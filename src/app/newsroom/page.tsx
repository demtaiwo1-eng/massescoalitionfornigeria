"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newsroomRequest } from "@/lib/newsroom-api";

type User={id:string;email:string;fullName:string;role:string};
type Article={id:string;slug:string;title:string;category:string;status:string;updated_at:string;author_name:string};

const categories=["Politics","Economy","Security","Education","Health","Society"];
export default function NewsroomDashboard() {
  const router=useRouter();
  const [user,setUser]=useState<User|null>(null);
  const [articles,setArticles]=useState<Article[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [showCreate,setShowCreate]=useState(false);
  const [title,setTitle]=useState("");
  const [category,setCategory]=useState("Politics");
  const [body,setBody]=useState("");

  async function refresh() {
    try {
      const [me,list]=await Promise.all([newsroomRequest<{user:User}>("/api/auth/me"),newsroomRequest<{articles:Article[]}>("/api/newsroom/articles")]);
      setUser(me.user);setArticles(list.articles);setError("");
    } catch(e) { setError(e instanceof Error?e.message:"Unable to load newsroom.");router.push("/newsroom/sign-in/"); }
    finally { setLoading(false); }
  }
  useEffect(()=>{void refresh();},[]);
  async function logout(){try{await newsroomRequest("/api/auth/logout",{method:"POST"});}finally{router.push("/newsroom/sign-in/");}}
  async function createArticle(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    const slug=title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    try{
      await newsroomRequest("/api/newsroom/articles",{method:"POST",body:JSON.stringify({title,slug,category,bodyText:body,bodyJson:{text:body}})});
      setTitle("");setBody("");setShowCreate(false);await refresh();
    }catch(err){setError(err instanceof Error?err.message:"Could not save article.");}
  }
  async function articleAction(id:string,action:"submit"|"review"|"publish"){
    try{
      const body=action==="review"?{decision:"approved",notes:"Approved in newsroom dashboard."}:{};
      await newsroomRequest(`/api/newsroom/articles/${id}/${action}`,{method:"POST",body:JSON.stringify(body)});
      await refresh();
    }catch(err){setError(err instanceof Error?err.message:"Action failed.");}
  }

  if(loading)return <main className="signin-page"><div className="signin-card">Loading secure newsroom…</div></main>;
  return <main className="newsroom-dashboard">
    <header className="newsroom-topbar"><Link href="/" className="brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>NEWSROOM</small></span></Link><div><span>{user?.fullName} · {user?.role.replaceAll("_"," ")}</span><button type="button" onClick={logout}>Sign out</button></div></header>
    <section className="newsroom-content"><div className="newsroom-heading"><div><div className="eyebrow">EDITORIAL OPERATIONS</div><h1>Newsroom workspace</h1><p>Draft, submit and review original reporting.</p></div><button className="primary-button" onClick={()=>setShowCreate(!showCreate)}> {showCreate?"Close":"New article"} </button></div>
      {error&&<p className="notice" role="alert">{error}</p>}
      {showCreate&&<form className="article-create-form" onSubmit={createArticle}><h2>Start an article</h2><label>Headline<input required value={title} onChange={e=>setTitle(e.target.value)} /></label><label>Section<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Story draft<textarea rows={8} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write original reporting. Verify facts and attribute sources." /></label><button className="primary-button" type="submit">Save draft</button></form>}
      <div className="newsroom-table-wrap"><h2>Editorial queue</h2>{articles.length===0?<p>No articles yet. Create your first draft to begin.</p>:<table className="newsroom-table"><thead><tr><th>Headline</th><th>Section</th><th>Status</th><th>Author</th><th>Actions</th></tr></thead><tbody>{articles.map(a=><tr key={a.id}><td>{a.title}</td><td>{a.category}</td><td><span className="status-pill">{a.status.replaceAll("_"," ")}</span></td><td>{a.author_name}</td><td><div className="article-actions">{a.status==="draft"||a.status==="changes_requested"?<button onClick={()=>articleAction(a.id,"submit")}>Submit</button>:null}{["publisher","managing_editor","news_editor"].includes(user?.role||"")&&a.status==="submitted"?<button onClick={()=>articleAction(a.id,"review")}>Approve</button>:null}{["publisher","managing_editor"].includes(user?.role||"")&&a.status==="approved"?<button onClick={()=>articleAction(a.id,"publish")}>Publish</button>:null}</div></td></tr>)}</tbody></table>}</div>
    </section>
  </main>;
}
