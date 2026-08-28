import React, { useState } from "react";
import { LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck } from "lucide-react";

import ThemeStyles from "./components/layout/ThemeStyles";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import ClassesPage from "./pages/admin/ClassesPage";
import ReportsPage from "./pages/admin/ReportsPage";
import TeacherHomePage from "./pages/teacher/TeacherHomePage";
import StudentHomePage from "./pages/student/StudentHomePage";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useSchoolData } from "./hooks/useSchoolData";

const NAV = {
  admin: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "students", label: "Students", icon: Users },
    { key: "teachers", label: "Teachers", icon: GraduationCap },
    { key: "classes", label: "Classes", icon: BookOpen },
    { key: "reports", label: "Reports", icon: ClipboardCheck },
  ],
  teacher: [{ key: "myclasses", label: "My Classes", icon: BookOpen }],
  student: [{ key: "profile", label: "My Profile", icon: Users }],
};

function SignedInApp() {
  const { profile, logout } = useAuth();
  const [tab, setTab] = useState(profile.role === "admin" ? "dashboard" : profile.role === "teacher" ? "myclasses" : "profile");
  const schoolData = useSchoolData(true);

  const navItems = NAV[profile.role] || [];

  return (
    <AppShell
      navItems={navItems}
      tab={tab}
      setTab={setTab}
      profile={profile}
      onSignOut={logout}
      footer={schoolData.loading ? "Loading from Supabase…" : schoolData.error ? `Error: ${schoolData.error}` : "Connected to Supabase · live"}
    >
      {schoolData.error && (
        <p className="mb-4 rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">
          {schoolData.error}
        </p>
      )}

      {profile.role === "admin" && tab === "dashboard" && <DashboardPage data={schoolData} />}
      {profile.role === "admin" && tab === "students" && <StudentsPage data={schoolData} refetch={schoolData.refetch} />}
      {profile.role === "admin" && tab === "teachers" && <TeachersPage data={schoolData} refetch={schoolData.refetch} />}
      {profile.role === "admin" && tab === "classes" && <ClassesPage data={schoolData} refetch={schoolData.refetch} />}
      {profile.role === "admin" && tab === "reports" && <ReportsPage data={schoolData} />}
      {profile.role === "teacher" && <TeacherHomePage data={schoolData} teacherId={profile.teacherId} refetch={schoolData.refetch} />}
      {profile.role === "student" && <StudentHomePage data={schoolData} studentId={profile.studentId} />}
    </AppShell>
  );
}

function Root() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="erp-root flex min-h-[400px] items-center justify-center rounded-lg border border-[var(--rule)]">
        <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="erp-root rounded-lg border border-[var(--rule)]">
        <LoginPage />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="erp-root flex min-h-[400px] items-center justify-center rounded-lg border border-[var(--rule)] p-6 text-center">
        <p className="text-sm text-[var(--ink-soft)]">
          Signed in, but no profile row was found for this account. Ask an admin to check Authentication → Users
          and the linked row in the <code className="erp-mono">profiles</code> table.
        </p>
      </div>
    );
  }

  return <SignedInApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeStyles />
      <Root />
    </AuthProvider>
  );
}
