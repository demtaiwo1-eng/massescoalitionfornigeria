"use client";

import Link from "@/components/site-link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newsroomRequest } from "@/lib/newsroom-api";

export default function NewsroomSignIn() {
  const router = useRouter();
  const [mode,setMode] = useState<"login"|"setup"|"recovery"|"register">("login");
  const [email,setEmail] = useState("");
  const [fullName,setFullName] = useState("");
  const [password,setPassword] = useState("");
  const [setupToken,setSetupToken] = useState("");
  const [role,setRole] = useState("reporter");
  const [recoveryKey,setRecoveryKey] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [setupAvailable,setSetupAvailable] = useState(false);

  useEffect(()=>{void newsroomRequest<{available:boolean}>("/api/setup/status").then(r=>setSetupAvailable(r.available)).catch(()=>setSetupAvailable(false));},[]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "register") {
        await newsroomRequest("/api/auth/register",{method:"POST",body:JSON.stringify({email,fullName,password,role})});
        setMode("login"); setPassword(""); setMessage("Registration received. The Administrator must approve your account before you can sign in.");
      } else if (mode === "recovery") {
        await newsroomRequest("/api/auth/publisher-recovery",{method:"POST",body:JSON.stringify({email,recoveryKey,newPassword:password})});
        setMode("login"); setPassword(""); setRecoveryKey("");
        setMessage("Administrator password updated. Sign in using your new password.");
      } else if (mode === "setup") {
        await newsroomRequest("/api/setup/first-admin",{method:"POST",headers:{"x-mcn-setup-token":setupToken},body:JSON.stringify({email,fullName,password})});
        setMode("login"); setSetupAvailable(false); setMessage("Administrator account created. Sign in with the email and password you just registered.");
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
    <h1>{mode === "setup" ? "Register the first Administrator" : mode === "register" ? "Create newsroom account" : mode === "recovery" ? "Recover Administrator access" : "Newsroom access"}</h1>
    <p>{mode === "setup" ? "The first person to complete this protected setup becomes the newsroom Administrator and controls registrations, staff and publishing." : mode === "register" ? "Choose the newsroom role you are applying for. Your account stays pending until the Administrator approves it." : mode === "recovery" ? "Use the one-time recovery key to reset the Administrator password. Enter the new password only here." : "Sign in with your approved newsroom credentials. New registrations require Administrator approval."}</p>
    <form onSubmit={submit} className="signin-form">
      {(mode === "setup" || mode === "register") && <label>Full name<input required autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} /></label>}
      <label>Email address<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" minLength={mode==="setup"||mode==="recovery"||mode==="register"?14:1} autoComplete={mode==="setup"||mode==="recovery"||mode==="register"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} />{(mode==="setup"||mode==="recovery"||mode==="register") && <small>Use at least 14 characters.</small>}</label>
      {mode === "register" && <label>Requested role<select value={role} onChange={e=>setRole(e.target.value)}><option value="reporter">Reporter</option><option value="contributor">Contributor</option><option value="news_editor">News Editor</option><option value="managing_editor">Managing Editor</option></select></label>}
      {mode === "setup" && <label>One-time setup key<input required type="password" autoComplete="off" value={setupToken} onChange={e=>setSetupToken(e.target.value)} /></label>}
      {mode === "recovery" && <label>One-time Administrator recovery key<input required type="password" autoComplete="off" value={recoveryKey} onChange={e=>setRecoveryKey(e.target.value)} /></label>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "Please wait…" : mode==="setup" ? "Create Administrator account" : mode==="register" ? "Submit registration" : mode==="recovery" ? "Update Administrator password" : "Sign in securely"}</button>
    </form>
    {message && <p role="status" className="notice">{message}</p>}
    {mode === "login" && <><button type="button" className="signin-mode-toggle" onClick={()=>{setMode("register");setMessage("");}}>Register for a newsroom role</button><button type="button" className="signin-mode-toggle" onClick={()=>{setMode("recovery");setMessage("");}}>Recover Administrator access</button></>}
    {mode === "register" && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode("login");setMessage("");}}>Back to sign in</button>}
    {mode === "recovery" && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode("login");setMessage("");}}>Back to sign in</button>}
    {setupAvailable && mode !== "recovery" && <button type="button" className="signin-mode-toggle" onClick={()=>{setMode(mode==="login"?"setup":"login");setMessage("");}}> {mode==="login"?"First-time Administrator setup":"Back to sign in"} </button>}
    <p className="notice">Public readers do not need a newsroom account to read published stories. Staff accounts are activated only after Administrator approval.</p>
    <Link className="text-link" href="/">Return to public website</Link>
  </div></main>;
}
