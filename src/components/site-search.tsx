"use client";

import Link from "@/components/site-link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

const API="https://mcn-newsroom-api.onrender.com";
const pages=[
 {title:"About Masses Coalition of Nigeria",section:"About",href:"/about/",description:"Our mission and public-interest journalism."},
 {title:"Editorial principles",section:"Editorial policy",href:"/editorial-policy/",description:"Accuracy, verification, corrections and responsible reporting."},
 {title:"Contact the newsroom",section:"Contact",href:"/contact/",description:"News tips, corrections and editorial enquiries."},
 {title:"Latest stories",section:"Latest",href:"/latest/",description:"The latest reports published by the newsroom."},
 {title:"All coverage categories",section:"Categories",href:"/categories/",description:"Browse all reporting topics."},
 ...["Politics","Economy","Security","Education","Health","Society"].map(name=>({title:name,section:"Coverage category",href:"/category/"+name.toLowerCase()+"/",description:"Reporting and analysis about "+name.toLowerCase()+"."}))
];
type Article={slug:string;title:string;dek:string|null;category:string;published_at:string};
export default function SiteSearch(){
 const [query,setQuery]=useState("");const [articles,setArticles]=useState<Article[]>([]);const [loading,setLoading]=useState(false);
 useEffect(()=>{
  const q=query.trim();if(!q){setArticles([]);setLoading(false);return;}
  const controller=new AbortController();setLoading(true);
  const timer=window.setTimeout(()=>fetch(API+"/api/articles?q="+encodeURIComponent(q)+"&limit=30",{signal:controller.signal})
   .then(async r=>{if(!r.ok)throw new Error("Search unavailable");return r.json();})
   .then(d=>setArticles(d.articles||[])).catch(e=>{if(e.name!=="AbortError")setArticles([]);}).finally(()=>setLoading(false)),250);
  return()=>{window.clearTimeout(timer);controller.abort();};
 },[query]);
 const pageResults=useMemo(()=>{const q=query.trim().toLowerCase();return q?pages.filter(p=>(p.title+" "+p.section+" "+p.description).toLowerCase().includes(q)):[];},[query]);
 return <div className="site-search">
  <form className="search-form" onSubmit={e=>e.preventDefault()} role="search">
   <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search published stories, topics and pages…" aria-label="Search published stories and pages"/>
   <button type="submit" aria-label="Search"><Search size={17}/> Search</button>
  </form>
  <div className="search-results" aria-live="polite">
   {!query.trim()?<p className="search-hint">Search published articles and information across the publication.</p>:loading?<p className="search-hint">Searching published stories…</p>:<>
    {articles.map(a=><Link className="search-result" key={"article-"+a.slug} href={"/story/?slug="+encodeURIComponent(a.slug)}><span><small>{a.category} · Published story</small><strong>{a.title}</strong><span>{a.dek||"Read this report from the newsroom."}</span></span><b>→</b></Link>)}
    {pageResults.map(p=><Link className="search-result" key={p.href} href={p.href}><span><small>{p.section}</small><strong>{p.title}</strong><span>{p.description}</span></span><b>→</b></Link>)}
    {!articles.length&&!pageResults.length&&<p className="search-hint">No matching published stories or pages. Try another keyword or category.</p>}
    <p className="search-hint">{articles.length+pageResults.length} result{articles.length+pageResults.length===1?"":"s"} found</p>
   </>}
  </div>
 </div>;
}
