import { site } from "@/config/site";

/** Монограма «ТЄ» з оригінального логотипу, перефарбована через CSS-маску */
export function LogoMark({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`logo-mark ${className}`} />;
}

export function Logo({ className = "", tone = "ink" }: { className?: string; tone?: "ink" | "paper" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className={tone === "paper" ? "bg-paper" : "bg-emerald"} />
      <span className="font-display text-[15px] font-medium tracking-[-0.02em] leading-none">
        {site.name}
      </span>
    </span>
  );
}
