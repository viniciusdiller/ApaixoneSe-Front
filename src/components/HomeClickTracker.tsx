"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/trackClick";

export function HomeClickTracker() {
  useEffect(() => {
    trackClick("institucional", "home");
  }, []);

  return null;
}
