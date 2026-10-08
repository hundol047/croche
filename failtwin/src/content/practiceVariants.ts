import { isUniversitySubject, type UniversitySubject } from '@/domain/curriculum';
import { schoolFamilies, schoolProblem } from './schoolBank';
import type { ErrorType, Problem, Subject, EducationLevel } from '@/domain/types';

export type Difficulty = Problem['difficulty'];
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
export const VARIANTS_PER_FAMILY = 2000;
export const PROBLEMS_PER_DIFFICULTY = 10000;
export const PROBLEMS_PER_SUBJECT = 30000;
/** IDs and enumeration are immutable within v2; change version when changing them. */
export const PRACTICE_BANK_VERSION = 'v2';

type Spec = Pick<Problem, 'prompt' | 'answerType' | 'correctAnswer' | 'explanation'>;
interface Family {
  id: string; topic: string; target: ErrorType;
  build: (a: number, b: number, c: number) => Spec;
}
export interface PracticeFamily { id: string; topic: string; count: number }
const numeric = (prompt: string, answer: number, explanation: string): Spec => ({
  prompt: `${prompt}\n숫자만 입력하세요. 소수는 소수점 아래 6자리까지 반올림해도 됩니다.`,
  answerType: 'numeric', correctAnswer: String(Number(answer.toFixed(6))), explanation,
});
const display = (n: number) => String(Number(n.toFixed(6)));
const text = (prompt: string, answer: string, explanation: string): Spec => ({ prompt, answerType: 'text', correctAnswer: answer, explanation });
const family = (id: string, topic: string, build: Family['build'], target: ErrorType = 'calculation_error'): Family => ({ id, topic, build, target });
const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);
const range = (start: number, end: number, step = 1): number[] => {
  const values: number[] = [];
  for (let i = start; i < end; i += step) values.push(i);
  return values;
};
const code = (source: string) => `다음 Python 3 코드의 출력은?\n\n${source}`;

