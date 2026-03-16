import { randomUUID } from "node:crypto";
import { dirname, join, posix, resolve, sep } from "node:path";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import sharp from "sharp";
import {
  InvalidPlaylistImageError,
  type PlaylistImageStoragePort,
  type SavePlaylistImageInput,
  type StoredPlaylistImage,
} from "packages/application/src/ports/storage/playlist-image-storage-port";
import type { UploadConfig } from "@/main/upload-config";

const resolveStoragePath = (uploadsRootDir: string, relativePath: string): string | null => {
  const normalizedRelativePath = relativePath.replaceAll("\\", "/");

  if (
    !normalizedRelativePath ||
    normalizedRelativePath.startsWith("/") ||
    normalizedRelativePath.includes("\0")
  ) {
    return null;
  }

  const resolvedUploadsRootDir = resolve(uploadsRootDir);
  const resolvedPath = resolve(resolvedUploadsRootDir, normalizedRelativePath);

  if (resolvedPath !== resolvedUploadsRootDir && !resolvedPath.startsWith(`${resolvedUploadsRootDir}${sep}`)) {
    return null;
  }

  return resolvedPath;
};

const removeEmptyDirectories = async (directoryPath: string, uploadsRootDir: string): Promise<void> => {
  const resolvedUploadsRootDir = resolve(uploadsRootDir);
  let currentDirectoryPath = resolve(directoryPath);

  while (
    currentDirectoryPath !== resolvedUploadsRootDir &&
    currentDirectoryPath.startsWith(`${resolvedUploadsRootDir}${sep}`)
  ) {
    const entries = await readdir(currentDirectoryPath);

    if (entries.length > 0) {
      return;
    }

    await rm(currentDirectoryPath, { recursive: false, force: true });
    currentDirectoryPath = dirname(currentDirectoryPath);
  }
};

const toPlaylistImagePath = (playlistId: string): string => {
  return posix.join("playlists", playlistId, `${randomUUID()}.webp`);
};

export const resolveLocalPlaylistImagePath = (
  uploadsRootDir: string,
  imagePath: string,
): string | null => {
  return resolveStoragePath(uploadsRootDir, imagePath);
};

const processPlaylistImage = async (
  input: SavePlaylistImageInput,
  uploadConfig: UploadConfig,
): Promise<Uint8Array> => {
  let processedImage: Buffer;

  try {
    processedImage = await sharp(input.bytes, { failOn: "error" })
      .rotate()
      .resize({
        width: uploadConfig.playlistImageMaxWidth,
        height: uploadConfig.playlistImageMaxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: uploadConfig.playlistImageWebpQuality,
        effort: 6,
      })
      .toBuffer();
  } catch {
    throw new InvalidPlaylistImageError();
  }

  return new Uint8Array(processedImage);
};

export const createLocalPlaylistImageStorage = (
  uploadConfig: UploadConfig,
): PlaylistImageStoragePort => ({
  savePlaylistImage: async (
    playlistId: string,
    input: SavePlaylistImageInput,
  ): Promise<StoredPlaylistImage> => {
    const imagePath = toPlaylistImagePath(playlistId);
    const absoluteImagePath = resolveStoragePath(uploadConfig.uploadsRootDir, imagePath);

    if (!absoluteImagePath) {
      throw new Error("Invalid playlist image path");
    }

    const processedBytes = await processPlaylistImage(input, uploadConfig);

    await mkdir(join(uploadConfig.uploadsRootDir, "playlists", playlistId), { recursive: true });
    await writeFile(absoluteImagePath, processedBytes);

    return { imagePath };
  },
  deletePlaylistImage: async (imagePath: string): Promise<void> => {
    const absoluteImagePath = resolveStoragePath(uploadConfig.uploadsRootDir, imagePath);

    if (!absoluteImagePath) {
      return;
    }

    await rm(absoluteImagePath, { force: true });
    await removeEmptyDirectories(dirname(absoluteImagePath), uploadConfig.uploadsRootDir);
  },
});
