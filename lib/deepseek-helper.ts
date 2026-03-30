// @ts-nocheck
// NOTE: Ten plik nie jest obecnie używany w aplikacji - pozostawiony jako referencja
import { DeepSeek } from "deepseek";

// Inicjalizacja DeepSeek z kluczem API z process.env
const deepSeek = new DeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

// Funkcja do indeksowania plików
export async function indexFiles(filePaths: string[]) {
  return await deepSeek.indexFiles(filePaths);
}

// Funkcja do wyszukiwania plików po frazie
export async function searchFiles(query: string) {
  return await deepSeek.search(query);
}

// Funkcja do automatycznego porządkowania plików (np. rekomendacje folderów)
export async function organizeFiles(filePaths: string[]) {
  return await deepSeek.organize(filePaths);
}

export default deepSeek;
