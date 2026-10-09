# chrome_extension-freee_tab_opener

freee の打刻ページを表示する Chrome 用拡張機能です。


## 使い方

actionボタンを押すとfreee の打刻ページ(`https://p.secure.freee.co.jp/`)の表示状況に合わせて以下の動作します。
- freee人事労務の画面をすでにタブで開いている  
  ・・・そのタブをウィンドウごと最前面に表示して、タブをリロード（打刻ボタンを押したらログアウト済みだったことがあったため）
- freee人事労務の画面を開いていない  
  ・・・`https://p.secure.freee.co.jp/`を新規タブで開いて表示する

ショートカットキー（`Ctrl+Shift+E` / Mac: `Command+Shift+E`）でも同じ動作をします。

## 自動起動（オプション設定）

拡張機能のオプション画面から以下を設定できます。

| 設定 | 内容 | 保存先 |
|---|---|---|
| この端末で機能を有効にする | オフにするとこの端末では自動起動が動作しない | 端末固有 |
| ブラウザ起動時に自動で開く | ブラウザ起動時にfreeeタブを開く | 端末間で同期 |
| ブラウザ操作の再開時に自動で開く | 指定時間（30分〜8時間）以上操作がなかった後の再開時にfreeeタブを開く | 端末間で同期 |

- 自動起動は、セッション復元などによるタブの読み込みが落ち着いてから5秒後（最大20秒）に1回だけ実行します。複数ウィンドウを復元しても、freeeタブが重複して開くことはありません。
- ブラウザ起動直後（60秒以内）は「操作の再開時」の自動起動は動作せず、「起動時」の設定にのみ従います。

## インストール方法

### Chrome ウェブストアからインストール

未申請

### ソースからインストール

Chrome の拡張機能設定からデベロッパーモードをオンにし、このディレクトリを読み込みます。

または、以下のダウンロードリンクから最新版をダウンロードして読み込んでください。

- [freee_tab_opener_v0.0.11.zip](./zip/freee_tab_opener_v0.0.11.zip)  

## ファイル構成

```files
├─ icons
│   ├── icon_16.png # 拡張機能のアイコン
│   ├── icon_48.png # 拡張機能のアイコン
│   └── icon_128.png # 拡張機能のアイコン
├─ zip
│   └── freee_tab_opener_v*.zip # ローカルインストール用のzipファイル
├─ background.js # タブを開く処理・自動起動の制御（Service Worker）
├─ options.html # オプション画面
├─ options.js # オプション画面の設定保存処理
├─ build.sh # 配布用zipの作成スクリプト
├─ manifest.json # 拡張機能の設定ファイル
└─ README.md # このファイル
```

## ビルド

```bash
./build.sh
```

`manifest.json` のバージョンを元に `zip/freee_tab_opener_v<バージョン>.zip` を作成します。

## 類似拡張機能
- [takuyayukat/chrome_extension-freee_overtime: chrome extension to display overtime hours on freee work_records](https://github.com/takuyayukat/chrome_extension-freee_overtime)  
  - README.mdを参考にさせて頂きました🙇‍♂️