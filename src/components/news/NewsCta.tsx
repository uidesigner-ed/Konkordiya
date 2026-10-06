import { newsUi } from "@/content/news";
import { content } from "@/content/uk";
import { site } from "@/config/site";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";

/** Заклик до консультації наприкінці сторінок новин */
export function NewsCta() {
  return (
    <section className="ncta page-x" data-cursor-dark aria-labelledby="ncta-title">
      <div className="ncta__inner" data-reveal>
        <h2 id="ncta-title" className="ncta__title t-display">
          <RichText parts={newsUi.cta.title} />
        </h2>
        <div className="ncta__side">
          <p className="ncta__text">{newsUi.cta.text}</p>
          <div className="ncta__actions">
            <Button href={site.consultUrl} variant="light" size="lg" cursor={content.ui.write}>
              {content.hero.cta}
            </Button>
            <SocialLinks className="flex" size={22} />
          </div>
        </div>
      </div>
    </section>
  );
}
