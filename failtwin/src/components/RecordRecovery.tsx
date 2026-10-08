import React, { useState } from 'react';
import { View } from 'react-native';
import { spacing } from '@/constants/theme';
import { exportRecord } from '@/utils/exportRecord';
import { sessionStore } from '@/state/sessionStore';
import { Button } from './Button';
import { Title, Body, Caption } from './typography';
import { archiveAndResetRecord, exportDamagedRecord, restoreRecordBackup, type StorageCorruptionError } from '@/storage/repositories';

export function RecordRecovery({ error, onRecovered }: { error: StorageCorruptionError; onRecovered: () => Promise<void> }) {
  const [message, setMessage] = useState('');
  const [confirmReset,setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = async (restore: boolean, reset = false) => {
    setBusy(true); setMessage('');
    try {
      if (restore) {
        if (reset) await archiveAndResetRecord(error.key); else await restoreRecordBackup(error.key);
        await sessionStore.bind(null); await onRecovered();
      }
      else {
        const text = await exportDamagedRecord(error.key);
        await exportRecord(text,'failtwin-record-recovery.json');
      }
    } catch (e) { setMessage(e instanceof Error ? e.message : '기록 복구에 실패했습니다. 원본은 유지됩니다.'); }
    finally { setBusy(false); }
  };
  return <View style={{gap:spacing.md}}>
    <Title>기록 복구</Title>
    <Body>저장된 기록이 손상되었습니다. 새 기록으로 덮어쓰지 않았습니다.</Body>
    <Caption>내보내기에는 답안과 학습 기록이 포함될 수 있습니다. 이전 정상 저장본으로 복원하며 최근 변경 일부는 포함되지 않을 수 있습니다. 손상 원본도 별도로 보존합니다.</Caption>
    <Button label="손상 원본 내보내기" variant="secondary" disabled={busy} onPress={() => { void run(false); }} />
    <Button label="이전 기록으로 복원" disabled={busy} onPress={() => { void run(true); }} />
    {confirmReset ? <>
      <Body>손상 원본을 별도로 보존한 뒤 해당 기록을 비웁니다. 학습 기록을 비우면 진행 중 세션도 보존 후 비워 중복 제출을 막습니다. 이 작업으로 손상된 내용을 자동으로 복원할 수는 없습니다.</Body>
      <Button label="원본 보존 후 빈 기록으로 시작" disabled={busy} onPress={() => { void run(true,true); }} />
      <Button label="기록 비우기 취소" variant="ghost" disabled={busy} onPress={()=>setConfirmReset(false)} />
    </> : <Button label="복원할 백업이 없는 경우" variant="ghost" disabled={busy} onPress={()=>setConfirmReset(true)} />}
    {message ? <Body>{message}</Body> : null}
  </View>;
}
