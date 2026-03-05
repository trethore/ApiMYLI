import { createWriteStream } from "node:fs";
import { once } from "node:events";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { $ } from "bun";

const GOOGLE_DRIVE_URL =
  "https://drive.google.com/file/d/1j6ApZCLpCaTTLtD3yOldOnYV_O8CgLAK/view?usp=drive_link";
const DATA_DIRECTORY_PATH = resolve(import.meta.dir, "../data");
const ARCHIVE_PATH = resolve(DATA_DIRECTORY_PATH, "seed-csv.zip");

const PROGRESS_UPDATE_INTERVAL_MS = 100;

const extractGoogleDriveFileId = (url: string): string => {
  const match = /\/d\/([^/]+)/.exec(url);

  if (match === null) {
    throw new Error("Unable to extract Google Drive file ID.");
  }

  return match[1];
};

const buildGoogleDriveDownloadUrl = (fileId: string): string => {
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const parseContentLength = (contentLengthHeader: string | null): number | null => {
  if (contentLengthHeader === null) {
    return null;
  }

  const parsedContentLength = Number(contentLengthHeader);

  if (Number.isNaN(parsedContentLength) || parsedContentLength <= 0) {
    return null;
  }

  return parsedContentLength;
};

const downloadArchive = async (downloadUrl: string, archivePath: string): Promise<void> => {
  const response = await fetch(downloadUrl);

  if (!response.ok || response.body === null) {
    throw new Error(`Failed to download archive (${response.status} ${response.statusText}).`);
  }

  const contentLengthHeader = response.headers.get("content-length");
  const totalBytes = parseContentLength(contentLengthHeader);

  let downloadedBytes = 0;
  let lastRenderAt = 0;

  const renderProgress = (force: boolean): void => {
    const now = Date.now();

    if (!force && now - lastRenderAt < PROGRESS_UPDATE_INTERVAL_MS) {
      return;
    }

    lastRenderAt = now;

    if (totalBytes === null) {
      process.stdout.write(`\rDownloading seed archive... ${formatBytes(downloadedBytes)}`);
      return;
    }

    const percentage = Math.min((downloadedBytes / totalBytes) * 100, 100);
    process.stdout.write(
      `\rDownloading seed archive... ${percentage.toFixed(1)}% (${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)})`,
    );
  };

  const reader = response.body.getReader();
  const writeStream = createWriteStream(archivePath);

  renderProgress(true);

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      downloadedBytes += value.byteLength;
      renderProgress(false);

      if (!writeStream.write(value)) {
        await once(writeStream, "drain");
      }
    }

    writeStream.end();
    await once(writeStream, "finish");
  } catch (error: unknown) {
    writeStream.destroy();
    throw error;
  } finally {
    reader.releaseLock();
  }

  renderProgress(true);
  process.stdout.write("\n");
};

const extractArchive = async (archivePath: string, targetDirectoryPath: string): Promise<void> => {
  await $`unzip -o ${archivePath} -d ${targetDirectoryPath}`;
};

await mkdir(DATA_DIRECTORY_PATH, { recursive: true });

const fileId = extractGoogleDriveFileId(GOOGLE_DRIVE_URL);
const downloadUrl = buildGoogleDriveDownloadUrl(fileId);

await downloadArchive(downloadUrl, ARCHIVE_PATH);

console.log("Extracting CSV files...");
await extractArchive(ARCHIVE_PATH, DATA_DIRECTORY_PATH);

await rm(ARCHIVE_PATH, { force: true });

console.log("Seed CSV files are available in apps/api/data/");
