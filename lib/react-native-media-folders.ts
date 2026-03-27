// react-native-media-folders.ts
// Tworzenie folderów na muzykę i filmy na Androidzie (React Native/Expo)
// Wymaga: expo-file-system

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export async function createMediaFolders() {
  if (Platform.OS !== 'android') return;
  const musicDir = FileSystem.documentDirectory + 'Music/';
  const moviesDir = FileSystem.documentDirectory + 'Movies/';
  await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true }).catch(() => {});
  await FileSystem.makeDirectoryAsync(moviesDir, { intermediates: true }).catch(() => {});
}
