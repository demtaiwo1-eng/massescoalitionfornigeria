import Link from "@/components/site-link";
import ContactForm from "../../components/contact-form";

export const metadata={title:"Contact the Newsroom",description:"Send a news tip, correction or editorial enquiry to Masses Coalition of Nigeria."};
export default function ContactPage(){
 return <main className="subpage"><div className="subpage-top"><div className="wrap"><Link href="/" className="back-link">← Back to homepage</Link><div className="eyebrow">MASSES COALITION OF NIGERIA</div><h1>Contact the newsroom</h1><p>Send a news tip, correction, response or editorial enquiry.</p></div></div>
  <div className="wrap subpage-content contact-layout"><div className="prose"><h2>We welcome responsible tips and feedback.</h2><p>Share enough detail for our editors to understand your message. We review submissions before any decision to publish. Do not submit passwords, banking details or information that could put a source at risk.</p><p>Sending a message does not guarantee publication or a response time. For urgent safety matters, contact the appropriate emergency service directly.</p></div><ContactForm/></div>
 </main>;
}
