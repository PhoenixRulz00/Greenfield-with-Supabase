export function normalizeTeacherEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function hasTeacherEmailConflict(existingTeachers = [], email, currentTeacherId = null) {
  const normalizedEmail = normalizeTeacherEmail(email);
  if (!normalizedEmail) return false;

  return existingTeachers.some((teacher) => {
    const sameEmail = normalizeTeacherEmail(teacher.email) === normalizedEmail;
    const sameTeacher = currentTeacherId && teacher.id === currentTeacherId;
    return sameEmail && !sameTeacher;
  });
}
