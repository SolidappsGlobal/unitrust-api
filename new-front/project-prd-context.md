# Project PRD Context

**Project Name:** UniTrust Data Matching  
**Repository (working name):** CSV File Upload Viewer

## Purpose
This document is the single source of truth for Cursor AI and contributors.  
It captures project intent, scope, architecture, data model, and key business rules to ensure consistency as the codebase grows.

## Project Name and Scope
- **Name:** UniTrust Data Matching (Frontend + Integration)
- **Scope:**
  - React/Vite frontend that allows CSV upload and data review.
  - Integration with Back4App (Parse) for authentication, file/object storage, and baseline/current dataset management.
  - Business rules (scoring, classification, confirmation) are executed through Back4App cloud functions, not Bubble.
- **Out of Scope (for current phase):**
  - Advanced exports (Excel/JSON).
  - Chart visualizations.

## Tech Stack (current)
- **Frontend:** React 18 + Vite, TypeScript, Tailwind, Radix UI, PapaParse.
- **Backend/BaaS:** Back4App (Parse) for authentication, data persistence, baseline/current storage, and API.
- **Tooling:** GitHub for version control, GitFlow branching model, Cursor IDE for AI-assisted coding.

## Current Status
- **Auth:** mocked locally; planned integration with Back4App Users.
- **CSV:** upload and table view working locally; persistence in Back4App planned (Parse.File and/or collections).
- **Git Process:** `main`, `develop`, and `feature/*` branches with PR flow in place.

## Architecture & Data Flow

### High-Level Architecture
- **Frontend (React + Vite)**  
  - User Interface for CSV upload and data visualization (tables, upcoming custom views).  
  - Handles authentication via Back4App Users API.  
  - Sends files to Back4App for storage and triggers the diff process.  

- **Back4App (Parse Platform)**  
  - **Baseline Storage:** last confirmed dataset.  
  - **Current Storage:** newly uploaded dataset from the frontend.  
  - **Diff Processor (Cloud Code):** compares datasets (Baseline vs Current).  
  - **Scoring Engine:** calculates similarity score for each record based on business rules.  
  - **Classification Layer:** classifies records into Auto Confirm, Manual Review, or New Record.  
  - **API Layer:** exposes results back to frontend as JSON.  

### Data Flow (simplified steps)
1. User uploads CSV in frontend.  
2. File is sent to Back4App and stored as Current CSV.  
3. Back4App compares Current CSV with Baseline CSV through Cloud Code.  
4. Results (diff + scores + classifications) are returned as JSON.  
5. Frontend displays:
   - Auto Confirm list  
   - Manual Review list  
   - New Records list  
6. Once confirmed by user, Current becomes the new Baseline stored in Back4App.

## Business Rules

### 1. Matching Engine & Scoring
- **Fields considered:**
  - PolicyNumber
  - Phone
  - Date of Birth
  - Name (FirstName + LastName)
  - Policy Value (Prem Value) → conditional
  - AgentNumber (WriterNumber) → conditional

- **Scoring Calculation:**
  - +20 points for each matched field.
  - **Core Fields (max 80 points):**
    - PolicyNumber
    - Phone
    - Date of Birth
    - Name
  - **Conditional Fields (evaluated only if all 4 core fields match):**
    - Policy Value (+20 points)
    - AgentNumber (+20 points)
  - **Maximum score = 100**.
  - Empty or inconsistent fields → zero points.

- **Classification thresholds:**
  - > 80 → **Auto Confirm**
  - 50–80 → **Manual Review**
  - < 50 → **New Record**

---

### 2. Record States
All records are derived from comparisons (Current vs Baseline).  

- **New Record**  
  - Logic: no existing match found.  
  - Action: user may trigger record creation.  

- **Confirmed**  
  - Logic: validated & confirmed (auto or manual).  
  - Action: no further review needed.  

- **Has Conflicts**  
  - Logic: multiple possible matches found.  
  - Action: flagged for Manual Review.  

- **To Confirm**  
  - Logic: potential match exists but requires explicit validation.  
  - Action: displayed for user confirmation.

---

### 3. Audit & Governance
- Every decision (automatic or manual) **must be logged**.  
- Logs include:
  - Input data
  - Score calculation
  - Final decision (system or human)
  - Timestamp
- Purpose: transparency, auditability, compliance.

---

### 4. Auto-Confirmation Rules
- Field `confirm = "yes"` if single unique match is found with:
  - Carrier + PolicyNumber + AgentNumber
