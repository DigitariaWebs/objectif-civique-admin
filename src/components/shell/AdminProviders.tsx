"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";
import { CommandPaletteHost } from "@/components/ui/CommandPalette";
import { useBranding, applyBrandingToDom } from "@/stores/useBranding";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const branding = useBranding();

  useEffect(() => {
    applyBrandingToDom({
      primaryColor: branding.primaryColor,
      primaryHoverColor: branding.primaryHoverColor,
      primaryFixed: branding.primaryFixed,
    });
  }, [branding.primaryColor, branding.primaryHoverColor, branding.primaryFixed]);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
      <ConfirmDialogHost />
      <CommandPaletteHost />
      {branding.customCss && <style dangerouslySetInnerHTML={{ __html: branding.customCss }} />}
    </>
  );
}
