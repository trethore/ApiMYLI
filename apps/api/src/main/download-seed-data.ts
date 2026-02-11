import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_DRIVE_URL =
  "https://drive.google.com/file/d/1QCGaCi6WB9FI4paqV4mGlH30FmymDCUl/view?usp=drive_link";
const OUTPUT_DIR = join(import.meta.dir, "../../prisma/seed-data");
const FALLBACK_ARCHIVE_NAME = "seed-data.zip";

function extractGoogleDriveFileId(shareUrl: string): string {
  const parsedUrl = new URL(shareUrl);
  const pathMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
  if (pathMatch?.[1] !== undefined) {
    return pathMatch[1];
  }

  const queryId = parsedUrl.searchParams.get("id");
  if (queryId !== null && queryId.length > 0) {
    return queryId;
  }

  throw new Error("Unable to extract Google Drive file id from URL.");
}

function getInitialDownloadUrl(fileId: string): string {
  const url = new URL("https://drive.google.com/uc");
  url.searchParams.set("export", "download");
  url.searchParams.set("id", fileId);
  return url.toString();
}

function isHtmlResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type");
  return contentType !== null && contentType.toLowerCase().includes("text/html");
}

function decodeHtml(value: string): string {
  return value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}

function extractConfirmationUrl(html: string): string {
  const formMatch = html.match(/<form[^>]*id="download-form"[^>]*action="([^"]+)"[^>]*>/i);
  if (formMatch?.[1] === undefined) {
    throw new Error("Unable to find Google Drive confirmation form.");
  }

  const confirmationUrl = new URL(formMatch[1], "https://drive.google.com");
  const inputPattern = /<input[^>]*name="([^"]+)"[^>]*value="([^"]*)"[^>]*>/gi;

  for (const inputMatch of html.matchAll(inputPattern)) {
    const name = inputMatch[1];
    const value = inputMatch[2];
    if (name !== undefined && value !== undefined) {
      confirmationUrl.searchParams.set(name, decodeHtml(value));
    }
  }

  return confirmationUrl.toString();
}

function extractArchiveName(response: Response): string {
  const disposition = response.headers.get("content-disposition");
  if (disposition === null) {
    return FALLBACK_ARCHIVE_NAME;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1] !== undefined) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1] !== undefined) {
    return basicMatch[1];
  }

  return FALLBACK_ARCHIVE_NAME;
}

async function requestArchive(fileId: string): Promise<Response> {
  const initialResponse = await fetch(getInitialDownloadUrl(fileId));
  if (!initialResponse.ok) {
    throw new Error(`Initial download request failed with status ${initialResponse.status}.`);
  }

  if (!isHtmlResponse(initialResponse)) {
    return initialResponse;
  }

  const html = await initialResponse.text();
  const confirmationUrl = extractConfirmationUrl(html);
  const confirmedResponse = await fetch(confirmationUrl);

  if (!confirmedResponse.ok) {
    throw new Error(`Confirmed download request failed with status ${confirmedResponse.status}.`);
  }

  if (isHtmlResponse(confirmedResponse)) {
    throw new Error("Google Drive returned HTML instead of the archive file.");
  }

  return confirmedResponse;
}

async function saveResponseBody(response: Response, filePath: string): Promise<void> {
  const bytesWritten = await Bun.write(filePath, response);
  if (bytesWritten <= 0) {
    throw new Error("No data was written to disk.");
  }
}

async function extractArchive(archivePath: string, destinationDir: string): Promise<void> {
  const unzipBinary = Bun.which("unzip");
  if (unzipBinary === null) {
    throw new Error("The 'unzip' command is required but was not found on this machine.");
  }

  const unzipProcess = Bun.spawn([unzipBinary, "-o", archivePath, "-d", destinationDir], {
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await unzipProcess.exited;
  if (exitCode !== 0) {
    throw new Error(`Archive extraction failed with exit code ${exitCode}.`);
  }
}

async function main(): Promise<void> {
  const driveUrl = Bun.env.SEED_DATA_DRIVE_URL ?? DEFAULT_DRIVE_URL;
  const fileId = extractGoogleDriveFileId(driveUrl);

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Downloading seed archive...");
  const response = await requestArchive(fileId);
  const archiveName = extractArchiveName(response);
  const archivePath = join(OUTPUT_DIR, archiveName);

  await saveResponseBody(response, archivePath);
  console.log(`Archive saved to ${archivePath}`);

  console.log("Extracting archive...");
  await extractArchive(archivePath, OUTPUT_DIR);
  await unlink(archivePath);
  console.log(`Archive removed from ${archivePath}`);
  console.log(`CSV files extracted to ${OUTPUT_DIR}`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Seed download failed: ${message}`);
  process.exit(1);
});
