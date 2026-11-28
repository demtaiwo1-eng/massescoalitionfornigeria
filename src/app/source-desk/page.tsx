import type { Metadata } from "next";
import Link from "@/components/site-link";
import { ibConnectBriefs } from "@/data/ibconnect-briefs";
import { ArrowUpRight, ShieldAlert, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "IB Connect source desk",
  description: "Thirty-five recent, attributed external-source briefs from IB Connect, prepared for editorial review."
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
      <div className="eyebrow"><Newspaper size={15}/> EXTERNAL SOURCE MONITOR</div>
      <h1>35 recent stories.<br/><em>One source desk.</em></h1>
      <p className="source-desk-intro">A curated reading list of recent IB Connect posts, with concise MCN-written descriptions, publication dates and direct links to the original publisher.</p>
      <div className="source-desk-notice" role="note">
        <ShieldAlert size={22}/>
        <div><strong>Editorial transparency</strong><p>These are third-party source briefs, not original MCN reporting. MCN has not independently verified every claim. Opinion, campaign material and allegations are labelled; any story selected for MCN publication must be independently checked, balanced and cleared by an editor.</p></div>
      </div>
      <div className="source-desk-meta"><span><strong>{ibConnectBriefs.length}</strong> source briefs</span><span>15–27 November 2026</span><span>Publisher: IB Connect</span></div>
    </section>
    <section className="wrap source-desk-list">
      <div className="source-desk-section-heading"><div><div className="eyebrow">LATEST FIRST</div><h2>Recent posts from <em>IB Connect</em></h2></div><a href="https://ibconnectng.blogspot.com/" target="_blank" rel="noopener noreferrer">Visit original site <ArrowUpRight size={15}/></a></div>
      <div className="source-brief-grid">
        {ibConnectBriefs.map((story, index) => <article className="source-brief-card" key={story.url}>
          <div className="source-brief-top"><span className="source-brief-index">{String(index+1).padStart(2,"0")}</span><time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleString("en-NG",{day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Lagos"})}</time></div>
          <div className="source-brief-tags"><span className="source-category">{story.category}</span><span className={flagTone(story.flag)}>{story.flag}</span></div>
          <h3>{story.title}</h3>
          <p>{story.summary}</p>
          <a className="source-brief-link" href={story.url} target="_blank" rel="noopener noreferrer">Read original at IB Connect <ArrowUpRight size={15}/></a>
        </article>)}
      </div>
    </section>
    <section className="source-desk-footer"><div className="wrap source-desk-footer-inner"><div><div className="eyebrow">HAVE FIRST-HAND INFORMATION?</div><h2>Help us verify the story.</h2><p>Send documents, on-record sources or corrections to the newsroom. A link to another publisher is a lead, not proof.</p></div><Link className="primary-button" href="/contact/">Contact the newsroom <ArrowUpRight size={16}/></Link></div></section>
    <footer className="source-desk-bottom"><div className="wrap"><span>© {new Date().getFullYear()} Masses Coalition of Nigeria</span><span>External-source monitoring · Editorial review required</span></div></footer>
  </main>;
}
