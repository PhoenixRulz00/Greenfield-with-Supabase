import React, { useState } from "react";
import { Users, FileText, BookOpen, Calendar, CheckSquare } from "lucide-react";
import { Badge, EmptyState } from "../../components/ui";
import { attendanceStats, sectionLabel, STATUS_META } from "../../utils/attendanceStats";
import MaterialCard from "../../components/materials/MaterialCard";
import MaterialViewerModal from "../../components/materials/MaterialViewerModal";

export default function StudentHomePage({ data, studentId }) {
  const { students, sections, attendance, materials = [] } = data;
  const [activeTab, setActiveTab] = useState("materials"); // "materials" | "profile"
  const [materialFilter, setMaterialFilter] = useState("all");
  const [viewingMaterial, setViewingMaterial] = useState(null);

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    return (
      <EmptyState
        icon={Users}
        title="Profile not linked"
        hint="This student login isn't linked to a student record yet. Ask your admin to check the account setup."
      />
    );
  }

  const stats = attendanceStats(attendance, student.id);

  // Materials uploaded specifically to this student's section
  const myClassMaterials = materials.filter((m) => m.sectionId === student.sectionId);
  const filteredMaterials = materialFilter === "all"
    ? myClassMaterials
    : myClassMaterials.filter((m) => m.type === materialFilter);

  const notesCount = myClassMaterials.filter((m) => m.type === "notes").length;
  const homeworkCount = myClassMaterials.filter((m) => m.type === "homework").length;
  const assignmentCount = myClassMaterials.filter((m) => m.type === "assignment").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--rule)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="erp-serif text-2xl font-semibold">Welcome, {student.name}</h2>
            <span className="rounded-full bg-[var(--green-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--green)]">
              {sectionLabel(sections, student.sectionId)}
            </span>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            Access your class notes, homework, assignments, and attendance records.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-1">
          <button
            onClick={() => setActiveTab("materials")}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "materials"
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <BookOpen size={14} />
            Class Materials
            {myClassMaterials.length > 0 && (
              <span className="rounded-full bg-[var(--blue-bg)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--blue)]">
                {myClassMaterials.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "profile"
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <Users size={14} />
            Profile & Attendance
          </button>
        </div>
      </div>

      {/* TAB 1: CLASS MATERIALS & ASSIGNMENTS */}
      {activeTab === "materials" && (
        <div className="flex flex-col gap-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-3">
            {[
              { id: "all", label: `All Materials (${myClassMaterials.length})` },
              { id: "notes", label: `Notes & Chapters (${notesCount})` },
              { id: "homework", label: `Homework (${homeworkCount})` },
              { id: "assignment", label: `Assignments (${assignmentCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMaterialFilter(f.id)}
                className={`focus-ring rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  materialFilter === f.id
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "bg-[var(--slate-bg)] text-[var(--ink)] hover:bg-[var(--rule-soft)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--rule)] bg-[var(--paper-raised)] p-12 text-center">
              <FileText size={40} className="mx-auto text-[var(--ink-soft)] opacity-50 mb-3" />
              <h3 className="erp-serif text-lg font-semibold text-[var(--ink)]">
                No {materialFilter === "all" ? "study materials" : materialFilter} available yet
              </h3>
              <p className="text-xs text-[var(--ink-soft)] max-w-sm mx-auto mt-1">
                Your teachers haven't uploaded any {materialFilter === "all" ? "materials" : materialFilter} for {sectionLabel(sections, student.sectionId)} yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((mat) => (
                <MaterialCard
                  key={mat.id}
                  material={mat}
                  sections={sections}
                  canDelete={false}
                  onViewFile={(m) => setViewingMaterial(m)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & ATTENDANCE */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4 lg:col-span-1">
            <p className="erp-serif text-lg font-semibold">{student.name}</p>
            <dl className="mt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--ink-soft)]">Admission No.</dt>
                <dd className="erp-mono">{student.admissionNo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-soft)]">Section</dt>
                <dd>{sectionLabel(sections, student.sectionId)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-soft)]">Date of birth</dt>
                <dd>{student.dob || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-soft)]">Guardian</dt>
                <dd>{student.guardianName || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-soft)]">Guardian phone</dt>
                <dd>{student.guardianPhone || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4 lg:col-span-2">
            <h3 className="erp-serif mb-3 text-base font-semibold">Attendance summary</h3>
            <div className="mb-4 flex items-center gap-4">
              <div
                className="erp-serif text-3xl font-semibold"
                style={{
                  color: stats.pct === null ? "var(--ink-soft)" : stats.pct < 75 ? "var(--red)" : "var(--green)",
                }}
              >
                {stats.pct === null ? "—" : `${stats.pct}%`}
              </div>
              <p className="text-xs text-[var(--ink-soft)]">
                {stats.present} present / {stats.total} recorded days
              </p>
            </div>

            {stats.records.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">No attendance has been recorded yet.</p>
            ) : (
              <div className="erp-scroll max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                    <tr>
                      <th className="py-1">Date</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.records.map((r) => (
                      <tr key={r.id} className="border-t border-[var(--rule-soft)]">
                        <td className="erp-mono py-1.5 text-xs">{r.date}</td>
                        <td className="py-1.5">
                          <Badge tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].name}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-app File Viewer Modal */}
      {viewingMaterial && (
        <MaterialViewerModal
          material={viewingMaterial}
          onClose={() => setViewingMaterial(null)}
        />
      )}
    </div>
  );
}
