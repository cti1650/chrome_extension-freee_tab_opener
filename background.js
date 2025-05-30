// Freeeタブを開く共通の関数
async function openFreeeTab() {
  const moveUrl = 'https://p.secure.freee.co.jp/';
  const checkUrls = [
    'https://p.secure.freee.co.jp/',
    'https://accounts.secure.freee.co.jp/sessions/new'
  ];
  
  try {
    let tabs = await chrome.tabs.query({});
    let foundTab = null;

    // Check if the tab with the specific URL exists
    for (let tab of tabs) {
      if (checkUrls.some(url => tab.url.startsWith(url))) {
        foundTab = tab;
        break;
      }
    }

    if (foundTab) {
      // Activate the window and tab, then reload the tab
      await chrome.windows.update(foundTab.windowId, { focused: true });
      await chrome.tabs.update(foundTab.id, { active: true });
      chrome.tabs.reload(foundTab.id);
    } else {
      // Create a new tab with the given URL
      await chrome.tabs.create({ url: moveUrl });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// アクションボタンがクリックされた時
chrome.action.onClicked.addListener(async () => {
  await openFreeeTab();
});

// ショートカットキーが押された時
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-freee') {
    await openFreeeTab();
  }
});

// ブラウザ起動時の処理
chrome.runtime.onStartup.addListener(async () => {
  console.log('ブラウザが起動しました');
  
  try {
    // オプションから自動起動設定を取得
    const result = await chrome.storage.sync.get(['autoStartEnabled']);
    
    if (result.autoStartEnabled) {
      console.log('自動起動が有効になっています');
      
      // 少し待ってからFreeeタブを開く（ブラウザの起動完了を待つため）
      setTimeout(async () => {
        await openFreeeTab();
      }, 2000);
    }
  } catch (error) {
    console.error('自動起動処理でエラーが発生しました:', error);
  }
});

// スリープ復帰検知のための変数
let lastActiveTime = Date.now();
let isFirstCheck = true;

// スリープからの復帰を検知する関数
async function checkSleepResume() {
  const currentTime = Date.now();
  const timeDiff = currentTime - lastActiveTime;
  
  // 5分以上の空白時間があった場合、スリープから復帰したと判断
  // 初回チェックは除外
  if (!isFirstCheck && timeDiff > 5 * 60 * 1000) {
    console.log('スリープからの復帰を検知しました');
    
    try {
      const result = await chrome.storage.sync.get(['wakeUpEnabled']);
      
      if (result.wakeUpEnabled) {
        console.log('スリープ復帰時の自動起動が有効になっています');
        
        // 少し待ってからFreeeタブを開く
        setTimeout(async () => {
          await openFreeeTab();
        }, 1000);
      }
    } catch (error) {
      console.error('スリープ復帰処理でエラーが発生しました:', error);
    }
  }
  
  lastActiveTime = currentTime;
  isFirstCheck = false;
}

// 定期的にスリープ復帰をチェック（30秒間隔）
setInterval(checkSleepResume, 30000);

// タブの状態変化を監視してアクティブ時間を更新
chrome.tabs.onActivated.addListener(() => {
  lastActiveTime = Date.now();
});

chrome.tabs.onUpdated.addListener(() => {
  lastActiveTime = Date.now();
});

// 拡張機能のインストール時にデフォルト設定を保存
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const result = await chrome.storage.sync.get(['autoStartEnabled', 'wakeUpEnabled']);
    
    // 初回インストール時はデフォルト設定を保存
    const updates = {};
    if (result.autoStartEnabled === undefined) {
      updates.autoStartEnabled = false;
    }
    if (result.wakeUpEnabled === undefined) {
      updates.wakeUpEnabled = false;
    }
    
    if (Object.keys(updates).length > 0) {
      await chrome.storage.sync.set(updates);
      console.log('デフォルト設定を保存しました:', updates);
    }
  } catch (error) {
    console.error('初期設定の保存でエラーが発生しました:', error);
  }
});