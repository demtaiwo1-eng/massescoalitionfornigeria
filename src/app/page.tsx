import Link from "@/components/site-link";
import { ArrowRight, ArrowUpRight, Search, ShieldCheck, Newspaper } from "lucide-react";
import MobileNavigation from "../components/mobile-navigation";
import PublicArticles from "../components/public-articles";
import { newsStories } from "@/data/news-stories";

const sections = ["Politics", "Economy", "Security", "Education", "Health", "Society"];
const flagTone = (flag: string) => flag.startsWith("Allegations")
  ? "source-flag source-flag-alert"
  : flag === "Campaign material" ? "source-flag source-flag-campaign" : "source-flag";

export default function HomePage() {
  
  return (
    <main className="mcn-home">
      <div className="topline"><div className="wrap topline-inner"><span>Independent journalism. Public interest first.</span><span>Nigeria · English</span></div></div>
      <header className="header wrap">
        <Link href="/" className="brand" aria-label="Masses Coalition of Nigeria home">
          <span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/latest/">Latest</Link>
          {sections.map((section) => <Link key={section} href={`/category/${section.toLowerCase()}/`}>{section}</Link>)}
        </nav>
        <div className="header-actions"><Link className="icon-link" href="/search/" aria-label="Search"><Search size={19}/></Link><Link className="text-button source-desk-header-link" href="/source-desk/">Explore News</Link><Link className="staff-link" href="/newsroom/sign-in/">Newsroom <ArrowRight size={15}/></Link><MobileNavigation/></div>
      </header>

      <section className="wrap section-block explore-news-section" id="explore-news">
        <div className="section-heading"><div><div className="eyebrow">LATEST NEWS & DEVELOPMENTS</div><h1>Explore <em>News.</em></h1></div><span className="explore-news-count">{newsStories.length} stories</span></div>
        <div className="explore-news-intro"><p>Browse the latest stories across politics, the economy, security, society and more. Each item includes a short summary, publication date, category and a link to its original report.</p></div>
        <div className="home-source-disclaimer"><ShieldCheck size={18}/><p><strong>Editorial note:</strong> These collected reports are presented for discovery and further reading. MCN newsroom publication is separate and requires independent editorial review, verification and approval.</p></div>
        <div className="explore-news-grid">
          {newsStories.map((story, index) => <article className="explore-news-card" key={story.url}>
            {story.imageUrl && <a className="explore-news-image" href={story.url} target="_blank" rel="noopener noreferrer" aria-label={`Open original report: ${story.title}`}><img src={story.imageUrl} alt={story.title} loading={index < 6 ? "eager" : "lazy"} decoding="async"/></a>}
            <div className="mcn-story-meta"><span>{story.category}</span><time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleDateString("en-NG", {day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Lagos"})}</time></div>
            <h2><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a></h2>
            <p>{story.summary}</p>
            <div className="explore-news-card-bottom"><span className={flagTone(story.flag)}>{story.flag}</span><a className="mcn-read-link" href={story.url} target="_blank" rel="noopener noreferrer">Read full story <ArrowUpRight size={15}/></a></div>
          </article>)}
        </div>
      </section>

      <section className="wrap section-block home-published-section"><div className="section-heading"><div><div className="eyebrow">ORIGINAL MCN REPORTING</div><h2>Published by <em>our newsroom.</em></h2></div><Link href="/latest/" className="text-button">All published stories <ArrowRight size={16}/></Link></div><PublicArticles limit={3}/></section>
      <section className="wrap section-block">
        <div className="section-heading"><div><div className="eyebrow">EXPLORE OUR COVERAGE</div><h2>Stories across <em>every sector.</em></h2></div><Link href="/categories/" className="text-button">All categories <ArrowRight size={16}/></Link></div>
        <div className="category-grid">{sections.map((s, i) => <Link className="category-card" key={s} href={`/category/${s.toLowerCase()}/`}><span className="category-number">0{i+1}</span><strong>{s}</strong><ArrowRight size={17}/></Link>)}</div>
      </section>
      <section className="editorial-band"><div className="wrap editorial-inner"><div className="editorial-icon"><Newspaper size={25}/></div><div><div className="eyebrow">OUR EDITORIAL STANDARD</div><h2>Facts before noise. <em>People before power.</em></h2><p>We are committed to original reporting, transparent sourcing, corrections when needed and a clear separation between fact and opinion.</p></div><Link className="light-button" href="/editorial-policy/">Read our principles <ArrowRight size={16}/></Link></div></section>
      <footer><div className="wrap footer-main"><div className="brand footer-brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span></div><div className="footer-about">An independent Nigerian publication committed to public-interest journalism and accountable storytelling.</div><div className="footer-links"><Link href="/about/">About</Link><Link href="/editorial-policy/">Editorial policy</Link><Link href="/corrections/">Corrections</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link><Link href="/contact/">Contact</Link><Link href="/access/activate/">Activate access</Link><Link href="/source-desk/">Explore News</Link><Link href="/newsroom/sign-in/">Newsroom sign in</Link></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Masses Coalition of Nigeria</span><span>Independent. Responsible. For the people.</span></div></footer>
    </main>
  );
}
