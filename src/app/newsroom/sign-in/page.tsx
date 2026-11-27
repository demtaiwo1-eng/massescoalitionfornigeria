"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newsroomRequest } from "@/lib/newsroom-api";

export default function NewsroomSignIn() {
  const router = useRouter();
  const [mode,setMode] = useState<"login"|"setup">("login");
  const [email,setEmail] = useState("");
  const [fullName,setFullName] = useState("");
  const [password,setPassword] = useState("");
  const [setupToken,setSetupToken] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [setupAvailable,setSetupAvailable] = useState(false);

  useEffect(()=>{void newsroomRequest<{available:boolean}>("/api/setup/status").then(r=>setSetupAvailable(r.available)).catch(()=>setSetupAvailable(false));},[]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "setup") {
        await newsroomRequest("/api/setup/first-admin",{method:"POST",headers:{"x-mcn-setup-token":setupToken},body:JSON.stringify({email,fullName,password})});
        setMode("login"); setSetupAvailable(false); setMessage("Publisher account created. Sign in with the email and password you just registered.");
      } else {
        await newsroomRequest("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});
        router.push("/newsroom/");
      }
    } catch(error) { setMessage(error instanceof Error ? error.message : "Unable to continue. Please try again."); }
    finally { setBusy(false); }
  }

  return <main className="signin-page"><div className="signin-card">
    <Link href="/" className="brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span></Link>
    <div className="eyebrow">PRIVATE EDITORIAL WORKSPACE</div>
    <h1>{mode === "setup" ? "Create publisher account" : "Newsroom access"}</h1>
    <p>{mode === "setup" ? "One-time first-owner setup. This creates the first Publisher account; staff accounts are managed from the newsroom." : "Sign in with your newsroom credentials. Access is restricted by your assigned editorial role."}</p>
    <form onSubmit={submit} className="signin-form">
      {mode === "setup" && <label>Full name<input required autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} /></label>}
      <label>Email address<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" minLength={mode==="setup"?14:1} autoComplete={mode==="setup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} />{mode==="setup" && <small>Use at least 14 characters.</small>}</label>
      {mode === "setup" && <label>One-time setup key<input required type="password" autoComplete="off" value={setupToken} onChange={e=>setSetupToken(e.target.value)} /></label>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "Please wait…" : mode==="setup" ? "Create Publisher account" : "Sign in securely"}</button>
    </form>
    {message && <p role="status" className="notice">{message}</p>}
    {setupAvailable && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode(mode==="login"?"setup":"login");setMessage("");}}> {mode==="login"?"First-time Publisher setup":"Back to sign in"} </button>}
    <p className="notice">Public readers do not need a newsroom account or activation PIN to read published stories.</p>
    <Link className="text-link" href="/">Return to public website</Link>
  </div></main>;
}
