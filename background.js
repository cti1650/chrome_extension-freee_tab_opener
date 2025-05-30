// Freeeタブを開く共通の関数
async function openFreeeTab() {
  const moveUrl = "https://p.secure.freee.co.jp/";
  const checkUrls = [
    "https://p.secure.freee.co.jp/",
    "https://accounts.secure.freee.co.jp/sessions/new",
  ];

  try {
    let tabs = await chrome.tabs.query({});
    let foundTab = null;

    // Check if the tab with the specific URL exists
    for (let tab of tabs) {
      if (checkUrls.some((url) => tab.url.startsWith(url))) {
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
    console.error("An error occurred:", error);
  }
}

// アクションボタンがクリックされた時
chrome.action.onClicked.addListener(async () => {
  await openFreeeTab();
});

// ショートカットキーが押された時
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-freee") {
    await openFreeeTab();
  }
});

// ブラウザ起動時の処理
chrome.runtime.onStartup.addListener(async () => {
  console.log("ブラウザが起動しました");

  try {
    // オプションから自動起動設定を取得
    const result = await chrome.storage.sync.get(["autoStartEnabled"]);

    if (result.autoStartEnabled) {
      console.log("自動起動が有効になっています");

      // 少し待ってからFreeeタブを開く（ブラウザの起動完了を待つため）
      setTimeout(async () => {
        await openFreeeTab();
      }, 2000);
    }
  } catch (error) {
    console.error("自動起動処理でエラーが発生しました:", error);
  }
});


// アクティブ時間を更新する関数
async function updateLastActiveTime(eventType = "unknown") {
  try {
    console.log(`アクティブ時間を更新: イベントタイプ = ${eventType}`);
    // 前回のアクティブ時間を取得
    const result = await chrome.storage.local.get([
      "lastActiveTime",
      "isInitialized",
    ]);
    const lastActiveTime = result.lastActiveTime || currentTime;
    const isInitialized = result.isInitialized || false;
    const prevActiveTime = new Date(lastActiveTime || 0);
    console.log(`前回のアクティブ時間: ${prevActiveTime.toLocaleString()}`);
    const currentTime = Date.now();
    const timeDiff = currentTime - (lastActiveTime || 0);
    console.log(`前回からの経過時間: ${Math.round(timeDiff / 1000)}秒`);

    // 30分以上の空白時間があった場合、スリープから復帰したと判断
    if (isInitialized && timeDiff > 30 * 60 * 1000) {
      console.log(
        `スリープからの復帰を検知しました (${Math.round(
          timeDiff / 1000 / 60
        )}分間の停止)`
      );
      // スリープ復帰設定をチェック
      const settings = await chrome.storage.sync.get("wakeUpEnabled");
      if (settings.wakeUpEnabled) {
        console.log("スリープ復帰時の自動起動が有効になっています");
        // 少し待ってからFreeeタブを開く
        setTimeout(async () => {
          await openFreeeTab();
        }, 1000);
      }
    }
    // 現在のアクティブ時間を保存
    await chrome.storage.local.set({
      lastActiveTime: currentTime,
      isInitialized: true,
    });
    console.log(
      "アクティブ時間を更新しました:",
      new Date(currentTime || 0).toLocaleString()
    );
  } catch (error) {
    console.error("アクティブ時間の更新でエラーが発生しました:", error);
  }
}

// タブの状態変化を監視してアクティブ時間を更新
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateLastActiveTime("タブ切り替え");
});
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // ページの読み込み完了時のみ反応（過度な呼び出しを防ぐ）
  if (changeInfo.status === "complete") {
    await updateLastActiveTime("タブ更新");
  } else if (changeInfo.title || changeInfo.url) {
    // タイトルやURLの変更時もアクティブ時間を更新
    await updateLastActiveTime("タブタイトル/URL変更");
  }
});
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    // ウィンドウフォーカス変更時は特に詳細ログ
    try {
      await updateLastActiveTime(`ウィンドウフォーカス (ID: ${windowId})`);
    } catch (error) {
      await updateLastActiveTime("ウィンドウフォーカス");
    }
  }
});

// 拡張機能のインストール時にデフォルト設定を保存
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const result = await chrome.storage.sync.get([
      "autoStartEnabled",
      "wakeUpEnabled",
    ]);

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
      console.log("デフォルト設定を保存しました:", updates);
    }
  } catch (error) {
    console.error("初期設定の保存でエラーが発生しました:", error);
  }
});
