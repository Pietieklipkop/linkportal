# LinkPortal — Application Specification

This document details the specifications for **LinkPortal**, a custom contact/lead capture platform. The design is inspired by the bold corporate aesthetic of Specialist Mechanical Engineers (SME), utilizing deep blue, dark slate, and red accent colors.

---

## 1. Core Objectives & Authentication

- **Fixed Administrator Account**:
  - Email: `admin@linkportal.com`
  - Password: `password123` (configured securely at start/seeding or verified statically)
- **Multi-Tenant / Form Generation**:
  - The administrator can create unique "Form Links".
  - Each Form Link represents a separate target/tenant database space or category where user responses are stored.
- **Data Exporting**:
  - The administrator can review form submissions and download entries in CSV format.

---

## 2. Design System & Aesthetics (Inspired by SME)

- **Colors**:
  - **Primary (Navy Blue)**: `#013859` (RGB: `1, 56, 89`)
  - **Secondary (Slate/Teal)**: `#204F6A` (RGB: `32, 79, 106`)
  - **Accent (Crimson Red)**: `#B21E23` (RGB: `178, 30, 35`)
  - **Background (Light Gray)**: `#F9F9F9` (HSL: `0, 0%, 98%`)
  - **Text (Dark Grey)**: `#1B1B1B` (RGB: `27, 27, 27`)
- **Typography**:
  - Font Family: `Raleway` (headings) and `Lato` or `Inter` (body) loaded from Google Fonts.
- **Styling Details**:
  - Glassmorphic navigation headers.
  - Drop shadows on cards (`0 0.15em 2em rgba(0,0,0,0.15)`).
  - High-contrast buttons with hover transitions from `#B21E23` to `#204F6A` or `#013859`.

---

## 3. Database Schema (Drizzle ORM)

We will define the following models:

### 3.1. `form_link` (Form Configuration)

Tracks the generated URLs and their settings:

- `id` (text, primary key, UUID)
- `name` (text, unique, human-readable name for the link, e.g., "Main Website")
- `slug` (text, unique, URL friendly slug, e.g., `main-website`)
- `createdAt` (timestamp, default now)

### 3.2. `form_entry` (Form Submissions)

Stores submissions matching the specified fields:

- `id` (text, primary key, UUID)
- `formLinkId` (text, foreign key referencing `form_link.id`)
- `name` (text, required)
- `surname` (text, required)
- `email` (text, required)
- `phone` (text, required)
- `type` (text, enum: `'supplier' | 'client' | 'career_opportunity'`)
- `message` (text, required)
- `createdAt` (timestamp, default now)

---

## 4. Routing & View Structure

The application will use SvelteKit routes:

```
src/routes/
├── +layout.svelte               # Global layout, fonts, tailwind import
├── +page.svelte                 # Public homepage or admin redirection
├── login/
│   ├── +page.server.ts          # Login action handling (static verify / auth integration)
│   └── +page.svelte            # SME themed login page
├── admin/
│   ├── +layout.server.ts        # Guard: redirect to /login if not authenticated
│   ├── +layout.svelte          # Admin Dashboard layout with side/top navigation
│   ├── +page.server.ts          # Forms list & form creation actions
│   ├── +page.svelte            # Forms creation/listing UI
│   └── forms/
│       └── [id]/
│           ├── +page.server.ts  # Entries loader & CSV export action
│           └── +page.svelte    # Submissions review list and export trigger
└── f/
    └── [slug]/
        ├── +page.server.ts      # Public submission handler action
        └── +page.svelte        # Public form page styled like SME contact page
```

---

## 5. User Flows

### 5.1. Admin Authentication Flow

1. Navigates to `/login`.
2. Enters credentials `admin@linkportal.com` / `password123`.
3. Server signs in user.
4. Redirects to `/admin`.

### 5.2. Link Creation Flow

1. Admin navigates to `/admin`.
2. Fills out form title (e.g. "Vendor Registration").
3. Server generates a slug (e.g. `vendor-registration`) and persists the `form_link`.
4. Admin copies the distribution URL: `https://<domain>/f/vendor-registration`.

### 5.3. Public Submission Flow

1. Guest visits `/f/vendor-registration`.
2. Form fields are validated client-side and server-side:
   - **Name** (Text)
   - **Surname** (Text)
   - **Email** (Email address validation)
   - **Phone** (Tel input validation)
   - **Type** (Select: Supplier, Client, Career Opportunity)
   - **Message** (Textarea)
3. Upon submission, information is saved to `form_entry` table, and a success message page is rendered.

### 5.4. Data Export Flow

1. Admin opens `/admin/forms/[id]`.
2. Displays paginated or scrollable table of all submissions.
3. Click "Download CSV" calls an action that streams/returns a text response with content type `text/csv` formatted with standard fields:
   `Name,Surname,Email,Phone,Type,Message,Date`
