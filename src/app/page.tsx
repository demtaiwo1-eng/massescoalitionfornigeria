import Link from "@/components/site-link";
import { ArrowRight, Search, ShieldCheck, Newspaper, Radio } from "lucide-react";
import MobileNavigation from "../components/mobile-navigation";
import PublicArticles from "../components/public-articles";

const sections = ["Politics", "Economy", "Security", "Education", "Health", "Society"];

export default function HomePage() {
  return (
    <main>
      <div className="topline"><div className="wrap topline-inner"><span>Independent journalism. Public interest first.</span><span>Nigeria · English</span></div></div>
      <header className="header wrap">
        <Link href="/" className="brand" aria-label="Masses Coalition of Nigeria home">
          <span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {sections.map((section) => <Link key={section} href={`/category/${section.toLowerCase()}/`}>{section}</Link>)}
        </nav>
        <div className="header-actions"><Link className="icon-link" href="/search/" aria-label="Search"><Search size={19}/></Link><Link className="staff-link" href="/newsroom/sign-in/">Newsroom <ArrowRight size={15}/></Link><MobileNavigation/></div>
      </header>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"/> THE PEOPLE. THE FACTS. THE FUTURE.</div>
          <h1>News that puts<br/><em>people first.</em></h1>
          <p>Independent Nigerian reporting, thoughtful analysis and stories that matter to our communities.</p>
          <div className="hero-actions"><Link className="primary-button" href="/latest/">Explore the latest <ArrowRight size={17}/></Link><Link className="text-button" href="/about/">About our mission</Link></div>
          <div className="hero-note"><ShieldCheck size={16}/> Original reporting. Responsible journalism.</div>
        </div>
        <div className="hero-art" aria-label="Editorial illustration">
          <div className="art-sun"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <div className="art-card"><span className="art-kicker">THE PUBLIC INTEREST</span><strong>Truth.<br/>Context.<br/><i>Accountability.</i></strong><span className="art-rule"/></div>
          <span className="art-caption">A platform for the stories that shape us.</span>
        </div>
      </section>
      <section className="ticker"><div className="wrap ticker-inner"><span className="ticker-label"><Radio size={15}/> NEWS DESK</span><span>We are building an independent home for verified Nigerian stories.</span><Link href="/about/">Our editorial promise <ArrowRight size={14}/></Link></div></section>
      <section className="wrap section-block"><div className="section-heading"><div><div className="eyebrow">LATEST FROM THE NEWSROOM</div><h2>Reporting that <em>matters.</em></h2></div><Link href="/latest/" className="text-button">All latest stories <ArrowRight size={16}/></Link></div><PublicArticles limit={3}/></section>
      <section className="wrap section-block">
        <div className="section-heading"><div><div className="eyebrow">EXPLORE OUR COVERAGE</div><h2>Stories across <em>every sector.</em></h2></div><Link href="/categories/" className="text-button">All categories <ArrowRight size={16}/></Link></div>
        <div className="category-grid">{sections.map((s, i) => <Link className="category-card" key={s} href={`/category/${s.toLowerCase()}/`}><span className="category-number">0{i+1}</span><strong>{s}</strong><ArrowRight size={17}/></Link>)}</div>
      </section>
      <section className="editorial-band"><div className="wrap editorial-inner"><div className="editorial-icon"><Newspaper size={25}/></div><div><div className="eyebrow">OUR EDITORIAL STANDARD</div><h2>Facts before noise. <em>People before power.</em></h2><p>We are committed to original reporting, transparent sourcing, corrections when needed and a clear separation between fact and opinion.</p></div><Link className="light-button" href="/editorial-policy/">Read our principles <ArrowRight size={16}/></Link></div></section>
      <footer><div className="wrap footer-main"><div className="brand footer-brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span></div><div className="footer-about">An independent Nigerian publication committed to public-interest journalism and accountable storytelling.</div><div className="footer-links"><Link href="/about/">About</Link><Link href="/editorial-policy/">Editorial policy</Link><Link href="/corrections/">Corrections</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link><Link href="/contact/">Contact</Link><Link href="/access/activate/">Activate access</Link><Link href="/newsroom/sign-in/">Newsroom sign in</Link></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Masses Coalition of Nigeria</span><span>Independent. Responsible. For the people.</span></div></footer>
    </main>
  );
}
