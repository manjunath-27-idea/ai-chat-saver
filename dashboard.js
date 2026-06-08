let currentChats = [];
let selectedChatId = null;

async function loadChats() {
  const result = await chrome.storage.local.get(['savedChats']);
  currentChats = result.savedChats || [];
  renderChats();
}

function renderChats() {
  const list = document.getElementById('chatsList');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const platformFilter = document.getElementById('platformFilter').value;
  
  let filtered = currentChats;
  
  if (searchTerm) {
    filtered = filtered.filter(c => 
      c.title.toLowerCase().includes(searchTerm) ||
      c.messages.some(m => m.text.toLowerCase().includes(searchTerm))
    );
  }
  
  if (platformFilter !== 'all') {
    filtered = filtered.filter(c => c.platform === platformFilter);
  }
  
  // Sort by newest first
  filtered.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  
  document.getElementById('totalChats').textContent = `${filtered.length} chat${filtered.length !== 1 ? 's' : ''} saved`;
  
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <p>${searchTerm || platformFilter !== 'all' ? 'No matching chats' : 'No saved chats yet'}</p>
        <span>${searchTerm || platformFilter !== 'all' ? 'Try different filters' : 'Click the star icon on any AI chat to save it here'}</span>
      </div>
    `;
    selectChat(null);
    return;
  }
  
  list.innerHTML = filtered.map(chat => {
    const preview = chat.messages[0]?.text?.substring(0, 120) + '...' || 'No preview';
    const date = new Date(chat.createdAt).toLocaleDateString();
    const msgCount = chat.messages?.length || 0;
    const isActive = chat.id === selectedChatId ? ' active' : '';
    
    return `
      <div class="chat-card${isActive}" data-id="${chat.id}">
        <div class="chat-card-header">
          <div>
            <div class="chat-title">${escapeHtml(chat.title)}</div>
            <div class="chat-meta">
              <span class="platform-badge">${chat.platform}</span>
              <span>${msgCount} messages</span>
              <span>${date}</span>
            </div>
          </div>
        </div>
        <div class="chat-preview">${escapeHtml(preview)}</div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.chat-card').forEach(card => {
    card.addEventListener('click', () => {
      const chat = currentChats.find(c => c.id === card.dataset.id);
      if (chat) selectChat(chat);
    });
  });

  // Default selection logic: maintain current selection if valid,
  // otherwise default to first sorted card in list.
  let activeChat = filtered.find(c => c.id === selectedChatId);
  if (!activeChat && filtered.length > 0) {
    activeChat = filtered[0];
  }
  selectChat(activeChat);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function selectChat(chat) {
  if (!chat) {
    selectedChatId = null;
    document.querySelector('.viewer-placeholder').style.display = 'flex';
    document.querySelector('.viewer-content').style.display = 'none';
    return;
  }
  
  selectedChatId = chat.id;
  
  // Highlight active chat-card
  document.querySelectorAll('.chat-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === chat.id);
  });
  
  document.querySelector('.viewer-placeholder').style.display = 'none';
  document.querySelector('.viewer-content').style.display = 'flex';
  
  document.getElementById('viewerTitle').textContent = chat.title;
  document.getElementById('viewerPlatform').textContent = chat.platform;
  document.getElementById('viewerDate').textContent = new Date(chat.createdAt).toLocaleString();
  document.getElementById('viewerLink').href = chat.url;
  
  const messagesContainer = document.getElementById('viewerMessages');
  messagesContainer.innerHTML = chat.messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="message-role">${msg.role}</div>
      <div class="message-text">${escapeHtml(msg.text)}</div>
    </div>
  `).join('');
  
  messagesContainer.scrollTop = 0;
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', renderChats);
document.getElementById('platformFilter').addEventListener('change', renderChats);

document.getElementById('viewerDelete').addEventListener('click', async () => {
  const chat = currentChats.find(c => c.id === selectedChatId);
  if (!chat) return;
  if (!confirm('Delete this saved chat?')) return;
  
  currentChats = currentChats.filter(c => c.id !== chat.id);
  await chrome.storage.local.set({ savedChats: currentChats });
  // local storage onChanged callback handles auto-selection of next card
});

document.getElementById('viewerExport').addEventListener('click', () => {
  const chat = currentChats.find(c => c.id === selectedChatId);
  if (!chat) return;
  const blob = new Blob([JSON.stringify(chat, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${chat.platform}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('exportAllBtn').addEventListener('click', () => {
  if (currentChats.length === 0) return alert('No chats to export');
  const blob = new Blob([JSON.stringify(currentChats, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `all-saved-chats-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSettingsModal();
  }
});

// Settings Modal controls
function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('active');
  loadCustomPlatforms();
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
  document.getElementById('addPlatformForm').reset();
}

// Add event listeners for settings modal
document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
document.getElementById('settingsClose').addEventListener('click', closeSettingsModal);
document.getElementById('settingsModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeSettingsModal();
});

// Manage custom platforms
let customPlatforms = [];

async function loadCustomPlatforms() {
  const result = await chrome.storage.local.get(['customPlatforms']);
  customPlatforms = result.customPlatforms || [];
  renderCustomPlatforms();
  populatePlatformFilterDropdown(customPlatforms);
}

