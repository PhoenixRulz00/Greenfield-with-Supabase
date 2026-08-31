import { supabase } from "../supabaseClient";

/**
 * Fetch all study materials, ordered by creation date (newest first).
 * If sectionId is provided, filters by section.
 */
export async function fetchMaterials(sectionId = null) {
  let query = supabase
    .from("study_materials")
    .select("*, teachers(name, subject)")
    .order("created_at", { ascending: false });

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((m) => ({
    id: m.id,
    sectionId: m.section_id,
    teacherId: m.teacher_id,
    teacherName: m.teachers?.name || "Teacher",
    type: m.type, // 'notes' | 'homework' | 'assignment'
    title: m.title,
    subject: m.subject || m.teachers?.subject || "",
    description: m.description || "",
    dueDate: m.due_date || null,
    fileUrl: m.file_url || "",
    fileName: m.file_name || "",
    fileType: m.file_type || "",
    fileSize: m.file_size || null,
    createdAt: m.created_at,
  }));
}

/**
 * Upload an attachment (PDF, JPG, PNG, document) to the 'materials' Supabase Storage bucket.
 */
export async function uploadMaterialFile(file, sectionId = "general") {
  if (!file) return null;

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${sectionId}/${timestamp}_${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from("materials")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}. Please ensure the 'materials' storage bucket is created in Supabase.`);
  }

  const { data: urlData } = supabase.storage.from("materials").getPublicUrl(data.path);

  return {
    fileUrl: urlData.publicUrl,
    fileName: file.name,
    fileType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
    fileSize: file.size,
    storagePath: data.path,
  };
}

/**
 * Create a new study material / notes / homework / assignment entry.
 */
export async function createMaterial({
  sectionId,
  teacherId,
  type,
  title,
  subject,
  description,
  dueDate,
  fileUrl,
  fileName,
  fileType,
  fileSize,
}) {
  const payload = {
    section_id: sectionId,
    teacher_id: teacherId || null,
    type,
    title: title.trim(),
    subject: subject?.trim() || null,
    description: description?.trim() || null,
    due_date: dueDate || null,
    file_url: fileUrl || null,
    file_name: fileName || null,
    file_type: fileType || null,
    file_size: fileSize || null,
  };

  const { data, error } = await supabase
    .from("study_materials")
    .insert(payload)
    .select("*, teachers(name, subject)")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    sectionId: data.section_id,
    teacherId: data.teacher_id,
    teacherName: data.teachers?.name || "Teacher",
    type: data.type,
    title: data.title,
    subject: data.subject || "",
    description: data.description || "",
    dueDate: data.due_date,
    fileUrl: data.file_url,
    fileName: data.file_name,
    fileType: data.file_type,
    fileSize: data.file_size,
    createdAt: data.created_at,
  };
}

/**
 * Delete a study material record and its associated file from storage (if any).
 */
export async function deleteMaterial(materialId, fileUrl = null) {
  if (fileUrl && fileUrl.includes("/materials/")) {
    try {
      const parts = fileUrl.split("/materials/");
      if (parts[1]) {
        const decodedPath = decodeURIComponent(parts[1]);
        await supabase.storage.from("materials").remove([decodedPath]);
      }
    } catch (e) {
      console.warn("Could not delete file from storage:", e);
    }
  }

  const { error } = await supabase.from("study_materials").delete().eq("id", materialId);
  if (error) throw error;
}

/**
 * Realtime subscription to study_materials changes
 */
export function subscribeToMaterials(onChange) {
  const channel = supabase
    .channel("study-materials-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "study_materials" },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
