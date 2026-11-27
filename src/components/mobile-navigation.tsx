"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, ArrowRight } from "lucide-react";

const links = [
  ["Politics", "/category/politics/"],
  ["Economy", "/category/economy/"],
  ["Security", "/category/security/"],
  ["Education", "/category/education/"],
  ["Health", "/category/health/"],
  ["Society", "/category/society/"],
];

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-navigation">
      <button className="menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen(v => !v)}>
        {open ? <X size={21}/> : <Menu size={21}/>}
      </button>
      {open && <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} />}
      <nav id="mobile-site-menu" className={open ? "mobile-menu is-open" : "mobile-menu"} aria-label="Mobile navigation" aria-hidden={!open}>
        <div className="mobile-menu-heading"><strong>Explore MCN</strong><button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={19}/></button></div>
        <Link href="/latest/" onClick={() => setOpen(false)}>Latest stories <ArrowRight size={16}/></Link>
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={16}/></Link>)}
        <Link href="/categories/" onClick={() => setOpen(false)}>All categories <ArrowRight size={16}/></Link>
        <Link href="/search/" onClick={() => setOpen(false)}><Search size={16}/> Search</Link>
        <Link href="/about/" onClick={() => setOpen(false)}>About MCN</Link>
        <Link href="/contact/" onClick={() => setOpen(false)}>Contact newsroom</Link>
        <Link href="/access/activate/" onClick={() => setOpen(false)}>Activate advanced access</Link>
        <Link href="/newsroom/sign-in/" onClick={() => setOpen(false)}>Newsroom sign in</Link>
      </nav>
    </div>
  );
}
