import type { SchoolLevel } from '@/domain/curriculum';
import { schoolFamily as f, choiceSchool as q, numericSchool as n, type Difficulty } from './schoolTypes';
export const HISTORY_FACTS = [
  {year:660,name:'백제 멸망',clue:'나당 연합군의 공격으로 백제가 멸망했다.',era:'삼국'},
  {year:668,name:'고구려 멸망',clue:'나당 연합군의 공격으로 고구려가 멸망했다.',era:'삼국'},
  {year:676,name:'신라의 삼국 통일',clue:'신라가 당의 세력을 몰아내고 삼국 통일을 이루었다.',era:'통일 신라'},
  {year:698,name:'발해 건국',clue:'대조영이 고구려 유민 등을 이끌고 발해를 세웠다.',era:'남북국'},
  {year:918,name:'고려 건국',clue:'왕건이 고려를 세웠다.',era:'고려'},
  {year:926,name:'발해 멸망',clue:'거란의 공격으로 발해가 멸망했다.',era:'남북국'},
  {year:936,name:'고려의 후삼국 통일',clue:'고려가 후백제를 멸망시키며 후삼국을 통일했다.',era:'고려'},
  {year:956,name:'노비안검법 실시',clue:'광종이 불법으로 노비가 된 사람을 조사해 양인으로 회복시켰다.',era:'고려'},
  {year:958,name:'고려 과거제 실시',clue:'광종이 쌍기의 건의를 받아들여 과거제를 실시했다.',era:'고려'},
  {year:993,name:'서희의 외교 담판',clue:'서희가 거란과 담판해 강동 6주 확보의 계기를 마련했다.',era:'고려'},
  {year:1019,name:'귀주 대첩',clue:'강감찬이 귀주에서 거란군을 크게 물리쳤다.',era:'고려'},
  {year:1170,name:'무신 정변',clue:'무신들이 정변을 일으켜 정권을 장악했다.',era:'고려'},
  {year:1232,name:'강화도 천도',clue:'고려가 몽골의 침입에 맞서 수도를 강화도로 옮겼다.',era:'고려'},
  {year:1377,name:'직지 간행',clue:'청주 흥덕사에서 금속 활자로 직지를 간행했다.',era:'고려'},
  {year:1388,name:'위화도 회군',clue:'이성계가 위화도에서 군대를 돌려 개경으로 향했다.',era:'고려'},
  {year:1392,name:'조선 건국',clue:'이성계가 조선을 세웠다.',era:'조선'},
  {year:1443,name:'훈민정음 창제',clue:'세종이 백성을 위한 문자 훈민정음을 창제했다.',era:'조선'},
  {year:1446,name:'훈민정음 반포',clue:'세종 때 훈민정음이 반포되었다.',era:'조선'},
  {year:1592,name:'임진왜란 발발',clue:'일본이 조선을 침략하면서 임진왜란이 시작되었다.',era:'조선'},
  {year:1627,name:'정묘호란',clue:'후금이 조선을 침략했다.',era:'조선'},
  {year:1636,name:'병자호란',clue:'청이 조선을 침략해 조선이 남한산성에서 항전했다.',era:'조선'},
  {year:1750,name:'균역법 실시',clue:'영조가 군포 부담을 1년에 2필에서 1필로 줄였다.',era:'조선'},
  {year:1776,name:'규장각 설치',clue:'정조가 왕실 도서관이자 학술 기관인 규장각을 설치했다.',era:'조선'},
  {year:1866,name:'병인양요',clue:'프랑스군이 강화도를 침략했다.',era:'조선'},
  {year:1871,name:'신미양요',clue:'미국 함대가 강화도를 침략했다.',era:'조선'},
  {year:1876,name:'강화도 조약 체결',clue:'조선이 일본과 강화도 조약을 체결했다.',era:'조선'},
  {year:1884,name:'갑신정변',clue:'급진 개화파가 정변을 일으켰으나 3일 만에 실패했다.',era:'조선'},
  {year:1894,name:'동학 농민 운동',clue:'전봉준 등이 이끈 농민들이 반봉건·반외세 운동을 전개했다.',era:'조선'},
  {year:1897,name:'대한 제국 수립',clue:'고종이 황제로 즉위하고 대한 제국을 선포했다.',era:'대한 제국'},
  {year:1905,name:'을사늑약 강제 체결',clue:'일본이 대한 제국의 외교권을 빼앗는 조약을 강제로 체결했다.',era:'대한 제국'},
  {year:1910,name:'국권 피탈',clue:'일본이 한국을 강제로 병합했다.',era:'일제 강점기'},
  {year:1919,name:'3·1 운동',clue:'독립 선언을 계기로 전국에서 만세 시위가 확산되었다.',era:'일제 강점기'},
  {year:1920,name:'봉오동 전투',clue:'홍범도 등이 이끈 독립군이 봉오동에서 일본군을 물리쳤다.',era:'일제 강점기'},
  {year:1929,name:'광주 학생 항일 운동',clue:'광주에서 시작한 학생들의 항일 운동이 전국으로 확산되었다.',era:'일제 강점기'},
  {year:1932,name:'윤봉길 의거',clue:'윤봉길이 상하이 훙커우 공원에서 의거를 실행했다.',era:'일제 강점기'},
  {year:1940,name:'한국 광복군 창설',clue:'대한민국 임시 정부가 충칭에서 한국 광복군을 창설했다.',era:'일제 강점기'},
  {year:1945,name:'광복',clue:'일본의 패전으로 한국이 식민 지배에서 해방되었다.',era:'현대'},
  {year:1948,name:'대한민국 정부 수립',clue:'대한민국 정부가 수립되었다.',era:'현대'},
  {year:1950,name:'6·25 전쟁 발발',clue:'북한의 남침으로 6·25 전쟁이 시작되었다.',era:'현대'},
  {year:1953,name:'정전 협정 체결',clue:'전쟁을 멈추는 정전 협정이 체결되었다.',era:'현대'},
  {year:1960,name:'4·19 혁명',clue:'부정 선거에 항의하는 시민과 학생의 시위로 이승만이 하야했다.',era:'현대'},
  {year:1980,name:'5·18 민주화 운동',clue:'광주 시민들이 신군부의 계엄 확대와 진압에 맞서 민주화를 요구했다.',era:'현대'},
  {year:1987,name:'6월 민주 항쟁',clue:'전국적인 민주화 시위가 대통령 직선제 개헌으로 이어졌다.',era:'현대'},
  {year:1991,name:'남북한 유엔 동시 가입',clue:'대한민국과 북한이 유엔에 함께 가입했다.',era:'현대'},
] as const;
// Combinations, not invented events or attributed source quotations.
const triples: (readonly [typeof HISTORY_FACTS[number],typeof HISTORY_FACTS[number],typeof HISTORY_FACTS[number]])[]=[];
for(let i=0;i<HISTORY_FACTS.length-2;i+=1)for(let j=i+1;j<HISTORY_FACTS.length-1;j+=1)for(let k=j+1;k<HISTORY_FACTS.length;k+=1)triples.push([HISTORY_FACTS[i]!,HISTORY_FACTS[j]!,HISTORY_FACTS[k]!]);
export function historyTriple(index:number) {
  const triple=triples[index];
  if(!triple)throw new Error('역사 자료 범위를 벗어났습니다.');
  return triple;
}
export function historyFamilies(level:SchoolLevel,difficulty:Difficulty) {
  return ['first','last','order','span','middle'].map((id,kind)=>f(`history-${id}`,['가장 먼저 일어난 사건','가장 나중의 사건','사건의 흐름','세 사건 사이의 기간','앞뒤 사건으로 찾기'][kind]!, (a,b,c)=>{
    const index=(a-1)+20*(b-1)+200*(c-1);
    // Spread 2,000 triples across all 13,244 combinations (44 choose 3).
    const triple=historyTriple(Math.floor(index*triples.length/2000));
    const displayed=[triple[(index+1)%3]!,triple[(index+2)%3]!,triple[index%3]!];
    const rows=displayed.map((item,i)=>`${['가','나','다'][i]}. ${difficulty==='hard'?`학습용 설명: ${item.clue}`:item.name}${difficulty==='easy'?` (${item.year}년)`:''}`).join('\n');
    const prefix=level==='csat'?'[수능형 · 자체 제작]\n':'';
    const base=`${prefix}다음 세 사건을 읽으세요. 설명은 학습용으로 작성한 요약이며 사료 인용이 아닙니다.\n${rows}`;
    const chronological=triple.map(item=>['가','나','다'][displayed.indexOf(item)]).join(' → ');
    const explanation=triple.map(item=>`${item.name}: ${item.year}년 — ${item.clue}`).join('\n');
    if(kind===3)return n(`${base}\n가장 먼저 일어난 사건부터 가장 나중 사건까지 몇 년인가요? 두 연도의 차로 계산하세요.`,triple[2].year-triple[0].year,explanation);
    if(kind===2)return q(`${base}\n시간 순서대로 배열한 것은?`,chronological,['가 → 나 → 다','가 → 다 → 나','나 → 가 → 다','나 → 다 → 가','다 → 가 → 나','다 → 나 → 가'],explanation,index,level==='csat'?5:4);
    const selected=kind===0?triple[0]:kind===1?triple[2]:triple[1];
    const correct=['가','나','다'][displayed.indexOf(selected)]!;
    return q(`${base}\n${kind===0?'가장 먼저':kind===1?'가장 나중에':'시간상 두 번째로'} 일어난 사건은?`,correct,['가','나','다','세 사건이 같은 해에 일어났다','순서를 알 수 없다'],explanation,index,level==='csat'?5:4);
  },'concept_confusion'));
}