const math: Record<Difficulty, Family[]> = {
  easy: [
    family('derivative', '미분계수', (a, b, c) => numeric(`f(x)=${a}x²+${b}x일 때 f′(${c})는?`, 2*a*c+b, `f′(x)=${2*a}x+${b}이므로 ${c}을 대입하면 ${2*a*c+b}입니다.`)),
    family('linear', '일차방정식', (a, b, c) => numeric(`${a}x+${b}=${a*c+b}을 만족하는 x는?`, c, `양변에서 ${b}을 빼고 ${a}으로 나누면 x=${c}입니다.`)),
    family('integral', '일차함수의 정적분', (a, b, c) => numeric(`∫₀^${c} (${a}x+${b}) dx의 값은?`, a*c*c/2+b*c, `원시함수는 ${a}x²/2+${b}x입니다. 0부터 ${c}까지의 차는 ${a*c*c/2+b*c}입니다.`)),
    family('determinant', '2차 행렬식', (a, b, c) => numeric(`행렬 [[${a}, ${b}], [${c}, ${b+c}]]의 행렬식은?`, a*(b+c)-b*c, `주대각선 곱에서 반대 대각선 곱을 뺍니다. ${a}×${b+c}−${b}×${c}=${a*(b+c)-b*c}입니다.`), 'sign_error'),
    family('sequence', '등차수열의 합', (a, b, c) => numeric(`첫 항 ${a}, 공차 ${b}인 등차수열의 첫 ${c+2}개 항의 합은?`, (c+2)*(2*a+(c+1)*b)/2, `마지막 항은 ${a+(c+1)*b}입니다. 항 수×(첫 항+마지막 항)/2=${(c+2)*(2*a+(c+1)*b)/2}입니다.`)),
  ],
  medium: [
    family('series', '멱급수의 끝점', (a, b, c) => text(`Σ (((x−${b-1})/${a})ⁿ / n^${c+1}) (n=1→∞)의 수렴구간을 구하시오. 끝점 포함 여부를 표시하세요.`, `[${b-1-a},${b-1+a}]`, `|x−${b-1}|<${a}에서 수렴합니다. 양 끝점에서도 Σ1/n^${c+1}이 수렴하므로 [${b-1-a},${b-1+a}]입니다.`), 'edge_case_omission'),
    family('ode', '초기값과 지수함수', (a, b, c) => { const k=a+1, initial=b+2+10*(c-1); return text(`y′+${k}y=0, y(0)=${initial}의 해 y(x)를 구하시오. ce^(kx) 형식으로 입력하세요.`, `${initial}e^{-${k}x}`, `변수를 분리하면 y=Ce^(−${k}x)입니다. 초기조건에서 C=${initial}이므로 ${initial}e^(−${k}x)입니다.`); }, 'sign_error'),
    family('domain', '약분 전 정의역', (a, b, c) => { const prompt=`g(x)=(x²−${a*a})/(x−${a})+${b}일 때 g(${c})은?`; return a===c ? text(`${prompt}\n숫자 또는 “정의되지 않음”으로 답하세요.`, '정의되지 않음', `x=${a}에서 원래 분모가 0입니다. 약분한 식을 대입할 수 없으므로 정의되지 않습니다.`) : numeric(prompt, c+a+b, `x≠${a}에서 g(x)=x+${a}+${b}입니다. ${c}은 제외된 점이 아니므로 값은 ${c+a+b}입니다.`); }, 'condition_omission'),
    family('product', '곱의 미분', (a, b, c) => numeric(`f(x)=(x+${a})(x+${b})일 때 f′(${c})는?`, 2*c+a+b, `곱의 미분에서 f′(x)=(x+${b})+(x+${a})입니다. x=${c}에서 ${2*c+a+b}입니다.`)),
    family('system', '연립방정식', (a, b, c) => numeric(`x+y=${a}, x+${c+1}y=${b}을 동시에 만족하는 y는?`, (b-a)/c, `둘째 식에서 첫째 식을 빼면 ${c}y=${b-a}입니다. 따라서 y=${b-a}/${c}입니다.`), 'sign_error'),
  ],
  hard: [
    family('second', '삼차함수의 이계도함수', (a, b, c) => numeric(`f(x)=(x+${a})(x+${b})(x+${c})일 때 f″(${a})는?`, 8*a+2*b+2*c, `전개한 x²의 계수는 ${a+b+c}입니다. f″(x)=6x+${2*(a+b+c)}이므로 값은 ${8*a+2*b+2*c}입니다.`)),
    family('polynomial-integral', '다항식의 구간 적분', (a, b, c) => { const hi=b+c; const primitive=(x:number)=>a*x*x*x/3+b*x*x/2+c*x; return numeric(`∫_${b}^${hi} (${a}x²+${b}x+${c}) dx의 값은?`, primitive(hi)-primitive(b), `원시함수는 ${a}x³/3+${b}x²/2+${c}x입니다. 위 끝점 ${hi}의 값에서 아래 끝점 ${b}의 값을 뺍니다.`); }),
    family('forced-ode', '평형값과 초기값', (a, b, c) => numeric(`y′+${a}y=${a*b}, y(0)=${b+c}일 때 x=ln(2)/${a}에서 y의 값은? ln은 자연로그입니다.`, b+c/2, `평형값은 ${b}이고 y=${b}+${c}e^(−${a}x)입니다. 주어진 x에서 지수항은 1/2이므로 y=${b+c/2}입니다.`)),
    family('harmonic', '조건부 수렴과 끝점', (a, b, c) => { const center=b-1+10*(c-1); return text(`Σ (((x−${center})/${a})ⁿ / n) (n=1→∞)의 수렴구간을 구하시오. 끝점 포함 여부를 표시하세요.`, `[${center-a},${center+a})`, `반지름은 ${a}입니다. x=${center-a}에서는 교대 조화급수로 수렴하고 x=${center+a}에서는 조화급수로 발산합니다. 따라서 [${center-a},${center+a})입니다.`); }, 'edge_case_omission'),
    family('quotient', '몫의 미분', (a, b, c) => numeric(`f(x)=(${a}x+${b})/(x+${c})일 때 f′(${b})는?`, (a*c-b)/(b+c)**2, `몫의 미분을 적용하면 f′(x)=(${a*c-b})/(x+${c})²입니다. x=${b}에서 ${a*c-b}/${(b+c)**2}입니다.`), 'sign_error'),
  ],
};
const physics: Record<Difficulty, Family[]> = {
  easy: [
    family('force', '힘과 가속도', (a,b,c)=>numeric(`질량 ${a+1} kg인 수레에 오른쪽 ${(a+1)*(b+1)} N, 왼쪽 ${c-1} N의 힘이 작용합니다. 오른쪽을 양으로 한 가속도는 몇 m/s²인가요?`, ((a+1)*(b+1)-(c-1))/(a+1), `알짜힘은 ${(a+1)*(b+1)-(c-1)} N입니다. 질량 ${a+1} kg으로 나누면 ${display(((a+1)*(b+1)-(c-1))/(a+1))} m/s²입니다.`), 'sign_error'),
    family('speed', '평균 속력', (a,b,c)=>numeric(`${a+20*(b-1)} m를 ${c} s 동안 이동했습니다. 평균 속력은 몇 m/s인가요?`, (a+20*(b-1))/c, `이동 거리를 시간으로 나눕니다. ${a+20*(b-1)}/${c} m/s입니다.`)),
    family('weight', '질량과 무게', (a,b,c)=> { const g=(b+10*(c-1))/10+1; return numeric(`중력가속도가 ${g} m/s²인 행성에서 질량 ${a} kg 물체의 무게는 몇 N인가요?`, a*g, `무게=질량×중력가속도=${a}×${g}=${display(a*g)} N입니다. 질량과 무게의 단위는 다릅니다.`); }, 'unit_error'),
    family('work', '알짜힘이 한 일', (a,b,c)=>numeric(`이동 방향의 힘 ${a} N과 반대 힘 ${c-1} N이 작용합니다. 같은 방향으로 ${b} m 이동할 때 알짜힘이 한 일은 몇 J인가요?`, (a-c+1)*b, `알짜힘 ${a-(c-1)} N에 이동 거리 ${b} m를 곱하면 ${(a-c+1)*b} J입니다. 음수는 운동을 방해하는 일을 뜻합니다.`), 'sign_error'),
    family('voltage', '옴의 법칙', (a,b,c)=>numeric(`저항 ${a+20*(b-1)} Ω에 전류 ${c} A가 흐릅니다. 양 끝 전압은 몇 V인가요?`, (a+20*(b-1))*c, `V=IR=${c}×${a+20*(b-1)}=${(a+20*(b-1))*c} V입니다.`)),
  ],
  medium: [
    family('motion', '초기 속도와 이동 거리', (a,b,c)=>numeric(`초기 속도 ${c-1} m/s인 물체가 ${a+2} m/s²로 ${b+3}초 동안 가속합니다. 이 시간 동안의 변위는 몇 m인가요?`, (c-1)*(b+3)+(a+2)*(b+3)**2/2, `s=v₀t+½at²=${c-1}×${b+3}+½×${a+2}×${b+3}²=${(c-1)*(b+3)+(a+2)*(b+3)**2/2} m입니다.`)),
    family('energy', '역학적 에너지', (a,b,c)=>numeric(`질량 ${2*a} kg, 속력 ${b+2} m/s, 기준면 위 높이 ${c-1} m인 물체의 역학적 에너지는 몇 J인가요? g=10 m/s²입니다.`, a*(b+2)**2+20*a*(c-1), `E=½mv²+mgh=${a*(b+2)**2}+${20*a*(c-1)}=${a*(b+2)**2+20*a*(c-1)} J입니다.`)),
    family('units', '속력 변환과 거리', (a,b,c)=> { const speed=10*a+b-1; return numeric(`${Number((speed*3.6).toFixed(1))} km/h로 등속 운동하는 열차가 ${c} s 동안 이동한 거리는 몇 m인가요?`, speed*c, `3.6으로 나누면 ${speed} m/s입니다. 시간 ${c} s를 곱하면 ${speed*c} m입니다.`); }, 'unit_error'),
    family('momentum', '완전 비탄성 충돌', (a,b,c)=>numeric(`질량 ${a} kg 물체가 ${b} m/s로 움직여 정지한 ${c} kg 물체와 충돌한 뒤 붙었습니다. 외력이 없을 때 함께 움직이는 속력은 몇 m/s인가요?`, a*b/(a+c), `운동량 보존: ${a}×${b}=(${a}+${c})v입니다. v=${a*b}/${a+c} m/s입니다.`)),
    family('spring', '탄성 에너지와 위치 에너지', (a,b,c)=>numeric(`용수철 상수 ${20*a} N/m, 압축 길이 ${b/10} m입니다. 질량 1 kg 물체를 ${c/10} m 높이까지 올리는 데 필요한 위치 에너지와 저장된 탄성 에너지의 합은 몇 J인가요? g=10 m/s²입니다.`, a*b*b/10+c, `탄성 에너지 ½kx²=${a*b*b/10} J, 위치 에너지 mgh=${c} J입니다. 합은 ${a*b*b/10+c} J입니다.`)),
  ],
  hard: [
    family('braking', '반응 시간과 정지 거리', (a,b,c)=> { const v=a+10, dec=b+1; return numeric(`자동차가 ${v} m/s로 달립니다. 반응 시간 ${c/10} s 동안 등속 운동한 뒤 ${dec} m/s²의 일정한 감속도로 멈춥니다. 총 정지 거리는 몇 m인가요?`, v*c/10+v*v/(2*dec), `반응 거리 ${v*c/10} m와 제동 거리 v²/(2a)=${v*v}/${2*dec} m를 더합니다.`); }),
    family('parallel', '직렬·병렬 혼합 회로', (a,b,c)=>numeric(`저항 ${b} Ω과 ${c} Ω을 병렬로 연결한 부분에 ${a} Ω 저항을 직렬로 연결합니다. 전원 전압 ${a+b+c} V일 때 전체 전류는 몇 A인가요?`, (a+b+c)/(a+b*c/(b+c)), `병렬 합성저항은 ${b*c}/${b+c} Ω입니다. 여기에 직렬 저항 ${a} Ω을 더한 뒤 전압 ${a+b+c} V를 합성저항으로 나눕니다.`)),
    family('incline', '마찰이 있는 경사면', (a,b,c)=>numeric(`sinθ=0.6, cosθ=0.8인 경사면 위로 질량 ${a} kg 물체가 움직이고 있습니다. 면을 따라 위쪽 힘 ${10*b} N, 운동마찰계수 ${c/20}, g=10 m/s²일 때 위쪽을 양으로 한 가속도는 몇 m/s²인가요?`, 10*b/a-6-0.4*c, `위쪽 힘에서 mg sinθ와 μmg cosθ를 뺍니다. 질량으로 나누면 ${10*b}/${a}−6−${display(0.4*c)} m/s²입니다. 음수이면 위로 움직이며 감속합니다.`), 'sign_error'),
    family('elastic', '일차원 탄성 충돌', (a,b,c)=>numeric(`질량 m₁=${a} kg, m₂=${b} kg인 물체의 충돌 전 속도는 u₁=${c+2} m/s, u₂=−${c} m/s입니다. 일차원 완전 탄성 충돌 후 첫 물체의 속도 v₁은 몇 m/s인가요? 오른쪽이 양입니다.`, ((a-b)*(c+2)-2*b*c)/(a+b), `운동량과 운동에너지 보존에서 v₁=((m₁−m₂)u₁+2m₂u₂)/(m₁+m₂)입니다. 대입하면 (${a-b}×${c+2}−${2*b*c})/${a+b} m/s입니다.`), 'sign_error'),
    family('heat', '열손실과 온도 변화', (a,b,c)=>numeric(`전체 열용량 ${100*a} J/K인 용기에 전력 ${100*b} W의 히터를 ${10*c} s 동안 사용합니다. 공급 에너지의 20%가 밖으로 손실되고 상변화가 없을 때 온도 상승은 몇 K인가요?`, 8*b*c/a, `유효 열량은 0.8Pt=${800*b*c} J입니다. ΔT=Q/C=${800*b*c}/${100*a} K입니다.`), 'condition_omission'),
  ],
};
const python: Record<Difficulty, Family[]> = {
  easy: [
    family('operators', '연산자 우선순위', (a,b,c)=>numeric(code(`print(${a} + ${b} * ${c})`), a+b*c, `곱셈 ${b}×${c}을 먼저 계산한 뒤 ${a}을 더하면 ${a+b*c}입니다.`)),
    family('index', '리스트의 음수 인덱스', (a,b,c)=>numeric(code(`nums = [${a}, ${b}, ${c}, ${a+b}]\nprint(nums[-2])`), c, `−1은 마지막 항, −2는 그 앞의 항입니다. 출력은 ${c}입니다.`), 'edge_case_omission'),
    family('range-length', 'range의 항 개수', (a,b,c)=>numeric(code(`print(len(range(${a}, ${a+b*c}, ${b})))`), c, `시작 ${a}에서 ${b}씩 증가하며 끝 ${a+b*c}은 제외됩니다. 생성되는 항은 ${c}개입니다.`), 'edge_case_omission'),
    family('division', '몫과 나머지', (a,b,c)=>numeric(code(`print(${a} // ${c} + ${b} % ${c})`), Math.floor(a/c)+b%c, `첫 나눗셈의 몫은 ${Math.floor(a/c)}, 둘째 나눗셈의 나머지는 ${b%c}입니다. 합은 ${Math.floor(a/c)+b%c}입니다.`)),
    family('string-length', '문자열 반복과 길이', (a,b,c)=>numeric(code(`print(len(('x' * ${a} + 'y' * ${b}) * ${c}))`), (a+b)*c, `한 묶음 길이는 ${a+b}이고 ${c}번 반복하므로 길이는 ${(a+b)*c}입니다.`)),
  ],
  medium: [
    family('range', 'range의 끝과 간격', (a,b,c)=> { const start=c-1, end=a+b+8, step=b+2, values=range(start,end,step); return numeric(code(`print(sum(range(${start}, ${end}, ${step})))`), sum(values), `생성 값은 ${values.length ? values.join(', ') : '없음'}입니다. 끝 ${end}은 제외됩니다. 합은 ${sum(values)}입니다.`); }, 'edge_case_omission'),
    family('squares', '반복문 누적', (a,b,c)=> { const values=range(c,a+c+1), answer=b-1+sum(values.map(x=>x*x)); return numeric(code(`total = ${b-1}\nfor i in range(${c}, ${a+c+1}):\n    total += i * i\nprint(total)`), answer, `초기값 ${b-1}에 ${c}부터 ${a+c}까지의 제곱을 더합니다. 결과는 ${answer}입니다.`); }),
    family('filter', '조건을 만족하는 횟수', (a,b,c)=> { const values=range(c-1,a+c+5).filter(x=>x%(b+1)===0); return numeric(code(`count = 0\nfor i in range(${c-1}, ${a+c+5}):\n    if i % ${b+1} == 0:\n        count += 1\nprint(count)`), values.length, `${c-1}부터 ${a+c+4}까지 ${b+1}의 배수만 셉니다. 해당 값은 ${values.length ? values.join(', ') : '없음'}으로 총 ${values.length}개입니다.`); }, 'condition_omission'),
    family('dictionary', '딕셔너리 빈도 누적', (a,b,c)=>numeric(code(`counts = {}\nfor x in [${a}, ${b}, ${a}, ${c}, ${b}]:\n    counts[x] = counts.get(x, 0) + 1\nprint(counts[${a}])`), 2+(a===b?2:0)+(a===c?1:0), `같은 값은 같은 키에 누적됩니다. ${a}의 등장 횟수는 ${2+(a===b?2:0)+(a===c?1:0)}입니다.`)),
    family('slice', '슬라이싱과 합', (a,b,c)=> { const values=range(0,a+5).slice(b-1,b+c); return numeric(code(`nums = list(range(${a+5}))\nprint(sum(nums[${b-1}:${b+c}]))`), sum(values), `끝 인덱스 ${b+c}은 제외하고 리스트 길이를 넘으면 끝에서 멈춥니다. 선택 값의 합은 ${sum(values)}입니다.`); }, 'edge_case_omission'),
  ],
  hard: [
    family('nested', '중첩 반복과 조건', (a,b,c)=> {
      const outer=a+2, inner=b+2, mod=c+1;
      let total=0;
      for(let i=0;i<outer;i+=1) for(let j=0;j<inner;j+=1) if((i+j)%mod===0) total+=i+j;
      return numeric(code(`total = 0\nfor i in range(${outer}):\n    for j in range(${inner}):\n        if (i + j) % ${mod} == 0:\n            total += i + j\nprint(total)`), total, `모든 (i,j) 조합에서 i+j가 ${mod}의 배수일 때만 더합니다. 경계는 각각 ${outer-1}, ${inner-1}이고 결과는 ${total}입니다.`);
    }, 'condition_omission'),
    family('break', 'break와 반복 종료', (a,b,c)=> {
      const mod=c+1, end=a+b*mod;
      let count=0;
      for(let x=a;x<end;x+=1) { if(x%mod===0) break; count+=1; }
      return numeric(code(`count = 0\nfor x in range(${a}, ${end}):\n    if x % ${mod} == 0:\n        break\n    count += 1\nprint(count)`), count, `처음 만나는 ${mod}의 배수에서 count 증가 전에 종료합니다. 그 앞의 값만 세므로 ${count}입니다.`);
    }, 'edge_case_omission'),
    family('alias', '중첩 리스트와 참조 공유', (a,b,c)=> {
      const rows=c+1;
      return numeric(code(`rows = [[${a}] * ${b}] * ${rows}\nrows[0][${b-1}] += ${rows}\nprint(sum(row[-1] for row in rows))`), rows*(a+rows), `리스트 반복은 내부 리스트를 복사하지 않아 ${rows}개 행이 같은 객체를 가리킵니다. 각 마지막 값은 ${a+rows}, 합은 ${rows*(a+rows)}입니다.`);
    }, 'concept_confusion'),
    family('recursion', '재귀 호출의 누적', (a,b,c)=> {
      const depth=c+2;
      return numeric(code(`def f(n):\n    if n == 0:\n        return ${a}\n    return f(n - 1) + ${b} * n\nprint(f(${depth}))`), a+b*depth*(depth+1)/2, `기저값 ${a}에 ${b}×(1+…+${depth})을 더합니다. 합은 ${a+b*depth*(depth+1)/2}입니다.`);
    }),
    family('set', '집합 컴프리헨션', (a,b,c)=> {
      const mod=c+1, end=a+b+c+2;
      const values=[...new Set(range(a,end).map(i=>i%mod))];
      return numeric(code(`values = {i % ${mod} for i in range(${a}, ${end})}\nprint(sum(values))`), sum(values), `나머지의 중복을 집합에서 제거합니다. 서로 다른 값은 ${values.join(', ')}이고 합은 ${sum(values)}입니다.`);
    }, 'concept_confusion'),
  ],
};
const bank: Record<UniversitySubject, Record<Difficulty, Family[]>> = { '공업수학': math, '일반물리': physics, 'Python 프로그래밍': python };

