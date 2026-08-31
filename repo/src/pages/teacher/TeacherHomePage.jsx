import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, History, BookOpen, FileText, Plus, ClipboardCheck } from "lucide-react";
import { Button, EmptyState, Input, Modal } from "../../components/ui";
import { markAttendance, fetchHistoryForRecord } from "../../lib/queries/attendance";
import { deleteMaterial } from "../../lib/queries/materials";
import { STATUS_META, sectionAttendanceForDate, sectionLabel, teacherSectionIds, todayISO } from "../../utils/attendanceStats";
import MaterialUploadModal from "../../components/materials/MaterialUploadModal";
import MaterialCard from "../../components/materials/MaterialCard";
import MaterialViewerModal from "../../components/materials/MaterialViewerModal";

export default function TeacherHomePage({ data, teacherId, refetch }) {
  const { sections, students, teacherAssignments, attendance, materials = [], teachers = [] } = data;
  const mySections = teacherSectionIds(sections, teacherAssignments, teacherId);
  const currentTeacher = teachers.find((t) => t.id === teacherId);

  const [mainTab, setMainTab] = useState("attendance"); // "attendance" | "materials"
  const [activeSection, setActiveSection] = useState(mySections[0] || null);
  const [date, setDate] = useState(todayISO());
  const [historyFor, setHistoryFor] = useState(null); // { student, history }
  const [saving, setSaving] = useState(false);

  // Materials state
  const [materialFilter, setMaterialFilter] = useState("all"); // "all" | "notes" | "homework" | "assignment"
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState(null);

  useEffect(() => {
    if (!activeSection && mySections.length) {
      setActiveSection(mySections[0]);
    }
  }, [mySections, activeSection]);

  if (mySections.length === 0) {
    return <EmptyState icon={BookOpen} title="No sections assigned yet" hint="Ask an admin to assign you to a class section." />;
  }

  // Section-specific students and marks
  const sectionStudents = students.filter((s) => s.sectionId === activeSection && s.active);
  const todaysMarks = sectionAttendanceForDate(attendance, activeSection, date);
  const markedCount = todaysMarks.length;

  // Section-specific materials
  const sectionMaterials = materials.filter((m) => m.sectionId === activeSection);
  const filteredMaterials = materialFilter === "all"
    ? sectionMaterials
    : sectionMaterials.filter((m) => m.type === materialFilter);

  const setStatus = async (studentId, status) => {
    setSaving(true);
    try {
      await markAttendance({ studentId, sectionId: activeSection, date, status, markedById: teacherId });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const shiftDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  const openHistory = async (student, record) => {
    const history = await fetchHistoryForRecord(record.id);
    setHistoryFor({ student, history });
  };

  const handleDeleteMaterial = async (materialId, fileUrl) => {
    try {
      await deleteMaterial(materialId, fileUrl);
      await refetch();
    } catch (err) {
      alert("Failed to delete material: " + (err.message || err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--rule)] pb-4">
        <div>
          <h2 className="erp-serif text-2xl font-semibold">Teacher Portal</h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Manage attendance and share study notes, homework, & assignments with your classes.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-1">
          <button
            onClick={() => setMainTab("attendance")}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              mainTab === "attendance"
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <ClipboardCheck size={14} />
            Attendance
          </button>

          <button
            onClick={() => setMainTab("materials")}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              mainTab === "materials"
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <FileText size={14} />
            Notes & Assignments
            {materials.filter((m) => mySections.includes(m.sectionId)).length > 0 && (
              <span className="rounded-full bg-[var(--blue-bg)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--blue)]">
                {materials.filter((m) => mySections.includes(m.sectionId)).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Class & Section Switcher */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
          Select Class Section
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mySections.map((secId) => {
            const countForSec = materials.filter((m) => m.sectionId === secId).length;
            return (
              <button
                key={secId}
                onClick={() => setActiveSection(secId)}
                className={`focus-ring rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeSection === secId
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--rule)] bg-[var(--paper-raised)] hover:bg-[var(--slate-bg)]"
                }`}
              >
                {sectionLabel(sections, secId)}
                {mainTab === "materials" && countForSec > 0 && (
                  <span className={`ml-1.5 text-xs opacity-75`}>
                    ({countForSec})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ATTENDANCE */}
      {mainTab === "attendance" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-3">
            <div className="flex items-center gap-2">
              <button onClick={() => shiftDate(-1)} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)]">
                <ChevronLeft size={16} />
              </button>
              <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
              <button
                onClick={() => shiftDate(1)}
                disabled={date >= todayISO()}
                className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)] disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <span className="text-xs text-[var(--ink-soft)]">
              {markedCount} of {sectionStudents.length} marked{saving ? " · saving…" : ""}
            </span>
          </div>

          <div className="erp-scroll overflow-x-auto rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)]">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-[var(--slate-bg)] text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Admission No.</th>
                  <th className="px-3 py-2">Mark attendance</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sectionStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--ink-soft)]">
                      No active students found in this section.
                    </td>
                  </tr>
                ) : (
                  sectionStudents.map((s) => {
                    const rec = todaysMarks.find((a) => a.studentId === s.id);
                    return (
                      <tr key={s.id} className="border-t border-[var(--rule-soft)]">
                        <td className="px-3 py-2 font-medium">{s.name}</td>
                        <td className="erp-mono px-3 py-2 text-xs">{s.admissionNo}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            {Object.entries(STATUS_META).map(([key, meta]) => (
                              <button
                                key={key}
                                title={meta.name}
                                onClick={() => setStatus(s.id, key)}
                                className={`stamp ${rec?.status === key ? "active" : ""}`}
                                style={{
                                  color: meta.color,
                                  background: rec?.status === key ? `color-mix(in srgb, ${meta.color} 14%, transparent)` : "transparent",
                                }}
                              >
                                {meta.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {rec && (
                            <button
                              onClick={() => openHistory(s, rec)}
                              className="focus-ring inline-flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]"
                            >
                              <History size={12} /> history
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STUDY MATERIALS & ASSIGNMENTS */}
      {mainTab === "materials" && (
        <div className="flex flex-col gap-4">
          {/* Action Bar: Category filters & Upload button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: `All (${sectionMaterials.length})` },
                { id: "notes", label: `Notes (${sectionMaterials.filter((m) => m.type === "notes").length})` },
                { id: "homework", label: `Homework (${sectionMaterials.filter((m) => m.type === "homework").length})` },
                { id: "assignment", label: `Assignments (${sectionMaterials.filter((m) => m.type === "assignment").length})` },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setMaterialFilter(filter.id)}
                  className={`focus-ring rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    materialFilter === filter.id
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-[var(--slate-bg)] text-[var(--ink)] hover:bg-[var(--rule-soft)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setUploadOpen(true)}
            >
              Post Material / Assignment
            </Button>
          </div>

          {/* List of Materials */}
          {filteredMaterials.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--rule)] bg-[var(--paper-raised)] p-10 text-center">
              <FileText size={36} className="mx-auto text-[var(--ink-soft)] opacity-60 mb-2" />
              <h3 className="erp-serif text-lg font-semibold text-[var(--ink)]">
                No {materialFilter === "all" ? "materials" : materialFilter} posted yet for {sectionLabel(sections, activeSection)}
              </h3>
              <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto mt-1">
                Upload chapter notes, reading PDFs, homework scans, or assignments for students in this class section.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setUploadOpen(true)}
                >
                  Post to this Section
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((mat) => (
                <MaterialCard
                  key={mat.id}
                  material={mat}
                  sections={sections}
                  canDelete={mat.teacherId === teacherId || !mat.teacherId}
                  onDelete={handleDeleteMaterial}
                  onViewFile={(m) => setViewingMaterial(m)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance History Modal */}
      {historyFor && (
        <Modal title={`Attendance history · ${historyFor.student.name}`} onClose={() => setHistoryFor(null)}>
          {historyFor.history.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No corrections have been made to this record yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {historyFor.history.map((h, i) => (
                <li key={i} className="rounded-md border border-[var(--rule-soft)] p-2">
                  <span className="capitalize">{h.from}</span> → <span className="font-semibold capitalize">{h.to}</span>
                  <div className="text-xs text-[var(--ink-soft)]">{new Date(h.changedAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {/* Upload Material Modal */}
      {uploadOpen && (
        <MaterialUploadModal
          sections={sections}
          allowedSectionIds={mySections}
          defaultSectionId={activeSection}
          teacherId={teacherId}
          teacherSubject={currentTeacher?.subject || ""}
          onClose={() => setUploadOpen(false)}
          onSuccess={async () => {
            await refetch();
          }}
        />
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
