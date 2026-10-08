import { Platform, Share } from 'react-native';
/** Explicit user export only; no server upload and no logging of the record body. */
export async function exportRecord(text: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([text],{type:'application/json'}));
    const link = document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);
  } else await Share.share({message:text});
}
