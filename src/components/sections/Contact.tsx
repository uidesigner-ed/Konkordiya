"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { site } from "@/config/site";
import { SectionHead } from "@/components/ui/SectionHead";
import { messengerItems } from "@/components/ui/SocialLinks";
import { IconArrow, IconMail, IconPhone, IconPin } from "@/components/ui/Icons";
import dynamic from "next/dynamic";

// Форма — у самому низу сторінки: її код вантажимо після першого екрана
const LeadForm = dynamic(() => import("@/components/forms/LeadForm").then((m) => m.LeadForm), {
  ssr: false,
  loading: () => <div className="lead-placeholder" aria-hidden />,
});

/** Фінальний заклик: месенджери як велика панель + контакти рядками реєстру. */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const c = content.contact;

  useFx(
    root,
    ({ gsap }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q(".contact-text"), { y: 30, opacity: 0, duration: 1.1, scrollTrigger: { trigger: q(".contact-text")[0], start: "top 88%", once: true } });
        gsap.from(q(".msg"), {
          yPercent: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: { trigger: q(".msg-row")[0], start: "top 90%", once: true },
        });
        gsap.from(q(".contact-line"), {
          scaleX: 0,
          duration: 1.3,
          stagger: 0.1,
          ease: "quill",
          scrollTrigger: { trigger: q(".contact-details")[0], start: "top 92%", once: true },
        });
      });
    },
  );

  const details = [
    { label: c.labels.phone, value: site.phone.display, href: site.phone.href, Icon: IconPhone, mono: true },
    { label: c.labels.address, value: site.address.display, href: site.address.mapUrl, Icon: IconPin, external: true },
    { label: c.labels.email, value: site.email, href: `mailto:${site.email}`, Icon: IconMail },
  ];

  return (
    <section ref={root} id="kontakty" aria-labelledby="contact-title" className="section page-x contact">
      <div className="contact-top">
        <SectionHead n={12} id="contact-title" title={c.title} className="contact-title" />
        <p className="contact-text t-lead">{c.text}</p>
      </div>

      <ul className="msg-row" aria-label={c.labels.messengers}>
        {messengerItems.map(({ key, href, Icon }) => (
          <li key={key} className="msg-cell">
            <a href={href} target="_blank" rel="noopener noreferrer" className="msg" data-cursor={content.ui.write}>
              <span className="msg__fill" aria-hidden />
              <Icon size={30} className="msg__icon" />
              <span className="msg__name t-display">{content.ui.messengers[key]}</span>
              <IconArrow size={22} className="msg__arrow" />
            </a>
          </li>
        ))}
      </ul>

      <div className="contact-bottom">
        <dl className="contact-details">
          {details.map(({ label, value, href, Icon, mono, external }) => (
            <div key={label} className="contact-row">
              <span className="contact-line" aria-hidden />
              <dt className="contact-row__label">
                <Icon size={20} />
                {label}
              </dt>
              <dd>
                <a
                  href={href}
                  className={`contact-row__value link-line ${mono ? "t-mono" : ""}`}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
        <div className="contact-form" data-track-zone="home-contact">
          <h3 className="contact-form__title t-display">
            Або залиште <span className="ital">заявку</span>
          </h3>
          <p className="contact-form__text">Передзвонимо або напишемо у зручний для вас месенджер.</p>
          <LeadForm location="home" />
        </div>
      </div>
    </section>
  );
}
