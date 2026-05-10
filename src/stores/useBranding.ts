"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type BrandingState = {
  appName: string;
  primaryColor: string;
  primaryHoverColor: string;
  primaryFixed: string;
  logoDataUrl: string | null;
  showTricolor: boolean;
  darkMode: boolean;
  customCss: string;
  setPrimaryColor: (color: string) => void;
  setAppName: (name: string) => void;
  setLogo: (dataUrl: string | null) => void;
  setShowTricolor: (v: boolean) => void;
  setDarkMode: (v: boolean) => void;
  setCustomCss: (css: string) => void;
  resetBranding: () => void;
};

const DEFAULT_PRIMARY = "#0055A4";
const DEFAULT_PRIMARY_HOVER = "#004a92";
const DEFAULT_PRIMARY_FIXED = "#d6e4f5";

export function applyBrandingToDom(state: Partial<BrandingState>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (state.primaryColor) {
    root.style.setProperty("--primary", state.primaryColor);
    root.style.setProperty("--color-primary", state.primaryColor);
  }
  if (state.primaryHoverColor) {
    root.style.setProperty("--primary-hover", state.primaryHoverColor);
  }
  if (state.primaryFixed) {
    root.style.setProperty("--primary-fixed", state.primaryFixed);
    root.style.setProperty("--color-primary-fixed", state.primaryFixed);
  }
}

function deriveTones(hex: string) {
  // Very small "darker / lighter" shifts; safe for any hex value.
  const m = /^#?([a-f\d]{6})$/i.exec(hex);
  if (!m) return { hover: DEFAULT_PRIMARY_HOVER, fixed: DEFAULT_PRIMARY_FIXED };
  const num = parseInt(m[1]!, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const hover = `#${[clamp(r - 11), clamp(g - 11), clamp(b - 18)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
  const fixed = `#${[clamp(r + 200 - r * 0.2), clamp(g + 200 - g * 0.2), clamp(b + 200 - b * 0.2)]
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")}`;
  return { hover, fixed };
}

export const useBranding = create<BrandingState>()(
  persist(
    (set) => ({
      appName: "Objectif Civique",
      primaryColor: DEFAULT_PRIMARY,
      primaryHoverColor: DEFAULT_PRIMARY_HOVER,
      primaryFixed: DEFAULT_PRIMARY_FIXED,
      logoDataUrl: null,
      showTricolor: true,
      darkMode: false,
      customCss: "",
      setPrimaryColor: (color) => {
        const { hover, fixed } = deriveTones(color);
        set({ primaryColor: color, primaryHoverColor: hover, primaryFixed: fixed });
        applyBrandingToDom({ primaryColor: color, primaryHoverColor: hover, primaryFixed: fixed });
      },
      setAppName: (appName) => set({ appName }),
      setLogo: (logoDataUrl) => set({ logoDataUrl }),
      setShowTricolor: (showTricolor) => set({ showTricolor }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setCustomCss: (customCss) => set({ customCss }),
      resetBranding: () => {
        set({
          appName: "Objectif Civique",
          primaryColor: DEFAULT_PRIMARY,
          primaryHoverColor: DEFAULT_PRIMARY_HOVER,
          primaryFixed: DEFAULT_PRIMARY_FIXED,
          logoDataUrl: null,
          showTricolor: true,
          darkMode: false,
          customCss: "",
        });
        applyBrandingToDom({
          primaryColor: DEFAULT_PRIMARY,
          primaryHoverColor: DEFAULT_PRIMARY_HOVER,
          primaryFixed: DEFAULT_PRIMARY_FIXED,
        });
      },
    }),
    { name: "oc-admin-branding" },
  ),
);
