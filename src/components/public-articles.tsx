"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API="https://mcn-newsroom-api.onrender.com";
type Article={id:string;slug:string;title:string;dek:string|null;category:string;featured_image_url:string|null;featured_image_alt:string|null;published_at:string;seo_description:string|null};

export default function PublicArticles({category,limit=30}: {category?:string;limit?:number}) {
  const [articles,setArticles]=useState<Article[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    const url=new URL(API+"/api/articles");
    url.searchParams.set("limit",String(limit));
    if(category)url.searchParams.set("category",category);
    fetch(url,{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error("Could not load published stories.");return r.json();})
      .then(data=>setArticles(data.articles||[])).catch(e=>{if(e.name!=="AbortError")setError(e.message||"Stories are temporarily unavailable.");})
      .finally(()=>setLoading(false));
    return ()=>controller.abort();
  },[category,limit]);
  if(loading)return <p className="search-hint">Loading published stories…</p>;
  if(error)return <p className="notice" role="status">{error}</p>;
  if(!articles.length)return <div className="empty-stories"><strong>No stories published yet.</strong><p>Our newsroom is preparing original, verified reporting for this section. Check back soon.</p></div>;
  return <div className="public-article-grid">{articles.map(a=><article className="public-article-card" key={a.id}>
    {a.featured_image_url&&<Link href={"/story/?slug="+encodeURIComponent(a.slug)}><img src={a.featured_image_url} alt={a.featured_image_alt||""} loading="lazy"/></Link>}
    <div className="article-card-copy"><span className="article-category">{a.category}</span><h2><Link href={"/story/?slug="+encodeURIComponent(a.slug)}>{a.title}</Link></h2>
      {a.dek&&<p>{a.dek}</p>}<time dateTime={a.published_at}>{new Date(a.published_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}</time>
    </div></article>)}</div>;
}
