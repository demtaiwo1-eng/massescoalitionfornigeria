import Link from "next/link";

export const metadata = { title: "Newsroom sign in" };

export default function NewsroomSignIn() {
  return <main className="signin-page"><div className="signin-card"><Link href="/" className="brand"><span className="brand-mark">MCN</span><span><strong>MASSES COALITION</strong><small>OF NIGERIA</small></span></Link><div className="eyebrow">PRIVATE EDITORIAL WORKSPACE</div><h1>Newsroom access</h1><p>The private newsroom is being configured. Access will be invitation-based, with separate permissions for reporters, editors and the publisher.</p><p className="notice">Public readers do not need a newsroom account or activation PIN to read published stories.</p><Link className="primary-button" href="/">Return to public website</Link></div></main>;
}
