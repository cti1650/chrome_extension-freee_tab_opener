#!/bin/bash

# Chrome拡張機能のビルドスクリプト
# manifest.jsonからバージョンを取得し、zipファイルを作成

set -e

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"

# manifest.jsonからバージョンを取得
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | sed 's/"version": "//;s/"$//')

if [ -z "$VERSION" ]; then
    echo "エラー: manifest.jsonからバージョンを取得できませんでした"
    exit 1
fi

# zipディレクトリがなければ作成
mkdir -p zip

# 出力ファイル名
OUTPUT_FILE="zip/freee_tab_opener_v${VERSION}.zip"

# 既存のzipファイルがあれば削除
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "既存のファイルを削除: $OUTPUT_FILE"
fi

# 拡張機能に必要なファイルのみをzip化
zip -r "$OUTPUT_FILE" \
    manifest.json \
    background.js \
    options.html \
    options.js \
    icons/ \
    -x "*.DS_Store"

echo ""
echo "ビルド完了: $OUTPUT_FILE"
echo "バージョン: $VERSION"
