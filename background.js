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

// 拡張機能のインストール時にデフォルト設定を保存
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const result = await chrome.storage.sync.get(['autoStartEnabled']);
    
    // 初回インストール時は自動起動を無効にする
    if (result.autoStartEnabled === undefined) {
      await chrome.storage.sync.set({ autoStartEnabled: false });
      console.log('デフォルト設定を保存しました');
    }
  } catch (error) {
    console.error('初期設定の保存でエラーが発生しました:', error);
  }
});