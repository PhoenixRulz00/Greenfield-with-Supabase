import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTeacherEmail, hasTeacherEmailConflict } from '../../teacherValidation.js';

test('normalizeTeacherEmail trims and lowercases email values', () => {
  assert.equal(normalizeTeacherEmail('  Jane@School.com  '), 'jane@school.com');
});

test('hasTeacherEmailConflict detects duplicate teacher emails while excluding the current teacher', () => {
  const teachers = [
    { id: 'teacher-1', email: 'jane@school.com' },
    { id: 'teacher-2', email: 'alex@school.com' },
  ];

  assert.equal(hasTeacherEmailConflict(teachers, 'JANE@school.com'), true);
  assert.equal(hasTeacherEmailConflict(teachers, 'newteacher@school.com'), false);
  assert.equal(hasTeacherEmailConflict(teachers, 'JANE@school.com', 'teacher-1'), false);
});
