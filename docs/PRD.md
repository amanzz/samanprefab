# Product Requirements Document (PRD)
## Saman Prefab — High-Performance Prefab Product Platform

**Version:** 1.0.0
**Date:** 2026-04-20
**Status:** Active

---

## 1. Product Vision

Saman Prefab is a high-performance, SEO-first, lead-generation web platform for a prefabricated construction product company. The platform's primary mission is to **convert visitors into qualified leads** through a structured quote engine — not to sell products directly online.

The platform must feel authoritative, fast, trustworthy, and regionally relevant to serve customers across 500+ Indian cities and towns.

---

## 2. Business Goals

| Goal | Description |
|---|---|
| **Primary** | Capture qualified leads via the Quote Engine |
| **Secondary** | Dominate local SEO for prefab searches in 500+ cities |
| **Tertiary** | Build a scalable content and product catalog ecosystem |
| **Operational** | Reduce manual sales effort via self-service quote flows |

---

## 3. Target Audience

- **B2C:** Individual homeowners planning construction or renovation
- **B2B:** Contractors, builders, architects, and real estate developers
- **Government / Institutional:** Schools, hospitals, warehouses, military/industrial facilities

---

## 4. Core Modules

### 4.1 Product Catalog
- Google Merchant Feed compatible
- Product variants (size, material, finish, load capacity)
- Product categories with filtered browsing
- Product detail pages with specs, images, downloads (PDF/DWG)
- Related products and comparison tool
- Structured data (JSON-LD: Product, BreadcrumbList)

### 4.2 Quote Engine (Primary Conversion System)
- Multi-step quote form (product → location → specs → contact)
- Dynamic pricing estimate with range display
- Quote reference ID system
- Email confirmation to user + internal notification
- CRM-ready lead data export (CSV / webhook)
- Admin dashboard to view, manage, and update quote statuses

### 4.3 Admin Panel (WordPress-level Control)
- Product CRUD: create, update, archive products
- Category and tag management
- Quote inbox: view all leads, filter by status, date, city
- City page generator: auto-generate SEO pages per city
- Content block editor: create/edit landing pages
- AI Writer integration: generate SEO content drafts
- Media library: upload, tag, organize images
- User roles: Super Admin, Content Editor, Sales Agent

### 4.4 SEO System (500+ City Pages)
- Dynamic city-level landing pages: `/prefab-[product]-in-[city]`
- Auto-populated with city name, local context, structured data
- Sitemap auto-generation
- Meta tags (title, description, OG, Twitter cards) per page
- Schema: LocalBusiness, Product, FAQPage, BreadcrumbList
- Canonical URL management
- robots.txt and sitemap.xml endpoints

### 4.5 Content System
- Block-based page editor (similar to Gutenberg/Notion)
- Supported blocks: Hero, Text, Image, CTA, FAQ, Testimonials, Grid
- AI Writer: generate city-page content, product descriptions, blog posts
- Blog/News module with category and tag support
- Testimonials and case studies module

---

## 5. Page Structure

### Public Pages

| Route | Page |
|---|---|
| `/` | Homepage |
| `/products` | Product Catalog (all) |
| `/products/[category]` | Category Listing |
| `/products/[category]/[slug]` | Product Detail Page |
| `/quote` | Quote Engine (multi-step) |
| `/quote/[ref-id]` | Quote Confirmation |
| `/blog` | Blog Listing |
| `/blog/[slug]` | Blog Post |
| `/about` | About Us |
| `/contact` | Contact Page |
| `/[city-slug]` | City Landing Page |
| `/prefab-[product]-in-[city]` | City × Product SEO Page |
| `/sitemap.xml` | Dynamic Sitemap |
| `/robots.txt` | Robots directive |

### Admin Pages (Protected, Role-based)

| Route | Page |
|---|---|
| `/admin` | Dashboard |
| `/admin/products` | Product List |
| `/admin/products/new` | Create Product |
| `/admin/products/[id]` | Edit Product |
| `/admin/quotes` | Quote Inbox |
| `/admin/quotes/[id]` | Quote Detail |
| `/admin/cities` | City Page Manager |
| `/admin/content` | Content Pages |
| `/admin/content/[id]` | Block Editor |
| `/admin/blog` | Blog Manager |
| `/admin/media` | Media Library |
| `/admin/settings` | Platform Settings |
| `/admin/users` | User Management |

---

## 6. User Flows

### 6.1 Lead Generation Flow (Primary)
```
Homepage / City SEO Page
    → Browse Products / View Product Detail
    → Click "Get Quote" CTA
    → Step 1: Select Product + Variant
    → Step 2: Enter Location (City, Pincode)
    → Step 3: Specify Requirements (quantity, timeline, notes)
    → Step 4: Enter Contact Info (name, phone, email)
    → Submit → Quote Reference ID generated
    → Email Confirmation sent to user
    → Notification sent to sales team
    → Admin Quote Inbox updated
```

### 6.2 SEO City Page Flow
```
Google Search: "prefab house in Pune"
    → /prefab-house-in-pune (City SEO page)
    → View local content, product highlights
    → Click "Get Quote for Pune"
    → Quote Engine (pre-filled with city = Pune)
    → Lead captured
```

### 6.3 Admin Content Flow
```
Admin Login
    → Navigate to Content / Blog
    → Create new page
    → Use Block Editor to add sections
    → Optionally use AI Writer to draft copy
    → Publish / Schedule
    → Page live on frontend
```

### 6.4 Admin Product Management Flow
```
Admin Login
    → Navigate to Products
    → Create / Edit Product
    → Set category, variants, images, specs
    → Generate Google Merchant Feed entry
    → Publish
```

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Performance** | Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms |
| **SEO** | 500+ indexed city pages within 90 days of launch |
| **Uptime** | 99.9% availability |
| **Security** | OWASP Top 10 compliance, JWT auth, rate limiting |
| **Accessibility** | WCAG 2.1 AA |
| **Mobile** | Fully responsive, mobile-first design |
| **Scalability** | Must handle 10,000+ products, 500+ city pages, 1M+ monthly page views |

---

## 8. Integration Requirements

| Integration | Purpose |
|---|---|
| Google Merchant Center | Product feed export |
| Google Analytics 4 | Traffic and conversion tracking |
| Google Search Console | SEO monitoring |
| SMTP / SendGrid | Email confirmations |
| WhatsApp Business API | Lead notification (optional) |
| CRM Webhook | Push quote leads to CRM |

---

*Document maintained by AI Agent. Last updated: 2026-04-20*
