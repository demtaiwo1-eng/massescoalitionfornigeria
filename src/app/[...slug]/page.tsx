import Link from "next/link";
import { notFound } from "next/navigation";

const categories = ["politics", "economy", "security", "education", "health", "society"];
const content: Record<string, { title: string; intro: string; body: string }> = {
  about: { title: "About Masses Coalition of Nigeria", intro: "Independent journalism, grounded in the public interest.", body: "Masses Coalition of Nigeria is being built as an independent publication for original Nigerian reporting, public-interest journalism and thoughtful analysis. Our work will be guided by accuracy, fairness, accountability and respect for the communities whose stories we tell." },
  "editorial-policy": { title: "Our editorial principles", intro: "Facts before noise. People before power.", body: "We aim to publish original, verified reporting. We will distinguish fact, analysis and opinion; identify sources clearly where it is safe and appropriate; seek responses from subjects of serious allegations; correct material errors transparently; and avoid fabricated stories, misleading headlines and unattributed copying. Submitted material is reviewed before publication." },
  contact: { title: "Contact the newsroom", intro: "Have a news tip, correction or editorial enquiry?", body: "Please contact the publication owner to arrange an official newsroom contact channel. Do not send passwords, payment credentials or confidential personal information through public comments." },
  latest: { title: "Latest stories", intro: "Original reporting and verified updates from our newsroom.", body: "Our editorial desk is preparing the first reports. Articles will appear here after they have passed editorial review and received publication approval." },
  categories: { title: "Explore our coverage", intro: "Reporting across the issues shaping Nigeria.", body: "Choose a coverage area below to explore stories as they are published." },
  search: { title: "Search the publication", intro: "Find reporting by topic, category or keyword.", body: "Search will cover published stories only. Private newsroom drafts and unpublished material are never exposed in public search." }
};

export default async function ContentPage({ params, searchParams }: { params: Promise<{ slug: string[] }>; searchParams: Promise<{ q?: string }> }) {
  const { slug } = await params;
  const key = slug.join("/").toLowerCase();
  const page = content[key];
  if (!page && !(slug.length === 2 && slug[0] === "category" && categories.includes(slug[1]))) notFound();
  const category = slug.length === 2 && slug[0] === "category" ? slug[1] : null;
  const q = (await searchParams).q || "";
  const current = category ? { title: category[0].toUpperCase() + category.slice(1), intro: `News, analysis and public-interest reporting on ${category}.`, body: "There are no published stories in this category yet. New articles will appear here after editorial review." } : page!;
  return <main className="subpage"><div className="subpage-top"><div className="wrap"><Link href="/" className="back-link">← Back to homepage</Link><div className="eyebrow">MASSES COALITION OF NIGERIA</div><h1>{current.title}</h1><p>{current.intro}</p></div></div><div className="wrap subpage-content">
    {key === "search" && <form action="/search" className="search-form"><input name="q" defaultValue={q} placeholder="Search published stories..." aria-label="Search published stories"/><button type="submit">Search</button></form>}
    {key === "categories" && <div className="category-grid">{categories.map((c,i)=><Link className="category-card" key={c} href={`/category/${c}`}><span className="category-number">0{i+1}</span><strong>{c[0].toUpperCase()+c.slice(1)}</strong><span>→</span></Link>)}</div>}
    {key !== "categories" && <article className="prose"><p>{current.body}</p>{key === "search" && q && <p className="notice">No matching published stories found for “{q}”.</p>}</article>}
    <div className="subpage-foot"><Link href="/editorial-policy">Editorial policy</Link><Link href="/newsroom/sign-in">Newsroom sign in</Link></div>
  </div></main>;
}
