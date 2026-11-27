"use client";

import Link from "@/components/site-link";
import {FormEvent,useState} from "react";
const API="https://mcn-newsroom-api.onrender.com";
export default function AccessActivationForm(){
 const [email,setEmail]=useState("");const [pin,setPin]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);const [success,setSuccess]=useState(false);const [articles,setArticles]=useState<{slug:string;title:string;dek:string|null;category:string}[]>([]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");setSuccess(false);
  try{const r=await fetch(API+"/api/access/activate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,pin})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to activate access.");window.sessionStorage.setItem("mcn_advanced_access_token",d.accessToken);const feed=await fetch(API+"/api/advanced/articles",{headers:{Authorization:"Bearer "+d.accessToken}});const feedData=await feed.json();setArticles(feedData.articles||[]);setSuccess(true);setMessage("Advanced access has been activated for "+d.email+". This access is available in this browser tab for seven days.");setPin("");}
  catch(e){setMessage(e instanceof Error?e.message:"Unable to activate access.");}finally{setBusy(false);}
 }
 return <form className="contact-form" onSubmit={submit}><label>Customer email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Single-use PIN<input required autoComplete="one-time-code" inputMode="text" maxLength={19} placeholder="XXXX-XXXX-XXXX-XXXX" value={pin} onChange={e=>setPin(e.target.value.toUpperCase())}/></label><button className="primary-button" disabled={busy}>{busy?"Checking…":"Activate access"}</button>{message&&<p className={success?"notice success-notice":"notice"} role="status">{message}</p>}{success&&<section className="advanced-access-list"><h2>Advanced access unlocked</h2>{articles.length?articles.map(a=><article key={a.slug}><span>{a.category}</span><h3><Link href={"/story/?slug="+encodeURIComponent(a.slug)}>{a.title}</Link></h3>{a.dek&&<p>{a.dek}</p>}</article>):<p>Your access is active. There are no advanced reports published yet; check again later.</p>}</section>}</form>;
}
