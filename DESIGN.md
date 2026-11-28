# MCN Homepage Design Direction

## Reference sites inspected
- IB Connect: https://ibconnectng.blogspot.com/ — first reference for a simple news-post flow, compact metadata, ticker and image-led story listing.
- Punch Newspapers: https://punchng.com/ — reference for a clear headline hierarchy and prominent lead story.
- Premium Times: https://www.premiumtimesng.com/ — reference for editorial category organization and image-led reporting cards.
- TheCable: https://www.thecable.ng/ — reference for a strong top-stories area, byline/date metadata and compact secondary stories.

Captured on 28 November 2026 at desktop viewport 1440×1000. Screenshots were captured for all four homepages; the implementation uses observed page structure and extracted branding information, not copied brand assets or articles.

## Direction for MCN
Create a news-first landing page. The first screen should visibly contain a lead story, its image, headline, category and publication date, with a compact column of other stories. Follow with a clearly labelled source-desk strip, more image-led stories, original MCN newsroom publications, category navigation and editorial standards.

## Design observations
- MCN's existing green accent and semantic ink/surface variables remain authoritative.
- The reference sites are predominantly light, high-contrast editorial layouts with restrained borders and low-radius image/card treatments.
- IB Connect extracted palette: primary #FF184E, secondary #3B5999, white background, black text; Fira Sans body.
- Punch extracted red accent #FF0000, white background, black text; Open Sans / Alegreya family evidence.
- Premium Times extracted red accent #F70D28, white background, dark text; Georgia family evidence.
- TheCable extracted deep red #9D090E, green accent #7DC244, white background, near-black text; Inter / DM Sans evidence.
- Shared layout pattern: compact masthead/navigation, strong top-story block, supporting headlines, section labels, image thumbnails and date/category metadata.
- These are reference observations, not MCN brand tokens.

## Implementation guidance
- Do not use another publisher's logo, palette, article text or proprietary assets.
- Keep MCN logo placement in the site header and footer. The user will provide public/mcnlogo.png or public/mcnlogo.jpg; until then retain the current text mark as a safe fallback.
- Source Desk content must be labelled as attributed external-source material, not original MCN journalism.
- Published MCN articles remain in a separate newsroom section.
- Keep the design responsive: desktop two-column lead/supporting-story layout; mobile single-column flow with readable image crops and compact metadata.
- Article cards should show title, image, category, publication date and source/byline where available. Never invent missing bylines.

## Evidence limits
- Extracted font sizes and component values are approximate machine-derived branding observations, not exact declarations for every component.
- Desktop screenshots do not establish mobile behavior or interaction states.
- External image availability and reuse rights must be verified separately; MCN should use only images it is permitted to display.
