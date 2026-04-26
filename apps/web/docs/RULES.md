# Rules & Guidelines

## Anti-Hallucination Rules
- Do NOT hallucinate features, API endpoints, or data structures.
- Do NOT assume business logic without explicit user instruction.
- Only implement what is explicitly asked.
- Verify existing codebase patterns before writing new code.

## Coding Standards
- Write clean, maintainable code.
- No business logic or backend implementation in the frontend yet.
- No fake data/mock data generation unless strictly needed for UI scaffolding.
- Use explicit types and interfaces (TypeScript).

## UI Consistency & Component Reuse Rules
- Strict adherence to the TailAdmin starter template's design language.
- Keep the layout, sidebar, and core UI components from the starter.
- **Component Reuse:** NEVER duplicate UI code. Extract buttons, inputs, modals, and cards into `/src/components/` and reuse them universally.
- Use atomic design principles for building complex interfaces out of simpler, standardized components.

## Performance Rules
- **Server vs Client Components:** Default to Server Components (`React Server Components`) to minimize bundle size. Use `"use client"` ONLY when state, hooks, or browser APIs are required.
- **Image Optimization:** Always use `next/image` with proper sizing and `priority` tags for LCP elements. Avoid heavy unoptimized assets.
- **Lazy Loading:** Dynamically import heavy third-party libraries or components that aren't critical to the initial paint.

## SEO Rules
- **Semantic HTML:** Use proper HTML5 tags (`<article>`, `<section>`, `<aside>`, `<nav>`). Ensure one and only one `<h1>` per page.
- **Metadata Management:** Every public page MUST export Next.js `metadata` or `generateMetadata()`.
- **Accessibility:** All images MUST have descriptive `alt` text. Form inputs MUST have associated labels.
- **Performance == SEO:** Fast Core Web Vitals are mandatory. Avoid layout shifts (CLS) and ensure fast First Contentful Paint (FCP).

## Agent Behavior Rules
- MUST create and maintain the documentation system.
- MUST update MEMORY.md after every phase.
- Follow RULES.md strictly.
- Report status after completing steps.