export function practiceCatalog(subject: Subject, difficulty: Difficulty, level: EducationLevel = 'university'): PracticeFamily[] {
  if(level!=='university')return schoolFamilies(level,subject,difficulty).map(({id,topic})=>({id,topic,count:VARIANTS_PER_FAMILY}));
  if(!isUniversitySubject(subject))throw new Error('이 학교급에서 지원하지 않는 과목입니다.');
  return bank[subject][difficulty].map(({ id, topic }) => ({ id, topic, count: VARIANTS_PER_FAMILY }));
}

/** Lazy mixed-radix enumeration: 20×10×10 unique condition combinations per family. */
export function practiceProblem(subject: Subject, difficulty: Difficulty, familyId: string, variant: number, level: EducationLevel = 'university'): Problem {
  if (!Number.isInteger(variant) || variant<0 || variant>=VARIANTS_PER_FAMILY) throw new Error('출제 범위를 벗어났습니다.');
  if(level!=='university')return schoolProblem(level,subject,difficulty,familyId,variant);
  if(!isUniversitySubject(subject))throw new Error('이 학교급에서 지원하지 않는 과목입니다.');
  const f=bank[subject][difficulty].find(item=>item.id===familyId);
  if (!f) throw new Error('지원하지 않는 문제 유형입니다.');
  const a=variant%20+1, b=Math.floor(variant/20)%10+1, c=Math.floor(variant/200)+1;
  return { id: `practice:${PRACTICE_BANK_VERSION}:${subject}:${difficulty}:${f.id}:${variant}`, subject, difficulty, topic:f.topic, source:'bank', targetErrorType:f.target, ...f.build(a,b,c) };
}

export function practiceProblemAt(subject: Subject, difficulty: Difficulty, index: number, level: EducationLevel = 'university'): Problem {
  if (!Number.isInteger(index) || index<0 || index>=PROBLEMS_PER_DIFFICULTY) throw new Error('출제 범위를 벗어났습니다.');
  const families=practiceCatalog(subject,difficulty,level);
  return practiceProblem(subject, difficulty, families[index%families.length]!.id, Math.floor(index/families.length),level);
}
