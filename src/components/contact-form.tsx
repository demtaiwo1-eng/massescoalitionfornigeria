"use client";

import { FormEvent, useState } from "react";

const API="https://mcn-newsroom-api.onrender.com";
export default function ContactForm(){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [ok,setOk]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");setOk(false);
  const form=e.currentTarget;const data=new FormData(form);
  try{
   const r=await fetch(API+"/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:data.get("name"),email:data.get("email"),subject:data.get("subject"),message:data.get("message"),website:data.get("website")})});
   const result=await r.json();if(!r.ok)throw new Error(result.error||"Could not send your message.");
   setOk(true);setMessage(result.message||"Your message has been sent.");form.reset();
  }catch(err){setMessage(err instanceof Error?err.message:"Could not send your message.");}
  finally{setBusy(false);}
 }
 return <form className="contact-form" onSubmit={submit}>
  <label>Your name<input name="name" required maxLength={120} autoComplete="name"/></label>
  <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email"/></label>
  <label>Subject<input name="subject" required maxLength={180}/></label>
  <label>Message<textarea name="message" required rows={7} maxLength={5000}/></label>
  <label className="contact-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label>
  <button className="primary-button" disabled={busy} type="submit">{busy?"Sending…":"Send message"}</button>
  {message&&<p role="status" className={ok?"notice success-notice":"notice"}>{message}</p>}
 </form>;
}
