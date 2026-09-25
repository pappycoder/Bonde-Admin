import { api } from "@/lib/api-client";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
}

export interface SignedUploadUrl {
  bucket: string;
  path: string;
  method: "PUT";
  uploadUrl: string;
  headers: Record<string, string>;
  expiresIn: number;
}

export const AVATAR_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export function avatarExtension(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "webp";
  }
}

export async function getProfile(): Promise<Profile> {
  return api.get<Profile>("/profile", { auth: true });
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  return api.patch<Profile>("/profile", input, { auth: true });
}

export async function signAvatarUploadUrl(input: {
  userId: string;
  contentType: string;
  size: number;
}): Promise<SignedUploadUrl> {
  return api.post<SignedUploadUrl>(
    "/storage/upload-url",
    {
      bucket: "bonde-avatars",
      path: `u-${input.userId}/avatar.${avatarExtension(input.contentType)}`,
      contentType: input.contentType,
      size: input.size,
    },
    { auth: true },
  );
}

export async function putAvatarFile(
  uploadUrl: string,
  headers: Record<string, string>,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, { method: "PUT", headers, body: file });
  if (!response.ok) {
    throw new Error("Avatar upload failed");
  }
}

export async function updateAvatar(path: string): Promise<Profile> {
  return api.patch<Profile>("/profile/avatar", { path }, { auth: true });
}