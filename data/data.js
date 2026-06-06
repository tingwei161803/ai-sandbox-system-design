/* =========================================================================
   AI Sandbox · data.js   (ONE shared data file, loaded by every page)

   The whole multi-page site is config-driven from two globals:
     window.SITE_META  = { title:{en,zh}, subtitle:{en,zh}, footer:{en,zh} }
     window.SITE_PAGES = [ { slug, layout, icon, title:{en,zh}, ...layoutData } ]

   Each entry of SITE_PAGES becomes ONE real .html page (slug "home" -> index.html,
   slug "x" -> x.html). Every human-visible string is {en,zh} so the language
   toggle repaints the whole site with nothing left stuck in the other language.

   Content is organised from a system-architecture slide and corroborated with
   the Linux kernel documentation and current AI-sandbox industry references
   (see the 設計原則 / Design page for the source list).
   ========================================================================= */

window.SITE_META = {
  title:    { en: "AI Sandbox Architecture", zh: "AI Sandbox 安全沙盒架構" },
  subtitle: { en: "A secure sandbox for running untrusted, AI-generated code.",
              zh: "用來安全執行不可信、AI 產生程式碼的沙盒系統。" },
  footer:   { en: "Curated by Peter Chang · Static site, no build step.",
              zh: "整理者：Peter Chang · 純靜態網站，無建置流程。" }
};

