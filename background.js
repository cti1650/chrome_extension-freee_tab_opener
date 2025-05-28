chrome.action.onClicked.addListener(async () => {
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
});
