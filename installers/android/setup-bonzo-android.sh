#!/data/data/com.termux/files/usr/bin/bash
set -e

BASE_PATH="$HOME/storage/shared/BONZO_media_HUB_Local"

echo "== BONZO_media_HUB Android Setup =="
echo "Tworzę strukturę folderów w: $BASE_PATH"

mkdir -p "$BASE_PATH/Music/Albums"
mkdir -p "$BASE_PATH/Music/Artists"
mkdir -p "$BASE_PATH/Music/Playlists"
mkdir -p "$BASE_PATH/Music/Downloads"
mkdir -p "$BASE_PATH/Movies/Library"
mkdir -p "$BASE_PATH/Movies/Watched"
mkdir -p "$BASE_PATH/Movies/ToWatch"
mkdir -p "$BASE_PATH/Movies/Downloads"

CONFIG_PATH="$BASE_PATH/bonzo-android-config.json"
cat > "$CONFIG_PATH" <<EOF
{
  "createdAt": "$(date -Iseconds)",
  "platform": "android",
  "basePath": "$BASE_PATH",
  "musicFolder": "$BASE_PATH/Music",
  "videoFolder": "$BASE_PATH/Movies",
  "notes": "Konfiguracja lokalnych folderów BONZO_media_HUB Android"
}
EOF

echo "✅ Foldery utworzone"
echo "✅ Konfiguracja zapisana: $CONFIG_PATH"
echo "Następnie uruchom BONZO_media_HUB (PWA) i użyj LOCAL_SETUP -> CONNECT folders."