- Field `confirm = "no"` if single unique match is found with:
  - Date of Birth (DOB)  

---

### 5. Error Handling & Escalation
- **API failure →** retry mechanism with logs.  
- **Incomplete CSV →** flag record for manual review.  
- **Multiple high-score matches →** escalate to human.  
- **Low score (<50%) →** escalate to human.  

---

### 6. Operational Guidance
- **Updating Baseline:** triggered after confirmation of Current dataset.  
- **Thresholds:** fixed for now; configurable in future.  
- **Monitoring:** dashboard planned (track totals, auto/manual/new, errors).

## Governance & Collaboration

### 1. Version Control (Git)
- **Repository:** GitHub → `csv-file-upload-viewer`
- **Branching Model:** GitFlow
  - `main` → stable production code
  - `develop` → integration of ongoing development
  - `feature/*` → new features or changes (e.g., `feature/auth`, `feature/add-project-context`)
  - `hotfix/*` → urgent fixes directly on `main`

### 2. Workflow
- Work is done in `feature/*` branches.
- Open **Pull Request (PR)** from `feature/*` → `develop`.
- Review and merge via GitHub interface.
- Periodically merge `develop` → `main` for releases.

### 3. Commit Conventions
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` → new feature
- `fix:` → bug fix
- `docs:` → documentation only
- `chore:` → tooling, configs, minor chores
- `refactor:` → code refactor without new features/fixes

Example:
feat: implement Back4App authentication with Parse SDK
docs: add project PRD context guidelines for Cursor


### 4. Release Management
- **Tag semantic versions** on `main`:
  - `v0.1.0` → initial project structure + auth placeholder
  - `v0.2.0` → first Back4App auth integration
  - `v0.3.0` → CSV persistence in Back4App
- **CHANGELOG.md** (to be created):
  - Human-readable summary of each release.
  - Auto-generated in future via tool (e.g., `standard-version`, `semantic-release`).

### 5. Collaboration Guidelines
- No direct commits to `main`.
- All contributions go through PRs.
- Keep PRs small and scoped (1 feature or fix).
- Always update `project-prd-context.md` after milestones (auth delivered, CSV persistence delivered, etc.).

### 6. CI/CD (Future Plan)
- GitHub Actions CI pipeline:
  - Lint + Typecheck
  - Run unit tests
  - Trigger build
- Deployment:
  - Frontend static hosting on Back4App or Vercel.
  - Backend maintained via Back4App Cloud Code + Parse API.

## Roadmap & Next Steps

### Phase 1 – Foundation (✅ In Progress)
- [x] Initialize Git repository + remote on GitHub  
- [x] Set up GitFlow workflow (`main`, `develop`, `feature/*`)  
- [x] Implement CSV upload & table view (local)  
- [x] Define project context (`project-prd-context.md`)  

### Phase 2 – Authentication
- [ ] Replace mocked auth with Back4App Users integration
- [ ] Implement login, signup, password reset
- [ ] Persist session in frontend (local storage / cookies)

### Phase 3 – Data Persistence
- [ ] Store uploaded CSV into Back4App (Parse.File + metadata)  
- [ ] Model schema in Parse Database for normalized record storage  
- [ ] Implement read & list of user-uploaded files  
- [ ] Select and load Baseline vs Current dataset from backend  

### Phase 4 – Matching & Scoring
- [ ] Implement Cloud Code in Back4App for diff + scoring  
- [ ] Integrate classification logic (Auto Confirm / Manual Review / New Record)  
- [ ] Display categorized results in frontend (tabs or views)  

### Phase 5 – Confirmation Workflow
- [ ] Enable user actions: confirm matches, create new records, resolve conflicts  
- [ ] When confirmed, persist "Current" dataset as new Baseline  
- [ ] Log every decision (user/system) for audit  

### Phase 6 – Governance & Releases
- [ ] Add `CHANGELOG.md` for semantic versioning  
- [ ] Configure branch protection rules (no direct commits to `main`)  
- [ ] Implement GitHub Actions (lint, build, tests)  
- [ ] First release tag: `v0.1.0`  

### Phase 7 – Enhancements (Future)
- [ ] Configurable thresholds for scoring  
- [ ] Dashboard view (stats, errors, matches history)  
- [ ] Export functionality (CSV/Excel/JSON)  
- [ ] Optional chart visualizations


