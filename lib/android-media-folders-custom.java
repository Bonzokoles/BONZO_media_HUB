// android-media-folders-custom.java
// Tworzenie folderów na muzykę i filmy na Androidzie (obsługa SD card + custom path)
// Użyj w natywnym module lub jako inspirację dla React Native

import android.content.Context;
import android.os.Environment;
import java.io.File;

public class AndroidMediaFoldersCustom {
    /**
     * Tworzy foldery na muzykę i filmy zarówno w pamięci wewnętrznej, jak i na SD card (jeśli dostępna).
     * @param context kontekst aplikacji
     * @param customSubfolder opcjonalny podfolder (np. "MyApp")
     */
    public static void createMediaFolders(Context context, String customSubfolder) {
        // Pamięć wewnętrzna
        File musicDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_MUSIC), customSubfolder);
        File moviesDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_MOVIES), customSubfolder);
        if (!musicDir.exists()) musicDir.mkdirs();
        if (!moviesDir.exists()) moviesDir.mkdirs();

        // SD card (jeśli dostępna)
        File[] externalDirs = context.getExternalFilesDirs(null);
        for (File dir : externalDirs) {
            if (dir != null && Environment.isExternalStorageRemovable(dir)) {
                File sdMusic = new File(new File(dir, Environment.DIRECTORY_MUSIC), customSubfolder);
                File sdMovies = new File(new File(dir, Environment.DIRECTORY_MOVIES), customSubfolder);
                if (!sdMusic.exists()) sdMusic.mkdirs();
                if (!sdMovies.exists()) sdMovies.mkdirs();
            }
        }
    }
}
