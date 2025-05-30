// DOM要素の取得
const autoStartCheckbox = document.getElementById('autoStart');
const wakeUpCheckbox = document.getElementById('wakeUp');
const statusDiv = document.getElementById('status');

// ステータスメッセージを表示する関数
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
    statusDiv.style.display = 'block';
    
    // 3秒後に非表示にする
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// 設定を読み込む関数
async function loadOptions() {
    try {
        const result = await chrome.storage.sync.get(['autoStartEnabled', 'wakeUpEnabled']);
        autoStartCheckbox.checked = result.autoStartEnabled || false;
        wakeUpCheckbox.checked = result.wakeUpEnabled || false;
    } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
        showStatus('設定の読み込みに失敗しました', true);
    }
}

// 設定を保存する関数
async function saveOptions() {
    try {
        await chrome.storage.sync.set({
            autoStartEnabled: autoStartCheckbox.checked,
            wakeUpEnabled: wakeUpCheckbox.checked
        });
        
        console.log('設定が保存されました:', {
            autoStartEnabled: autoStartCheckbox.checked,
            wakeUpEnabled: wakeUpCheckbox.checked
        });
        
        showStatus('設定が保存されました');
    } catch (error) {
        console.error('設定の保存に失敗しました:', error);
        showStatus('設定の保存に失敗しました', true);
    }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', loadOptions);
autoStartCheckbox.addEventListener('change', saveOptions);
wakeUpCheckbox.addEventListener('change', saveOptions);