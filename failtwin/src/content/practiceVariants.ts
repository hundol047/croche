import type { Problem, Subject } from '@/domain/types';

/** Finite, reproducible exercises: each answer is derived alongside its prompt. */
export function practiceVariants(subject: Subject): Problem[] {
  const result: Problem[] = [];
  const add = (variant: number, family: string, topic: string, spec: Pick<Problem, 'prompt' | 'answerType' | 'correctAnswer' | 'explanation' | 'targetErrorType'>) => {
    result.push({ id: `practice:${subject}:${family}:${variant}`, subject, topic, source: 'ai', difficulty: 'medium', ...spec });
  };
  for (let i = 0; i < 6; i += 1) {
    if (subject === '공업수학') {
      const r = i + 1; const k = i + 2; const c = i + 3;
      add(i, 'series', '멱급수의 끝점', {
        prompt: `멱급수 Σ ((x/${r})ⁿ / n²) (n=1→∞)의 수렴구간을 끝점 포함 여부까지 구하시오.`,
        answerType: 'text', correctAnswer: `[-${r},${r}]`, targetErrorType: 'edge_case_omission',
        explanation: `|x/${r}|<1에서 수렴합니다. x=±${r}에서도 절댓값 급수 Σ1/n²가 수렴하므로 [-${r},${r}]입니다.`,
      });
      add(i, 'ode', '초기값과 지수함수', {
        prompt: `y' + ${k}y = 0, y(0)=${c}의 해 y(x)를 구하시오. 답은 ${c}e^(-${k}x) 형식으로 입력하세요.`,
        answerType: 'text', correctAnswer: `${c}e^{-${k}x}`, targetErrorType: 'sign_error',
        explanation: `일반해는 Ce^(-${k}x)이고 초기조건에서 C=${c}입니다. 따라서 ${c}e^(-${k}x)입니다.`,
      });
      add(i, 'domain', '약분 전 정의역', {
        prompt: `g(x)=(x²-${r * r})/(x-${r})에서 g(${r})은? 숫자 또는 “정의되지 않음”으로 답하세요.`,
        answerType: 'text', correctAnswer: '정의되지 않음', targetErrorType: 'condition_omission',
        explanation: `x≠${r}일 때만 x+${r}로 약분할 수 있습니다. 원래 분모가 0인 x=${r}에서는 정의되지 않습니다.`,
      });
    } else if (subject === '일반물리') {
      const a = i + 3; const t = i + 4; const m = 2 * (i + 1); const v = i + 3; const kmh = 36 * (i + 1);
      add(i, 'motion', '이동 거리와 시간', {
        prompt: `정지 상태에서 ${a} m/s²로 가속하는 물체가 ${t}초 후 이동한 거리는? 숫자만 입력하세요. 단위: m`,
        answerType: 'numeric', correctAnswer: String(a * t * t / 2), targetErrorType: 'calculation_error',
        explanation: `s=½at²=½×${a}×${t}²=${a * t * t / 2} m입니다.`,
      });
      add(i, 'energy', '운동에너지', {
        prompt: `질량 ${m} kg, 속력 ${v} m/s인 자전거 모형의 운동에너지는? 숫자만 입력하세요. 단위: J`,
        answerType: 'numeric', correctAnswer: String(m * v * v / 2), targetErrorType: 'calculation_error',
        explanation: `E=½mv²=½×${m}×${v}²=${m * v * v / 2} J입니다. 속력을 제곱합니다.`,
      });
      add(i, 'units', '속력 단위 변환', {
        prompt: `${kmh} km/h로 이동하는 열차의 속력은 몇 m/s인가요? 숫자만 입력하세요.`,
        answerType: 'numeric', correctAnswer: String(kmh / 3.6), targetErrorType: 'unit_error',
        explanation: `km/h를 m/s로 바꾸려면 3.6으로 나눕니다. ${kmh}÷3.6=${kmh / 3.6} m/s입니다.`,
      });
    } else {
      const end = 10 + i; const step = 3 + i; const values: number[] = [];
      for (let j = 0; j < end; j += step) values.push(j);
      const n = i + 2; let squares = 0;
      for (let j = 1; j <= n; j += 1) squares += j * j;
      add(i, 'range', 'range의 끝과 간격', {
        prompt: `range(0, ${end}, ${step})이 생성하는 값들의 합은? 숫자만 입력하세요.`,
        answerType: 'numeric', correctAnswer: String(values.reduce((sum, value) => sum + value, 0)), targetErrorType: 'edge_case_omission',
        explanation: `생성되는 값은 ${values.join(', ')}입니다. 끝값 ${end}은 포함하지 않습니다. 합은 ${values.reduce((sum, value) => sum + value, 0)}입니다.`,
      });
      add(i, 'squares', '반복문 누적', {
        prompt: `다음 코드의 출력은?\n\ntotal = 0\nfor i in range(1, ${n + 1}):\n    total += i * i\nprint(total)`,
        answerType: 'numeric', correctAnswer: String(squares), targetErrorType: 'calculation_error',
        explanation: `1부터 ${n}까지 각 수의 제곱을 더합니다. 결과는 ${squares}입니다.`,
      });
      add(i, 'filter', '조건을 만족하는 횟수', {
        prompt: `다음 코드의 출력은?\n\ncount = 0\nfor i in range(${7 + i}):\n    if i % 2 == 0:\n        count += 1\nprint(count)`,
        answerType: 'numeric', correctAnswer: String(Math.ceil((7 + i) / 2)), targetErrorType: 'condition_omission',
        explanation: `0부터 ${6 + i}까지 짝수만 셉니다. 0도 포함하여 ${Math.ceil((7 + i) / 2)}개입니다.`,
      });
    }
  }
  return result;
}
