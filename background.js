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

    for (let tab of tabs) {
      if (checkUrls.some((url) => tab.url && tab.url.startsWith(url))) {
        foundTab = tab;
        break;
      }
    }

    if (foundTab) {
      await chrome.windows.update(foundTab.windowId, { focused: true });
      await chrome.tabs.update(foundTab.id, { active: true });
      chrome.tabs.reload(foundTab.id);
    } else {
      await chrome.tabs.create({ url: moveUrl });
    }
  } catch (error) {
    console.error("An error occurred in openFreeeTab:", error);
  }
}

chrome.action.onClicked.addListener(async () => {
  await openFreeeTab();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-freee") {
    await openFreeeTab();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log("ブラウザが起動しました");
  try {
    const result = await chrome.storage.sync.get(["autoStartEnabled"]);
    if (result.autoStartEnabled) {
      console.log("自動起動が有効になっています");
      setTimeout(async () => {
        await openFreeeTab();
      }, 2000);
    }
  } catch (error) {
    console.error("自動起動処理でエラーが発生しました:", error);
  }
});

async function updateLastActiveTime(eventType = "unknown") {
  try {
    const currentTime = Date.now(); // currentTimeを関数の最初に定義
    console.log(`アクティブ時間を更新: イベントタイプ = ${eventType}, 現在時刻: ${new Date(currentTime).toLocaleString()}`);

    const localData = await chrome.storage.local.get([
      "lastActiveTime",
      "isInitialized",
    ]);
    const lastActiveTimeFromStorage = localData.lastActiveTime;
    const isInitialized = localData.isInitialized || false;
    
    const effectiveLastActiveTime = lastActiveTimeFromStorage || currentTime;

    if (lastActiveTimeFromStorage) {
        console.log(`前回保存されたアクティブ時間: ${new Date(lastActiveTimeFromStorage).toLocaleString()}`);
    } else {
        console.log("前回のアクティブ時間は保存されていません。初回またはクリア後の可能性があります。");
    }
    
    const timeDiff = currentTime - effectiveLastActiveTime;
    console.log(`前回からの経過時間: ${Math.round(timeDiff / 1000)}秒`);

    if (isInitialized) { // 初期化済みの場合のみブラウザ操作復帰を考慮
      const settings = await chrome.storage.sync.get(['wakeUpEnabled', 'wakeUpTimeThreshold']);
      const wakeUpEnabled = settings.wakeUpEnabled || false;
      const wakeUpTimeThresholdMinutes = settings.wakeUpTimeThreshold || 30; // デフォルト30分
      const timeDiffThresholdMs = wakeUpTimeThresholdMinutes * 60 * 1000;

      console.log(`ブラウザ操作復帰設定: 有効=${wakeUpEnabled}, 検知時間=${wakeUpTimeThresholdMinutes}分 (${timeDiffThresholdMs}ms)`);

      if (timeDiff > timeDiffThresholdMs) {
        console.log(
          `ブラウザ操作の復帰の可能性を検知しました (${Math.round(
            timeDiff / 1000 / 60
          )}分間の非アクティブ)`
        );
        if (wakeUpEnabled) {
          console.log("ブラウザ操作復帰時の自動起動が有効になっています");
          setTimeout(async () => {
            await openFreeeTab();
          }, 1000);
        } else {
          console.log("ブラウザ操作復帰時の自動起動は無効です。");
        }
      }
    } else {
        console.log("まだ初期化されていません。ブラウザ操作復帰検知はスキップします。");
    }

    await chrome.storage.local.set({
      lastActiveTime: currentTime,
      isInitialized: true,
    });
    console.log(
      "アクティブ時間を更新・保存しました:",
      new Date(currentTime).toLocaleString()
    );
  } catch (error) {
    console.error("アクティブ時間の更新でエラーが発生しました:", error);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateLastActiveTime("タブ切り替え");
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    await updateLastActiveTime("タブ更新完了");
  } else if (changeInfo.title || (changeInfo.url && tab.active)) { // アクティブタブのURL/タイトル変更のみ
    await updateLastActiveTime("タブタイトル/URL変更");
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    await updateLastActiveTime(`ウィンドウフォーカス (ID: ${windowId})`);
  } else {
    await updateLastActiveTime(`ウィンドウフォーカスなし`);
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    const currentSettings = await chrome.storage.sync.get([
      "autoStartEnabled",
      "wakeUpEnabled",
      "wakeUpTimeThreshold"
    ]);

    const updates = {};
    if (currentSettings.autoStartEnabled === undefined) {
      updates.autoStartEnabled = false;
    }
    if (currentSettings.wakeUpEnabled === undefined) {
      updates.wakeUpEnabled = false;
    }
    if (currentSettings.wakeUpTimeThreshold === undefined) {
      updates.wakeUpTimeThreshold = 45; // デフォルト45分
    }

    if (Object.keys(updates).length > 0) {
      await chrome.storage.sync.set(updates);
      console.log("デフォルト設定を保存しました:", updates);
    }

    if (details.reason === "install") {
        console.log("拡張機能がインストールされました。");
        // 初回インストール時に lastActiveTime を設定することで、即座にスリープ復帰と誤認されるのを防ぐ
        await chrome.storage.local.set({ lastActiveTime: Date.now(), isInitialized: true });
        console.log("初回アクティブ時間を設定しました。");
    } else if (details.reason === "update") {
        console.log(`拡張機能が ${details.previousVersion} から ${chrome.runtime.getManifest().version} に更新されました。`);
        // アップデート時にも isInitialized が false の場合は初期化する
        const localData = await chrome.storage.local.get(["isInitialized"]);
        if (!localData.isInitialized) {
            await chrome.storage.local.set({ lastActiveTime: Date.now(), isInitialized: true });
            console.log("アップデート時にアクティブ時間を初期化しました。");
        }
    }
    // 初期アクティブ時間の更新（インストール時、アップデート時も含む）
    await updateLastActiveTime(`onInstalled (${details.reason})`);

  } catch (error) {
    console.error("初期設定の保存またはインストール/アップデート処理でエラーが発生しました:", error);
  }
});