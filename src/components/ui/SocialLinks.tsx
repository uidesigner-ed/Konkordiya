import { site } from "@/config/site";
import { content } from "@/content/uk";
import { IconInstagram, IconLinkedIn, IconTelegram, IconWhatsApp } from "./Icons";

const items = [
  { key: "telegram", href: site.social.telegram, Icon: IconTelegram },
  { key: "whatsapp", href: site.social.whatsapp, Icon: IconWhatsApp },
  { key: "instagram", href: site.social.instagram, Icon: IconInstagram },
  { key: "linkedin", href: site.social.linkedin, Icon: IconLinkedIn },
] as const;

export function SocialLinks({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <ul className={`social-links items-center gap-1 ${className}`}>
      {items.map(({ key, href, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={content.ui.messengers[key]}
            className="social-links__a"
          >
            <Icon size={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export const messengerItems = items;
