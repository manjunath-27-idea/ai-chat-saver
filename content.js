(function() {
  'use strict';

  const PLATFORM_SELECTORS = {
    chatgpt: {
      messages: '[data-testid="conversation-turn-"]',
      messageText: '.markdown, [data-message-author-role] .text-message',
      userMessage: '[data-message-author-role="user"]',
      assistantMessage: '[data-message-author-role="assistant"]',
      title: 'title'
    },
    claude: {
      messages: '.font-claude-message, .message, [data-testid="user-message"], [data-testid="assistant-message"]',
      messageText: '.prose, .message-content, [class*="message-content"]',
      userMessage: '.human-message, [data-testid="user-message"]',
      assistantMessage: '.assistant-message, [data-testid="assistant-message"]',
      title: 'title'
    },
    gemini: {
      messages: '.chat-item, .response-container',
      messageText: '.message-content, .model-response-text',
      userMessage: '.user-query-container',
      assistantMessage: '.model-response-container',
      title: 'title'
    },
    perplexity: {
      messages: '.prose, .answer-section',
      messageText: '.prose p, .answer-text',
      userMessage: '.user-message',
      assistantMessage: '.assistant-message',
      title: 'title'
    },
    poe: {
      messages: '.Message_chatMessage__',
      messageText: '.Message_chatMessageText__',
      userMessage: '.Message_humanMessage__',
      assistantMessage: '.Message_botMessage__',
      title: 'title'
    },
    copilot: {
      messages: '.cib-serp-main, .turn',
      messageText: '.response-message-content, .markdown-content',
      userMessage: '.user-message',
      assistantMessage: '.bot-message',
      title: 'title'
    },
    manus: {
      messages: '[class*="MessageItem_container"], .chat-message',
      messageText: '[class*="MessageItem_content"], .markdown-body',
      userMessage: '[class*="MessageItem_user"]',
      assistantMessage: '[class*="MessageItem_assistant"]',
      title: 'title'
    },
    generic: {
      messages: 'article, .message, .chat-message, [role="listitem"]',
      messageText: 'p, .text, .content',
      userMessage: '.user, .human, [data-role="user"]',
      assistantMessage: '.assistant, .bot, .ai, [data-role="assistant"]',
      title: 'title'
    }
  };

  const AI_ROUTING_TABLE = {
    chatgpt: {
      hosts: ['chatgpt.com', 'chat.openai.com'],
      paths: ['/', '/c/', '/g/']
    },
    claude: {
      hosts: ['claude.ai'],
      paths: ['/', '/new', '/chat/']
    },
    gemini: {
      hosts: ['gemini.google.com', 'bard.google.com'],
      paths: ['/app']
    },
    perplexity: {
      hosts: ['perplexity.ai'],
      paths: ['/', '/search']
    },
    poe: {
      hosts: ['poe.com'],
      paths: ['/']
    },
    copilot: {
      hosts: ['copilot.microsoft.com', 'copilot.live.com'],
      paths: ['/', '/chats']
    },
    deepseek: {
      hosts: ['chat.deepseek.com'],
      paths: ['/', '/chat']
    },
    huggingchat: {
      hosts: ['huggingface.co'],
      paths: ['/chat']
    },
    mistral: {
      hosts: ['chat.mistral.ai'],
      paths: ['/', '/chat']
    },
    characterai: {
      hosts: ['character.ai', 'beta.character.ai'],
      paths: ['/chat', '/chat2']
    },
    groq: {
      hosts: ['chat.groq.com'],
      paths: ['/', '/thread']
    },
    v0: {
      hosts: ['v0.dev'],
      paths: ['/r', '/chat']
    },
    bolt: {
      hosts: ['bolt.new'],
      paths: ['/', '/chat']
    },
    pi: {
      hosts: ['pi.ai'],
      paths: ['/', '/talk']
    },
    openrouter: {
      hosts: ['openrouter.ai'],
      paths: ['/chat']
    },
    kimi: {
      hosts: ['kimi.moonshot.cn'],
      paths: ['/', '/chat']
    },
    qwen: {
      hosts: ['chat.qwenlm.ai'],
      paths: ['/', '/c']
    },
    doubao: {
      hosts: ['doubao.com'],
      paths: ['/', '/chat']
    },
    chatglm: {
      hosts: ['chatglm.cn'],
      paths: ['/main', '/detail']
    },
    duckduckgo: {
      hosts: ['duckduckgo.com'],
      paths: ['/chat']
    },
    meta: {
      hosts: ['meta.ai'],
      paths: ['/', '/c']
    },
    cohere: {
      hosts: ['cohere.com', 'dashboard.cohere.com'],
      paths: ['/coral']
    },
    you: {
      hosts: ['you.com'],
      paths: ['/', '/search']
    },
    phind: {
      hosts: ['phind.com'],
      paths: ['/', '/search']
    },
    chatpdf: {
      hosts: ['chatpdf.com'],
      paths: ['/c']
    },
    monica: {
      hosts: ['monica.im'],
      paths: ['/chat']
    },
    venice: {
      hosts: ['venice.ai'],
      paths: ['/', '/chat']
    },
    manus: {
      hosts: ['manus.im'],
      paths: ['/', '/chat']
    },
    jasper: {
      hosts: ['jasper.ai', 'app.jasper.ai'],
      paths: ['/chat']
    },
    writesonic: {
      hosts: ['writesonic.com', 'app.writesonic.com'],
      paths: ['/chat']
    },
    copyai: {
      hosts: ['copy.ai', 'app.copy.ai'],
      paths: ['/chat']
    },
    nova: {
      hosts: ['novaapp.ai'],
      paths: ['/chat']
    },
    yuanbao: {
      hosts: ['yuanbao.tencent.com'],
      paths: ['/', '/chat']
    },
    qianwen: {
      hosts: ['qianwen.aliyun.com'],
      paths: ['/', '/chat']
    },
    yiyan: {
      hosts: ['yiyan.baidu.com'],
      paths: ['/', '/workspace']
    },
    xinghuo: {
      hosts: ['xinghuo.xfyun.cn'],
      paths: ['/desk']
    }
  };

  let dynamicRoutingTable = { ...AI_ROUTING_TABLE };
  let dynamicSelectors = { ...PLATFORM_SELECTORS };

  async function loadCustomPlatforms() {
    try {
      const result = await chrome.storage.local.get(['customPlatforms']);
      const customPlatforms = result.customPlatforms || [];
      
      customPlatforms.forEach(platform => {
        dynamicRoutingTable[platform.id] = {
          hosts: [platform.hostname],
          paths: [platform.pathname || '/']
        };
        dynamicSelectors[platform.id] = {
          messages: platform.selectors?.messages || PLATFORM_SELECTORS.generic.messages,
          messageText: platform.selectors?.messageText || PLATFORM_SELECTORS.generic.messageText,
          userMessage: platform.selectors?.userMessage || PLATFORM_SELECTORS.generic.userMessage,
          assistantMessage: platform.selectors?.assistantMessage || PLATFORM_SELECTORS.generic.assistantMessage,
          title: platform.selectors?.title || PLATFORM_SELECTORS.generic.title
        };
      });
    } catch (err) {
      console.error('Failed to load custom platforms:', err);
    }
  }

  function detectPlatform() {
    const host = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    
    for (const [platform, config] of Object.entries(dynamicRoutingTable)) {
      const isMatchingHost = config.hosts.some(h => host === h || host.endsWith('.' + h));
      if (isMatchingHost) {
        const isMatchingPath = config.paths.some(p => {
          if (p === '/') return path === '/';
          const cleanP = p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p;
          return path === p || path === cleanP || path.startsWith(cleanP + '/');
        });
        if (isMatchingPath) {
          return platform;
        }
      }
    }
    return 'generic';
  }

  function isChatInterface() {
    const platform = detectPlatform();
    const host = window.location.hostname.toLowerCase();
    
    let isRegisteredHost = false;
    let isMatchedPlatform = false;
    
    for (const [platformName, config] of Object.entries(dynamicRoutingTable)) {
      const match = config.hosts.some(h => host === h || host.endsWith('.' + h));
      if (match) {
        isRegisteredHost = true;
        if (platform === platformName) {
          isMatchedPlatform = true;
        }
      }
    }
    
    if (isRegisteredHost && !isMatchedPlatform) {
      return false;
    }
    return true;
  }

  function getPlatformConfig() {
    return dynamicSelectors[detectPlatform()] || dynamicSelectors.generic;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async function saveConversation(conversationData) {
    const result = await chrome.storage.local.get(['savedChats']);
    const savedChats = result.savedChats || [];
    
    const existingIndex = savedChats.findIndex(c => c.url === conversationData.url);
    if (existingIndex !== -1) {
      savedChats[existingIndex] = { ...savedChats[existingIndex], ...conversationData, updatedAt: Date.now() };
    } else {
      savedChats.push({ ...conversationData, id: generateId(), createdAt: Date.now() });
    }
    
    await chrome.storage.local.set({ savedChats });
    
    // Update star appearance
    updateStarButtons();
  }

  async function isConversationSaved(url) {
    const result = await chrome.storage.local.get(['savedChats']);
    const savedChats = result.savedChats || [];
    return savedChats.some(c => c.url === url);
  }

  function extractConversationData() {
    const config = getPlatformConfig();
    const url = window.location.href;
    const title = document.title || 'Untitled Chat';
    
    const messages = [];
    const messageElements = document.querySelectorAll(config.messages);
    
    messageElements.forEach(el => {
      const textEl = el.querySelector(config.messageText);
      const text = textEl ? textEl.innerText : el.innerText;
      
      let role = 'unknown';
      if (el.matches(config.userMessage) || el.querySelector(config.userMessage)) role = 'user';
      else if (el.matches(config.assistantMessage) || el.querySelector(config.assistantMessage)) role = 'assistant';
      
      if (text.trim()) {
        messages.push({ role, text: text.trim(), timestamp: Date.now() });
      }
    });

    return {
      url,
      title,
      platform: detectPlatform(),
      messages,
      messageCount: messages.length
    };
  }

  function createStarButton() {
    const btn = document.createElement('button');
    btn.className = 'ai-saver-star-btn';
    btn.innerHTML = `
      <svg class="ai-saver-star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;
    return btn;
  }

  async function updateStarButtons() {
    const saved = await isConversationSaved(window.location.href);
    document.querySelectorAll('.ai-saver-star-btn').forEach(btn => {
      btn.classList.toggle('saved', saved);
    });
  }

  function injectStarButtons() {
    // Remove existing buttons
    document.querySelectorAll('.ai-saver-container').forEach(el => el.remove());

    const platform = detectPlatform();
    if (platform === 'claude') {
      return;
    }

    const config = getPlatformConfig();
    
    // Platform-specific injection points
    const injectPoints = {
      chatgpt: () => {
        const headers = document.querySelectorAll('[class*="sticky"]');
        return headers.length > 0 ? headers : [document.querySelector('main')];
      },
      claude: () => {
        const header = document.querySelector('header') || document.querySelector('[data-testid="chat-header"]');
        return header ? [header] : [];
      },
      gemini: () => {
        return document.querySelectorAll('.conversation-title, header');
      },
      manus: () => {
        return document.querySelectorAll('[class*="Chat_header"], header');
      },
      generic: () => {
        return [document.body];
      }
    };

    const platform = detectPlatform();
    const targets = (injectPoints[platform] || injectPoints.generic)();

    targets.forEach(target => {
      if (!target || target.querySelector('.ai-saver-container')) return;
      
      const container = document.createElement('div');
      container.className = 'ai-saver-container';
      
      const starBtn = createStarButton();
      
      starBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const data = extractConversationData();
        await saveConversation(data);
        
        starBtn.classList.add('saved');
        starBtn.style.transform = 'scale(1.3)';
        setTimeout(() => starBtn.style.transform = 'scale(1)', 200);
      });

      container.appendChild(starBtn);
      target.appendChild(container);
    });

    updateStarButtons();
  }

  // Also add stars to individual messages
  async function injectMessageStars() {
    const platform = detectPlatform();
    
    if (platform === 'claude') {
      // Purge generic stars and body-owned overlay stars
      document.querySelectorAll('.ai-saver-msg-star').forEach(el => el.remove());
      document.querySelectorAll('.ai-saver-star').forEach(el => el.remove());

      // Target strictly [data-testid="user-message"] — the most stable Claude selector
      const userMessages = document.querySelectorAll('[data-testid="user-message"]');

      for (let index = 0; index < userMessages.length; index++) {
        const msgBubble = userMessages[index];

        // The star goes into a SIBLING actions row, not inside the bubble.
        // Check the parent container for any existing star (covers all siblings).
        const parent = msgBubble.parentElement;
        if (!parent) continue;
        if (parent.querySelector('[data-star-btn]')) continue;

        const msgUrl = window.location.href + '#msg-' + index;

        // Text block for content capture
        const textBlock =
          msgBubble.querySelector('[class*="font-user-message"]') ||
          msgBubble.querySelector('.prose') ||
          msgBubble.querySelector('p') ||
          msgBubble;

        // ── Find the actions row ─────────────────────────────────────────────
        // Strategy 1: sibling of the bubble that contains buttons (Copy/Edit)
        let actionsRow = null;
        let sibling = msgBubble.nextElementSibling;
        while (sibling) {
          if (sibling.querySelector('button')) {
            actionsRow = sibling;
            break;
          }
          sibling = sibling.nextElementSibling;
        }

        // Strategy 2: parent's child div that directly contains buttons
        if (!actionsRow) {
          for (const child of parent.children) {
            if (child !== msgBubble && child.querySelector('button')) {
              actionsRow = child;
              break;
            }
          }
        }

        // Strategy 3: look for a button with aria-label "copy" anywhere in parent
        if (!actionsRow) {
          const copyBtn = parent.querySelector(
            'button[aria-label*="opy"], button[aria-label*="dit"], button[title*="opy"], button[title*="dit"]'
          );
          if (copyBtn) actionsRow = copyBtn.parentElement;
        }

        // ── Build star pill button ──────────────────────────────────────────
        const saved = await isConversationSaved(msgUrl);

        const starBtn = document.createElement('button');
        starBtn.className = saved ? 'star-btn starred' : 'star-btn';
        starBtn.setAttribute('data-star-btn', 'true');
        starBtn.title = 'Save this message';
        starBtn.innerHTML = `
          <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24"
               fill="${saved ? 'currentColor' : 'none'}"
               stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>${saved ? 'Starred' : 'Star'}</span>
        `;

        starBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          const isCurrentlyStarred = starBtn.classList.contains('starred');
          if (isCurrentlyStarred) {
            const result = await chrome.storage.local.get(['savedChats']);
            let savedChats = result.savedChats || [];
            savedChats = savedChats.filter(c => c.url !== msgUrl);
            await chrome.storage.local.set({ savedChats });
            starBtn.classList.remove('starred');
            starBtn.querySelector('svg').setAttribute('fill', 'none');
            starBtn.querySelector('span').textContent = 'Star';
            updateStarButtons();
          } else {
            const messageData = {
              url: msgUrl,
              title: document.title + ' - Message #' + (index + 1),
              platform: 'claude',
              messages: [{ role: 'user', text: textBlock.innerText.trim(), timestamp: Date.now() }],
              isSingleMessage: true
            };
            await saveConversation(messageData);
            starBtn.classList.add('starred');
            starBtn.querySelector('svg').setAttribute('fill', 'currentColor');
            starBtn.querySelector('span').textContent = 'Starred';
          }
        });

        // ── Inject ──────────────────────────────────────────────────────────
        if (actionsRow) {
          actionsRow.appendChild(starBtn);
        } else {
          // Last resort: append directly after the bubble in the parent
          msgBubble.insertAdjacentElement('afterend', starBtn);
        }
      }
    } else {
      const config = getPlatformConfig();
      const messages = document.querySelectorAll(config.messages);
      
      for (let index = 0; index < messages.length; index++) {
        const msg = messages[index];
        
        let injectTarget = msg;
        let isUser = false;
        
        if (config.userMessage) {
          const userEl = msg.matches(config.userMessage) ? msg : msg.querySelector(config.userMessage);
          if (userEl) {
            injectTarget = userEl;
            isUser = true;
          }
        }
        
        if (!isUser && config.assistantMessage) {
          const assistantEl = msg.matches(config.assistantMessage) ? msg : msg.querySelector(config.assistantMessage);
          if (assistantEl) {
            injectTarget = assistantEl;
          }
        }
        
        if (injectTarget.querySelector('.ai-saver-msg-star') || injectTarget.querySelector('.star-btn')) continue;
        
        const msgUrl = window.location.href + '#msg-' + index;
        const saved = await isConversationSaved(msgUrl);
        
        const starBtn = document.createElement('button');
        starBtn.className = saved ? 'ai-saver-msg-star saved' : 'ai-saver-msg-star';
        starBtn.innerHTML = saved ? '★' : '☆';
        starBtn.title = 'Save this message';
        
        starBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const textEl = msg.querySelector(config.messageText) || msg;
          const isCurrentlySaved = starBtn.classList.contains('saved');
          
          if (isCurrentlySaved) {
            const result = await chrome.storage.local.get(['savedChats']);
            let savedChats = result.savedChats || [];
            savedChats = savedChats.filter(c => c.url !== msgUrl);
            await chrome.storage.local.set({ savedChats });
            
            starBtn.classList.remove('saved');
            starBtn.textContent = '☆';
          } else {
            const messageData = {
              url: msgUrl,
              title: document.title + ' - Message #' + (index + 1),
              platform: platform,
              messages: [{
                role: isUser ? 'user' : 'assistant',
                text: textEl.innerText.trim(),
                timestamp: Date.now()
              }],
              isSingleMessage: true
            };
            await saveConversation(messageData);
            starBtn.textContent = '★';
            starBtn.classList.add('saved');
          }
        });
        
        injectTarget.style.position = 'relative';
        injectTarget.appendChild(starBtn);
      }
    }
  }

  let domObserver = null;
  let urlObserver = null;

  // Initialize
  async function init() {
    await loadCustomPlatforms();
    
    if (domObserver) {
      domObserver.disconnect();
    }
    
    if (!isChatInterface()) {
      // Clean up if we navigated away (in SPA)
      document.querySelectorAll('.ai-saver-container').forEach(el => el.remove());
      document.querySelectorAll('.ai-saver-msg-star').forEach(el => el.remove());
      return;
    }

    injectStarButtons();
    injectMessageStars();
    
    // Observe DOM changes for dynamic loading
    domObserver = new MutationObserver(() => {
      if (domObserver) domObserver.disconnect();
      
      try {
        if (!isChatInterface()) {
          document.querySelectorAll('.ai-saver-container').forEach(el => el.remove());
          document.querySelectorAll('.ai-saver-msg-star').forEach(el => el.remove());
          return;
        }
        injectStarButtons();
        injectMessageStars();
      } finally {
        if (domObserver) {
          domObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      }
    });
    
    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on URL changes (SPA navigation)
  if (!urlObserver) {
    let lastUrl = location.href;
    urlObserver = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(init, 1000);
      }
    });
    urlObserver.observe(document, { subtree: true, childList: true });
  }

})();
