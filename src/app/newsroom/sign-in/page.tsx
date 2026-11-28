"use client";

import Link from "@/components/site-link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newsroomRequest } from "@/lib/newsroom-api";

export default function NewsroomSignIn() {
  const router = useRouter();
  const [mode,setMode] = useState<"login"|"setup"|"recovery">("login");
  const [email,setEmail] = useState("");
  const [fullName,setFullName] = useState("");
  const [password,setPassword] = useState("");
  const [setupToken,setSetupToken] = useState("");
  const [recoveryKey,setRecoveryKey] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [setupAvailable,setSetupAvailable] = useState(false);

  useEffect(()=>{void newsroomRequest<{available:boolean}>("/api/setup/status").then(r=>setSetupAvailable(r.available)).catch(()=>setSetupAvailable(false));},[]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "recovery") {
        await newsroomRequest("/api/auth/publisher-recovery",{method:"POST",body:JSON.stringify({email,recoveryKey,newPassword:password})});
        setMode("login"); setPassword(""); setRecoveryKey("");
        setMessage("Publisher password updated. Sign in using your new password.");
      } else if (mode === "setup") {
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
    <h1>{mode === "setup" ? "Create publisher account" : mode === "recovery" ? "Recover Publisher access" : "Newsroom access"}</h1>
    <p>{mode === "setup" ? "One-time first-owner setup. This creates the first Publisher account; staff accounts are managed from the newsroom." : mode === "recovery" ? "Use the one-time recovery key supplied by the site administrator to set a new Publisher password. The password is entered only here, not in chat." : "Sign in with your newsroom credentials. Access is restricted by your assigned editorial role."}</p>
    <form onSubmit={submit} className="signin-form">
      {mode === "setup" && <label>Full name<input required autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} /></label>}
      <label>Email address<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" minLength={mode==="setup"||mode==="recovery"?14:1} autoComplete={mode==="setup"||mode==="recovery"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} />{(mode==="setup"||mode==="recovery") && <small>Use at least 14 characters.</small>}</label>
      {mode === "setup" && <label>One-time setup key<input required type="password" autoComplete="off" value={setupToken} onChange={e=>setSetupToken(e.target.value)} /></label>}
      {mode === "recovery" && <label>One-time Publisher recovery key<input required type="password" autoComplete="off" value={recoveryKey} onChange={e=>setRecoveryKey(e.target.value)} /></label>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "Please wait…" : mode==="setup" ? "Create Publisher account" : mode==="recovery" ? "Update Publisher password" : "Sign in securely"}</button>
    </form>
    {message && <p role="status" className="notice">{message}</p>}
    {mode === "login" && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode("recovery");setMessage("");}}>Recover Publisher access</button>}
    {mode === "recovery" && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode("login");setMessage("");}}>Back to sign in</button>}
    {setupAvailable && mode !== "recovery" && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode(mode==="login"?"setup":"login");setMessage("");}}> {mode==="login"?"First-time Publisher setup":"Back to sign in"} </button>}
    <p className="notice">Public readers do not need a newsroom account or activation PIN to read published stories.</p>
    <Link className="text-link" href="/">Return to public website</Link>
  </div></main>;
}
