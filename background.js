chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ savedChats: [], customPlatforms: [] });
  } else {
    const result = await chrome.storage.local.get(['savedChats', 'customPlatforms']);
    const updates = {};
    if (result.savedChats === undefined) updates.savedChats = [];
    if (result.customPlatforms === undefined) updates.customPlatforms = [];
    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
    }
  }
});

// Handle keyboard shortcut (optional)
chrome.commands?.onCommand.addListener((command) => {
  if (command === 'save-current-chat') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'saveConversation' });
    });
  }
});

// Register dynamically stored custom scripts on service worker startup
async function registerSavedCustomScripts() {
  try {
    const result = await chrome.storage.local.get(['customPlatforms']);
    const customPlatforms = result.customPlatforms || [];
    
    // Get currently registered scripts to avoid duplicates
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    const customIds = scripts.map(s => s.id).filter(id => id.startsWith('custom-'));
    
    if (customIds.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: customIds });
    }
    
    const toRegister = customPlatforms.map(platform => ({
      id: 'custom-' + platform.id,
      matches: [platform.origin],
      js: ['content.js'],
      css: ['content.css'],
      runAt: 'document_idle'
    }));
    
    if (toRegister.length > 0) {
      await chrome.scripting.registerContentScripts(toRegister);
    }
  } catch (err) {
    console.error('Failed to register saved custom scripts:', err);
  }
}

// Initial script registration
registerSavedCustomScripts();

// Listen for messages from content script & dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'registerCustomScript') {
    const platform = request.platform;
    chrome.scripting.registerContentScripts([
      {
        id: 'custom-' + platform.id,
        matches: [platform.origin],
        js: ['content.js'],
        css: ['content.css'],
        runAt: 'document_idle'
      }
    ]).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      console.error('Failed to register dynamic script:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'unregisterCustomScript') {
    chrome.scripting.unregisterContentScripts({
      ids: ['custom-' + request.id]
    }).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      console.error('Failed to unregister dynamic script:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'getSavedChats') {
    chrome.storage.local.get(['savedChats'], (result) => {
      sendResponse({ savedChats: result.savedChats || [] });
    });
    return true;
  }
  
  if (request.action === 'deleteChat') {
    chrome.storage.local.get(['savedChats'], (result) => {
      const savedChats = (result.savedChats || []).filter(c => c.id !== request.id);
      chrome.storage.local.set({ savedChats }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.action === 'exportChat') {
    const blob = new Blob([JSON.stringify(request.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: `chat-${request.data.platform}-${Date.now()}.json`
    });
    sendResponse({ success: true });
    return true;
  }
});

// Open dashboard when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'dashboard.html' });
});

