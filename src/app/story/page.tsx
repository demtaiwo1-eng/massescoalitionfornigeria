import { Suspense } from "react";
import StoryViewer from "../../components/story-viewer";

export const metadata={title:"News report",description:"Published reporting from Masses Coalition of Nigeria."};
export default function StoryPage(){
 return <Suspense fallback={<main className="story-page"><div className="wrap">Loading report…</div></main>}><StoryViewer/></Suspense>;
}
