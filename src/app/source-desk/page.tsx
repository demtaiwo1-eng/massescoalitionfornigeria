import type { Metadata } from "next";
import Link from "@/components/site-link";
import { newsStories } from "@/data/news-stories";
import { ArrowUpRight, ShieldAlert, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore News",
  description: "A collection of recent news reports with images, summaries, publication dates and links to original articles."
};

const flagTone = (flag: string) => flag.startsWith("Allegations") ? "source-flag source-flag-alert" : flag === "Campaign material" ? "source-flag source-flag-campaign" : "source-flag";

export default function SourceDeskPage() {
  return <main className="source-desk-page">
    <header className="header wrap">
      <Link href="/" className="brand" aria-label="Masses Coalition of Nigeria home">
        <span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span>
      </Link>
      <nav className="source-desk-nav"><Link href="/latest/">Latest stories</Link><Link href="/newsroom/sign-in/">Newsroom</Link><Link href="/contact/">Send a tip</Link></nav>
    </header>
    <section className="source-desk-hero wrap">
      <div className="eyebrow"><Newspaper size={15}/> NEWS & DEVELOPMENTS</div>
      <h1>Explore <em>News.</em></h1>
      <p className="source-desk-intro">Browse collected news reports with concise summaries, publication dates, categories, photographs and links to the original articles.</p>
      <div className="source-desk-notice" role="note">
        <ShieldAlert size={22}/>
        <div><strong>Editorial transparency</strong><p>These collected reports are provided for discovery and further reading. They are not automatically presented as original MCN journalism. Claims, opinion, campaign material and allegations require independent verification, balance and editorial approval before publication by MCN.</p></div>
      </div>
      <div className="source-desk-meta"><span><strong>{newsStories.length}</strong> available stories</span><span>17–27 November 2026</span><span>Original article links included</span></div>
    </section>
    <section className="wrap source-desk-list">
      <div className="source-desk-section-heading"><div><div className="eyebrow">LATEST FIRST</div><h2>Stories to <em>explore</em></h2></div><Link href="/#explore-news">Back to homepage <ArrowUpRight size={15}/></Link></div>
      <div className="source-brief-grid">
        {newsStories.map((story, index) => <article className="source-brief-card" key={story.url}>
          {story.imageUrl && <a className="source-story-image source-desk-image" href={story.url} target="_blank" rel="noopener noreferrer" aria-label={`Open original report: ${story.title}`}><img src={story.imageUrl} alt={story.title} loading="lazy" decoding="async" /></a>}
          <div className="source-brief-top"><span className="source-brief-index">{String(index+1).padStart(2,"0")}</span><time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Lagos"})}</time></div>
          <div className="source-brief-tags"><span className="source-category">{story.category}</span><span className={flagTone(story.flag)}>{story.flag}</span></div>
          <h3>{story.title}</h3>
          <p>{story.summary}</p>
          <a className="source-brief-link" href={story.url} target="_blank" rel="noopener noreferrer">Read full story <ArrowUpRight size={15}/></a>
        </article>)}
      </div>
    </section>
    <section className="source-desk-footer"><div className="wrap source-desk-footer-inner"><div><div className="eyebrow">HAVE FIRST-HAND INFORMATION?</div><h2>Help us verify the story.</h2><p>Send documents, on-record sources or corrections to the newsroom. A link to another publisher is a lead, not proof.</p></div><Link className="primary-button" href="/contact/">Contact the newsroom <ArrowUpRight size={16}/></Link></div></section>
    <footer className="source-desk-bottom"><div className="wrap"><span>© {new Date().getFullYear()} Masses Coalition of Nigeria</span><span>News collection · Editorial review required</span></div></footer>
  </main>;
}
