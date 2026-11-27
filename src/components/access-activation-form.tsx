"use client";

import {FormEvent,useState} from "react";
const API="https://mcn-newsroom-api.onrender.com";
export default function AccessActivationForm(){
 const [email,setEmail]=useState("");const [pin,setPin]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);const [success,setSuccess]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");setSuccess(false);
  try{const r=await fetch(API+"/api/access/activate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,pin})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to activate access.");setSuccess(true);setMessage("Advanced access has been activated for "+d.email+". Keep this email address for your access record.");setPin("");}
  catch(e){setMessage(e instanceof Error?e.message:"Unable to activate access.");}finally{setBusy(false);}
 }
 return <form className="contact-form" onSubmit={submit}><label>Customer email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Single-use PIN<input required autoComplete="one-time-code" inputMode="text" maxLength={19} placeholder="XXXX-XXXX-XXXX-XXXX" value={pin} onChange={e=>setPin(e.target.value.toUpperCase())}/></label><button className="primary-button" disabled={busy}>{busy?"Checking…":"Activate access"}</button>{message&&<p className={success?"notice success-notice":"notice"} role="status">{message}</p>}</form>;
}
