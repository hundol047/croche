/** Synthetic fixtures in a temporary checkout; no official claim or repo release. */
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const assert = require('assert/strict'), { spawnSync } = require('child_process');
const root = path.resolve(__dirname,'..');
const work = fs.mkdtempSync(path.join(os.tmpdir(),'failtwin-content-tools-'));
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const dir = p => fs.mkdirSync(path.join(work,p),{recursive:true});
const file = (p,text) => fs.writeFileSync(path.join(work,p),text);
let checks=0;
try {
  for(const p of ['scripts','.verify-out/src/domain','.verify-out/src/content','src/content','bundle'])dir(p);
  fs.cpSync(path.join(root,'.verify-out/src/domain'),path.join(work,'.verify-out/src/domain'),{recursive:true});
  for(const p of ['scripts/prepare-exam.cjs','.verify-out/src/content/officialExamRelease.js','.verify-out/src/content/officialExamReceipts.js'])fs.copyFileSync(path.join(root,p),path.join(work,p));
  const q='SYNTHETIC QUESTION ARTIFACT, NOT AN OFFICIAL EXAM';
  const a='SYNTHETIC FINAL ANSWER ARTIFACT';
  const rights='SYNTHETIC RIGHTS TEST FIXTURE, NO ACTUAL LICENSE';
  file('bundle/questions.txt',q);file('bundle/answers.txt',a);file('bundle/rights.txt',rights);
  const b={receipt:{publisher:'KICE',examKind:'csat',examId:'tool-fixture',year:2026,title:'SYNTHETIC FIXTURE',sourceUrl:'https://www.kice.re.kr/tool-fixture',answerUrl:'https://www.kice.re.kr/tool-fixture-answers',questionSha256:sha(q),answerSha256:sha(a),rightsSha256:sha(rights),checkedBy:'Synthetic test only',checkedAt:'2026-10-08',rights:{basisUrl:'https://www.kice.re.kr/tool-fixture-rights',basis:'written-permission',summary:'Synthetic structural test; no real permission or verification.',thirdPartyCleared:true,redistributionAllowed:true}},files:{questions:'questions.txt',answers:'answers.txt',rights:'rights.txt'},items:[{number:1,officialAnswer:'5',materialComplete:true,transcriptionChecked:true,problem:{id:'official:tool-fixture:1',educationLevel:'csat',subject:'수학',topic:'Fixture',prompt:'SYNTHETIC: 2+3?',answerType:'numeric',correctAnswer:'5',explanation:'Synthetic 2+3=5.',difficulty:'easy',source:'bank'}}]};
  const run=(...args)=>spawnSync(process.execPath,['-r',path.join(root,'verify/preload.js'),path.join(work,'scripts/prepare-exam.cjs'),path.join(work,'bundle/input.json'),...args],{encoding:'utf8',timeout:10000});
  const save=()=>file('bundle/input.json',JSON.stringify(b));
  save();const first=run();assert.equal(first.status,0,first.stderr);checks++;
  const candidate=JSON.parse(fs.readFileSync(path.join(work,'bundle/input.candidate.json'),'utf8'));
  assert.equal(candidate.structuralChecksOnly,true);assert.equal(candidate.expertHistoryReview,'not-established-by-this-tool');assert.equal(fs.existsSync(path.join(work,'src/content/officialExamRelease.ts')),false);checks++;
  file('bundle/questions.txt','TAMPERED');assert.notEqual(run().status,0);file('bundle/questions.txt',q);checks++;
  b.files.questions='../scripts/prepare-exam.cjs';save();assert.notEqual(run().status,0);b.files.questions='questions.txt';checks++;
  fs.symlinkSync(path.join(work,'scripts/prepare-exam.cjs'),path.join(work,'bundle/outside.txt'));b.files.questions='outside.txt';save();assert.notEqual(run().status,0);b.files.questions='questions.txt';checks++;
  b.items[0].officialAnswer='-5';save();assert.notEqual(run().status,0);b.items[0].officialAnswer='5';checks++;
  b.receipt.rights.thirdPartyCleared=false;save();assert.notEqual(run().status,0);b.receipt.rights.thirdPartyCleared=true;checks++;
  save();assert.equal(run('--release').status,0);checks++;
  const released=fs.readFileSync(path.join(work,'src/content/officialExamRelease.ts'),'utf8');assert.ok(released.includes('official:tool-fixture:1'));assert.ok(fs.existsSync(path.join(work,'src/content/officialExamReceipts.ts')));checks++;
  file('.verify-out/src/content/officialExamRelease.js','exports.OFFICIAL_EXAM_RELEASE='+JSON.stringify(candidate.exams)+';');
  file('.verify-out/src/content/officialExamReceipts.js','exports.OFFICIAL_EXAM_RECEIPTS='+JSON.stringify([candidate.receipt])+';');
  b.items[0].problem.prompt='SYNTHETIC ALTERED TEXT';save();assert.notEqual(run('--release').status,0);assert.equal(fs.readFileSync(path.join(work,'src/content/officialExamRelease.ts'),'utf8'),released);checks++;
  console.log(`Content tool QA: ${checks} checks passed. Synthetic fixtures only; live official release unchanged.`);
} finally { fs.rmSync(work,{recursive:true,force:true}); }
