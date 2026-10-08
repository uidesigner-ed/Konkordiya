import { content } from "@/content/uk";
import { site } from "@/config/site";
import { serviceUi } from "@/content/services";
import { RichText } from "@/components/ui/RichText";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { IconPhone } from "@/components/ui/Icons";
import { LeadForm } from "@/components/forms/LeadForm";

/** Спільні блоки сторінок послуг: етапи, переваги, заявка */

export function StagesBlock({ id = "svp-steps" }: { id?: string }) {
  return (
    <section className="svp-sec svp-steps page-x" aria-labelledby={id}>
      <h2 id={id} className="svp-h2 t-display" data-reveal>
        {serviceUi.stagesTitle}
      </h2>
      <ol className="svp-steps__list">
        {content.stages.items.map((s, i) => (
          <li key={s} className="svp-step" data-reveal>
            <span className="svp-step__n t-mono">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="svp-step__title">{s}</h3>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function WhyBlock({ id = "svp-why" }: { id?: string }) {
  return (
    <section className="svp-sec svp-why page-x" aria-labelledby={id}>
      <div className="svp-why__head" data-reveal>
        <h2 id={id} className="svp-h2 t-display">
          {serviceUi.whyTitle}
        </h2>
        <p className="svp-why__intro">
          <RichText parts={content.advantages.intro} />
        </p>
      </div>
      <ul className="svp-why__list">
        {content.advantages.items.map((a) => (
          <li key={a.n} className="svp-why__item" data-reveal>
            <span className="svp-why__n t-mono">{a.n}</span>
            <h3 className="svp-why__title">{a.title}</h3>
            <p className="svp-why__text">{a.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Заявка: текст і контакти ліворуч, форма праворуч */
export function LeadBlock({ location, service, title = serviceUi.toForm }: { location: string; service?: string; title?: string }) {
  return (
    <section id="zaiavka" className="svp-sec svp-lead page-x" aria-labelledby="zaiavka-title" data-cursor-dark>
      <div className="svp-lead__inner">
        <div className="svp-lead__side">
          <h2 id="zaiavka-title" className="svp-lead__title t-display">
            {title}
          </h2>
          <p className="svp-lead__text">
            Залиште контакти — фахівець зв’яжеться з вами, уточнить задачу й запропонує рішення. Або напишіть нам у зручний месенджер.
          </p>
          <a href={site.phone.href} className="svp-lead__phone t-mono link-line">
            <IconPhone size={20} />
            {site.phone.display}
          </a>
          <SocialLinks className="flex -ml-2.5" size={22} />
          <p className="svp-lead__addr">{site.address.display}</p>
        </div>
        <LeadForm location={location} service={service} tone="dark" />
      </div>
    </section>
  );
}
