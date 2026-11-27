"use client";

import Link from "@/components/site-link";
import { useEffect,useState } from "react";
import { useSearchParams } from "next/navigation";

const API="https://mcn-newsroom-api.onrender.com";
type Article={slug:string;title:string;dek:string|null;body_text:string;category:string;featured_image_url:string|null;featured_image_alt:string|null;published_at:string;seo_title:string|null;seo_description:string|null};
export default function StoryViewer(){
 const params=useSearchParams();const slug=params.get("slug");
 const [article,setArticle]=useState<Article|null>(null);const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 useEffect(()=>{if(!slug){setError("No article was selected.");setLoading(false);return;}const controller=new AbortController();
  fetch(API+"/api/articles/"+encodeURIComponent(slug),{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Article not found.");return d.article;})
   .then(setArticle).catch(e=>{if(e.name!=="AbortError")setError(e.message);}).finally(()=>setLoading(false));
  return()=>controller.abort();
 },[slug]);
 return <main className="story-page"><div className="wrap story-wrap"><Link href="/latest/" className="back-link">← Back to latest stories</Link>
  {loading?<p>Loading article…</p>:error?<div className="empty-stories"><strong>{error}</strong><p>The article may have been removed or is not yet published.</p></div>:article&&<article className="story-article">
   <div className="eyebrow">{article.category} · PUBLIC INTEREST REPORTING</div><h1>{article.title}</h1>{article.dek&&<p className="story-dek">{article.dek}</p>}
   <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric"})}</time>
   {article.featured_image_url&&<img className="story-image" src={article.featured_image_url} alt={article.featured_image_alt||""}/>}
   <div className="story-body">{(article.body_text||"").split(/\n{2,}/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>
   <p className="story-disclosure">This report is published under the Masses Coalition of Nigeria editorial standards. Contact the newsroom to submit a correction or response.</p>
   <Link href="/contact/" className="text-button">Contact the newsroom →</Link>
  </article>}
 </div></main>;
}
