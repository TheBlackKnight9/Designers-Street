# 📚 Designers Street — Project Knowledge Base & Technical Handbook

Welcome to the official, authoritative **Project Knowledge Base & Technical Handbook** for **Designers Street**.

This handbook serves as the **Single Source of Truth** for developers, QA engineers, UI/UX designers, system architects, and product managers. It provides an end-to-end audit of the codebase, data models, API endpoints, application screens, design tokens, security policies, user flows, and deployment procedures.

---

## 🗂️ Knowledge Base Directory

| Document | Title | Description |
|:---|:---|:---|
| [01-project-overview.md](./01-project-overview.md) | **Project Overview & Business Model** | Vision, problem statement, marketplace model, customer/admin journeys, phase status |
| [02-architecture.md](./02-architecture.md) | **System Architecture & Data Flows** | High-level system design, repository-service pattern, Next.js server components, end-to-end trace |
| [03-tech-stack.md](./03-tech-stack.md) | **Technology Stack & Dependencies** | Exhaustive breakdown of packages, ORM, Supabase, Cloudinary, Razorpay, and build tools |
| [04-folder-structure.md](./04-folder-structure.md) | **Directory Map & File Conventions** | Complete mapping of `src/app`, `src/components`, `src/server`, `src/lib`, and config files |
| [05-database.md](./05-database.md) | **Database Schema & Data Models** | Complete Prisma models, relationships, indexes, constraints, ER diagrams, and usage maps |
| [06-api-documentation.md](./06-api-documentation.md) | **API Route Reference** | Technical specification of all REST endpoints, parameters, authentication, and error codes |
| [07-screen-documentation.md](./07-screen-documentation.md) | **Screen & Page Registry** | Full audit of every page route, components used, data loading, loading/empty/error states |
| [08-feature-documentation.md](./08-feature-documentation.md) | **Feature Matrix & Implementation** | End-to-end tracing of all features (Commerce, Inventory, Feed, Stories, Concept Art, Address Book) |
| [09-user-flows.md](./09-user-flows.md) | **User Flows & Sequence Diagrams** | Complete flowcharts for Customer Journey, Checkout, Admin Multi-House Management, and Payouts |
| [10-component-documentation.md](./10-component-documentation.md) | **UI Component Library** | Documentation of reusable components, props, parent/child relationships, and design tokens |
| [11-design-system.md](./11-design-system.md) | **Design System & Visual Tokens** | Typography hierarchy, color palette, spacing, shadows, borders, and responsive design rules |
| [12-security.md](./12-security.md) | **Security, Auth & Permissions** | Supabase Auth, middleware gating, role RBAC rules, input validation, and security recommendations |
| [13-testing-guide.md](./13-testing-guide.md) | **QA Testing Guide & Checklists** | Comprehensive test scenarios, happy paths, edge cases, failure states, and regression checklist |
| [14-developer-guide.md](./14-developer-guide.md) | **Developer Setup & Workflow** | Local setup, environment variables, database seeding, coding standards, and Git conventions |
| [15-phase-history.md](./15-phase-history.md) | **Phase History & Evolution** | Historical log of Phases 0 through 11 and current production Phase 12+ execution |
| [16-gap-analysis.md](./16-gap-analysis.md) | **Gap Analysis & Remaining Scope** | Honest audit of implemented, partial, missing, and deferred features grouped by severity |
| [17-known-bugs.md](./17-known-bugs.md) | **Known Bugs & Workarounds** | Current issue log, root cause analyses, workarounds, and resolution statuses |
| [18-performance.md](./18-performance.md) | **Performance & Optimization Audit** | Bundle size, image/video CDN optimization, database index efficiency, and caching strategy |
| [19-deployment-guide.md](./19-deployment-guide.md) | **Production Deployment & Ops** | Vercel deployment checklist, Supabase migration steps, Cloudinary setup, monitoring, and rollback |
| [20-final-handbook.md](./20-final-handbook.md) | **Executive Summary & Roadmap** | Project maturity score, architectural health, production readiness, and future recommendations |

---

## 📌 Ground Rule & Documentation Policy

Every feature documented in this handbook adheres to the **End-to-End Traceability Rule**:
$$\text{UI Screen} \longrightarrow \text{React Hook / Context} \longrightarrow \text{Client API} \longrightarrow \text{Next.js Route} \longrightarrow \text{Server Service} \longrightarrow \text{Prisma Repository} \longrightarrow \text{PostgreSQL Model}$$

If any link in the implementation chain is absent or incomplete, it is explicitly marked as `Not Implemented`, `Partial`, or `Missing`.

---

*Handcrafted for Designers Street Engineering & Product Team.*
