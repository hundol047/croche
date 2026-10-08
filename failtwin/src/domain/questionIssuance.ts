import type { Repositories, LearningState } from '@/storage/repositories';
import type { CrocheAIService, TrapInput } from '@/services/ai/CrocheAIService';
import type { Problem, Subject, TrapProblem } from './types';
import { practiceCatalog, practiceProblem, PRACTICE_BANK_VERSION, VARIANTS_PER_FAMILY, type Difficulty } from '@/content/practiceVariants';
import { validateProblem } from './schemas';

export interface IssuedQuestion { kind: 'practice' | 'trap'; subject: Subject; target?: string; text: string }

export const practiceProgressKey = (subject: Subject, difficulty: Difficulty, family: string) => `${PRACTICE_BANK_VERSION}:${subject}:${difficulty}:${family}`;

export function practiceAvailability(state: LearningState, subject: Subject, difficulty: Difficulty) {
  return practiceCatalog(subject, difficulty).map((f) => {
    const next = state.practiceProgress?.[practiceProgressKey(subject, difficulty, f.id)] ?? 0;
    if (!Number.isInteger(next) || next < 0 || next > VARIANTS_PER_FAMILY) throw new Error('출제 이력을 읽지 못했습니다. 저장된 학습 기록을 확인해주세요.');
    return { ...f, next, remaining: f.count - next };
  });
}

export async function issuePractice(repos: Repositories, ai: CrocheAIService, userId: string, subject: Subject, difficulty: Difficulty = 'medium', topic?: string): Promise<Problem> {
  if (ai.kind === 'mock') {
    let problem: Problem | undefined;
    // Selection and reservation share the serialized update. The local bank
    // stores counters, not 90,000 full question texts.
    await repos.learning.update(userId, (state) => {
      const pool = practiceAvailability(state, subject, difficulty).filter((f) => f.remaining > 0 && (!topic || f.topic === topic));
      pool.sort((a, b) => a.next - b.next);
      const family = pool[0];
      if (!family) throw new Error('EXHAUSTED: 선택한 난이도 또는 유형의 문제를 모두 열어봤습니다. 다른 유형이나 기본 문제를 선택해주세요.');
      const checked = validateProblem(practiceProblem(subject, difficulty, family.id, family.next));
      if (!checked.ok) throw new Error(checked.error);
      problem = checked.value;
      return { ...state, practiceProgress: { ...state.practiceProgress, [practiceProgressKey(subject, difficulty, family.id)]: family.next + 1 } };
    });
    return problem!;
  }
  const history = (await repos.learning.get(userId)).issued ?? [];
  const res = await ai.generateProblem({ subject, difficulty, topic, avoidPrompts: history.filter((q) => q.kind === 'practice' && q.subject === subject).map((q) => q.text) });
  if (!res.ok) throw new Error(res.error);
  await reserve(repos, userId, { kind: 'practice', subject: res.value.subject, text: res.value.prompt });
  return res.value;
}

export async function issueTrap(repos: Repositories, ai: CrocheAIService, userId: string, input: TrapInput): Promise<TrapProblem> {
  const history = (await repos.learning.get(userId)).issued ?? [];
  const res = await ai.generateTrapProblem({ ...input, avoidQuestions: history.filter((q) => q.kind === 'trap').map((q) => q.text) });
  if (!res.ok) throw new Error(res.error);
  await reserve(repos, userId, { kind: 'trap', subject: res.value.subject, target: res.value.targetErrorType, text: res.value.question });
  return res.value;
}

async function reserve(repos: Repositories, userId: string, question: IssuedQuestion): Promise<void> {
  // Issuance is recorded before opening the session, even when the answer is abandoned.
  await repos.learning.update(userId, (state) => {
    const issued = state.issued ?? [];
    if (issued.some((q) => q.kind === question.kind && q.text === question.text)) throw new Error('이미 준비한 문제입니다. 다시 시도해주세요.');
    return { ...state, issued: [...issued, question] };
  });
}
