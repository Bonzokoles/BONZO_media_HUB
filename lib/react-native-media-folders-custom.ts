// react-native-media-folders-custom.ts
// Tworzenie folderów na muzykę i filmy na Androidzie (obsługa SD card + custom path)
// Wymaga: expo-file-system
// UWAGA: Expo nie daje pełnej kontroli nad SD card, ale można wykryć ścieżki i próbować zapisać

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// UWAGA: Expo nie pozwala na pełny dostęp do SD card bez ejectowania do bare workflow!
// To podejście działa w bare workflow lub z natywnym modułem.

export async function createMediaFoldersCustom(customSubfolder: string = '') {
  if (Platform.OS !== 'android') return;
  // Pamięć wewnętrzna aplikacji
  const musicDir = FileSystem.documentDirectory + (customSubfolder ? `${customSubfolder}/` : '') + 'Music/';
  const moviesDir = FileSystem.documentDirectory + (customSubfolder ? `${customSubfolder}/` : '') + 'Movies/';
  await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true }).catch(() => {});
  await FileSystem.makeDirectoryAsync(moviesDir, { intermediates: true }).catch(() => {});

  // Próba wykrycia SD card (bare workflow lub custom native module)
  // Expo nie wspiera tego oficjalnie, ale można użyć react-native-fs w bare workflow:
  // import RNFS from 'react-native-fs';
  // const sdCardPath = RNFS.ExternalStorageDirectoryPath;
  // ...
  // Wtedy analogicznie tworzymy foldery na SD card
}
