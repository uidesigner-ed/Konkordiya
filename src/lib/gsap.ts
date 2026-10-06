"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, CustomEase, useGSAP);
  // Фірмові криві: «папір» — м'який виїзд, «перо» — різкий старт і довге гальмування
  CustomEase.create("paper", "0.16, 1, 0.3, 1");
  CustomEase.create("quill", "0.7, 0, 0.12, 1");
  gsap.defaults({ ease: "paper", duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
