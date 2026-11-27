"use client";

import Link from "@/components/site-link";
import { ChangeEvent,FormEvent,useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { MCN_API_URL,newsroomRequest } from "@/lib/newsroom-api";

type User={id:string;email:string;fullName:string;role:string};
type Article={id:string;slug:string;title:string;category:string;status:string;updated_at:string;author_name:string;dek?:string|null;body_text?:string;featured_image_url?:string|null;featured_image_alt?:string|null;seo_title?:string|null;seo_description?:string|null};
type Message={id:string;name:string;email:string;subject:string;message:string;status:string;created_at:string};
type Staff={id:string;email:string;full_name:string;role:string;is_active:boolean};
type Pin={id:string;customer_email:string;access_level:string;expires_at:string;uses:number;max_uses:number;revoked_at:string|null};
type Panel="articles"|"messages"|"staff"|"pins";
const categories=["Politics","Economy","Security","Education","Health","Society"];
const roles=["managing_editor","news_editor","reporter","contributor"];

export default function NewsroomDashboard(){
 const router=useRouter();
 const [user,setUser]=useState<User|null>(null);const [articles,setArticles]=useState<Article[]>([]);
 const [messages,setMessages]=useState<Message[]>([]);const [staff,setStaff]=useState<Staff[]>([]);const [pins,setPins]=useState<Pin[]>([]);
 const [panel,setPanel]=useState<Panel>("articles");const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const [showCreate,setShowCreate]=useState(false);const [editingId,setEditingId]=useState<string|null>(null);const [title,setTitle]=useState("");const [category,setCategory]=useState("Politics");const [dek,setDek]=useState("");const [body,setBody]=useState("");const [seoTitle,setSeoTitle]=useState("");const [seoDescription,setSeoDescription]=useState("");const [featuredImageUrl,setFeaturedImageUrl]=useState("");const [featuredImageAlt,setFeaturedImageAlt]=useState("");const [uploadingImage,setUploadingImage]=useState(false);
 const [staffName,setStaffName]=useState("");const [staffEmail,setStaffEmail]=useState("");const [staffPassword,setStaffPassword]=useState("");const [staffRole,setStaffRole]=useState("reporter");
 const [pinEmail,setPinEmail]=useState("");const [pinDays,setPinDays]=useState("30");const [newPin,setNewPin]=useState("");

 async function refresh(){
  try{const [me,list]=await Promise.all([newsroomRequest<{user:User}>("/api/auth/me"),newsroomRequest<{articles:Article[]}>("/api/newsroom/articles")]);setUser(me.user);setArticles(list.articles);setError("");}
  catch(e){setError(e instanceof Error?e.message:"Unable to load newsroom.");router.replace("/newsroom/sign-in/");}
  finally{setLoading(false);}
 }
 async function loadPanel(next:Panel){
  setPanel(next);setError("");setNotice("");
  try{
   if(next==="messages"){const r=await newsroomRequest<{messages:Message[]}>("/api/newsroom/messages");setMessages(r.messages);}
   if(next==="staff"){const r=await newsroomRequest<{users:Staff[]}>("/api/newsroom/users");setStaff(r.users);}
   if(next==="pins"){const r=await newsroomRequest<{pins:Pin[]}>("/api/newsroom/access-pins");setPins(r.pins);}
  }catch(e){setError(e instanceof Error?e.message:"Could not load this workspace section.");}
 }
 useEffect(()=>{void refresh();},[]);
 async function logout(){try{await newsroomRequest("/api/auth/logout",{method:"POST"});}finally{router.replace("/newsroom/sign-in/");}}
 async function uploadFeaturedImage(event:ChangeEvent<HTMLInputElement>){
  const selected=event.target.files?.[0];
  if(!selected)return;
  setUploadingImage(true);setError("");
  try{
   const form=new FormData();form.append("image",selected);form.append("altText",featuredImageAlt);
   const session=window.sessionStorage.getItem("mcn_session_token");
   const response=await fetch(MCN_API_URL+"/api/newsroom/media",{method:"POST",headers:session?{Authorization:"Bearer "+session}:{},body:form});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Image upload failed.");
   setFeaturedImageUrl(MCN_API_URL+result.media.url);setNotice("Image uploaded.");
  }catch(problem){setError(problem instanceof Error?problem.message:"Image upload failed.");}
  finally{setUploadingImage(false);event.target.value="";}
 }
 async function createArticle(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setNotice("");
  const slug=title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  try{await newsroomRequest("/api/newsroom/articles",{method:"POST",body:JSON.stringify({title,slug,category,dek,bodyText:body,bodyJson:{text:body},seoTitle,seoDescription,featuredImageUrl,featuredImageAlt})});
   setTitle("");setDek("");setBody("");setSeoTitle("");setSeoDescription("");setShowCreate(false);setNotice("Draft saved.");await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Could not save article.");}finally{setBusy(false);}
 }
 async function editArticle(id:string){setError("");try{const r=await newsroomRequest<{article:any}>("/api/newsroom/articles/"+id);const a=r.article;setEditingId(id);setTitle(a.title||"");setCategory(a.category||"Politics");setDek(a.dek||"");setBody(a.body_text||"");setSeoTitle(a.seo_title||"");setSeoDescription(a.seo_description||"");setFeaturedImageUrl(a.featured_image_url||"");setFeaturedImageAlt(a.featured_image_alt||"");setShowCreate(true);setPanel("articles");window.scrollTo({top:0,behavior:"smooth"});}catch(e){setError(e instanceof Error?e.message:"Unable to load article for editing.");}}\n async function articleAction(id:string,action:"submit"|"review"|"request_changes"|"publish"){
  setBusy(true);setError("");setNotice("");
  try{const body=action==="review"?{decision:"approved",notes:"Approved in newsroom dashboard."}:action==="request_changes"?{decision:"changes_requested",notes:"Please revise this draft in response to the editor’s notes."}:{};
   await newsroomRequest("/api/newsroom/articles/"+id+"/"+action,{method:"POST",body:JSON.stringify(body)});
   setNotice(action==="submit"?"Article submitted for editorial review.":action==="review"?"Article approved.":action==="request_changes"?"Article returned for corrections.":"Article published.");await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Action failed.");}finally{setBusy(false);}
 }
 async function createStaff(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setNotice("");
  try{await newsroomRequest("/api/newsroom/users",{method:"POST",body:JSON.stringify({fullName:staffName,email:staffEmail,password:staffPassword,role:staffRole})});
   setStaffName("");setStaffEmail("");setStaffPassword("");setNotice("Staff account created. Share the temporary password securely.");await loadPanel("staff");
  }catch(e){setError(e instanceof Error?e.message:"Could not create staff account.");}finally{setBusy(false);}
 }
 async function updateStaff(id:string,values:{role?:string;isActive?:boolean}){
  setBusy(true);try{await newsroomRequest("/api/newsroom/users/"+id,{method:"PATCH",body:JSON.stringify(values)});await loadPanel("staff");setNotice("Staff account updated.");}
  catch(e){setError(e instanceof Error?e.message:"Could not update account.");}finally{setBusy(false);}
 }
 async function issuePin(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setNewPin("");
  try{const r=await newsroomRequest<{pin:string}>("/api/newsroom/access-pins",{method:"POST",body:JSON.stringify({email:pinEmail,expiresInDays:Number(pinDays)})});setNewPin(r.pin);setPinEmail("");await loadPanel("pins");setNotice("PIN issued. Copy it now; it will not be shown again.");}
  catch(e){setError(e instanceof Error?e.message:"Could not issue PIN.");}finally{setBusy(false);}
 }
 async function revokePin(id:string){
  setBusy(true);try{await newsroomRequest("/api/newsroom/access-pins/"+id+"/revoke",{method:"POST"});await loadPanel("pins");setNotice("PIN revoked.");}
  catch(e){setError(e instanceof Error?e.message:"Could not revoke PIN.");}finally{setBusy(false);}
 }
 async function updateMessage(id:string,status:string){
  setBusy(true);try{await newsroomRequest("/api/newsroom/messages/"+id,{method:"PATCH",body:JSON.stringify({status})});await loadPanel("messages");setNotice("Inbox message updated.");}
  catch(e){setError(e instanceof Error?e.message:"Could not update message.");}finally{setBusy(false);}
 }

 if(loading)return <main className="signin-page"><div className="signin-card">Loading secure newsroom…</div></main>;
 const publisher=user?.role==="publisher";
 return <main className="newsroom-dashboard">
  <header className="newsroom-topbar"><Link href="/" className="brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>NEWSROOM</small></span></Link><div><span>{user?.fullName} · {user?.role.replaceAll("_"," ")}</span><button type="button" onClick={logout}>Sign out</button></div></header>
  <section className="newsroom-content">
   <div className="newsroom-heading"><div><div className="eyebrow">EDITORIAL OPERATIONS</div><h1>Newsroom workspace</h1><p>Draft, review and publish original reporting. Your role controls the tools available here.</p></div><button className="primary-button" onClick={()=>{setPanel("articles");setShowCreate(v=>!v);}}>{showCreate?"Close":"New article"}</button></div>
   {error&&<p className="notice" role="alert">{error}</p>}{notice&&<p className="notice success-notice" role="status">{notice}</p>}
   <nav className="newsroom-tabs" aria-label="Newsroom sections">
    <button className={panel==="articles"?"active":""} onClick={()=>loadPanel("articles")}>Articles</button>
    {["publisher","managing_editor","news_editor"].includes(user?.role||"")&&<button className={panel==="messages"?"active":""} onClick={()=>loadPanel("messages")}>Inbox</button>}
    {publisher&&<><button className={panel==="staff"?"active":""} onClick={()=>loadPanel("staff")}>Staff accounts</button><button className={panel==="pins"?"active":""} onClick={()=>loadPanel("pins")}>Advanced access PINs</button></>}
   </nav>
   {panel==="articles"&&<>
    {showCreate&&<form className="article-create-form" onSubmit={createArticle}><h2>{editingId?"Edit article":"Start an article"}</h2><label>Headline<input required maxLength={220} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Section<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Standfirst / summary<input maxLength={300} value={dek} onChange={e=>setDek(e.target.value)}/></label><label>Story draft<textarea rows={12} required value={body} onChange={e=>setBody(e.target.value)} placeholder="Write original reporting. Verify facts, identify sources and include responses to serious allegations."/></label><label>Upload featured image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadFeaturedImage} disabled={uploadingImage}/><small>{uploadingImage?"Uploading image…":"JPG, PNG or WebP · maximum 3 MB"}</small></label><label>Or use an image URL<input type="url" value={featuredImageUrl} onChange={e=>setFeaturedImageUrl(e.target.value)} placeholder="https://…"/></label><label>Image alternative text<input maxLength={300} value={featuredImageAlt} onChange={e=>setFeaturedImageAlt(e.target.value)} placeholder="Describe the image for readers using assistive technology"/></label>{featuredImageUrl&&<img className="newsroom-image-preview" src={featuredImageUrl} alt={featuredImageAlt||"Featured image preview"}/>}<details><summary>Search engine metadata</summary><label>SEO title<input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)}/></label><label>SEO description<textarea rows={2} value={seoDescription} onChange={e=>setSeoDescription(e.target.value)}/></label></details><button className="primary-button" disabled={busy} type="submit">{busy?"Saving…":editingId?"Save article changes":"Save draft"}</button><button type="button" onClick={()=>{setShowCreate(false);setEditingId(null);}}>Cancel</button></form>}
    <div className="newsroom-table-wrap"><h2>Editorial queue</h2>{articles.length===0?<p>No articles yet. Create your first original draft to begin.</p>:<table className="newsroom-table"><thead><tr><th>Headline</th><th>Section</th><th>Status</th><th>Author</th><th>Actions</th></tr></thead><tbody>{articles.map(a=><tr key={a.id}><td>{a.title}</td><td>{a.category}</td><td><span className="status-pill">{a.status.replaceAll("_"," ")}</span></td><td>{a.author_name}</td><td><div className="article-actions">{(a.status==="draft"||a.status==="changes_requested")&&<><button disabled={busy} onClick={()=>editArticle(a.id)}>Edit</button><button disabled={busy} onClick={()=>articleAction(a.id,"submit")}>Submit</button></>}{["publisher","managing_editor","news_editor"].includes(user?.role||"")&&a.status==="submitted"&&<><button disabled={busy} onClick={()=>articleAction(a.id,"review")}>Approve</button><button disabled={busy} onClick={()=>articleAction(a.id,"request_changes")}>Request changes</button></>}{["publisher","managing_editor"].includes(user?.role||"")&&a.status==="approved"&&<button disabled={busy} onClick={()=>articleAction(a.id,"publish")}>Publish</button>}</div></td></tr>)}</tbody></table>}</div>
   </>}
   {panel==="messages"&&<div className="newsroom-table-wrap"><h2>Reader and source inbox</h2>{!messages.length?<p>No contact messages have arrived yet.</p>:<div className="inbox-list">{messages.map(m=><article className="inbox-card" key={m.id}><div className="inbox-card-head"><strong>{m.subject}</strong><span className="status-pill">{m.status}</span></div><p>{m.message}</p><div className="inbox-meta">{m.name} · <a href={"mailto:"+m.email}>{m.email}</a> · {new Date(m.created_at).toLocaleString("en-NG")}</div><div className="article-actions">{m.status==="new"&&<button onClick={()=>updateMessage(m.id,"read")}>Mark read</button>}{m.status!=="replied"&&<button onClick={()=>updateMessage(m.id,"replied")}>Mark replied</button>}{m.status!=="archived"&&<button onClick={()=>updateMessage(m.id,"archived")}>Archive</button>}</div></article>)}</div>}</div>}
   {panel==="staff"&&publisher&&<><form className="article-create-form" onSubmit={createStaff}><h2>Add newsroom staff</h2><label>Full name<input required value={staffName} onChange={e=>setStaffName(e.target.value)}/></label><label>Email<input required type="email" value={staffEmail} onChange={e=>setStaffEmail(e.target.value)}/></label><label>Temporary password<input required minLength={14} type="password" value={staffPassword} onChange={e=>setStaffPassword(e.target.value)}/><small>At least 14 characters. Share securely and ask the staff member to change it after first sign-in.</small></label><label>Role<select value={staffRole} onChange={e=>setStaffRole(e.target.value)}>{roles.map(r=><option key={r} value={r}>{r.replaceAll("_"," ")}</option>)}</select></label><button className="primary-button" disabled={busy}>Create staff account</button></form><div className="newsroom-table-wrap"><h2>Team access</h2><table className="newsroom-table"><thead><tr><th>Name / email</th><th>Role</th><th>Access</th><th>Actions</th></tr></thead><tbody>{staff.map(s=><tr key={s.id}><td>{s.full_name}<br/><small>{s.email}</small></td><td><select value={s.role} onChange={e=>updateStaff(s.id,{role:e.target.value})}>{roles.concat("publisher").map(r=><option key={r}>{r}</option>)}</select></td><td>{s.is_active?"Active":"Disabled"}</td><td><button onClick={()=>updateStaff(s.id,{isActive:!s.is_active})}>{s.is_active?"Disable":"Enable"}</button></td></tr>)}</tbody></table></div></>}
   {panel==="pins"&&publisher&&<><form className="article-create-form" onSubmit={issuePin}><h2>Issue advanced-access PIN</h2><p>Issue a unique, single-use PIN after you have independently confirmed the customer's payment. No payment gateway is connected.</p><label>Customer email<input required type="email" value={pinEmail} onChange={e=>setPinEmail(e.target.value)}/></label><label>PIN validity<select value={pinDays} onChange={e=>setPinDays(e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">365 days</option></select></label><button className="primary-button" disabled={busy}>Generate PIN</button>{newPin&&<div className="issued-pin"><strong>New PIN — copy now</strong><code>{newPin}</code><button type="button" onClick={()=>navigator.clipboard.writeText(newPin)}>Copy PIN</button></div>}</form><div className="newsroom-table-wrap"><h2>Issued PINs</h2>{!pins.length?<p>No advanced-access PINs issued.</p>:<table className="newsroom-table"><thead><tr><th>Customer</th><th>Expiry</th><th>Usage</th><th>Status</th><th>Action</th></tr></thead><tbody>{pins.map(p=><tr key={p.id}><td>{p.customer_email}</td><td>{new Date(p.expires_at).toLocaleDateString("en-NG")}</td><td>{p.uses}/{p.max_uses}</td><td>{p.revoked_at?"Revoked":p.uses>=p.max_uses?"Used":new Date(p.expires_at)<new Date()?"Expired":"Active"}</td><td>{!p.revoked_at&&p.uses<p.max_uses&&<button onClick={()=>revokePin(p.id)}>Revoke</button>}</td></tr>)}</tbody></table>}</div></>}
  </section>
 </main>;
}
