/** Maintainer-only tool. Input is JSON and never executed as code. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateExamBundle } = require('../.verify-out/src/domain/examIngestion');
const { OFFICIAL_EXAM_RELEASE } = require('../.verify-out/src/content/officialExamRelease');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function withinBundle(base, relative, extensions) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) throw new Error('자료 경로는 묶음 폴더의 상대 경로여야 합니다.');
  const file = fs.realpathSync(path.resolve(base, relative));
  if (!file.startsWith(base + path.sep) || !extensions.includes(path.extname(file).toLowerCase())) throw new Error('자료 경로나 확장자가 허용 범위를 벗어났습니다.');
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size === 0 || stat.size > 32 * 1024 * 1024) throw new Error('증빙은 1~32 MiB의 일반 파일이어야 합니다.');
  return fs.readFileSync(file);
}
try {
  const fileArg = process.argv[2];
  const release = process.argv.includes('--release');
  if (!fileArg) throw new Error('사용법: npm run content:prepare-exam -- bundle.json [--release]. 공식 원문·정답·이용 권한을 사람이 대조한 뒤만 release하세요.');
  const file = fs.realpathSync(fileArg), base = path.dirname(file);
  if (path.extname(file) !== '.json' || fs.statSync(file).size > 2 * 1024 * 1024) throw new Error('묶음은 최대 2 MiB JSON이어야 합니다.');
  const bundle = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = validateExamBundle(bundle);
  if (!result.ok) throw new Error(result.error);
  const { receipt, exams } = result.value;
  if (!bundle.files) throw new Error('실제 증빙 파일 경로가 필요합니다.');
  for (const [key, hashKey, extensions] of [
    ['questions', 'questionSha256', ['.pdf', '.txt', '.json']],
    ['answers', 'answerSha256', ['.pdf', '.txt', '.json']],
    ['rights', 'rightsSha256', ['.pdf', '.txt', '.md']],
  ]) {
    if (sha(withinBundle(base, bundle.files[key], extensions)) !== receipt[hashKey]) throw new Error(`${key}: 실제 파일의 SHA-256이 증빙과 다릅니다.`);
  }
  const old = new Map(OFFICIAL_EXAM_RELEASE.map(e => [e.id, e]));
  for (const e of exams) {
    if (old.has(e.id) && JSON.stringify(old.get(e.id)) !== JSON.stringify(e)) throw new Error('공개한 문항 ID의 내용은 수정할 수 없습니다. 새 버전 ID와 변경 기록을 사용하세요.');
    old.set(e.id, e);
  }
  const candidate = { receipt, exams, structuralChecksOnly: true, expertHistoryReview: 'not-established-by-this-tool' };
  const out = path.join(base, `${path.basename(file, '.json')}.candidate.json`);
  fs.writeFileSync(out, JSON.stringify(candidate, null, 2) + '\n');
  if (release) {
    // A deliberate maintainer action after factual/licensing review. Structural
    // success cannot authenticate a reviewer or establish copyright permission.
    const receiptFile = path.resolve(__dirname, '../src/content/officialExamReceipts.ts');
    const existing = fs.existsSync(path.resolve(__dirname, '../.verify-out/src/content/officialExamReceipts.js'))
      ? require('../.verify-out/src/content/officialExamReceipts').OFFICIAL_EXAM_RECEIPTS : [];
    const previous = existing.find(r => r.examId === receipt.examId);
    if (previous && JSON.stringify(previous) !== JSON.stringify(receipt)) throw new Error('기존 기출 증빙을 덮어쓸 수 없습니다. 새 버전 식별자를 사용하세요.');
    const receipts = previous ? existing : [...existing, receipt];
    const payload = `import type { OfficialExam } from './officialExams';\n/** Maintainer-reviewed artifact release. Keep released IDs/content immutable. */\nexport const OFFICIAL_EXAM_RELEASE: readonly OfficialExam[] = ${JSON.stringify([...old.values()], null, 2)};\n`;
    // Prepare both complete strings before mutation. Review git diff and run all
    // checks after publishing locally, then commit the matched pair together.
    const receiptPayload = `import type { ExamReceipt } from '@/domain/examIngestion';\nexport const OFFICIAL_EXAM_RECEIPTS: readonly ExamReceipt[] = ${JSON.stringify(receipts, null, 2)};\n`;
    fs.writeFileSync(receiptFile, receiptPayload);
    fs.writeFileSync(path.resolve(__dirname, '../src/content/officialExamRelease.ts'), payload);
    console.log(`${exams.length}문항을 로컬 release에 반영했습니다. 증빙·권리 주장 자체의 사실성은 자동 검증하지 않습니다. git diff와 회귀 검증이 필요합니다.`);
  } else console.log(`${exams.length}문항 구조·해시 검증 통과. 후보: ${out}. 앱 수록은 변경하지 않았습니다. 사실·권리·전문가 감수 완료를 뜻하지 않습니다.`);
} catch (e) {
  console.error(e instanceof SyntaxError ? '기출 묶음의 JSON 형식을 확인해주세요.' :
    e && ['ENOENT','EACCES','EISDIR'].includes(e.code) ? '기출 묶음 또는 증빙 파일을 읽지 못했습니다.' :
      e instanceof Error ? e.message : '기출 묶음 검증 실패');
  process.exitCode = 1;
}
