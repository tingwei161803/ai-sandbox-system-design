# AI Sandbox 安全沙盒架構

> 一套五層式安全架構的互動式說明網站：把不可信、AI 產生的程式碼，關進強化過的 Linux 沙盒中執行 —— 隔離、限額、全程可觀測。

本網站把一張「AI Sandbox 安全沙盒系統架構」簡報，整理成一個可瀏覽、可互動、雙語的多頁面靜態網站，並以 Linux 核心文件與當前 AI 沙盒業界資料佐證內容。涵蓋系統架構總覽、五大核心元件、任務生命週期（資料流）、四道隔離機制、設計原則與業界現況，外加術語速查、隨堂測驗與字卡三個學習小工具。

---

## 🔗 線上版 / Live

| | |
|---|---|
| 🌐 網站 | <https://ai-sandbox-system-design.peteraim.com/> |

> 直接點進去就能用，無需安裝。各子頁有獨立網址（例如 `…/isolation.html`），元件／隔離機制卡片支援 `#<slug>` 深連結，例如 <https://ai-sandbox-system-design.peteraim.com/isolation.html#seccomp-bpf>。
>
> 英文版在 `/en/` 底下、檔名一一對應，例如 <https://ai-sandbox-system-design.peteraim.com/en/isolation.html>。

---

## ✨ 功能特色

- 🧱 **多頁面架構** — 一個 hub 首頁 + 9 個共用 shell 的子頁，每頁有獨立 URL 與 SEO
- 🌏 **一個語言一個網址** — 中文在 root、English 在 `/en/`，每頁兩種語言各有自己的網址，互相用 `hreflang` 標註；切換鈕是真正的連結
- 🌗 **深色 / 淺色模式** — 手動切換，跨頁持久
- 🔍 **即時搜尋與分類篩選** — 元件、隔離機制、術語皆可搜尋／依分類過濾
- 🪟 **詳情對話框 + 深連結** — 卡片點開看細節，`#<slug>` 可直接分享到特定項目
- 🧑‍💻 **角色學習地圖** — 各角色（架構師、後端／平台、安全、DevOps/SRE、前端）要學的技能與該學到的程度（了解／會用／實作／精通）
- 🗂️ **互動學習工具** — 術語速查（可搜尋詞彙表）、隨堂測驗（即時對錯 + 計分）、字卡（點擊翻面）
- 📊 **流量追蹤** — 已接 Google Analytics 4（見下方聲明）
- 📱 **響應式設計** — 手機、平板、桌機皆適配
- ⚡ **純靜態** — 無後端、無建置流程、載入快、可離線瀏覽

---

## 📂 內容結構 / 資料來源

本站內容整理自一張 **AI Sandbox 安全沙盒系統架構簡報**，並以下列公開資料佐證隔離機制與業界現況：

- Linux namespaces — <https://en.wikipedia.org/wiki/Linux_namespaces>
- Seccomp BPF — <https://docs.kernel.org/userspace-api/seccomp_filter.html>
- Control Group v2 (cgroups) — <https://docs.kernel.org/admin-guide/cgroup-v2.html>
- What are namespaces and cgroups — <https://blog.nginx.org/blog/what-are-namespaces-cgroups-how-do-they-work>
- How to sandbox AI agents — <https://northflank.com/blog/how-to-sandbox-ai-agents>
- Sandboxed environments for AI coding — <https://www.bunnyshell.com/guides/sandboxed-environments-ai-coding/>

```
ai-sandbox-system-design/
├── index.html          # hub 首頁（總覽）
├── architecture.html   # 系統架構總覽（bento）
├── components.html     # 核心元件（gallery + 對話框）
├── dataflow.html       # 任務生命週期 / 資料流（timeline）
├── isolation.html      # 沙盒隔離機制（gallery + 對話框）
├── design.html         # 設計原則與業界現況（長文）
├── roles.html          # 角色學習地圖（角色 → 技能 → 學習程度）
├── glossary.html       # 技術術語速查
├── quiz.html           # 隨堂測驗
├── flashcards.html     # 字卡 / 翻卡
├── en/                 # 以上十頁的英文版，檔名一一對應（root 是中文）
├── assets/
│   ├── styles.css      # Material Design 3 基底 + 各版型樣式
│   ├── shell.js        # 共用 chrome（appbar / 跨頁導覽 / 頁尾 / dialog / 語言+主題）
│   └── app.js          # 版型引擎：依 data-page 選 renderer 渲染
├── data/
│   └── data.js         # 唯一資料檔：SITE_META + SITE_PAGES[]（雙語）
└── .nojekyll
```

> ⚠️ **非官方／教學用途**：本網站為個人整理之非官方說明，架構內容來自上述簡報，技術細節雖已對照核心文件，仍可能有簡化或出入，請以官方來源為準。

---

## 🛠 本機使用

```bash
# 1. clone 專案
git clone https://github.com/tingwei161803/ai-sandbox-system-design.git
cd ai-sandbox-system-design

# 2a. 最簡單：直接開啟首頁
open index.html

# 2b. 或啟動本機伺服器（建議，跨頁導覽 / 深連結才完全正常）
uv run python -m http.server 4173
# 然後瀏覽 http://localhost:4173
```

> 本專案為純靜態網站，不需安裝任何依賴。若要跑本機伺服器，依偏好一律使用 `uv`（不要用裸 `python3` / `pip`）。

---

## 📝 聲明 / License

- 整理者：**Peter Chang**。
- 本站為非官方教學整理，架構簡報之著作權歸原作者所有；引用之技術資料著作權歸各原始來源所有。
- 本網站使用 **Google Analytics 4**（GA4 property：`AI Sandbox 安全沙盒架構 - GA4`）蒐集匿名流量數據（例如頁面瀏覽），用於了解使用情形；不蒐集個人身分資訊。可參閱 [Google 隱私政策](https://policies.google.com/privacy)。
- 程式碼以 **MIT** 授權釋出。
- 如為權利人並希望調整或移除內容，請開 issue 聯絡。
