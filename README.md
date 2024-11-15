# chrome_extension-freee_tab_opener

freee の打刻ページを表示する Chrome 用拡張機能です。


## 使い方

actionボタンを押すとfreee の打刻ページ(`https://p.secure.freee.co.jp/`)の表示状況に合わせて以下の動作します。
- freee人事労務の画面をすでにタブで開いている  
  ・・・そのタブをウィンドウごと最前面に表示して、タブをリロード（打刻ボタンを押したらログアウト済みだったことがあったため）
- freee人事労務の画面を開いていない  
  ・・・`https://p.secure.freee.co.jp/`を新規タブで開いて表示する

## インストール方法

### Chrome ウェブストアからインストール

未申請

### ソースからインストール

Chrome の拡張機能設定からデベロッパーモードをオンにし、このディレクトリを読み込みます。

## ファイル構成

```files
├─ icons
│   ├── icon_16.png # 拡張機能のアイコン
│   ├── icon_48.png # 拡張機能のアイコン
│   └── icon_128.png # 拡張機能のアイコン
├─ background.js # actionボタンを押した際に実行するスクリプト
├─ manifest.json # 拡張機能の設定ファイル
└─ README.md # このファイル
```

## 類似拡張機能
- [takuyayukat/chrome_extension-freee_overtime: chrome extension to display overtime hours on freee work_records](https://github.com/takuyayukat/chrome_extension-freee_overtime)  
  - README.mdを参考にさせて頂きました🙇‍♂️