function renderCustomPlatforms() {
  const list = document.getElementById('customPlatformsList');
  if (customPlatforms.length === 0) {
    list.innerHTML = `<p style="color: var(--text-secondary); font-size: 13px;">No custom platforms added yet.</p>`;
    return;
  }
  
  list.innerHTML = customPlatforms.map(platform => `
    <div class="custom-platform-item" data-id="${platform.id}">
      <div class="custom-platform-info">
        <span class="custom-platform-name">${escapeHtml(platform.name)}</span>
        <span class="custom-platform-url">${escapeHtml(platform.hostname)}${escapeHtml(platform.pathname)}</span>
      </div>
      <button class="btn btn-danger btn-delete-platform" data-id="${platform.id}" style="padding: 6px 12px; font-size: 12px; height: auto;">Delete</button>
    </div>
  `).join('');
  
  // Attach delete handlers
  list.querySelectorAll('.btn-delete-platform').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const platform = customPlatforms.find(p => p.id === id);
      if (!platform) return;
      if (!confirm(`Delete custom platform "${platform.name}"?`)) return;
      
      chrome.runtime.sendMessage({ action: 'unregisterCustomScript', id }, async (response) => {
        try {
          await chrome.permissions.remove({ origins: [platform.origin] });
        } catch (err) {
          console.warn('Failed to remove permissions:', err);
        }
        
        customPlatforms = customPlatforms.filter(p => p.id !== id);
        await chrome.storage.local.set({ customPlatforms });
        loadCustomPlatforms();
      });
    });
  });
}

function populatePlatformFilterDropdown(platforms) {
  const select = document.getElementById('platformFilter');
  const selectValue = select.value;
  
  const defaultOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'copilot', label: 'Microsoft Copilot' },
    { value: 'perplexity', label: 'Perplexity' },
    { value: 'poe', label: 'Poe' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'huggingchat', label: 'Hugging Chat' },
    { value: 'mistral', label: 'Mistral (Le Chat)' },
    { value: 'characterai', label: 'Character.ai' },
    { value: 'groq', label: 'Groq Chat' },
    { value: 'v0', label: 'v0.dev' },
    { value: 'bolt', label: 'Bolt.new' },
    { value: 'pi', label: 'Pi' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'kimi', label: 'Kimi' },
    { value: 'qwen', label: 'Qwen' },
    { value: 'doubao', label: 'Doubao' },
    { value: 'chatglm', label: 'ChatGLM' },
    { value: 'duckduckgo', label: 'DuckDuckGo AI' },
    { value: 'meta', label: 'Meta AI' },
    { value: 'cohere', label: 'Cohere Coral' },
    { value: 'you', label: 'You.com' },
    { value: 'phind', label: 'Phind' },
    { value: 'chatpdf', label: 'ChatPDF' },
    { value: 'monica', label: 'Monica' },
    { value: 'venice', label: 'Venice.ai' },
    { value: 'manus', label: 'Manus' },
    { value: 'jasper', label: 'Jasper Chat' },
    { value: 'writesonic', label: 'Writesonic' },
    { value: 'copyai', label: 'Copy.ai' },
    { value: 'nova', label: 'Nova AI' },
    { value: 'yuanbao', label: 'Tencent Yuanbao' },
    { value: 'qianwen', label: 'Alibaba Qianwen' },
    { value: 'yiyan', label: 'Baidu ERNIE' },
    { value: 'xinghuo', label: 'Xunfei Spark' }
  ];
  
  select.innerHTML = '';
  
  defaultOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });
  
  platforms.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.name;
    select.appendChild(option);
  });
  
  select.value = selectValue || 'all';
}

function divideChatUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);
    const origin = url.origin + '/*';
    const hostname = url.hostname;
    let pathname = url.pathname;
    
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return { origin, hostname, pathname };
  } catch (err) {
    return null;
  }
}

// Form Submission Handler
document.getElementById('addPlatformForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('platformNameInput').value.trim();
  const urlStr = document.getElementById('platformUrlInput').value.trim();
  
  const divided = divideChatUrl(urlStr);
  if (!divided) {
    alert('Please enter a valid URL.');
    return;
  }
  
  chrome.permissions.request({
    origins: [divided.origin]
  }, (granted) => {
    if (!granted) {
      alert('Host permissions are required to run the saver on this URL.');
      return;
    }
    
    const selectors = {
      messages: document.getElementById('selectorMessages').value.trim() || null,
      messageText: document.getElementById('selectorMessageText').value.trim() || null,
      userMessage: document.getElementById('selectorUser').value.trim() || null,
      assistantMessage: document.getElementById('selectorAssistant').value.trim() || null
    };
    
    const newPlatform = {
      id: 'custom_' + Date.now().toString(36),
      name,
      origin: divided.origin,
      hostname: divided.hostname,
      pathname: divided.pathname,
      selectors
    };
    
    chrome.runtime.sendMessage({
      action: 'registerCustomScript',
      platform: newPlatform
    }, async (response) => {
      if (response && response.success) {
        customPlatforms.push(newPlatform);
        await chrome.storage.local.set({ customPlatforms });
        loadCustomPlatforms();
        document.getElementById('addPlatformForm').reset();
        alert(`Successfully registered "${name}"!`);
      } else {
        alert('Failed to register content script: ' + (response?.error || 'Unknown error'));
      }
    });
  });
});

// Initialize
async function initializeDashboard() {
  await loadChats();
  await loadCustomPlatforms();
}

initializeDashboard();

// Storage changes sync
chrome.storage.onChanged.addListener((changes) => {
  if (changes.savedChats) {
    currentChats = changes.savedChats.newValue || [];
    renderChats();
  }
  if (changes.customPlatforms) {
    customPlatforms = changes.customPlatforms.newValue || [];
    renderCustomPlatforms();
    populatePlatformFilterDropdown(customPlatforms);
  }
});
