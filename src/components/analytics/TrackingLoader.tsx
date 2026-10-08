"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { SiteTracking as SiteTrackingType } from "./SiteTracking";

/**
 * Аналітика й банер згоди не потрібні для першого кадру: код підвантажується
 * окремим чанком після гідратації і не конкурує з першим екраном.
 */
const SiteTracking = dynamic(() => import("./SiteTracking").then((m) => m.SiteTracking), { ssr: false });

export function TrackingLoader(props: ComponentProps<typeof SiteTrackingType>) {
  return <SiteTracking {...props} />;
}
