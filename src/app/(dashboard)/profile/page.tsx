"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";
import { PasswordForm } from "@/components/account/password-form";
import { SessionsCard } from "@/components/account/sessions-card";
import { TwoFactorCard } from "@/components/account/two-factor-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  getProfile,
  putAvatarFile,
  signAvatarUploadUrl,
  updateAvatar,
  updateProfile,
} from "@/lib/api/profile";
import { useApi } from "@/hooks/use-api";

const PHONE_PATTERN = /^\+?[0-9]+$/;

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
      : name.slice(0, 2);
  return initials.toUpperCase();
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Please try again.";
}

export default function ProfilePage() {
  const { user, updateProfileDisplay } = useAuth();
  const { data: profile, loading: profileLoading } = useApi(
    () => getProfile(),
    [],
  );

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!prefilled && profile) {
    setPrefilled(true);
    setFullName(profile.fullName);
    setPhone(profile.phone ?? "");
    setAvatarUrl(profile.avatarUrl);
  }

  const email = user?.email ?? siteConfig.user.email;
  const role = user?.role ?? "ADMIN";
  const name = fullName.trim() || user?.name || siteConfig.user.name;
  const initials = initialsOf(name);
  const effectiveAvatar = avatarUrl ?? user?.avatarUrl ?? null;

  const handleProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Full name is required");
      return;
    }
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      toast.error("Invalid phone number", {
        description: "Use digits with an optional leading +.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: trimmedName,
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      });
      updateProfileDisplay({ name: updated.fullName });
      toast.success("Profile updated", {
        description: "Your account details were saved.",
      });
    } catch (error) {
      toast.error("Could not save profile", { description: messageOf(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;

    if (!(AVATAR_CONTENT_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Unsupported image type", {
        description: "Use JPEG, PNG or WebP.",
      });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Image too large", {
        description: "Avatars must be 5 MB or smaller.",
      });
      return;
    }

    setUploading(true);
    try {
      const { path, uploadUrl, headers } = await signAvatarUploadUrl({
        userId: user.id,
        contentType: file.type,
        size: file.size,
      });
      await putAvatarFile(uploadUrl, headers, file);
      const updated = await updateAvatar(path);
      setAvatarUrl(updated.avatarUrl);
      updateProfileDisplay({ avatarUrl: updated.avatarUrl });
      toast.success("Avatar updated", {
        description: "Your profile picture was updated.",
      });
    } catch (error) {
      toast.error("Could not update avatar", { description: messageOf(error) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account security."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                Your name, email address and role.
              </CardDescription>
            </CardHeader>
            {profileLoading && !profile ? (
              <CardContent>
                <LoadingState label="Loading profile…" />
              </CardContent>
            ) : (
              <form
                onSubmit={(event) => void handleProfile(event)}
                // Card is a flex column with gap-6, but a <form> wrapper
                // collapses content + footer into one flex child, so the
                // card's gap stops applying and the button sits flush against
                // the last field. This restores the card's own rhythm.
                className="flex flex-col gap-6"
              >
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="size-14">
                        {effectiveAvatar ? (
                          <AvatarImage src={effectiveAvatar} alt={name} />
                        ) : null}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => void handleAvatarChange(event)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        aria-label="Change avatar"
                        className="absolute -right-1 -bottom-1 size-6 rounded-full"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Camera className="size-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-transparent bg-primary/10 text-primary"
                      >
                        {role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {email}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-name">Full name</Label>
                      <Input
                        id="p-name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-email">Email</Label>
                      <Input id="p-email" type="email" value={email} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-phone">Phone number</Label>
                    <Input
                      id="p-phone"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>

          <PasswordForm />
        </div>

        <div className="space-y-4">
          <TwoFactorCard />

          <SessionsCard />
        </div>
      </div>
    </div>
  );
}
