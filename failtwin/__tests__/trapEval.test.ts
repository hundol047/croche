import { checkAnswer, inferTrapErrorType } from '@/domain/trapEval';
import type { TrapProblem } from '@/domain/types';

const base: Pick<TrapProblem, 'answerType' | 'correctAnswer'> = {
  answerType: 'numeric',
  correctAnswer: '20',
};

describe('trapEval', () => {
  it('checks numeric answers with tolerance and formatting noise', () => {
    expect(checkAnswer(base, '20')).toBe(true);
    expect(checkAnswer(base, ' 20 ')).toBe(true);
    expect(checkAnswer(base, '20.0')).toBe(true);
    expect(checkAnswer(base, '100')).toBe(false);
  });

  it('checks mcq answers order-independently', () => {
    const mcq: Pick<TrapProblem, 'answerType' | 'correctAnswer'> = {
      answerType: 'mcq',
      correctAnswer: 'tuple, str',
    };
    expect(checkAnswer(mcq, 'str, tuple')).toBe(true);
    expect(checkAnswer(mcq, 'tuple')).toBe(false);
  });

  it('checks text answers normalized', () => {
    const txt: Pick<TrapProblem, 'answerType' | 'correctAnswer'> = {
      answerType: 'text',
      correctAnswer: '[-1,1)',
    };
    expect(checkAnswer(txt, ' [-1, 1) ')).toBe(true);
    expect(checkAnswer(txt, '[-1,1]')).toBe(false);
  });

  it('infers the targeted error type by default (Prediction HIT)', () => {
    const trap: Pick<TrapProblem, 'targetErrorType'> = { targetErrorType: 'edge_case_omission' };
    expect(inferTrapErrorType(trap, '(-1,1)', '')).toBe('edge_case_omission');
  });

  it('overrides target when reasoning signals a different pattern', () => {
    const trap: Pick<TrapProblem, 'targetErrorType'> = { targetErrorType: 'edge_case_omission' };
    expect(inferTrapErrorType(trap, 'x', '그냥 빨리 찍었어요')).toBe('rushed_reasoning');
  });
});
