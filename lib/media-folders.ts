import fs from 'fs';
import path from 'path';

// Domyślna struktura folderów dla aplikacji muzycznej i filmowej
const defaultStructure = {
  Music: [
    'Albums',
    'Artists',
    'Playlists',
    'Covers',
    'Downloads',
    'Temp',
  ],
  Movies: [
    'Library',
    'Watched',
    'ToWatch',
    'Covers',
    'Downloads',
    'Temp',
  ],
};

/**
 * Tworzy domyślną strukturę folderów w podanej lokalizacji
 * @param {string} basePath - Ścieżka bazowa (np. katalog użytkownika)
 */
export function createDefaultMediaFolders(basePath: string) {
  Object.entries(defaultStructure).forEach(([main, subfolders]) => {
    const mainPath = path.join(basePath, main);
    if (!fs.existsSync(mainPath)) fs.mkdirSync(mainPath, { recursive: true });
    subfolders.forEach((sub) => {
      const subPath = path.join(mainPath, sub);
      if (!fs.existsSync(subPath)) fs.mkdirSync(subPath, { recursive: true });
    });
  });
}

// Przykład użycia (PC):
// createDefaultMediaFolders(process.env.HOME || process.env.USERPROFILE);

// Na Androidzie (np. przez React Native lub Cordova) należy użyć odpowiednich API do filesystemu.
