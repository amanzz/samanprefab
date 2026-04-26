"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Nav data ── */
const SOLUTIONS = [
  { href: "/products?category=portable-cabins",  label: "Portable Cabins",  desc: "Relocatable modular units" },
  { href: "/products?category=security-cabins",  label: "Security Cabins",  desc: "Guard posts & checkpoints" },
  { href: "/products?category=worker-colony",    label: "Worker Colony",    desc: "On-site worker housing" },
  { href: "/products?category=prefab-offices",   label: "Prefab Offices",   desc: "Ready-to-use office spaces" },
];

/* ── Inline SVGs ── */
const ChevronDown = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const WaIcon = () => (
  <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

/* ── Dropdown ── */
function SolutionsDropdown({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Solutions
        <ChevronDown open={open} />
      </button>

      <div
        role="menu"
        style={{
          position: "absolute", top: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)",
          width: 280, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb", overflow: "hidden", zIndex: 100,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transform: open ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-8px)",
          transition: "opacity 0.2s, transform 0.2s",
        }}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg, #2563eb, #6366f1)" }} />
        <div style={{ padding: "8px 8px" }}>
          {SOLUTIONS.map(s => (
            <Link key={s.href} href={s.href} role="menuitem"
              onClick={() => setOpen(false)}
              style={{ display: "flex", flexDirection: "column", padding: "10px 14px", borderRadius: 10, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{s.label}</span>
              <span style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{s.desc}</span>
            </Link>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px" }}>
          <Link href="/products"
            onClick={() => setOpen(false)}
            style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none", background: "#eff6ff" }}
          >
            View All Products →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Drawer ── */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [solOpen, setSolOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { open ? (document.body.style.overflow = "hidden") : (document.body.style.overflow = ""); return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => { onClose(); }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s" }} />

      {/* Drawer */}
      <div role="dialog" aria-modal aria-label="Navigation menu"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "82%", maxWidth: 360, background: "#fff",
          zIndex: 50, display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.32,0,0,1)" }}>

        {/* Top */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#2563eb,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 14, height: 14, border: "2.5px solid white", transform: "rotate(45deg)" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", letterSpacing: "-0.3px" }}>SAMAN<span style={{ color: "#2563eb" }}>PREFAB</span></span>
          </Link>
          <button onClick={onClose} aria-label="Close menu"
            style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          {/* Solutions accordion */}
          <div>
            <button onClick={() => setSolOpen(v => !v)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 12, border: "none", background: "transparent", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
              Solutions
              <ChevronDown open={solOpen} />
            </button>
            <div style={{ overflow: "hidden", maxHeight: solOpen ? 400 : 0, transition: "max-height 0.3s ease", paddingLeft: 8 }}>
              {SOLUTIONS.map(s => (
                <Link key={s.href} href={s.href} onClick={onClose}
                  style={{ display: "block", padding: "11px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14, color: "#334155", marginBottom: 2 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {[{ href: "/about", label: "About" }, { href: "/contact", label: "Contact" }].map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              style={{ display: "block", padding: "13px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 2 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ padding: "16px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/contact?ref=quote" onClick={onClose}
            style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "white", fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
            Get Free Quote
          </Link>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" onClick={onClose}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 14, border: "2px solid #22c55e", color: "#15803d", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            <WaIcon /> Chat on WhatsApp
          </a>
        </div>

        <div style={{ padding: "14px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Call Us</p>
          <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>+91 98765 43210</p>
        </div>
      </div>
    </>
  );
}

/* ── Main Navbar ── */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const onScroll = useCallback(() => setScrolled(window.scrollY > 10), []);
  useEffect(() => { window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, [onScroll]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav
        id="site-header"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled ? "rgba(255,255,255,0.97)" : "#ffffff",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid #f1f5f9",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.07)" : "none",
          transition: "box-shadow 0.3s, border-color 0.3s",
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #2563eb 0%, #6366f1 50%, #2563eb 100%)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

          {/* Logo */}
          <Link href="/" aria-label="Saman Prefab homepage"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#2563eb,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.3)", flexShrink: 0 }}>
              <div style={{ width: 15, height: 15, border: "2.5px solid white", transform: "rotate(45deg)" }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1 }}>
              SAMAN<span style={{ color: "#2563eb" }}>PREFAB</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "none", alignItems: "center", gap: 4 }} className="desktop-nav">
            <SolutionsDropdown scrolled={scrolled} />
            {[{ href: "/about", label: "About" }, { href: "/contact", label: "Contact" }].map(item => (
              <Link key={item.href} href={item.href}
                style={{ textDecoration: "none", fontWeight: 600, fontSize: 14, color: isActive(item.href) ? "#2563eb" : "#374151", padding: "6px 12px", borderRadius: 8, transition: "all 0.15s", background: isActive(item.href) ? "#eff6ff" : "transparent" }}
                onMouseEnter={e => { if (!isActive(item.href)) { e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}}
                onMouseLeave={e => { if (!isActive(item.href)) { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; }}}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* WhatsApp - desktop only */}
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              style={{ display: "none", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, border: "1.5px solid #22c55e", color: "#15803d", fontWeight: 600, fontSize: 13, textDecoration: "none", transition: "all 0.2s" }}
              className="wa-btn"
              onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <WaIcon />
              WhatsApp
            </a>

            {/* Primary CTA */}
            <Link href="/contact?ref=quote"
              style={{ display: "none", alignItems: "center", padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "all 0.2s", whiteSpace: "nowrap" }}
              className="quote-btn"
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get Free Quote
            </Link>

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}
              style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}
              className="ham-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="11" x2="17" y2="11"/><line x1="3" y1="16" x2="17" y2="16"/>
              </svg>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes shimmer { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .wa-btn { display: flex !important; }
            .quote-btn { display: flex !important; }
            .ham-btn { display: none !important; }
          }
        `}</style>
      </nav>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
