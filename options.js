// DOM要素の取得
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
        const result = await chrome.storage.sync.get([
            'autoStartEnabled', 
            'wakeUpEnabled', 
            'wakeUpTimeThreshold'
        ]);
        autoStartCheckbox.checked = result.autoStartEnabled || false;
        wakeUpCheckbox.checked = result.wakeUpEnabled || false;
        wakeUpTimeSelect.value = result.wakeUpTimeThreshold || '45'; // デフォルト45分
        
        // wakeUpTimeSelect の有効/無効状態を設定
        wakeUpTimeSelect.disabled = !wakeUpCheckbox.checked;

    } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
        showStatus('設定の読み込みに失敗しました', true);
    }
}

// 設定を保存する関数
async function saveOptions() {
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
        
        console.log('設定が保存されました:', {
            autoStartEnabled,
            wakeUpEnabled,
            wakeUpTimeThreshold
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
wakeUpTimeSelect.addEventListener('change', saveOptions);