# Changelog

All notable changes to the **AI Chat Saver** Chrome Extension will be documented in this file.

## [1.3.6] - 2026-06-08

### Fixed
- Fixed duplicate header star button injection on Claude by excluding sidebar, navigation, and profile menu containers from injection targets.
- Positioned user prompt message star buttons outside the message bubble box on the left, vertically centered beside the bubble, preventing overlapping text or layout distortion.
- Styled star icons to look completely native by default (subtle gray glassmorphism outline) and only turn bright gold when hovered or saved.

---

## [1.3.5] - 2026-06-08

### Fixed
- Fixed an infinite recursive mutation loop bug inside `content.js`. Injecting and removing star button elements triggered the `MutationObserver` callback recursively, leading to 100% CPU utilization and periodic tab reloads/crashes. Added disconnect/reconnect logic inside observers to safely ignore script-driven DOM modifications.
- Resolved a duplicate observer memory leak bug by using global variables to track and clean up existing observers on SPA URL navigation changes.

---

## [1.3.4] - 2026-06-08

### Fixed
- Fixed a path comparison bug in `detectPlatform` inside `content.js` where trailing slashes in platform path configurations (like Claude's `/chat/`) caused double-slash mismatches, preventing the extension script from matching and loading on those pages.
- Expanded Claude selector compatibility to include `[data-testid="user-message"]` and `[data-testid="assistant-message"]` under main message selectors.
- Expanded Claude sticky header query targets to look for dynamic header containers.

---

## [1.3.3] - 2026-06-08

### Added
- Repositioned the search input bar to span the full width across the top of both panels (chat viewer and sidebar).
- Relocated the platform filter dropdown select back next to the H1 logo title in the main header.
- Relocated the "Export All" action button into a new "Backup & Export" section inside the Settings slide-out drawer.
- Cleaned up the right sidebar toolbar to feature only the list of chats and settings menu.

---

## [1.3.2] - 2026-06-08

### Changed
- Swapped columns in the split-screen layout: the static chat viewer (`#chatViewer`) is now located on the left side, and the chats sidebar navigation (`.chats-sidebar` containing search, filter select, and chat card list) is located on the right side.
- Relocated the platform filter dropdown select back into the sidebar toolbar for cohesive local navigation.
- Maintained responsive behavior where the sidebar stacks on top of the chat viewer on small mobile screens.

---

## [1.3.1] - 2026-06-08

### Added
- Integrated the platform filter select dropdown directly inside the header beside the main title logo.
- Moved the Settings action to the bottom of the left sidebar as a dedicated sidebar menu item.
- Re-architected the Settings modal into a premium slide-out side drawer with smooth opacity and horizontal transform transitions.

---

## [1.3.0] - 2026-06-08

### Added
- Replaced the popup modal chat viewer in the dashboard with a premium static, two-column split-screen layout.
- Added sidebar navigation containing search, platform filters, custom platform config triggers, and saved chat lists.
- Implemented responsive grid/flex layout with scroll locks to prevent double scrollbars.
- Added active card highlighting and default selection of the first card on load or when filters are changed.

### Fixed
- Fixed extension update listener in `background.js` to prevent wiping user data (chats and custom platforms) on updates.

---

## [1.2.1] - 2026-06-07

### Fixed
- Fixed text-overlapping glitch where the save-star buttons obscured message texts in Gemini and other platforms. Added a dynamic direct-parent CSS `:has()` padding-right rule (`padding-right: 44px !important`) to reserve clear right margin space for the absolute-positioned stars.
- Refined message star button colors, shadows, and hover transitions (introducing glassmorphism semi-transparency and dark-theme class checks) to look completely native in dark mode layouts.

---

## [1.2.0] - 2026-06-07

### Added
- Added **36 native AI platforms** to the routing and matching system in [content.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/content.js).
- Added corresponding permissions and match rules for all 36 domains in [manifest.json](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/manifest.json) to enable native injection out-of-the-box.
- Populated all 36 AI chat platforms inside the dashboard filter dropdown in [dashboard.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/dashboard.js).

---

## [1.1.0] - 2026-06-07

### Added
- Added a **Settings Modal** in [dashboard.html](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/dashboard.html) and [dashboard.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/dashboard.js) to allow users to register custom AI chat platforms.
- Implemented **URL Dividing** (parsing) to dynamically extract hostnames, pathnames, and origin matches.
- Integrated Chrome **optional host permissions** (`*://*/*` in [manifest.json](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/manifest.json)) so host permissions are requested dynamically when a user adds a new platform, keeping initial installation warning-free.
- Implemented dynamic script registration in [background.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/background.js) utilizing Chrome's `scripting` API, which restores registered custom platforms' content scripts on browser startup.
- Refactored routing detection in [content.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/content.js) into a data-driven structure (`AI_ROUTING_TABLE`) supporting dynamic expansion of platforms and path-specific chat matching.

---

## [1.0.4] - 2026-06-07

### Added
- Targeted specific user prompt wrappers (e.g. `.user-query-container` on Gemini, `[class*="MessageItem_user"]` on Manus) and assistant responses to inject the save-star buttons directly inside the message bubbles rather than the outer row container.
- Configured CSS in [content.css](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/content.css) to set relative positioning for these nested wrappers, ensuring alignment of the absolute-positioned star.

---

## [1.0.3] - 2026-06-07

### Removed
- Removed the `chrome_url_overrides` field in [manifest.json](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/manifest.json) that overrode the Chrome New Tab page.

### Added
- Added a click action listener inside [background.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/background.js) that opens the dashboard ([dashboard.html](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/dashboard.html)) in a new tab whenever the extension toolbar icon is clicked.

---

## [1.0.2] - 2026-06-07

### Added
- Re-added specific support for **Google Gemini** (`gemini.google.com`) inside:
  - [manifest.json](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/manifest.json) (`host_permissions` & `content_scripts.matches`)
  - [content.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/content.js) (selectors, platform detection, injection helper)
  - [dashboard.html](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/dashboard.html) (dropdown filter option)

### Fixed
- Avoided using the broad wildcard `*://*.google.com/*` host permission to prevent redirect glitches for Google links in the overridden New Tab page.

---

## [1.0.1] - 2026-06-07

### Removed
- Removed all Google-related chat connections, including Gemini and Bard, from:
  - [manifest.json](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/manifest.json) (host permissions and matches)
  - [content.js](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/content.js) (platform selectors, detectPlatform, injection configs)
  - [dashboard.html](file:///c:/Users/91849/AntiGravityProjects/ai-chat-saver/dashboard.html) (platform filter option)

---

## [1.0.0] - 2026-06-07

### Added
- Initial release of the **AI Chat Saver** Chrome Extension.
- Multi-platform scraping support: ChatGPT, Claude, Gemini, Perplexity, Poe, Copilot, Manus, and generic websites.
- Main header star injection for saving full chats.
- Individual message hover star injection for single message capture.
- Local storage database for saved chats.
- New Tab page override with Search, Filtering, and JSON exports.
