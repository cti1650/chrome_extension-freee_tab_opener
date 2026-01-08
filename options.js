// DOM要素の取得
const deviceEnabledCheckbox = document.getElementById('deviceEnabled');
const autoStartCheckbox = document.getElementById('autoStart');
const wakeUpCheckbox = document.getElementById('wakeUp');
const wakeUpTimeSelect = document.getElementById('wakeUpTime');
const statusDiv = document.getElementById('status');

// ステータスメッセージを表示する関数
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// 設定を読み込む関数
async function loadOptions() {
    try {
        // 端末固有設定（local）を読み込む
        const localResult = await chrome.storage.local.get(['deviceEnabled']);
        // deviceEnabled はデフォルト true
        deviceEnabledCheckbox.checked = localResult.deviceEnabled !== false;

        // 同期設定（sync）を読み込む
        const syncResult = await chrome.storage.sync.get([
            'autoStartEnabled',
            'wakeUpEnabled',
            'wakeUpTimeThreshold'
        ]);
        autoStartCheckbox.checked = syncResult.autoStartEnabled || false;
        wakeUpCheckbox.checked = syncResult.wakeUpEnabled || false;
        wakeUpTimeSelect.value = syncResult.wakeUpTimeThreshold || '480'; // デフォルト8時間

        // wakeUpTimeSelect の有効/無効状態を設定
        wakeUpTimeSelect.disabled = !wakeUpCheckbox.checked;

    } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
        showStatus('設定の読み込みに失敗しました', true);
    }
}

// 端末固有設定を保存する関数
async function saveLocalOptions() {
    try {
        const deviceEnabled = deviceEnabledCheckbox.checked;

        await chrome.storage.local.set({
            deviceEnabled: deviceEnabled
        });

        console.log('端末固有設定が保存されました:', { deviceEnabled });
        showStatus('設定が保存されました');
    } catch (error) {
        console.error('端末固有設定の保存に失敗しました:', error);
        showStatus('設定の保存に失敗しました', true);
    }
}

// 同期設定を保存する関数
async function saveSyncOptions() {
    try {
        const autoStartEnabled = autoStartCheckbox.checked;
        const wakeUpEnabled = wakeUpCheckbox.checked;
        const wakeUpTimeThreshold = parseInt(wakeUpTimeSelect.value, 10);

        await chrome.storage.sync.set({
            autoStartEnabled: autoStartEnabled,
            wakeUpEnabled: wakeUpEnabled,
            wakeUpTimeThreshold: wakeUpTimeThreshold
        });

        // wakeUpTimeSelect の有効/無効状態を更新
        wakeUpTimeSelect.disabled = !wakeUpEnabled;

        console.log('同期設定が保存されました:', {
            autoStartEnabled,
            wakeUpEnabled,
            wakeUpTimeThreshold
        });

        showStatus('設定が保存されました');
    } catch (error) {
        console.error('同期設定の保存に失敗しました:', error);
        showStatus('設定の保存に失敗しました', true);
    }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', loadOptions);
deviceEnabledCheckbox.addEventListener('change', saveLocalOptions);
autoStartCheckbox.addEventListener('change', saveSyncOptions);
wakeUpCheckbox.addEventListener('change', saveSyncOptions);
wakeUpTimeSelect.addEventListener('change', saveSyncOptions);