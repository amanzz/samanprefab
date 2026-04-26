# Product Requirements Document (PRD)

## Product Vision
To build a high-performance, SEO-focused web platform serving as a robust public website for lead generation and quote management, alongside a powerful admin panel for centralized control over products, quotes, media, and SEO. The system will be a production-grade, highly scalable platform based on a Next.js App Router architecture.

## 1. Product System
The core entity representing items available for quoting.

**Data Structure & Fields:**
- **Core Fields:** `id`, `name`, `slug`, `sku`, `description`, `price` (optional/baseline), `category_id`, `status` (active/draft/archived).
- **Attributes:** Dynamic JSON structure for product-specific attributes (e.g., dimensions, materials, color, weight).
- **Media:** Array of associated media IDs (images, technical drawings, specifications PDFs).
- **SEO Fields:** `meta_title`, `meta_description`, `canonical_url`, `og_image`, `structured_data` (JSON-LD schema for Product).

## 2. Quote System
A seamless, multi-step lead generation engine designed to maximize conversions without immediate payment processing.

**Multi-Step Flow:**
1. **Selection:** User configures product variants and quantities.
2. **Details:** User inputs specific project requirements (timeline, delivery location, special instructions).
3. **Contact Info:** User provides name, company, email, and phone number.
4. **Confirmation:** System generates a reference number and sends acknowledgment emails.

**Data Structure:**
- **Quote Data:** `id`, `reference_number`, `status` (pending, reviewed, sent, rejected, converted), `total_estimated_value`, `created_at`, `updated_at`.
- **Customer Data:** `name`, `company`, `email`, `phone`, `location`.
- **Items:** Array of products with configured attributes and quantities.

## 3. SEO System
A fundamental architectural pillar designed to capture programmatic search traffic.

**City Pages Engine:**
- Dynamic generation of location-based landing pages (e.g., "Prefab Cabins in [City]").
- Content injection combining global product data with localized SEO text.
- Automated sitemap.xml and robots.txt management.

**Product Pages:**
- Granular URL structure: `/product-category/[slug]` and `/product/[category]/[slug]`.
- Automated breadcrumb generation and schema markup.

**Meta Structure:**
- Centralized configuration for title templates (e.g., `[Product Name] - Best Price | [Brand]`).
- Fallback mechanisms for missing meta descriptions.
- Dynamic Open Graph and Twitter card tags generation.

## 4. Admin Panel Features
A highly functional, TailAdmin-based dashboard for content management.

- **Dashboard (`/admin/dashboard`):** High-level metrics (new quotes, active products, recent conversions, traffic overview).
- **Product Management (`/admin/products`):** CRUD operations for products, bulk import/export, variant management, and attribute configuration.
- **Quote Management (`/admin/quotes`):** Kanban or list view for quote pipeline, status updates, PDF generation, and client communication logs.
- **SEO Management (`/admin/seo`):** Global meta tag defaults, city-page template management, 301 redirect management, and programmatic schema builder.
- **Settings (`/admin/settings`):** Global application settings, API keys, email templates, and user roles.
- **Media Management (`/admin/media`):** Centralized asset library with drag-and-drop upload, automatic WebP optimization, and global alt-text management.
- **Redirects (`/admin/redirects`):** Interface for managing 301/302 redirects to prevent 404s after product deprecations.
