# 🏫 Greenfield School ERP

A full-stack **School ERP / School Management System** built with **React, Vite, TailwindCSS, and Supabase**.

**Selected Option:** Option A — School ERP / School Management System

---

## 🌐 Quick Access

| Resource                       | Link                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 🚀 **Live Application**        | https://greenfield-with-supabase.vercel.app/                                                         |
| 💻 **GitHub Repository**       | https://github.com/PhoenixRulz00/Greenfield-with-Supabase                                            |
| 📊 **Test Data & Credentials** | https://docs.google.com/spreadsheets/d/1ylxhLLl3o7d3IYTA2W9qPiWE7pCB5iXnmXvyXUPn1ME/edit?usp=sharing |

---

# ⚡ 5-Minute Examiner Workflow

The application has **three role-based portals**. Use the accounts below to quickly inspect the major workflows.

### 1️⃣ Admin → Management

Login:

```text
Email: admin@greenfield.edu
Password: admin123
```

Check:

* 📊 Dashboard statistics
* 👨‍🎓 Student management
* 👨‍🏫 Teacher management
* 🏫 Classes & Sections
* 🔗 Teacher/Subject assignments
* 📈 Attendance reports
* 📥 CSV export

---

### 2️⃣ Teacher → Attendance & Materials

Login:

```text
Email: rajesh.sharma@gmail.com
Password: rajesh456
```

Check:

* 🏫 Assigned section
* ✅ Mark Present / Absent / Late / Excused
* 📅 Change attendance date
* 📝 Attendance correction/audit trail
* 📚 Post Notes / Study Material
* 🏠 Post Homework
* 📋 Post Assignments
* 📎 Upload PDF/JPG/PNG/Word files
* ⏰ Set assignment deadlines

Other teacher accounts are available in the test-data spreadsheet.

---

### 3️⃣ Student → Restricted Class Access

Login:

```text
Email: aarav.stu001@school.edu
Password: Pass@STU1
```

Check:

* 📚 View class materials
* 📝 Notes
* 🏠 Homework
* 📋 Assignments
* 🔎 Category filtering
* ⏰ Due-date status
* 📄 In-app document viewing
* 📥 Download materials
* 📊 Personal attendance percentage
* 📅 Attendance history

---

# 🔐 Key Security Demonstration

The system uses **Supabase Row-Level Security (RLS)**.

```text
Admin
  → School-wide access

Teacher
  → Assigned sections only

Student
  → Own enrolled section only
```

Students cannot access materials belonging to other sections through direct database queries because access is enforced at the PostgreSQL/RLS level.

---

# 🏗️ Architecture

```text
React + Vite + TailwindCSS
           │
           ▼
     Supabase Client
           │
     ┌─────┼──────────────┐
     ▼     ▼              ▼
   Auth  PostgreSQL     Storage
          + RLS
           │
        Realtime
```

### Main Database Tables

```text
profiles
students
teachers
classes
sections
teacher_assignments
attendance_records
attendance_audit_log
study_materials
```

---

# 🛠️ Technology Stack

**Frontend**

* React 18
* Vite 6
* TailwindCSS
* Lucide Icons

**Backend**

* Supabase
* PostgreSQL
* Supabase Auth
* Row-Level Security
* Supabase Storage
* Supabase Realtime
* Supabase Edge Functions

**Deployment**

* Vercel

---

# 🚀 Run Locally

### Requirements

* Node.js 18+
* npm

### Setup

```bash
git clone https://github.com/PhoenixRulz00/Greenfield-with-Supabase.git
cd Greenfield-with-Supabase
npm install
```

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

---

# 🧪 Quick Test Checklist

| Feature               | Verify With       |
| --------------------- | ----------------- |
| Authentication        | All roles         |
| Admin Dashboard       | Admin             |
| Student Management    | Admin             |
| Teacher Management    | Admin             |
| Classes & Sections    | Admin             |
| Teacher Assignment    | Admin             |
| Attendance            | Teacher           |
| Attendance Audit      | Teacher           |
| Notes & Materials     | Teacher           |
| Homework              | Teacher           |
| Assignments           | Teacher           |
| File Upload/Download  | Teacher + Student |
| Class-based Isolation | Student           |
| Attendance History    | Student           |
| Reports               | Admin             |
| CSV Export            | Admin             |
| RLS Security          | Teacher + Student |

---

# 📁 Important Project Locations

```text
src/
├── components/
├── hooks/
├── lib/queries/
├── pages/
│   ├── admin/
│   ├── teacher/
│   └── student/
├── utils/
├── App.jsx
└── main.jsx

supabase/
├── schema.sql
└── functions/
```

---

# ⚠️ Known Limitations

This is an **MVP School ERP**. The current version does not include a full:

* Parent portal
* Online fee management system
* Examination/gradebook system
* Student assignment-submission/grading system
* SMS/email notification platform
* Timetable management system

These are planned as future extensions.

---

# ⭐ What to Inspect First

For the fastest evaluation, follow this order:

```text
ADMIN
  ↓
Dashboard
  ↓
Students / Teachers
  ↓
Classes & Assignments
  ↓
TEACHER
  ↓
Attendance
  ↓
Notes / Homework / Assignments
  ↓
STUDENT
  ↓
Materials
  ↓
Attendance
  ↓
RLS / Section Isolation
```

### Test Accounts

See the complete credential list and test data:

📊 **Google Sheets:**
https://docs.google.com/spreadsheets/d/1ylxhLLl3o7d3IYTA2W9qPiWE7pCB5iXnmXvyXUPn1ME/edit?usp=sharing

---

## 🎯 Project Goal

Demonstrate a working full-stack School ERP with:

**Role-based authentication + student/teacher management + classes + attendance + study materials + assignments + reporting + database-level security.**
