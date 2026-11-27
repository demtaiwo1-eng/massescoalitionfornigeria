import Link from "next/link";
import AccessActivationForm from "../../../components/access-activation-form";

export const metadata={title:"Activate Advanced Access",description:"Activate a single-use advanced access PIN issued by the MCN publisher."};
export default function ActivateAccessPage(){
 return <main className="subpage"><div className="subpage-top"><div className="wrap"><Link href="/" className="back-link">← Back to homepage</Link><div className="eyebrow">MASSES COALITION OF NIGERIA</div><h1>Activate advanced access</h1><p>Enter the email address the Publisher issued the PIN to.</p></div></div><div className="wrap subpage-content contact-layout"><div className="prose"><h2>Secure, one-time activation</h2><p>Each PIN is unique, single-use, email-bound and expires on its stated date. If your PIN is invalid or has expired, contact the Publisher.</p><p>Payments are verified manually by the Publisher. This website does not collect payments or issue PINs automatically.</p></div><AccessActivationForm/></div></main>;
}
