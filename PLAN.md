# Strategic Technical Plan: AI CSC Platform

## 1. Architecture Blueprint

This architecture is designed for **scalability, measurability, and serverless deployment**. It adheres to the "Read-Only" constraints for this agent but provides the blueprint for the Builder.

### Core Technology Stack
*   **Framework**: **Next.js 15 (App Router)**
    *   *Why*: Standards-based, serverless-friendly, excellent support for React Server Components (RSC) to minimize client bundle size.
*   **Database**: **PostgreSQL via Neon**
    *   *Why*: Serverless architecture (scales to zero), branching support for safe "preview" environments, strict relational integrity for the complex Course/Artifact/Team web.
*   **ORM**: **Prisma**
    *   *Why*: Type-safe schema definition, huge ecosystem, easy migration management.
*   **Authentication**: **Better Auth (NeonAuth)**
    *   *Why*: Modern, performance-focused, excellent TypeScript support, and native integration with PostgreSQL/Neon.
*   **File Storage**: **UploadThing (S3 Wrapper) or Vercel Blob**
    *   *Why*: Simplifies the complex task of uploading files (Artifacts) directly to cloud storage without burdening the server.
*   **Analytics**: **PostHog**
    *   *Why*: Event-based analytics to track "Time Saved" and "Tools Used" effectively. Can visualize growth funnels better than standard web analytics.
*   **AI Integration**: **Vercel AI SDK**
    *   *Why*: Standardized API for connecting with OpenAI/Anthropic/DeepSeek for "Reflection" analysis or future "AI Mentor" features.

### Frontend Strategy
*   **Styling**: **Tailwind CSS + Shadcn/UI** (Neo-Brutalism Theme).
*   **State Management**:
    *   **Server**: React Server Components (RSC) for fetching.
    *   **Client**: `nuqs` (URL-based state) for shareable dashboards/filters.
    *   **Mutations**: Server Actions (`next-safe-action` recommended for type safety).
*   **Visualization**: **Recharts** for the "Visible Growth" charts and Analytics dashboards.

---

## 2. Core Data Entities & Schema Strategy

### 2.1 User & Roles (The Foundation)
*   **Roles**: Defined as an Enum (`STUDENT`, `MENTOR`, `ADMIN`).
*   **Relations**:
    *   `User` ↔ `Team` (Optional, Many-to-One)
    *   `User` ↔ `Cohort`
    *   `User` ↔ `Hobby` (One-to-Many)

### 2.2 Course Structure (The Skeleton)
*   **Hierarchy**: `Course` → `Stage` → `Week`.
*   **Progress Tracking**:
    *   We do not track "clicks". We track **Outcomes** (Artifacts).
    *   A "Stage" is completed only when the required `Artifact` is submitted and approved.

### 2.3 The Artifact (The Atom)
This is the central entity. It must be polymorphic or flexible.
*   **Properties**:
    *   `type`: `SCHOOL`, `PERSONAL`, `TEAM`, `EXTERNAL`.
    *   `status`: `DRAFT`, `SUBMITTED`, `REVIEWED`.
    *   `content`: JSON (Rich text) or URL.
    *   `reflection`: Linked entity containing:
        *   `beforeState` (Text)
        *   `afterState` (Text)
        *   `toolUsed` (Relation to `Tool`)
        *   `timeSaved` (Int - minutes)
*   **Linkage**: Connected to a `Stage` (if school work) OR a `Hobby` (if personal).

### 2.4 Tools & Knowledge Base
*   **Tool Catalog**: A distinct table `Tool` (`name`, `category`, `url`).
*   **Usage**: Many-to-Man relation between `Artifact` and `Tool`.
    *   *Metric*: Count usage frequency to populate "Used by CSC students" badges.

---

## 3. Engineering Iterations (Phased Execution)

Instead of a monolithic build, we break this down into value-delivering increments.

### Phase 1: The Identity & Structure (Weeks 1-2)
*   **Goal**: Users can exist, have roles, and see the course structure.
*   **Tasks**:
    *   Setup Next.js + Prisma + Neon.
    *   Implement Authentication (Auth.js) with Role checks.
    *   Seed Database with Course → Stages → Weeks data.
    *   build "Course Map" UI (The vertical learning path).

### Phase 2: The Action Loop (Weeks 3-4)
*   **Goal**: Students can create Artifacts and Reflection.
*   **Tasks**:
    *   Implement "Make Artifact" Flow (Upload/Link).
    *   Build "Reflection" Form (The critical "Time Saved" inputs).
    *   Create "Hobbies" management UI.
    *   Connect Artifacts to Hobbies or Course Stages.

### Phase 3: The Social Layer (Weeks 5-6)
*   **Goal**: Teams form and Mentors can review.
*   **Tasks**:
    *   Team creation and member invites.
    *   Mentor Dashboard (View all students, filter by "Stuck").
    *   Commenting/Feedback system on Artifacts.

### Phase 4: Visibility & Assets (Week 7+)
*   **Goal**: The data becomes useful information.
*   **Tasks**:
    *   "Visible Growth" Charts (Recharts visualization of progress).
    *   Public Profile generation (Shareable URL).
    *   Tool Catalog & Favorites.

## 4. Next Steps for Builder

1.  **Initialize DB**: Create `schema.prisma` with `User`, `Course`, `Artifact`, `Team` models.
2.  **Auth Setup**: Configure Better Auth with Neon/PostgreSQL adapter.
3.  **Scaffold**: Create the `dashboard/` layout and `course/[slug]` route.
