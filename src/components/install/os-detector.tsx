"use client";

import { useEffect, useState } from "react";
import type { Platform } from "@/lib/install-steps";

export function useDetectedPlatform(): Platform | null {
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) {
      setPlatform("windows");
    } else if (ua.includes("mac")) {
      setPlatform("mac");
    }
  }, []);

  return platform;
}
