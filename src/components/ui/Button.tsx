import type { ReactNode } from "react";
import { Magnetic } from "./Magnetic";
import { IconArrow } from "./Icons";

type Props = {
  href: string;
  children: string;
  variant?: "primary" | "light" | "outline";
  size?: "md" | "lg";
  cursor?: string;
  external?: boolean;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/** Кнопка-пігулка: текст «перекочується», коло з іконкою заливається червоним чорнилом */
export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  cursor,
  external = true,
  icon,
  className = "",
  ariaLabel,
}: Props) {
  return (
    <Magnetic className={className}>
      <a
        href={href}
        className={`btn btn--${variant} btn--${size}`}
        data-cursor={cursor}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <span className="btn__label">
          <span className="btn__text" data-text={children}>
            {children}
          </span>
        </span>
        <span className="btn__icon" aria-hidden>
          <span className="btn__icon-a">{icon ?? <IconArrow size={18} />}</span>
          <span className="btn__icon-b">{icon ?? <IconArrow size={18} />}</span>
        </span>
      </a>
    </Magnetic>
  );
}
