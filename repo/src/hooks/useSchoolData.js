import { useCallback, useEffect, useState } from "react";
import { fetchTeachers } from "../lib/queries/teachers";
import { fetchStudents } from "../lib/queries/students";
import { fetchClasses, fetchSections, fetchTeacherAssignments } from "../lib/queries/classes";
import { fetchAllAttendance, subscribeToAttendance } from "../lib/queries/attendance";
import { fetchMaterials, subscribeToMaterials } from "../lib/queries/materials";

const empty = { teachers: [], students: [], classes: [], sections: [], teacherAssignments: [], attendance: [], materials: [] };

/**
 * Loads all school data from Supabase and keeps attendance & materials live via
 * realtime subscriptions. `refetch()` is exposed so mutations (create/update
 * calls in lib/queries/*) can trigger a fresh pull after they succeed.
 */
export function useSchoolData(enabled) {
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      const [teachers, students, classes, sections, teacherAssignments, attendance, materials] = await Promise.all([
        fetchTeachers(),
        fetchStudents(),
        fetchClasses(),
        fetchSections(),
        fetchTeacherAssignments(),
        fetchAllAttendance(),
        fetchMaterials().catch((err) => {
          console.warn("Materials fetch skipped or table pending migration:", err);
          return [];
        }),
      ]);
      setData({ teachers, students, classes, sections, teacherAssignments, attendance, materials });
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load data from Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    refetch();
  }, [enabled, refetch]);

  // Live attendance updates
  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = subscribeToAttendance(() => {
      fetchAllAttendance().then((attendance) => setData((prev) => ({ ...prev, attendance })));
    });
    return unsubscribe;
  }, [enabled]);

  // Live materials updates
  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = subscribeToMaterials(() => {
      fetchMaterials()
        .then((materials) => setData((prev) => ({ ...prev, materials })))
        .catch(() => {});
    });
    return unsubscribe;
  }, [enabled]);

  return { ...data, loading, error, refetch };
}

