import { content } from "@/content/uk";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { SheetIndicator } from "@/components/layout/SheetIndicator";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Audiences } from "@/components/sections/Audiences";
import { Services } from "@/components/sections/Services";
import { Support } from "@/components/sections/Support";
import { Extra } from "@/components/sections/Extra";
import { Military } from "@/components/sections/Military";
import { Advantages } from "@/components/sections/Advantages";
import { Stages } from "@/components/sections/Stages";
import { Experience } from "@/components/sections/Experience";
import { Team } from "@/components/sections/Team";
import { Reviews } from "@/components/sections/Reviews";
import { Contact } from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/server/seo";

export function generateMetadata() {
  return pageMetadata("/");
}

export default function Home() {
  return (
    <MotionProvider>
      <a href="#main" className="skip-link">
        {content.ui.skip}
      </a>
      <SmoothScroll />
      <Preloader />
      <div className="grid-lines" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="ledger-rule" aria-hidden />
      <Header />
      <SheetIndicator />
      <main id="main">
        <Hero />
        <Marquee />
        <Audiences />
        <Services />
        <Support />
        <Extra />
        <Military />
        <Advantages />
        <Stages />
        <Experience />
        <Team />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden />
      <Cursor />
    </MotionProvider>
  );
}