window.SITE_PAGES = [

  /* ===================================================================== */
  /* 1 · HOME / HUB                                                         */
  /* ===================================================================== */
  {
    slug: "home", layout: "hub", icon: "home",
    title:    { en: "Overview", zh: "總覽" },
    subtitle: { en: "A five-layer architecture that runs untrusted code inside a hardened Linux sandbox — isolated, resource-capped and fully observable. Every page shares this nav, language and theme.",
                zh: "一套五層式架構，把不可信的程式碼關進強化過的 Linux 沙盒中執行 —— 隔離、限額、全程可觀測。所有頁面共用這個導覽、語言與主題。" },
    stats: [
      { value: 5, label: { en: "Core components", zh: "核心元件" } },
      { value: 4, label: { en: "Isolation layers", zh: "隔離機制" } },
      { value: 8, label: { en: "Namespace types (kernel 6.1)", zh: "Namespace 類型（kernel 6.1）" } },
      { value: 6, label: { en: "Lifecycle steps", zh: "任務生命週期步驟" } }
    ]
  },

  /* ===================================================================== */
  /* 2 · ARCHITECTURE (bento)                                               */
  /* ===================================================================== */
  {
    slug: "architecture", layout: "archstack", icon: "account_tree",
    title:    { en: "System Architecture", zh: "系統架構總覽" },
    subtitle: { en: "Five layers, top to bottom — from the browser down to the kernel-level sandbox.",
                zh: "五層由上而下 —— 從瀏覽器一路到核心層的沙盒。" },
    intro: { en: "Data flows top to bottom: each layer hands off to the next, and the untrusted code only ever runs at the guarded core. Each layer has one job, so a failure (or a hostile workload) stays contained instead of spreading.",
             zh: "資料由上而下流動：每一層交棒給下一層，而不可信的程式碼只在被嚴密看守的核心執行。每層只做一件事，因此故障（或惡意工作負載）會被框住，而不會擴散。" },
    layers: [
      { icon: "devices", name: { en: "Frontend UI", zh: "前端 UI" },
        role: { en: "Upload, launch, view results", zh: "上傳、啟動、看結果" },
        items: [ { en: "File upload", zh: "檔案上傳" }, { en: "Sandbox launch", zh: "沙盒啟動" }, { en: "Result display", zh: "執行結果呈現" } ] },
      { icon: "database", name: { en: "Database", zh: "資料庫" },
        role: { en: "Temporary & result store", zh: "暫存 / 結果儲存" },
        items: [ { en: "Job (ID / Status)", zh: "Job 任務紀錄" }, { en: "Results", zh: "Results 結果" }, { en: "Logs", zh: "Logs 日誌" } ] },
      { icon: "manage_accounts", name: { en: "Job Manager", zh: "任務管理器" },
        role: { en: "Dispatch · monitor · return", zh: "派送 · 監控 · 回傳" },
        items: [ { en: "Dispatch to nodes", zh: "派送到節點" }, { en: "Monitor status", zh: "監控節點狀態" }, { en: "Return results", zh: "回傳執行結果" }, { en: "Store to Sandbox", zh: "存回 Sandbox" } ] },
      { icon: "security", name: { en: "Sandbox Executor", zh: "沙盒執行層" },
        role: { en: "Runs untrusted code under four kernel-level controls", zh: "在四道核心層級控制下執行不可信程式碼" },
        accent: true, tag: { en: "Security core", zh: "安全核心" },
        items: [ { en: "Linux Namespace", zh: "Linux Namespace" }, { en: "Seccomp-BPF", zh: "Seccomp-BPF" }, { en: "Cgroups", zh: "Cgroup" }, { en: "Timeout", zh: "Timeout" } ] },
      { icon: "monitor_heart", name: { en: "Monitoring & Logs", zh: "監控與日誌" },
        role: { en: "Observe everything, touch nothing", zh: "觀測一切、不碰沙盒" },
        items: [ { en: "Live resource metrics", zh: "即時資源監控" }, { en: "Anomaly alerts", zh: "異常告警" }, { en: "Log query", zh: "執行記錄查詢" } ] }
    ]
  },

  /* ===================================================================== */
  /* 3 · COMPONENTS (gallery + dialog)                                      */
  /* ===================================================================== */
  {
    slug: "components", layout: "gallery", icon: "widgets",
    title:    { en: "Core Components", zh: "核心元件" },
    subtitle: { en: "The five building blocks. Click any card for detail.", zh: "五大組成單元。點任一張卡看細節。" },
    categories: [
      { key: "interface",     en: "Interface",     zh: "介面層" },
      { key: "data",          en: "Data",          zh: "資料層" },
      { key: "control",       en: "Control",       zh: "控制層" },
      { key: "execution",     en: "Execution",     zh: "執行層" },
      { key: "observability", en: "Observability", zh: "觀測層" }
    ],
    items: [
      {
        slug: "frontend-ui", category: "interface",
        title:   { en: "Frontend UI", zh: "前端 UI" },
        summary: { en: "Where users upload code, launch a sandbox and read the results.",
                   zh: "使用者上傳程式碼、啟動沙盒、閱讀結果的地方。" },
        tags: ["upload", "launch", "results"],
        overview: { en: "The only layer a user touches. Three jobs: (1) file upload — submit the code or files to run; (2) sandbox launch — kick off a job; (3) result display — render stdout, files and status once the run finishes. It never executes anything itself; it only talks to the database and reads back results.",
                    zh: "使用者唯一會接觸到的一層。三件事：(1) 檔案上傳 —— 提交要執行的程式碼或檔案；(2) 沙盒啟動 —— 觸發一個任務；(3) 執行結果呈現 —— 任務跑完後顯示 stdout、檔案與狀態。它本身不執行任何東西，只跟資料庫溝通、讀回結果。" }
      },
      {
        slug: "database", category: "data",
        title:   { en: "Database", zh: "資料庫" },
        summary: { en: "Temporary store and result store: jobs, results and logs.",
                   zh: "暫存與結果儲存：任務、結果與日誌。" },
        tags: ["jobs", "results", "logs"],
        overview: { en: "The shared source of truth between layers, holding three kinds of record. Job — task record keyed by Job ID with a Status field. Results — the stored output of each run (stdout, files, steps). Logs — execution and error logs for later inspection. Because everything flows through here, the UI and the monitoring layer stay decoupled from the executor.",
                    zh: "各層之間共享的真實來源，存三種紀錄。Job（任務紀錄）—— 以 Job ID 為鍵、帶 Status 欄位。Results（結果存放）—— 每次執行的輸出（stdout、檔案、步驟）。Logs（日誌紀錄）—— 執行紀錄與錯誤紀錄，供日後查閱。因為一切都流經這裡，UI 與監控層才能跟執行器解耦。" }
      },
      {
        slug: "job-manager", category: "control",
        title:   { en: "Job Manager", zh: "任務管理器 (Job Manager)" },
        summary: { en: "Dispatches tasks to nodes, watches them, returns results.",
                   zh: "派送任務到節點、監看狀態、回傳結果。" },
        tags: ["dispatch", "monitor", "scale"],
        overview: { en: "The orchestrator. It (1) dispatches tasks to execution nodes, (2) monitors node status while a job is running, (3) updates and returns execution results, and (4) writes results back to the sandbox store. Adding more execution nodes behind the Job Manager is how the system scales horizontally.",
                    zh: "調度中樞。它會 (1) 派送任務到執行節點、(2) 在任務執行中監控節點狀態、(3) 更新／回傳執行結果、(4) 把結果存回 Sandbox。在任務管理器後面增加更多執行節點，就是這套系統水平擴充的方式。" }
      },
      {
        slug: "sandbox-executor", category: "execution",
        title:   { en: "Sandbox Executor", zh: "沙盒執行層 (Sandbox Executor)" },
        summary: { en: "The security core: namespaces, seccomp-BPF, cgroups and timeout.",
                   zh: "安全核心：namespace、seccomp-BPF、cgroup 與 timeout。" },
        tags: ["namespace", "seccomp", "cgroup", "timeout"],
        overview: { en: "Where untrusted code actually runs — and the layer that earns the word 'secure'. It stacks four kernel-level controls: Linux Namespaces (isolate PID / Network / Mount / UTS views), Seccomp-BPF (restrict which syscalls are even allowed), Cgroups (cap CPU / Memory / I/O / PIDs) and Timeout (kill runaway jobs). See the Isolation page for each mechanism in depth.",
                    zh: "不可信程式碼真正執行的地方 —— 也是「安全」二字的來源。它疊了四道核心層級的控制：Linux Namespace（隔離 PID／Network／Mount／UTS 視圖）、Seccomp-BPF（限制哪些 syscall 才被允許）、Cgroup（限制 CPU／Memory／I/O／PIDs）、Timeout（砍掉失控任務）。各機制細節見「隔離機制」頁。" }
      },
      {
        slug: "monitoring", category: "observability",
        title:   { en: "Monitoring & Logs", zh: "監控與日誌" },
        summary: { en: "Live resource monitoring, anomaly alerts and execution-log queries.",
                   zh: "即時資源監控、異常告警、執行記錄查詢。" },
        tags: ["metrics", "alerts", "audit"],
        overview: { en: "The observability layer. Three jobs: (1) live resource-usage monitoring while jobs run; (2) anomaly logging / notification / alerting when something misbehaves; (3) execution-log query so operators can audit what happened after the fact. It reads from the database and the executor without ever touching the sandboxed code.",
                    zh: "可觀測性的一層。三件事：(1) 任務執行時的即時資源使用監控；(2) 異常紀錄／通知／告警；(3) 執行記錄查詢，讓維運者事後稽核發生了什麼。它從資料庫與執行器讀資料，完全不碰被沙盒化的程式碼。" }
      }
    ]
  },

  /* ===================================================================== */
  /* 4 · DATA FLOW / LIFECYCLE (timeline)                                   */
  /* ===================================================================== */
  {
    slug: "dataflow", layout: "timeline", icon: "timeline",
    title:    { en: "Task Lifecycle", zh: "任務生命週期 / 資料流" },
    subtitle: { en: "What happens between 'submit code' and 'see results'.",
                zh: "從「送出程式碼」到「看到結果」之間發生的事。" },
    events: [
      { date: { en: "Step 1", zh: "第 1 步" },
        title: { en: "Submit", zh: "提交任務" },
        body: { en: "The user uploads code and launches a sandbox from the Frontend UI.",
                zh: "使用者在前端 UI 上傳程式碼、啟動沙盒。" } },
      { date: { en: "Step 2", zh: "第 2 步" },
        title: { en: "Persist the job", zh: "建立任務紀錄" },
        body: { en: "A Job record (Job ID + Status) is written to the database; the Job Manager listens for new work.",
                zh: "在資料庫建立一筆 Job 紀錄（Job ID + Status）；任務管理器監聽新任務。" } },
      { date: { en: "Step 3", zh: "第 3 步" },
        title: { en: "Dispatch to a node", zh: "派送到節點" },
        body: { en: "The Job Manager describes the task's requirements and dispatches it to the Sandbox Executor.",
                zh: "任務管理器描述任務需求，並把它派送到沙盒執行層。" } },
      { date: { en: "Step 4", zh: "第 4 步" },
        title: { en: "Isolated execution", zh: "隔離執行" },
        body: { en: "The code runs under namespaces, seccomp-BPF, cgroup limits and a timeout — contained on every axis.",
                zh: "程式碼在 namespace、seccomp-BPF、cgroup 限額與 timeout 約束下執行 —— 每個面向都被框住。" } },
      { date: { en: "Step 5", zh: "第 5 步" },
        title: { en: "Monitor & log", zh: "監控與紀錄" },
        body: { en: "Monitoring watches resource usage live and records any anomalies, alerts or errors.",
                zh: "監控層即時監看資源用量，記錄任何異常、告警或錯誤。" } },
      { date: { en: "Step 6", zh: "第 6 步" },
        title: { en: "Return results", zh: "回傳結果" },
        body: { en: "Execution results are updated, written back to the sandbox store, and rendered to the user.",
                zh: "更新執行結果、存回 Sandbox、並呈現給使用者。" } }
    ]
  },

  /* ===================================================================== */
  /* 5 · ISOLATION MECHANISMS (gallery + dialog, with sources)              */
  /* ===================================================================== */
  {
    slug: "isolation", layout: "gallery", icon: "shield",
    title:    { en: "Isolation Mechanisms", zh: "沙盒隔離機制" },
    subtitle: { en: "The four kernel-level controls inside the Sandbox Executor. Click for detail.",
                zh: "沙盒執行層裡的四道核心層級控制。點開看細節。" },
    categories: [
      { key: "namespace", en: "Visibility", zh: "可見範圍" },
      { key: "syscall",   en: "Syscalls",   zh: "系統呼叫" },
      { key: "resource",  en: "Resources",  zh: "資源" },
      { key: "lifecycle", en: "Lifecycle",  zh: "生命週期" }
    ],
    items: [
      {
        slug: "linux-namespace", category: "namespace",
        title:   { en: "Linux Namespace", zh: "Linux Namespace 隔離" },
        summary: { en: "Isolates what a process can SEE — PID / Network / Mount / UTS and more.",
                   zh: "隔離行程「看得到什麼」—— PID／Network／Mount／UTS 等。" },
        tags: ["PID", "Network", "Mount", "UTS"],
        overview: { en: "Namespaces decide what a process is allowed to see and interact with. As of Linux 6.1 there are eight types; this sandbox leans on PID (own process-ID space, so the workload is PID 1 and can't see host processes), Network (its own isolated network stack and devices), Mount (an isolated filesystem view), and UTS (its own hostname). The result: code inside the sandbox cannot observe — let alone touch — anything outside it. Sources: Linux namespaces (Wikipedia / man7), NGINX 'namespaces & cgroups'.",
                    zh: "Namespace 決定一個行程能看到、能互動的範圍。到 Linux 6.1 共有八種；本沙盒主要用 PID（獨立的行程 ID 空間，工作負載是 PID 1，看不到宿主行程）、Network（自己獨立的網路堆疊與裝置）、Mount（隔離的檔案系統視圖）、UTS（自己的 hostname）。結果是：沙盒內的程式碼根本觀測不到 —— 更別說碰到 —— 外面的東西。來源：Linux namespaces（Wikipedia／man7）、NGINX「namespaces & cgroups」。" }
      },
      {
        slug: "seccomp-bpf", category: "syscall",
        title:   { en: "Seccomp-BPF", zh: "Seccomp-BPF 系統呼叫限制" },
        summary: { en: "A syscall firewall: rejects forbidden system calls before they run.",
                   zh: "系統呼叫防火牆：在禁止的 syscall 執行前就攔下。" },
        tags: ["syscall", "BPF", "attack-surface"],
        overview: { en: "Seccomp-BPF attaches a BPF filter to the process that runs BEFORE each syscall. The filter evaluates a struct seccomp_data (the syscall number and its numeric arguments) and decides allow or deny — from the kernel's view, only the allowed syscalls exist. Because BPF programs can't dereference pointers, the design is immune to time-of-check/time-of-use (TOCTOU) tricks, and shrinking the set of reachable syscalls directly shrinks the kernel attack surface. Sources: kernel.org seccomp_filter docs.",
                    zh: "Seccomp-BPF 把一個 BPF 過濾器掛到行程上，在每次 syscall 執行「之前」先跑。過濾器檢視 struct seccomp_data（syscall 編號與其數值參數）來決定放行或拒絕 —— 從核心角度看，只有被允許的 syscall 存在。因為 BPF 程式無法解參考指標，這個設計對 time-of-check/time-of-use（TOCTOU）攻擊免疫；而縮小可達的 syscall 集合，就直接縮小了核心攻擊面。來源：kernel.org seccomp_filter 文件。" }
      },
      {
        slug: "cgroup", category: "resource",
        title:   { en: "Cgroups", zh: "Cgroup 資源限制" },
        summary: { en: "Caps how MUCH a process can use — CPU / Memory / I/O / PIDs.",
                   zh: "限制行程「能用多少」—— CPU／Memory／I/O／PIDs。" },
        tags: ["CPU", "Memory", "I/O", "PIDs"],
        overview: { en: "Where namespaces limit visibility, cgroups limit consumption. cgroup v2 uses one unified hierarchy with four controllers this sandbox cares about: cpu (cpu.max hard quota), memory (memory.max hard limit — exceed it and the cgroup's OOM killer fires), io (io.max bandwidth / IOPS caps) and pids (a hard cap on process count that defuses fork bombs). This is what stops one job from starving every other job on the host. Sources: kernel.org Control Group v2.",
                    zh: "Namespace 限制可見範圍，Cgroup 則限制消耗量。cgroup v2 用單一的統一階層，本沙盒在意四個控制器：cpu（cpu.max 硬性配額）、memory（memory.max 硬上限 —— 超過就觸發該 cgroup 的 OOM killer）、io（io.max 頻寬／IOPS 上限）、pids（行程數硬上限，化解 fork bomb）。這正是「一個任務不會餓死宿主上其他任務」的關鍵。來源：kernel.org Control Group v2。" }
      },
      {
        slug: "timeout", category: "lifecycle",
        title:   { en: "Timeout control", zh: "Timeout 控制" },
        summary: { en: "Kills runaway jobs so nothing squats on resources forever.",
                   zh: "砍掉失控任務，避免有東西永久佔著資源。" },
        tags: ["wall-clock", "auto-kill", "cleanup"],
        overview: { en: "Even with everything else in place, a workload could simply hang or loop forever and squat on its slot. A wall-clock timeout bounds every run: when the limit is hit, the job is terminated and its sandbox torn down. It complements cgroups (which cap rate of use) by capping total duration, and it keeps node capacity flowing for the next task in the queue.",
                    zh: "就算前面全都到位，一個工作負載還是可能單純卡住或無限迴圈，霸佔著它的位置。一個牆鐘（wall-clock）逾時為每次執行設上界：到點就終止任務、拆掉沙盒。它和 cgroup（限制使用速率）互補 —— cgroup 管「用多快」，timeout 管「用多久」—— 並讓節點容量持續流給佇列中的下一個任務。" }
      }
    ]
  },

  /* ===================================================================== */
  /* 6 · DESIGN PRINCIPLES + INDUSTRY CONTEXT (article)                     */
  /* ===================================================================== */
  {
    slug: "design", layout: "article", icon: "design_services",
    title:    { en: "Design Principles & Context", zh: "設計原則與業界現況" },
    subtitle: { en: "Why the system is shaped this way — and how it compares to the field.",
                zh: "為什麼這套系統長這樣 —— 以及它與業界的對照。" },
    sections: [
      {
        id: "goals", heading: { en: "Design goals", zh: "設計目標" },
        blocks: [
          { type: "p", text: { en: "The system exists to run code its operators do not trust — typically AI-generated — without that code being able to harm the host, other workloads, or the data around it. Two non-functional properties dominate every decision: high isolation and high scalability.",
                               zh: "這套系統的存在，是為了執行維運者不信任的程式碼 —— 通常是 AI 產生的 —— 同時讓那段程式碼無法傷害宿主、其他工作負載或周邊資料。兩個非功能性特性主導了每個決策：高隔離性與高擴充性。" } },
          { type: "quote", text: { en: "Treat every workload as hostile, then make 'hostile' boring.",
                                   zh: "把每個工作負載都當成有敵意，然後讓「有敵意」變得無聊。" } }
        ]
      },
      {
        id: "isolation", heading: { en: "High isolation", zh: "高隔離性" },
        blocks: [
          { type: "p", text: { en: "Isolation is layered on purpose, because no single mechanism is sufficient on its own:",
                               zh: "隔離是刻意分層的，因為沒有任何單一機制能獨力做到完整防護：" } },
          { type: "ul", items: {
              en: [
                "Namespaces hide the rest of the system from the workload (what it can see).",
                "Seccomp-BPF removes syscalls the workload should never need (what it can ask the kernel to do).",
                "Cgroups cap CPU, memory, I/O and process count (how much it can use).",
                "Timeouts bound how long it can run (how long it can hold a slot)."
              ],
              zh: [
                "Namespace 把系統其餘部分對工作負載隱藏起來（它看得到什麼）。",
                "Seccomp-BPF 拿掉工作負載根本不該用到的 syscall（它能要求核心做什麼）。",
                "Cgroup 限制 CPU、記憶體、I/O 與行程數（它能用多少）。",
                "Timeout 限制它能跑多久（它能霸佔位置多久）。"
              ] } },
          { type: "p", text: { en: "Together they form four independent walls. An attacker has to defeat all of them at once, which is far harder than slipping past any one.",
                               zh: "四者合起來是四道彼此獨立的牆。攻擊者必須同時攻破全部，這比繞過其中任何一道都難得多。" } }
        ]
      },
      {
        id: "scalability", heading: { en: "High scalability", zh: "高擴充性" },
        blocks: [
          { type: "p", text: { en: "Scale comes from the Job Manager / execution-node split. The control plane (UI, database, Job Manager) stays small and shared; the data plane (execution nodes) is stateless and disposable. To handle more load you add nodes — the Job Manager just dispatches to more of them.",
                               zh: "擴充性來自「任務管理器／執行節點」的拆分。控制平面（UI、資料庫、任務管理器）保持精簡、共享；資料平面（執行節點）則是無狀態、可拋棄的。要承受更多負載就加節點 —— 任務管理器只要派送給更多節點即可。" } },
          { type: "h3", text: { en: "Why a database in the middle", zh: "為什麼中間要放資料庫" } },
          { type: "p", text: { en: "Routing jobs, results and logs through a shared database decouples the layers: the UI never calls an execution node directly, and monitoring can read everything without touching the sandbox. Decoupled layers can be scaled — and reasoned about — independently.",
                               zh: "讓任務、結果與日誌都流經一個共享資料庫，能讓各層解耦：UI 永遠不直接呼叫執行節點，監控也能讀到一切而不碰沙盒。解耦後的各層，可以各自獨立擴充、也各自獨立推理。" } }
        ]
      },
      {
        id: "context", heading: { en: "Industry context (verified)", zh: "業界現況（已查證）" },
        blocks: [
          { type: "p", text: { en: "This design sits squarely in a fast-moving field. A few corroborated data points for scale:",
                               zh: "這套設計正落在一個高速演進的領域中。幾個已查證的數據點，說明它的規模：" } },
          { type: "ul", items: {
              en: [
                "A 2025 Veracode report found ~45% of AI-generated code fails security tests — sandboxing is not optional.",
                "E2B reported sandbox sessions growing from ~40,000/month (Mar 2024) to ~15M/month (Mar 2025).",
                "Stronger isolation tiers exist above this design: gVisor intercepts syscalls in user space (only a vetted subset reaches the host); Firecracker microVMs give each workload its own kernel, booting in ~125ms with under 5 MiB overhead.",
                "A common production recommendation is defense in depth: namespaces + seccomp + cgroups, optionally wrapped in a microVM for a hardware boundary."
              ],
              zh: [
                "2025 年 Veracode 報告指出約 45% 的 AI 產生程式碼通不過安全測試 —— 沙盒並非選配。",
                "E2B 回報沙盒 session 從約每月 4 萬次（2024 年 3 月）成長到約每月 1,500 萬次（2025 年 3 月）。",
                "比這套設計更強的隔離層級也存在：gVisor 在使用者空間攔截 syscall（只有經審核的子集會到宿主核心）；Firecracker microVM 讓每個工作負載擁有自己的核心，約 125ms 啟動、額外負擔小於 5 MiB。",
                "常見的正式環境建議是縱深防禦：namespace + seccomp + cgroup，必要時再用 microVM 包一層硬體邊界。"
              ] } },
          { type: "h3", text: { en: "Sources", zh: "參考來源" } },
          { type: "ul", items: {
              en: [
                "Linux namespaces — en.wikipedia.org/wiki/Linux_namespaces",
                "Seccomp BPF — docs.kernel.org/userspace-api/seccomp_filter.html",
                "Control Group v2 — docs.kernel.org/admin-guide/cgroup-v2.html",
                "What are namespaces and cgroups — blog.nginx.org",
                "How to sandbox AI agents — northflank.com/blog/how-to-sandbox-ai-agents",
                "Sandboxed environments for AI coding — bunnyshell.com"
              ],
              zh: [
                "Linux namespaces — en.wikipedia.org/wiki/Linux_namespaces",
                "Seccomp BPF — docs.kernel.org/userspace-api/seccomp_filter.html",
                "Control Group v2 — docs.kernel.org/admin-guide/cgroup-v2.html",
                "What are namespaces and cgroups — blog.nginx.org",
                "How to sandbox AI agents — northflank.com/blog/how-to-sandbox-ai-agents",
                "Sandboxed environments for AI coding — bunnyshell.com"
              ] } }
        ]
      }
    ]
  },

  /* ===================================================================== */
  /* 7 · ROLES / LEARNING ROADMAP (custom layout)                          */
  /* ===================================================================== */
  {
    slug: "roles", layout: "roadmap", icon: "school",
    title:    { en: "Learning Paths by Role", zh: "角色學習地圖" },
    subtitle: { en: "Want to help build a system like this? Here's what each role learns — and to what depth.",
                zh: "想參與打造這樣一套系統？這裡列出每個角色要學什麼 —— 以及學到什麼程度。" },
    intro: { en: "Pick the role you want to grow into, then read down its skills. The badge on each skill says how deep you need to go: just understand it, be able to use it, build it from scratch, or master it.",
             zh: "挑一個你想成為的角色，往下看它的技能清單。每項技能的標籤代表你要鑽多深：只要了解、會用、能從零實作、還是要精通。" },
    levels: [
      { key: "aware",  label: { en: "Aware",  zh: "了解" }, note: { en: "grasp the concept & trade-offs", zh: "懂概念與取捨，不必動手" } },
      { key: "use",    label: { en: "Use",    zh: "會用" }, note: { en: "use existing tools to get it done", zh: "能用現成工具完成任務" } },
      { key: "build",  label: { en: "Build",  zh: "實作" }, note: { en: "build, debug & integrate it yourself", zh: "能從零打造、除錯、整合" } },
      { key: "master", label: { en: "Master", zh: "精通" }, note: { en: "design, optimize & teach it", zh: "能設計、最佳化、教別人" } }
    ],
    roles: [
      {
        icon: "architecture",
        name: { en: "System Architect", zh: "系統架構師" },
        goal: { en: "Design the whole secure, scalable system and its trade-offs.", zh: "設計整套安全、可擴充的系統與其取捨。" },
        skills: [
          { name: { en: "System design & trade-offs", zh: "系統設計與取捨" }, level: "master" },
          { name: { en: "Isolation model (namespace / seccomp / cgroup)", zh: "隔離模型（namespace / seccomp / cgroup）" }, level: "build", note: { en: "deep enough to choose the right mix", zh: "深到足以選對組合" } },
          { name: { en: "Distributed systems & scaling (control vs data plane)", zh: "分散式系統與擴充（控制／資料平面）" }, level: "build" },
          { name: { en: "Threat modeling", zh: "威脅模型" }, level: "use" },
          { name: { en: "Container vs microVM trade-offs (gVisor / Firecracker)", zh: "容器 vs microVM 取捨（gVisor / Firecracker）" }, level: "use" },
          { name: { en: "Observability by design", zh: "可觀測性設計" }, level: "use" }
        ]
      },
      {
        icon: "terminal",
        name: { en: "Backend / Platform Engineer", zh: "後端 / 平台工程師" },
        goal: { en: "Build the Job Manager and the Sandbox Executor.", zh: "實作任務管理器與沙盒執行層。" },
        skills: [
          { name: { en: "Linux systems programming (processes, syscalls)", zh: "Linux 系統程式設計（行程、syscall）" }, level: "build" },
          { name: { en: "Namespace / cgroup APIs (clone, unshare, cgroupfs)", zh: "Namespace / cgroup API（clone、unshare、cgroupfs）" }, level: "build" },
          { name: { en: "Writing seccomp-BPF filters", zh: "撰寫 seccomp-BPF 過濾器" }, level: "build" },
          { name: { en: "Job queue & scheduling", zh: "任務佇列與排程" }, level: "build" },
          { name: { en: "Container runtimes (runc / containerd)", zh: "容器執行期（runc / containerd）" }, level: "use" },
          { name: { en: "Go / Rust / C (at least one)", zh: "Go / Rust / C（至少一種）" }, level: "build" }
        ]
      },
      {
        icon: "shield_person",
        name: { en: "Security Engineer", zh: "安全工程師" },
        goal: { en: "Harden isolation, model threats and stop sandbox escapes.", zh: "強化隔離、做威脅模型、防止沙盒逃逸。" },
        skills: [
          { name: { en: "Linux security model (capabilities, LSM, seccomp)", zh: "Linux 安全模型（capabilities、LSM、seccomp）" }, level: "master" },
          { name: { en: "Sandbox escapes & attack surface", zh: "沙盒逃逸與攻擊面" }, level: "build" },
          { name: { en: "Policy: seccomp / AppArmor / SELinux", zh: "政策：seccomp / AppArmor / SELinux" }, level: "build" },
          { name: { en: "Threat modeling & red-teaming", zh: "威脅模型與紅隊演練" }, level: "build" },
          { name: { en: "microVM isolation (Firecracker / KVM)", zh: "microVM 隔離（Firecracker / KVM）" }, level: "use" },
          { name: { en: "Vulnerability research & CVE tracking", zh: "弱點研究與 CVE 追蹤" }, level: "use" }
        ]
      },
      {
        icon: "cloud_sync",
        name: { en: "DevOps / SRE", zh: "DevOps / SRE" },
        goal: { en: "Deploy, scale, monitor and stay on-call for the platform.", zh: "部署、擴充、監控並負責 on-call。" },
        skills: [
          { name: { en: "Container orchestration (Kubernetes)", zh: "容器編排（Kubernetes）" }, level: "build" },
          { name: { en: "CI/CD & Infrastructure as Code (Terraform)", zh: "CI/CD 與基礎設施即程式碼（Terraform）" }, level: "build" },
          { name: { en: "Observability (metrics / logs / alerts)", zh: "可觀測性（指標 / 日誌 / 告警）" }, level: "build" },
          { name: { en: "cgroup resource quota tuning", zh: "cgroup 資源配額調校" }, level: "use" },
          { name: { en: "Autoscaling execution nodes", zh: "執行節點自動擴縮" }, level: "build" },
          { name: { en: "Incident response & on-call", zh: "事件應變與 on-call" }, level: "use" }
        ]
      },
      {
        icon: "web",
        name: { en: "Frontend Engineer", zh: "前端工程師" },
        goal: { en: "Build the UI for upload, launch and result display.", zh: "打造上傳、啟動、結果呈現的介面。" },
        skills: [
          { name: { en: "HTML / CSS / JavaScript fundamentals", zh: "HTML / CSS / JavaScript 基礎" }, level: "master" },
          { name: { en: "A frontend framework (React / Vue)", zh: "前端框架（React / Vue 其一）" }, level: "build" },
          { name: { en: "Live updates (WebSocket / SSE for job status)", zh: "即時更新（WebSocket / SSE 顯示任務狀態）" }, level: "build" },
          { name: { en: "REST API integration", zh: "REST API 串接" }, level: "build" },
          { name: { en: "Frontend security (XSS, output escaping)", zh: "前端資安（XSS、輸出跳脫）" }, level: "use" },
          { name: { en: "UX & accessibility", zh: "UX 與無障礙" }, level: "use" }
        ]
      }
    ]
  },

  /* ===================================================================== */
  /* 8 · GLOSSARY (custom layout)                                           */
  /* ===================================================================== */
  {
    slug: "glossary", layout: "glossary", icon: "menu_book",
    title:    { en: "Glossary", zh: "技術術語速查" },
    subtitle: { en: "Search the terms used across this site.", zh: "搜尋本站用到的術語。" },
    terms: [
      { term: { en: "Sandbox", zh: "沙盒 (Sandbox)" },
        def:  { en: "An isolated environment for running untrusted code so it can't affect anything outside it.",
                zh: "用來執行不可信程式碼的隔離環境，讓它無法影響外界。" } },
      { term: { en: "Namespace", zh: "Namespace" },
        def:  { en: "A Linux kernel feature that gives a process its own private view of a system resource (processes, network, filesystem, hostname…).",
                zh: "Linux 核心功能，給行程一份私有的系統資源視圖（行程、網路、檔案系統、hostname…）。" } },
      { term: { en: "PID namespace", zh: "PID namespace" },
        def:  { en: "Isolates the process-ID number space; the first process inside is PID 1 and cannot see host processes.",
                zh: "隔離行程 ID 空間；裡面第一個行程是 PID 1，看不到宿主行程。" } },
      { term: { en: "Network namespace", zh: "Network namespace" },
        def:  { en: "Gives a process its own isolated network stack, devices and ports.",
                zh: "給行程獨立隔離的網路堆疊、裝置與連接埠。" } },
      { term: { en: "Mount namespace", zh: "Mount namespace" },
        def:  { en: "Provides an isolated view of the filesystem mount points.",
                zh: "提供一份隔離的檔案系統掛載點視圖。" } },
      { term: { en: "UTS namespace", zh: "UTS namespace" },
        def:  { en: "Isolates the hostname and NIS domain name.",
                zh: "隔離主機名稱（hostname）與 NIS 網域名稱。" } },
      { term: { en: "Cgroup (control group)", zh: "Cgroup（控制群組）" },
        def:  { en: "Limits and accounts for the resources a group of processes can use — CPU, memory, I/O, process count.",
                zh: "限制並計量一組行程能用的資源 —— CPU、記憶體、I/O、行程數。" } },
      { term: { en: "Seccomp-BPF", zh: "Seccomp-BPF" },
        def:  { en: "A kernel facility that filters system calls with a BPF program, rejecting forbidden ones before they run.",
                zh: "用 BPF 程式過濾系統呼叫的核心機制，在禁止的呼叫執行前就攔下。" } },
      { term: { en: "Syscall (system call)", zh: "Syscall（系統呼叫）" },
        def:  { en: "The interface a program uses to ask the kernel to do something privileged (open a file, send a packet…).",
                zh: "程式請求核心執行特權動作（開檔、送封包…）的介面。" } },
      { term: { en: "BPF", zh: "BPF" },
        def:  { en: "Berkeley Packet Filter — a tiny in-kernel program format; seccomp uses it to evaluate syscalls.",
                zh: "Berkeley Packet Filter —— 一種核心內的小程式格式；seccomp 用它來評估 syscall。" } },
      { term: { en: "TOCTOU", zh: "TOCTOU" },
        def:  { en: "Time-of-check to time-of-use: a race where a value changes between validation and use. Seccomp-BPF avoids it by not dereferencing pointers.",
                zh: "檢查到使用之間的時間差：值在驗證與使用之間被改掉的競態。Seccomp-BPF 因為不解參考指標而避開它。" } },
      { term: { en: "OOM killer", zh: "OOM Killer" },
        def:  { en: "The kernel routine that terminates a process when memory runs out; a cgroup's memory.max can trigger it locally.",
                zh: "記憶體耗盡時終止行程的核心機制；cgroup 的 memory.max 可在該群組內觸發它。" } },
      { term: { en: "Fork bomb", zh: "Fork bomb" },
        def:  { en: "An attack that spawns processes endlessly to exhaust the system; the cgroup pids controller caps it.",
                zh: "無止盡產生行程以耗盡系統的攻擊；cgroup 的 pids 控制器可封住它。" } },
      { term: { en: "Attack surface", zh: "攻擊面 (Attack surface)" },
        def:  { en: "The set of points where an attacker can try to interact with a system; restricting syscalls shrinks it.",
                zh: "攻擊者可嘗試與系統互動的所有點；限制 syscall 可縮小它。" } },
      { term: { en: "microVM", zh: "microVM" },
        def:  { en: "A lightweight virtual machine with minimal device emulation, giving each workload its own kernel (e.g. Firecracker).",
                zh: "裝置模擬精簡的輕量虛擬機，讓每個工作負載擁有自己的核心（如 Firecracker）。" } },
      { term: { en: "Defense in depth", zh: "縱深防禦" },
        def:  { en: "Stacking multiple independent controls so an attacker must defeat all of them, not just one.",
                zh: "疊多道彼此獨立的防護，讓攻擊者必須全部攻破，而非只破一道。" } },
      { term: { en: "Job Manager", zh: "任務管理器 (Job Manager)" },
        def:  { en: "The orchestrator that dispatches tasks to execution nodes, monitors them, and returns results.",
                zh: "把任務派送到執行節點、監控並回傳結果的調度中樞。" } },
      { term: { en: "Control plane / Data plane", zh: "控制平面／資料平面" },
        def:  { en: "The control plane decides what runs (UI, DB, Job Manager); the data plane runs it (execution nodes). Splitting them enables scaling.",
                zh: "控制平面決定要跑什麼（UI、DB、任務管理器）；資料平面負責執行（執行節點）。拆開兩者才好擴充。" } }
    ]
  },

  /* ===================================================================== */
  /* 8 · QUIZ (custom layout, session-only)                                 */
  /* ===================================================================== */
  {
    slug: "quiz", layout: "quiz", icon: "quiz",
    title:    { en: "Quick Quiz", zh: "隨堂測驗" },
    subtitle: { en: "Six questions on the architecture. Score is session-only — refresh to reset.",
                zh: "六題架構小測。分數只活在當前 session —— 重新整理就歸零。" },
    questions: [
      {
        q: { en: "Which layer actually runs the untrusted code?", zh: "哪一層真正執行不可信的程式碼？" },
        options: [
          { en: "Frontend UI", zh: "前端 UI" },
          { en: "Database", zh: "資料庫" },
          { en: "Sandbox Executor", zh: "沙盒執行層" },
          { en: "Monitoring & Logs", zh: "監控與日誌" }
        ],
        answer: 2,
        explain: { en: "The Sandbox Executor is where code runs, wrapped in namespaces, seccomp, cgroups and a timeout.",
                   zh: "沙盒執行層是程式碼執行的地方，外面包著 namespace、seccomp、cgroup 與 timeout。" }
      },
      {
        q: { en: "What do Linux namespaces primarily control?", zh: "Linux namespace 主要控制什麼？" },
        options: [
          { en: "How much CPU/memory a process can use", zh: "行程能用多少 CPU／記憶體" },
          { en: "What a process can see and interact with", zh: "行程能看到、能互動的範圍" },
          { en: "How long a process may run", zh: "行程能跑多久" },
          { en: "Which user owns the files", zh: "檔案屬於哪個使用者" }
        ],
        answer: 1,
        explain: { en: "Namespaces govern visibility (PID, network, mount, UTS…). Resource amounts are cgroups' job.",
                   zh: "Namespace 管的是可見範圍（PID、網路、掛載、UTS…）。資源「用量」是 cgroup 的工作。" }
      },
      {
        q: { en: "Seccomp-BPF works by…", zh: "Seccomp-BPF 的運作方式是…" },
        options: [
          { en: "Encrypting all syscalls", zh: "把所有 syscall 加密" },
          { en: "Filtering syscalls before they run", zh: "在 syscall 執行前過濾它們" },
          { en: "Limiting the number of processes", zh: "限制行程數量" },
          { en: "Giving each job its own kernel", zh: "給每個任務自己的核心" }
        ],
        answer: 1,
        explain: { en: "A BPF filter inspects each syscall (number + numeric args) and allows or denies it before execution.",
                   zh: "BPF 過濾器在每個 syscall 執行前檢視它（編號＋數值參數）並決定放行或拒絕。" }
      },
      {
        q: { en: "Which cgroup controller defuses a fork bomb?", zh: "哪個 cgroup 控制器能化解 fork bomb？" },
        options: [
          { en: "cpu", zh: "cpu" },
          { en: "memory", zh: "memory" },
          { en: "io", zh: "io" },
          { en: "pids", zh: "pids" }
        ],
        answer: 3,
        explain: { en: "The pids controller caps the number of processes a cgroup can create.",
                   zh: "pids 控制器限制一個 cgroup 能建立的行程數量。" }
      },
      {
        q: { en: "Why route jobs, results and logs through a shared database?", zh: "為什麼讓任務、結果、日誌都流經共享資料庫？" },
        options: [
          { en: "To make the UI faster to style", zh: "讓 UI 比較好套樣式" },
          { en: "To decouple the layers so they scale independently", zh: "讓各層解耦、可各自獨立擴充" },
          { en: "Because the kernel requires it", zh: "因為核心強制要求" },
          { en: "To avoid using namespaces", zh: "為了不用 namespace" }
        ],
        answer: 1,
        explain: { en: "Decoupling via the database means the UI never calls a node directly and monitoring can read everything safely.",
                   zh: "透過資料庫解耦後，UI 永不直接呼叫節點，監控也能安全地讀到一切。" }
      },
      {
        q: { en: "What does the Timeout control protect against?", zh: "Timeout 控制是在防什麼？" },
        options: [
          { en: "Code that hangs or loops forever and squats on resources", zh: "卡住或無限迴圈、霸佔資源的程式碼" },
          { en: "Weak passwords", zh: "弱密碼" },
          { en: "Disk fragmentation", zh: "磁碟碎片" },
          { en: "Slow network cables", zh: "緩慢的網路線" }
        ],
        answer: 0,
        explain: { en: "A wall-clock timeout bounds total run time, complementing cgroups which bound the rate of use.",
                   zh: "牆鐘逾時限制總執行時間，與限制「使用速率」的 cgroup 互補。" }
      }
    ]
  },

  /* ===================================================================== */
  /* 9 · FLASHCARDS (custom layout)                                         */
  /* ===================================================================== */
  {
    slug: "flashcards", layout: "flashcards", icon: "style",
    title:    { en: "Flashcards", zh: "字卡 / 翻卡" },
    subtitle: { en: "Tap a card to flip it. Term on the front, meaning on the back.",
                zh: "點一下卡片翻面。正面是術語，背面是意思。" },
    cards: [
      { front: { en: "Namespace", zh: "Namespace" },
        back:  { en: "Isolates WHAT a process can see (PID / network / mount / UTS).", zh: "隔離行程「看得到什麼」（PID／網路／掛載／UTS）。" } },
      { front: { en: "Cgroup", zh: "Cgroup" },
        back:  { en: "Caps HOW MUCH a process can use (CPU / memory / I/O / PIDs).", zh: "限制行程「能用多少」（CPU／記憶體／I/O／PIDs）。" } },
      { front: { en: "Seccomp-BPF", zh: "Seccomp-BPF" },
        back:  { en: "Filters which syscalls a process may make — before they run.", zh: "過濾行程能做哪些 syscall —— 在執行前。" } },
      { front: { en: "Timeout", zh: "Timeout" },
        back:  { en: "Caps HOW LONG a job may run; kills runaways.", zh: "限制任務「能跑多久」；砍掉失控的。" } },
      { front: { en: "Sandbox Executor", zh: "沙盒執行層" },
        back:  { en: "The security core where untrusted code actually runs.", zh: "不可信程式碼真正執行的安全核心。" } },
      { front: { en: "Job Manager", zh: "任務管理器" },
        back:  { en: "Dispatches tasks to nodes, monitors them, returns results.", zh: "派送任務到節點、監控、回傳結果。" } },
      { front: { en: "Database role", zh: "資料庫的角色" },
        back:  { en: "Holds Jobs, Results and Logs — the shared source of truth.", zh: "存 Job、Results、Logs —— 共享的真實來源。" } },
      { front: { en: "OOM killer", zh: "OOM Killer" },
        back:  { en: "Kills a process when memory runs out; cgroup memory.max can trigger it.", zh: "記憶體耗盡時終止行程；cgroup memory.max 可觸發它。" } },
      { front: { en: "TOCTOU", zh: "TOCTOU" },
        back:  { en: "Check-to-use race; seccomp-BPF avoids it by not dereferencing pointers.", zh: "檢查到使用的競態；seccomp-BPF 不解指標而避開。" } },
      { front: { en: "Defense in depth", zh: "縱深防禦" },
        back:  { en: "Four independent walls — an attacker must beat all of them.", zh: "四道獨立的牆 —— 攻擊者得全部攻破。" } }
    ]
  }
];
