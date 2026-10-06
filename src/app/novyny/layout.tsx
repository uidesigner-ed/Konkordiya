import { content } from "@/content/uk";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { InnerPage } from "@/components/news/InnerPage";

/** Оболонка розділу «Новини»: та сама шапка, поле книги й футер, без прелоадера */
export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <a href="#main" className="skip-link">
        {content.ui.skip}
      </a>
      <SmoothScroll />
      <InnerPage />
      <div className="grid-lines" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="ledger-rule" aria-hidden />
      <Header base="/" />
      <main id="main" className="inner-main">
        {children}
      </main>
      <Footer base="/" />
      <div className="grain" aria-hidden />
      <Cursor />
    </MotionProvider>
  );
}
