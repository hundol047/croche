import type { MistakeRecord, Problem, Subject, EducationLevel } from './types';
import { problemById } from '@/content/problems';
import { CURRICULUM_UNITS, curriculumProblem } from '@/content/curriculumUnits';
import { practiceProblem } from '@/content/practiceVariants';
import { validateProblem } from './schemas';
import { EDUCATION_LEVELS, SUBJECTS } from './curriculum';

export function latestProblemRecords(records: MistakeRecord[]): MistakeRecord[] {
  const latest = new Map<string, MistakeRecord>();
  for (const record of records) { latest.delete(record.problemId); latest.set(record.problemId, record); }
  return [...latest.values()].reverse();
}
export function reviewProblem(record: MistakeRecord): Problem | undefined {
  let problem = record.problem ?? problemById(record.problemId);
  if (!problem && record.problemId.startsWith('curriculum-v1:')) {
    for (const unit of CURRICULUM_UNITS) for (let i=0;i<unit.items.length;i+=1) {
      if (`curriculum-v1:${unit.id}:${i}` === record.problemId) problem = curriculumProblem(unit,i);
    }
  }
  if (!problem && record.problemId.startsWith('practice:')) {
    const parts = record.problemId.split(':');
    const school = parts[1] === 'school-v1', level = school ? parts[2] : 'university';
    const [subject, difficulty, family, index] = parts.slice(school ? 3 : 2);
    if ((parts[1] === 'v2' || school) && parts.length === (school ? 7 : 6) && EDUCATION_LEVELS.includes(level as EducationLevel)
      && SUBJECTS.includes(subject as Subject) && ['easy','medium','hard'].includes(difficulty ?? '') && /^(?:0|[1-9]\d{0,4})$/.test(index ?? '')) {
      try { problem = practiceProblem(subject as Subject,difficulty as Problem['difficulty'],family!,Number(index),level as EducationLevel); } catch { /* An old/unknown ID remains readable without inventing a question. */ }
    }
  }
  return problem && problem.id === record.problemId && validateProblem(problem).ok ? problem : undefined;
}
