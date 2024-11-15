chrome.action.onClicked.addListener(async () => {
  const url = 'https://p.secure.freee.co.jp/';
  
  try {
    let tabs = await chrome.tabs.query({});
    let foundTab = null;

    // Check if the tab with the specific URL exists
    for (let tab of tabs) {
      if (tab.url.startsWith(url)) {
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
      await chrome.tabs.create({ url: url });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});