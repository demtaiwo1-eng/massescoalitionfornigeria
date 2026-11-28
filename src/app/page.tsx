import Link from "@/components/site-link";
import { ArrowRight, ArrowUpRight, Search, ShieldCheck, Newspaper, Radio } from "lucide-react";
import MobileNavigation from "../components/mobile-navigation";
import PublicArticles from "../components/public-articles";
import { ibConnectBriefs } from "@/data/ibconnect-briefs";

const sections = ["Politics", "Economy", "Security", "Education", "Health", "Society"];
const featuredBriefs = ibConnectBriefs.slice(0, 6);
const flagTone = (flag: string) => flag.startsWith("Allegations")
  ? "source-flag source-flag-alert"
  : flag === "Campaign material" ? "source-flag source-flag-campaign" : "source-flag";

export default function HomePage() {
  const leadStory = featuredBriefs[0];
  const supportingStories = featuredBriefs.slice(1, 4);
  const moreStories = featuredBriefs.slice(4, 7);

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
        <div className="header-actions"><Link className="icon-link" href="/search/" aria-label="Search"><Search size={19}/></Link><Link className="text-button source-desk-header-link" href="/source-desk/">Source desk</Link><Link className="staff-link" href="/newsroom/sign-in/">Newsroom <ArrowRight size={15}/></Link><MobileNavigation/></div>
      </header>

      <section className="mcn-news-masthead wrap">
        <div className="mcn-news-kicker"><span className="live-dot"/> THE NEWS DESK <span className="mcn-kicker-rule"/> <span>TOP STORIES & DEVELOPMENTS</span></div>
        <div className="mcn-news-grid">
          {leadStory && <article className="mcn-lead-story">
            <a className="mcn-lead-image" href={leadStory.url} target="_blank" rel="noopener noreferrer">
              {leadStory.imageUrl ? <img src={leadStory.imageUrl} alt={leadStory.title} fetchPriority="high"/> : <span className="mcn-image-placeholder">MCN NEWS</span>}
              <span className="mcn-image-label">SOURCE DESK</span>
            </a>
            <div className="mcn-story-meta"><span>{leadStory.category}</span><time dateTime={leadStory.publishedAt}>{new Date(leadStory.publishedAt).toLocaleDateString("en-NG", {day:"numeric",month:"long",year:"numeric",timeZone:"Africa/Lagos"})}</time><span>IB Connect</span></div>
            <h1><a href={leadStory.url} target="_blank" rel="noopener noreferrer">{leadStory.title}</a></h1>
            <p>{leadStory.summary}</p>
            <a className="mcn-read-link" href={leadStory.url} target="_blank" rel="noopener noreferrer">Read source story <ArrowUpRight size={15}/></a>
          </article>}
          <aside className="mcn-side-stories" aria-label="More top stories">
            <div className="mcn-side-heading">MORE TOP STORIES <Link href="/source-desk/">All stories <ArrowRight size={14}/></Link></div>
            {supportingStories.map((story) => <article className="mcn-side-story" key={story.url}>
              {story.imageUrl && <a className="mcn-side-thumb" href={story.url} target="_blank" rel="noopener noreferrer"><img src={story.imageUrl} alt="" loading="lazy"/></a>}
              <div><div className="mcn-story-meta"><span>{story.category}</span><time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleDateString("en-NG", {day:"numeric",month:"short",timeZone:"Africa/Lagos"})}</time></div>
                <h2><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a></h2>
                <span className={flagTone(story.flag)}>{story.flag}</span>
              </div>
            </article>)}
          </aside>
        </div>
      </section>

      <section className="mcn-breaking-strip"><div className="wrap mcn-breaking-inner"><span className="mcn-breaking-label"><Radio size={14}/> SOURCE DESK</span><span>{ibConnectBriefs.length} attributed IB Connect briefs available for editorial review</span><Link href="/source-desk/">Browse source desk <ArrowRight size={14}/></Link></div></section>

      <section className="wrap section-block home-source-section">
        <div className="section-heading"><div><div className="eyebrow">MORE FROM THE SOURCE DESK</div><h2>Stories to <em>follow.</em></h2></div><Link href="/source-desk/" className="text-button">View all {ibConnectBriefs.length} briefs <ArrowRight size={16}/></Link></div>
        <div className="home-source-disclaimer"><ShieldCheck size={18}/><p><strong>Source transparency:</strong> These are attributed summaries of third-party IB Connect posts, not original MCN reporting. Claims, campaign material and allegations are labelled and require independent editorial verification before MCN publication.</p></div>
        <div className="mcn-more-stories">
          {moreStories.map((story) => <article className="mcn-more-story" key={story.url}>
            {story.imageUrl && <a className="source-story-image" href={story.url} target="_blank" rel="noopener noreferrer"><img src={story.imageUrl} alt={story.title} loading="lazy"/></a>}
            <div className="mcn-story-meta"><span>{story.category}</span><time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleDateString("en-NG", {day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Lagos"})}</time></div>
            <h3><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a></h3><p>{story.summary}</p>
            <a className="mcn-read-link" href={story.url} target="_blank" rel="noopener noreferrer">Read source story <ArrowUpRight size={15}/></a>
          </article>)}
        </div>
        <div className="home-source-bottom"><span>Showing featured items from {ibConnectBriefs.length} monitored source briefs</span><Link className="primary-button" href="/source-desk/">Explore all source briefs <ArrowRight size={16}/></Link></div>
      </section>

      <section className="wrap section-block home-published-section"><div className="section-heading"><div><div className="eyebrow">ORIGINAL MCN REPORTING</div><h2>Published by <em>our newsroom.</em></h2></div><Link href="/latest/" className="text-button">All published stories <ArrowRight size={16}/></Link></div><PublicArticles limit={3}/></section>
      <section className="wrap section-block">
        <div className="section-heading"><div><div className="eyebrow">EXPLORE OUR COVERAGE</div><h2>Stories across <em>every sector.</em></h2></div><Link href="/categories/" className="text-button">All categories <ArrowRight size={16}/></Link></div>
        <div className="category-grid">{sections.map((s, i) => <Link className="category-card" key={s} href={`/category/${s.toLowerCase()}/`}><span className="category-number">0{i+1}</span><strong>{s}</strong><ArrowRight size={17}/></Link>)}</div>
      </section>
      <section className="editorial-band"><div className="wrap editorial-inner"><div className="editorial-icon"><Newspaper size={25}/></div><div><div className="eyebrow">OUR EDITORIAL STANDARD</div><h2>Facts before noise. <em>People before power.</em></h2><p>We are committed to original reporting, transparent sourcing, corrections when needed and a clear separation between fact and opinion.</p></div><Link className="light-button" href="/editorial-policy/">Read our principles <ArrowRight size={16}/></Link></div></section>
      <footer><div className="wrap footer-main"><div className="brand footer-brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span></div><div className="footer-about">An independent Nigerian publication committed to public-interest journalism and accountable storytelling.</div><div className="footer-links"><Link href="/about/">About</Link><Link href="/editorial-policy/">Editorial policy</Link><Link href="/corrections/">Corrections</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link><Link href="/contact/">Contact</Link><Link href="/access/activate/">Activate access</Link><Link href="/source-desk/">Source desk</Link><Link href="/newsroom/sign-in/">Newsroom sign in</Link></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Masses Coalition of Nigeria</span><span>Independent. Responsible. For the people.</span></div></footer>
    </main>
  );
}
