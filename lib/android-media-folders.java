// android-media-folders.java
// Przykład: Tworzenie folderów na muzykę i filmy na Androidzie (Java)
// Użyj w natywnym module lub jako inspirację dla React Native

import android.content.Context;
import android.os.Environment;
import java.io.File;

public class AndroidMediaFolders {
    public static void createMediaFolders(Context context) {
        File musicDir = context.getExternalFilesDir(Environment.DIRECTORY_MUSIC);
        File moviesDir = context.getExternalFilesDir(Environment.DIRECTORY_MOVIES);
        if (musicDir != null && !musicDir.exists()) musicDir.mkdirs();
        if (moviesDir != null && !moviesDir.exists()) moviesDir.mkdirs();
    }
}
