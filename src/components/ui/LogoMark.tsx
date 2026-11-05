import { site } from "@/config/site";

/** Монограма «ТЄ» з оригінального логотипу, перефарбована через CSS-маску (колір — --logo) */
export function LogoMark({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`logo-mark ${className}`} />;
}

export function Logo({
  className = "",
  tone = "ink",
  badge = false,
}: {
  className?: string;
  tone?: "ink" | "paper";
  /** монограма на темно-синій круглій підкладці (#0C1728) */
  badge?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {badge ? (
        <span className="logo-badge" aria-hidden>
          <LogoMark />
        </span>
      ) : (
        <LogoMark />
      )}
      <span className={`${tone === "paper" ? "text-paper" : ""} font-display text-[15px] font-medium tracking-[-0.02em] leading-none`}>
        {site.name}
      </span>
    </span>
  );
}
