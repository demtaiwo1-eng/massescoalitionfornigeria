"use client";

import Link from "@/components/site-link";
import { useEffect, useState } from "react";

const API="https://mcn-newsroom-api.onrender.com";
type Article={id:string;slug:string;title:string;dek:string|null;category:string;featured_image_url:string|null;featured_image_alt:string|null;published_at:string;seo_description:string|null};
type Pagination={page:number;limit:number;total:number;totalPages:number;hasPrevious:boolean;hasNext:boolean};

export default function PublicArticles({category,limit=12,paginate=false}: {category?:string;limit?:number;paginate?:boolean}) {
  const [articles,setArticles]=useState<Article[]>([]);
  const [pagination,setPagination]=useState<Pagination|null>(null);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{setPage(1);},[category,limit,paginate]);
  useEffect(()=>{
    const controller=new AbortController();
    const url=new URL(API+"/api/articles");
    url.searchParams.set("limit",String(limit));
    if(paginate)url.searchParams.set("page",String(page));
    if(category)url.searchParams.set("category",category);
    setLoading(true);setError("");
    fetch(url,{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error("Could not load published stories.");return r.json();})
      .then(data=>{setArticles(data.articles||[]);setPagination(data.pagination||null);})
      .catch(e=>{if(e.name!=="AbortError")setError(e.message||"Stories are temporarily unavailable.");})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[category,limit,paginate,page]);
  if(loading)return <p className="search-hint" aria-live="polite">Loading published stories…</p>;
  if(error)return <p className="notice" role="status">{error}</p>;
  if(!articles.length)return <div className="empty-stories"><strong>No stories published yet.</strong><p>Our newsroom is preparing original, verified reporting for this section. Check back soon.</p></div>;
  const totalPages=pagination?.totalPages||1;
  const pageNumbers=Array.from({length:totalPages},(_,i)=>i+1).filter(n=>n===1||n===totalPages||Math.abs(n-page)<=1);
  return <>
    {paginate&&pagination&&<p className="article-list-summary">Showing {(page-1)*limit+1}–{Math.min(page*limit,pagination.total)} of {pagination.total} published stories</p>}
    <div className="public-article-grid">{articles.map(a=><article className="public-article-card" key={a.id}>
      {a.featured_image_url&&<Link href={"/story/?slug="+encodeURIComponent(a.slug)}><img src={a.featured_image_url} alt={a.featured_image_alt||""} loading="lazy"/></Link>}
      <div className="article-card-copy"><span className="article-category">{a.category}</span><h2><Link href={"/story/?slug="+encodeURIComponent(a.slug)}>{a.title}</Link></h2>
        {a.dek&&<p>{a.dek}</p>}<time dateTime={a.published_at}>{new Date(a.published_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}</time>
      </div></article>)}</div>
    {paginate&&totalPages>1&&<nav className="article-pagination" aria-label="Story pages">
      <button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>← Previous</button>
      <div className="article-page-numbers">{pageNumbers.map((n,i)=><span key={n}>
        {i>0&&n-pageNumbers[i-1]>1&&<span className="page-ellipsis" aria-hidden="true">…</span>}
        <button type="button" aria-current={n===page?"page":undefined} className={n===page?"current":""} onClick={()=>setPage(n)}>{n}</button>
      </span>)}</div>
      <button type="button" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next →</button>
    </nav>}
  </>;
}
