Context
You are responsible for standardizing the folder and file structure of a Next.js 15 project (App Router).  
The task must be idempotent: if the project is new, create only the minimal functional structure;  
if it’s already in progress, reorganize it without breaking existing routes/code and without creating unnecessary features.

Goal
1) Ensure a minimal, functional folder/file structure.  
2) Define (and document) the convention for global components vs. colocated, route-specific components.  
3) DO NOT create routes/segments not explicitly requested (e.g., (auth), login, register, dashboard, dalle).

Operation Mode (automatic)
- For a newly created project: create only the minimal structure listed in “Target Structure.”  
- For an ongoing project:  
  - Preserve all existing routes and files.  
  - Reorganize/move components and services into the described convention.  
  - Do not remove code without a functional equivalent; only move/refactor when safe.

Target Structure (minimal and generic)
my-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/                # Global/shared components
│   │   ├── ui/                    # Primitives (e.g., button, input, modal)
│   │   └── layout/                # Global Header/Footer/Sidebar (if used)
│   ├── services/                  # HTTP calls to APIs/external services (e.g., Back4App)
│   │   ├── api/                   # Thin SDK for your own API (if any)
│   │   └── external/              # Third-party integrations (email, payments)
│   ├── styles/                    # Extra CSS (optional)
│   └── tests/                     # unit/e2e (optional)
├── .env.local                     # local env vars (not versioned)
├── .env.example                   # example env vars for onboarding
├── .gitignore
├── .eslintrc.json
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── README.md
└── tsconfig.json

Key Rules
- DO NOT create routes/segments such as (auth), login, register, (dashboard), dalle unless explicitly requested later.  
- Components:  
  - **Global** → `src/components/*`.  
  - **Route-specific** → colocated inside `src/app/<route>/components/*`.  
- `services/`: only create empty directories/README placeholders if there are no calls yet.  
- Config files must be the minimal required for the project to run (no extra opinions).  
- Idempotency: running the task multiple times must not duplicate or recreate folders/files.

Specific Actions
1) Create the folders/files from “Target Structure” if they don’t exist.  
2) If the project already has routes:  
   - Detect components only used by one route and move them into `src/app/<route>/components/`.  
   - Keep only truly global components in `src/components/`.  
3) Create/update `README.md` with:  
   - Organization pattern (global vs. colocated).  
   - How to add new routes in the App Router while following this convention.  
   - Where to add future integrations (Back4App/external) in `services/`.  
4) Create/update `.env.example` with placeholder keys (no secrets) and `.env.local` empty or with commented placeholders.  
5) Ensure `.gitignore` ignores `.next`, `node_modules`, `.env.local`, etc.

Minimal Boilerplate Contents
- `src/app/layout.tsx`: basic document with `<html lang="en">`, `<body>`, and `{children}`.  
- `src/app/page.tsx`: simple `<main>` with a “Hello”/placeholder.  
- `src/app/globals.css`: import resets/Tailwind if applicable.  
- `src/app/error.tsx` and `src/app/not-found.tsx`: simple components.  

Acceptance Criteria
- `npm run dev` starts and renders the Home `/`.  
- 404 and error pages work.  
- No unrequested routes/features created.  
- Convention for colocation documented in `README.md`.  
- Structure is idempotent (re-running does not duplicate files).  

Restrictions
- Do not add extra libraries (e.g., shadcn, zustand, react-query) unless requested.  
- Do not create mock APIs or local endpoints unless requested.  
- Do not rename existing routes.  

Expected Output
- Folders/files created/organized per “Target Structure.”  
- Brief `README.md` with the rules above.  
- `.env.example` and `.env.local` present.