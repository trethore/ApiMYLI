import { constants as fsConstants } from "node:fs";
import { access } from "node:fs/promises";
import type { AppServices } from "@/main/app-services";
import type { UploadConfig } from "@/main/upload-config";
import { InvalidPlaylistImageError } from "packages/application/src/ports/storage/playlist-image-storage-port";
import {
  PlaylistAccessDeniedError,
  PlaylistNotFoundError,
  uploadPlaylistImage,
} from "packages/application/src/use-cases/playlist/upload-playlist-image";
import { getAuthenticatedAccountId } from "packages/application/src/use-cases/account/get-authenticated-account-id";
import { resolveLocalPlaylistImagePath } from "@/infrastructure/local-playlist-image-storage";

const PLAYLIST_IMAGE_ROUTE_PATTERN = /^\/playlists\/([^/]+)\/image$/;
const SUPPORTED_IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type DetectedImage = {
  contentType: string;
};

const jsonResponse = (status: number, payload: Record<string, string>) => {
  return Response.json(payload, { status });
};

const getAuthToken = (request: Request): string | null => {
  const authHeader = request.headers.get("authorization");

  return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

const buildImageUrl = (uploadConfig: UploadConfig, imagePath: string): string => {
  return `${uploadConfig.uploadsPublicPath}/${imagePath}`;
};

const detectImage = (bytes: Uint8Array): DetectedImage | null => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { contentType: "image/png" };
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { contentType: "image/webp" };
  }

  return null;
};

const detectImageContentTypeFromPath = (imagePath: string): string | null => {
  if (imagePath.endsWith(".webp")) {
    return "image/webp";
  }

  if (imagePath.endsWith(".png")) {
    return "image/png";
  }

  if (imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return null;
};

const parseMultipartFile = async (
  request: Request,
  uploadConfig: UploadConfig,
): Promise<{ bytes: Uint8Array } | Response> => {
  const requestContentType = request.headers.get("content-type") ?? "";

  if (!requestContentType.includes("multipart/form-data")) {
    return jsonResponse(415, { error: "Content-Type must be multipart/form-data" });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonResponse(400, { error: "Invalid multipart payload" });
  }

  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    return jsonResponse(400, { error: "Field 'file' is required" });
  }

  if (fileEntry.size === 0) {
    return jsonResponse(400, { error: "Uploaded file is empty" });
  }

  if (fileEntry.size > uploadConfig.maxPlaylistImageBytes) {
    return jsonResponse(413, {
      error: `Uploaded file exceeds ${uploadConfig.maxPlaylistImageBytes} bytes`,
    });
  }

  if (fileEntry.type && !SUPPORTED_IMAGE_CONTENT_TYPES.has(fileEntry.type)) {
    return jsonResponse(415, { error: "Unsupported image MIME type" });
  }

  const bytes = new Uint8Array(await fileEntry.arrayBuffer());
  const detectedImage = detectImage(bytes);

  if (!detectedImage) {
    return jsonResponse(415, { error: "Unsupported image format" });
  }

  if (fileEntry.type && fileEntry.type !== detectedImage.contentType) {
    return jsonResponse(415, { error: "Image MIME type does not match file content" });
  }

  return {
    bytes,
  };
};

const handlePlaylistImageUpload = async (
  request: Request,
  services: AppServices,
  uploadConfig: UploadConfig,
  playlistId: string,
): Promise<Response> => {
  let accountId: string;

  try {
    accountId = await getAuthenticatedAccountId(services.authTokenService, getAuthToken(request));
  } catch {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const parsedFile = await parseMultipartFile(request, uploadConfig);

  if (parsedFile instanceof Response) {
    return parsedFile;
  }

  try {
    const result = await uploadPlaylistImage(
      services.playlistRepository,
      services.playlistImageStorage,
      accountId,
      playlistId,
      parsedFile,
    );

    return Response.json({
      imagePath: result.imagePath,
      imageUrl: buildImageUrl(uploadConfig, result.imagePath),
      playlistId: result.playlist.playlistId,
    });
  } catch (error) {
    if (error instanceof PlaylistNotFoundError) {
      return jsonResponse(404, { error: error.message });
    }

    if (error instanceof PlaylistAccessDeniedError) {
      return jsonResponse(403, { error: error.message });
    }

    if (error instanceof InvalidPlaylistImageError) {
      return jsonResponse(415, { error: error.message });
    }

    console.error(error);

    return jsonResponse(500, { error: "Internal server error" });
  }
};

const handleUploadedFile = async (
  request: Request,
  uploadConfig: UploadConfig,
  imagePath: string,
): Promise<Response> => {
  const absoluteImagePath = resolveLocalPlaylistImagePath(uploadConfig.uploadsRootDir, imagePath);

  if (!absoluteImagePath) {
    return new Response(null, { status: 404 });
  }

  try {
    await access(absoluteImagePath, fsConstants.R_OK);
  } catch {
    return new Response(null, { status: 404 });
  }

  const file = Bun.file(absoluteImagePath);
  const detectedContentType = detectImageContentTypeFromPath(imagePath);

  if (!detectedContentType) {
    return new Response(null, { status: 415 });
  }

  if (request.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": detectedContentType,
      },
    });
  }

  return new Response(file, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": detectedContentType,
    },
  });
};

export const handleMediaRequest = async (
  request: Request,
  services: AppServices,
  uploadConfig: UploadConfig,
): Promise<Response | null> => {
  const url = new URL(request.url);
  const playlistImageRouteMatch = PLAYLIST_IMAGE_ROUTE_PATTERN.exec(url.pathname);

  if (playlistImageRouteMatch) {
    if (request.method !== "POST") {
      return new Response(null, {
        status: 405,
        headers: {
          Allow: "POST",
        },
      });
    }

    return handlePlaylistImageUpload(request, services, uploadConfig, decodeURIComponent(playlistImageRouteMatch[1]));
  }

  const uploadsPublicPrefix = `${uploadConfig.uploadsPublicPath}/`;

  if (url.pathname.startsWith(uploadsPublicPrefix)) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
        },
      });
    }

    return handleUploadedFile(
      request,
      uploadConfig,
      decodeURIComponent(url.pathname.slice(uploadsPublicPrefix.length)),
    );
  }

  return null;
};
