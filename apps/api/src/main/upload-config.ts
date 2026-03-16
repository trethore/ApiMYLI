import { resolve } from "node:path";
import { parseIntegerInRange, parsePositiveInteger } from "@/main/config-utils";

export type UploadConfig = {
  uploadsRootDir: string;
  uploadsPublicPath: string;
  maxPlaylistImageBytes: number;
  playlistImageMaxWidth: number;
  playlistImageMaxHeight: number;
  playlistImageWebpQuality: number;
};

const normalizePublicPath = (value: string | undefined): string => {
  const normalizedValue = value?.trim().replaceAll(/^\/+|\/+$/g, "") ?? "uploads";

  return `/${normalizedValue || "uploads"}`;
};

export const loadUploadConfig = (): UploadConfig => ({
  uploadsRootDir: resolve(process.cwd(), Bun.env.UPLOADS_DIR ?? "data/uploads"),
  uploadsPublicPath: normalizePublicPath(Bun.env.UPLOADS_PUBLIC_PATH),
  maxPlaylistImageBytes: parsePositiveInteger(Bun.env.PLAYLIST_IMAGE_MAX_BYTES, 5 * 1024 * 1024),
  playlistImageMaxWidth: parsePositiveInteger(Bun.env.PLAYLIST_IMAGE_MAX_WIDTH, 1024),
  playlistImageMaxHeight: parsePositiveInteger(Bun.env.PLAYLIST_IMAGE_MAX_HEIGHT, 1024),
  playlistImageWebpQuality: parseIntegerInRange(Bun.env.PLAYLIST_IMAGE_WEBP_QUALITY, 82, 1, 100),
});
