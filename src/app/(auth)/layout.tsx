import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="mx-auto flex w-fit flex-col items-center gap-3"
        >
          <Image
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={318}
            height={113}
            priority
            className="h-10 w-auto"
          />
          <span className="text-xs text-muted-foreground">
            {siteConfig.tagline}
          </span>
        </Link>

        <Card className="w-full p-6">{children}</Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} ·{" "}
          {siteConfig.fullName}
        </p>
      </div>
    </div>
  );
}