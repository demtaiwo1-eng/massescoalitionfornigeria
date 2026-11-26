"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const entries = [
  { title: "About Masses Coalition of Nigeria", section: "About", href: "/about/", description: "Our mission and public-interest journalism." },
  { title: "Editorial principles", section: "Editorial policy", href: "/editorial-policy/", description: "Accuracy, verification, corrections and responsible reporting." },
  { title: "Contact the newsroom", section: "Contact", href: "/contact/", description: "News tips, corrections and editorial enquiries." },
  { title: "Latest stories", section: "Latest", href: "/latest/", description: "The latest reports published by the newsroom." },
  { title: "All coverage categories", section: "Categories", href: "/categories/", description: "Browse all reporting topics." },
  ...["Politics", "Economy", "Security", "Education", "Health", "Society"].map(name => ({
    title: name, section: "Coverage category", href: `/category/${name.toLowerCase()}/`, description: `Reporting and analysis about ${name.toLowerCase()}.`
  })),
];

export default function SiteSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter(item => `${item.title} ${item.section} ${item.description}`.toLowerCase().includes(q));
  }, [query]);

  return <div className="site-search">
    <form className="search-form" onSubmit={event => event.preventDefault()} role="search">
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search pages and coverage..." aria-label="Search pages and coverage"/>
      <button type="submit" aria-label="Search"><Search size={17}/> Search</button>
    </form>
    <div className="search-results" aria-live="polite">
      {!query.trim() ? <p className="search-hint">Search the publication's pages and coverage areas.</p> :
        results.length ? <><p className="search-hint">{results.length} result{results.length===1?"":"s"} found</p>{results.map(item=><Link className="search-result" key={item.href} href={item.href}><span><small>{item.section}</small><strong>{item.title}</strong><span>{item.description}</span></span><b>→</b></Link>)}</> :
        <p className="search-hint">No matching pages found. Try a category such as Politics, Economy or Health.</p>}
    </div>
    <p className="search-hint">Search for published news articles will be enabled when the newsroom publishing system is connected.</p>
  </div>;
}
