# CUK_DB_Project

## Central University of Kerala &mdash; Centralised Data System

A unified, centralized university data management platform designed for the **Central University of Kerala (CUK)**. The system enables departments and administrative sections to enter annual academic data into configurable dynamic tables, supports hierarchical scrutiny and multi-tier approval workflows, and allows administrators to consolidate, monitor compliance, and generate NAAC/NIRF-ready reports with Excel, CSV, and PDF exports.

---

## 🏛️ 7-Layer Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│ 1. USER INTERFACE                                      │
│    Department User | HoD | Authority | System Admin    │
└───────────────────────────┬────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATION & RBAC                               │
│    NextAuth Credentials + Role Middleware Protection   │
└───────────────────────────┬────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│ 3. DATA ENTRY ENGINE                                   │
│    Dynamic Tables (Text, Number, Date, File Upload)    │
└───────────────────────────┬────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│ 4. WORKFLOW PIPELINE                                   │
│    Draft → Submitted → Under Review → Verified → Done  │
│    + Return to Department with Reviewer Remarks        │
└───────────────────────────┬────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│ 5. CENTRAL DATABASE                                    │
│    Prisma ORM (SQLite / PostgreSQL)                    │
└───────────────────────────┬────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│ 6. REPORT & EXPORT ENGINE                              │
│    Consolidated Matrices | CSV | Excel | Printable PDF │
└───────────────────────────┬────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│ 7. ADMIN DASHBOARD & BI                                │
│    Compliance Matrix | Master Data | Full Audit Trail  │
└────────────────────────────────────────────────────────┘
```

---

## 🔑 Operational Roles & Demo Credentials

All test accounts use the password: `password123`

| Role | Email | Dashboard Route | Responsibilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@cukerala.ac.in` | `/admin` | BI Dashboard, Master Data (Depts, Users, Cycles, Templates), Reports & Exports, Audit Trail |
| **Competent Authority** | `authority@cukerala.ac.in` | `/authority` | University-wide compliance review, evidence inspection, verify & endorse, return |
| **Head of Department (HoD)** | `hod_cs@cukerala.ac.in` | `/hod` | Technical scrutiny of department entries, evidence download, verify & forward, return |
| **Department Nodal Officer** | `user_cs@cukerala.ac.in` | `/dashboard` | Enter departmental figures, upload sanction evidence orders, save draft, submit to HoD |
| **HoD (Economics)** | `hod_econ@cukerala.ac.in` | `/hod` | Scrutinize and verify Economics Department data |
| **Dept User (Economics)** | `user_econ@cukerala.ac.in` | `/dashboard` | Resubmit returned student strength figures with reviewer remarks |

---

## 🚀 Key Features

1. **Configurable Dynamic Templates:**
   * Admins can configure custom data-entry tables (e.g., *Faculty Strength*, *Student Strength*, *Research Projects & Grants*, *Infrastructure & Labs*) without touching code.
   * Supports `number`, `text`, `date`, and `file` upload fields (PDF, Excel, Word, JPG).

2. **Hierarchical 5-Step Approval Workflow:**
   * `DRAFT`: Saved locally by Department Nodal User.
   * `SUBMITTED`: Forwarded to HoD for technical scrutiny.
   * `UNDER_REVIEW`: Verified by HoD and forwarded to Competent Authority.
   * `VERIFIED`: Endorsed by Competent Authority (IQAC / VC Office).
   * `COMPLETED`: Finalized and archived by University Administration.
   * `RETURNED`: Can be sent back by HoD or Authority with custom remarks requiring revisions.

3. **Multi-Dimensional Consolidation & Reports:**
   * Filter university data by **Academic Year**, **School**, **Department**, **Template/Category**, and **Workflow Status**.
   * View dynamic column breakdown (e.g. Professor, Assoc Prof, Asst Prof, Total).
   * One-click **Download CSV / Excel** and clean **Print / PDF Report** with official university styling.

4. **Master Data Management:**
   * **Departments & Sections:** Manage academic departments and administrative sections mapped to Schools.
   * **User Directory:** Instant provisioning, deletion, and role mapping.
   * **Academic Reporting Cycles:** Manage reporting periods (e.g. `2026-27`) with active-year toggling to preserve historical data.
   * **Audit Trail:** Comprehensive activity logging (User, Department, Timestamp, Action, Old/New Value).

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, Turbopack)
* **Frontend:** React, Vanilla CSS Design System (Glassmorphism, Dark Mode)
* **Authentication:** NextAuth.js (JWT Strategy, RBAC)
* **Database & ORM:** Prisma ORM with SQLite (Local) / PostgreSQL (Cloud)
* **Security:** bcryptjs password hashing, server-side route middleware protection

---

## 💻 Local Development Setup

### 1. Prerequisites
* Node.js 18.x or 20.x
* npm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Tathagata2022/CUK_DB_Project.git
cd CUK_DB_Project

# Install dependencies
npm install

# Push schema and seed database
npx prisma db push
node prisma/seed.js

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. Use the **1-Click Prototype Role Login** buttons to immediately test any role.

---

## ☁️ Deployment (Render / Cloud)

This project includes a `render.yaml` blueprint ready for zero-cost deployment:

1. Create a repository on GitHub and push the code.
2. Sign in to [render.com](https://render.com) with GitHub.
3. Select **New +** &rarr; **Web Service** &rarr; choose `CUK_DB_Project`.
4. Set Build Command:
   ```bash
   npm install && npx prisma db push && node prisma/seed.js && npm run build
   ```
5. Set Start Command:
   ```bash
   npm start
   ```
6. Add Environment Variable:
   * `NEXTAUTH_SECRET` = `cuk_secret_key_2026`
7. Click **Deploy Web Service** &mdash; your app will be live with full HTTPS!

---

## 📄 License
Developed for the Central University of Kerala (CUK). Internal University Educational & Administrative Use.
