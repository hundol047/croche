import type { SchoolLevel } from '@/domain/curriculum';
import { schoolFamily as f,numericSchool as n,choiceSchool as q,decimal,type SchoolFamily,type Difficulty } from './schoolTypes';

export function socialFamilies(level:SchoolLevel,difficulty:Difficulty):SchoolFamily[] {
 const csat=level==='csat', pre=csat?'[수능형 · 자체 제작]\n':'';
 const place=level==='elementary'?'가상 마을':level==='middle'?'가상 지역':level==='high'?'가상 사회':'가상 사회·문화 조사';
 const options=csat?5:4;
 if(difficulty==='easy') return [
  f('so-route',csat?'표의 전체와 부분':'지도와 이동 경로',(a,b,c)=>n(csat?`${pre}${place}에서 A 집단 ${a+10}명, B 집단 ${b+10}명, C 집단 ${c+10}명을 조사했다. 전체 조사 인원은?`:`${place}의 지도에서 학교에서 도서관까지 ${a+1} km, 도서관에서 공원까지 ${b+1} km, 공원에서 집까지 ${c+1} km입니다. 이 경로의 총 거리는 몇 km인가요?`,csat?a+b+c+30:a+b+c+3,`표나 경로에 나온 세 값을 모두 더합니다.`)),
  f('so-vote','의사 결정과 투표 자료',(a,b,c)=>n(`${pre}${place}의 유효 투표는 찬성 ${a+20}표, 반대 ${b+10}표, 기권 ${c}표입니다. 유효 투표의 합계는?`,a+b+c+30,`문제에서 유효 투표로 분류한 세 항목을 모두 더하면 ${a+b+c+30}표입니다.`)),
  f('so-budget','예산의 사용과 잔액',(a,b,c)=>n(`${pre}${place}의 예산 ${100*(a+20)}원에서 도서 구입 ${100*b}원과 안내문 인쇄 ${100*c}원을 사용했습니다. 잔액은 얼마인가요?`,100*(a+20-b-c),`처음 예산에서 두 지출을 빼면 ${100*(a+20-b-c)}원입니다.`)),
  f('so-population','인구 구성의 비율',(a,b,c)=>n(`${pre}${place}의 A 집단 인원은 ${a}명, B 집단 ${b}명, C 집단 ${c}명입니다. A 집단이 전체에서 차지하는 비율은 몇 %인가요?`,100*a/(a+b+c),`전체 ${a+b+c}명 중 ${a}명이므로 ${a}/${a+b+c}×100%입니다.`)),
  f('so-fact','자료와 주장',(a,b,c)=>q(`${pre}${place}의 조사에 응답한 사람은 ${a+20}명, 응답하지 않은 사람은 A 구역 ${b}명, B 구역 ${c}명입니다. 이 기록과 일치하는 진술은?`,'응답하지 않은 사람이 있다',['모든 사람이 응답했다','응답한 사람이 한 명도 없다','응답하지 않은 사람은 0명이다','응답 여부만으로 소득을 알 수 있다'],`비응답자는 ${b+c}명으로 0보다 큽니다. 응답 여부 외의 정보는 제시되지 않았습니다.`,a+b+c,options),'verification_omission'),
 ];
 if(difficulty==='medium') return [
  f('so-density','인구 밀도 자료',(a,b,c)=>n(`${pre}${place}의 인구는 A 구역 ${100*a}명과 B 구역 ${100*b}명, 면적은 ${c+1} km²입니다. 인구 밀도는 몇 명/km²인가요?`,100*(a+b)/(c+1),`인구를 면적으로 나누면 ${decimal(100*(a+b)/(c+1))}명/km²입니다.`)),
  f('so-ratio','자료의 분모 확인',(a,b,c)=>n(`${pre}${place} 조사에서 전체 ${a+b+c}명 중 학생은 A 유형 ${a}명과 B 유형 ${b}명이고, 나머지 ${c}명은 학생이 아닙니다. 학생 중 A 유형의 비율은 몇 %인가요?`,100*a/(a+b),`질문의 분모는 전체가 아닌 학생 ${a+b}명입니다. ${a}/${a+b}×100%입니다.`),'condition_omission'),
  f('so-income','가구 수와 평균 자료',(a,b,c)=>n(`${pre}${place}에서 A 가구의 소득은 ${a*100}만원, B 가구는 ${b*100}만원, C 가구는 ${c*100}만원입니다. 세 가구의 평균 소득은 몇 만원인가요?`,100*(a+b+c)/3,`가구별 소득의 합을 세 가구로 나눕니다.`)),
  f('so-price','가상의 가격 변화',(a,b,c)=>n(`${pre}${place}의 물건 가격은 ${100*a}원입니다. 가격이 ${b}% 오른 뒤 할인권 ${10*c}원을 적용했습니다. 최종 가격은 얼마인가요?`,100*a+a*b-10*c,`인상액 ${a*b}원을 더한 뒤 할인권 ${10*c}원을 뺍니다.`,),'sign_error'),
  f('so-observation','상관과 원인 구분',(a,b,c)=>q(`${pre}${place}에서 A 지역 ${a+10}명과 B 지역 ${b+10}명을 관찰해 생활 습관과 성적을 기록했습니다. 두 지역은 소득·연령 구성도 다르고 임의 배정이나 조건 통제는 하지 않았습니다. 조사는 ${c}일간 이루어졌습니다. 올바른 해석은?`,'함께 변한 결과만으로 한 요인의 인과 효과를 단정할 수 없다',['두 지역의 차이는 오직 생활 습관 때문이다','기간이 짧아도 모든 인구에 반드시 같은 결과가 나온다','관찰만 하면 모든 다른 조건이 자동으로 같아진다','응답자의 연령은 제시한 조건과 무관하게 모두 같다'],`여러 조건이 함께 다른 관찰 자료입니다. 한 요인의 인과 효과를 식별하려면 추가 설계와 근거가 필요합니다.`,a+b+c,options),'verification_omission'),
 ];
 return [
  f('so-weighted','집단을 합친 평균',(a,b,c)=>n(`${pre}${place}에서 A 집단 ${a}명의 평균은 ${b+10}점, B 집단 ${b}명의 평균은 ${c+30}점입니다. 두 집단을 합친 전체 평균은?`,(a*(b+10)+b*(c+30))/(a+b),`집단별 점수 합을 구하고 전체 인원 ${a+b}명으로 나눕니다. 두 평균을 단순히 더해 2로 나누면 안 됩니다.`),'concept_confusion'),
  f('so-poverty','빈곤 기준과 자료',(a,b,c)=>n(`${pre}${place}의 중위 소득은 ${100*(a+10)}만원입니다. 이 문제의 상대적 빈곤 기준은 중위 소득의 ${b+30}%이며 경계값은 포함합니다. 소득 ${100*c}만원인 가구가 기준 이하인지 판단하기 위해 먼저 계산해야 할 기준 소득은 몇 만원인가요?`,(a+10)*(b+30),`문제에서 정한 비율을 중위 소득에 곱하면 ${(a+10)*(b+30)}만원입니다. 실제 제도의 보편적 기준을 가정한 것이 아닙니다.`),'condition_omission'),
  f('so-change','변화량과 변화율',(a,b,c)=>n(`${pre}${place}의 참여자는 처음 ${10*a}명, A 모임에서 ${b}명, B 모임에서 ${c}명이 더 참여해 다음 조사에서는 ${10*a+b+c}명입니다. 처음 인원 대비 증가율은 몇 %인가요?`,10*(b+c)/a,`증가한 ${b+c}명을 처음 인원 ${10*a}명으로 나누고 100을 곱합니다.`)),
  f('so-demand','수요와 공급의 모형',(a,b,c)=>n(`${pre}${place}의 가상 시장에서 가격 p에 따른 수요량은 (${a}−p)+${b}+${c}, 공급량은 p+${b}입니다. 두 양이 같아지는 가격 p는?`,(a+c)/2,`수요량=공급량으로 놓으면 2p=${a+c}입니다. 이 식은 문제에서 정한 단순 시장 모형입니다.`)),
  f('so-rule','가상 정책의 적용 조건',(a,b,c)=> {
    const threshold=100*(a+10), days=b+5, pass=(a+b+c)%4, names=['A','B','C','D'];
    const rows=names.map((name,i)=>({name,income:i===pass?threshold:i%2?threshold+100:threshold,days:i===pass?days+c:i%2?days+c:days-1}));
    return q(`${pre}${place}의 가상 지원 규칙: 소득 ${threshold}만원 이하 AND 기록 ${days}일 이상인 가구만 지원합니다. 실제 법이나 제도의 기준이 아닙니다.\n${rows.map(r=>`${r.name}: 소득 ${r.income}만원, 기록 ${r.days}일`).join('\n')}\n지원 대상은?`,names[pass]!,[...names.filter((_,i)=>i!==pass),'해당 가구 없음'],`두 조건을 모두 만족하는 가구는 ${names[pass]}입니다. 이하·이상의 경계값도 포함합니다.`,a+b+c,options);
  },'condition_omission'),
 ];
}
