(() => {
  "use strict";

  const plan = window.STUDY_PLAN;
  if (!plan || !Array.isArray(plan.sections)) {
    document.body.innerHTML = "<p class=\"load-error\">学习清单载入失败，请重新生成 data/study-plan.js。</p>";
    return;
  }

  const STORAGE_KEY = "ict-fullstack-review-progress-v1";
  const SYNC_CONFIG_KEY = "ict-fullstack-review-sync-v1";
  const DEFAULT_API_BASE_URL = window.APP_CONFIG?.apiBaseUrl || "";
  const circumference = 2 * Math.PI * 54;
  const allTasks = plan.sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.tasks.map((task) => ({ ...task, sectionId: section.id, groupId: group.id }))
    )
  );
  const taskIds = new Set(allTasks.map((task) => task.id));

  const state = {
    activeView: "overview",
    sectionId: "all",
    priority: "all",
    status: "all",
    query: "",
    overrides: loadOverrides(),
    openGroups: new Set(),
    syncConfig: loadSyncConfig(),
    syncState: "local"
  };

  const elements = {
    sidebar: document.getElementById("sidebar"),
    sectionNav: document.getElementById("section-nav"),
    menuButton: document.getElementById("menu-button"),
    tabs: [...document.querySelectorAll("[data-view]")],
    overviewView: document.getElementById("overview-view"),
    tasksView: document.getElementById("tasks-view"),
    noticesView: document.getElementById("notices-view"),
    searchInput: document.getElementById("search-input"),
    priorityFilter: document.getElementById("priority-filter"),
    statusFilter: document.getElementById("status-filter"),
    exportButton: document.getElementById("export-button"),
    importButton: document.getElementById("import-button"),
    importInput: document.getElementById("import-input"),
    syncButton: document.getElementById("sync-button"),
    syncIcon: document.getElementById("sync-icon"),
    syncStatus: document.getElementById("sync-status"),
    sidebarSyncSummary: document.getElementById("sidebar-sync-summary"),
    syncDialog: document.getElementById("sync-dialog"),
    syncForm: document.getElementById("sync-form"),
    apiUrlInput: document.getElementById("api-url-input"),
    syncKeyInput: document.getElementById("sync-key-input"),
    syncDialogError: document.getElementById("sync-dialog-error"),
    disconnectSync: document.getElementById("disconnect-sync"),
    connectSync: document.getElementById("connect-sync"),
    resetButton: document.getElementById("reset-button"),
    resetDialog: document.getElementById("reset-dialog"),
    confirmReset: document.getElementById("confirm-reset"),
    ringValue: document.getElementById("ring-value"),
    overallPercent: document.getElementById("overall-percent"),
    overviewTitle: document.getElementById("overview-title"),
    overviewSummary: document.getElementById("overview-summary"),
    completedCount: document.getElementById("completed-count"),
    remainingCount: document.getElementById("remaining-count"),
    totalCount: document.getElementById("total-count"),
    sidebarProgress: document.getElementById("sidebar-progress"),
    sidebarProgressBar: document.getElementById("sidebar-progress-bar"),
    priorityLanes: document.getElementById("priority-lanes"),
    learningSequence: document.getElementById("learning-sequence"),
    categoryProgressList: document.getElementById("category-progress-list"),
    sourceUpdated: document.getElementById("source-updated"),
    taskViewTitle: document.getElementById("task-view-title"),
    resultCount: document.getElementById("result-count"),
    taskGroups: document.getElementById("task-groups"),
    emptyState: document.getElementById("empty-state"),
    noticeCount: document.getElementById("notice-count"),
    noticeList: document.getElementById("notice-list"),
    toast: document.getElementById("toast")
  };

  let toastTimer;
  let syncQueue = Promise.resolve();

  function loadOverrides() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return saved && typeof saved.overrides === "object" ? saved.overrides : {};
    } catch {
      return {};
    }
  }

  function saveOverrides() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      sourceUpdatedAt: plan.sourceUpdatedAt,
      overrides: state.overrides
    }));
  }

  function loadSyncConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY) || "{}");
      return {
        apiBaseUrl: typeof saved.apiBaseUrl === "string" ? saved.apiBaseUrl : DEFAULT_API_BASE_URL,
        token: typeof saved.token === "string" ? saved.token : ""
      };
    } catch {
      return { apiBaseUrl: DEFAULT_API_BASE_URL, token: "" };
    }
  }

  function saveSyncConfig() {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(state.syncConfig));
  }

  function normalizeApiBaseUrl(value) {
    return value.trim().replace(/\/+$/, "");
  }

  function isAllowedApiUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || (
        url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)
      );
    } catch {
      return false;
    }
  }

  function hasCloudSync() {
    return Boolean(state.syncConfig.apiBaseUrl && state.syncConfig.token);
  }

  function isComplete(task) {
    return Object.prototype.hasOwnProperty.call(state.overrides, task.id)
      ? Boolean(state.overrides[task.id])
      : Boolean(task.completed);
  }

  function getStats(tasks) {
    const total = tasks.length;
    const completed = tasks.reduce((sum, task) => sum + (isComplete(task) ? 1 : 0), 0);
    return {
      total,
      completed,
      remaining: total - completed,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function inlineMarkup(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function formatPriority(priority) {
    return priority === "BASE" ? "基础" : priority;
  }

  function renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 2400);
  }

  function setSyncState(syncState) {
    state.syncState = syncState;
    const meta = {
      local: { label: "仅本地", icon: "cloud-off", summary: "进度仅保存在当前浏览器" },
      syncing: { label: "同步中", icon: "cloud-upload", summary: "正在同步云端进度" },
      synced: { label: "已同步", icon: "cloud-check", summary: "进度已同步到服务器" },
      error: { label: "同步失败", icon: "cloud-alert", summary: "云端不可用，已保存在本地" }
    }[syncState];
    elements.syncButton.classList.toggle("is-synced", syncState === "synced");
    elements.syncButton.classList.toggle("is-error", syncState === "error");
    elements.syncButton.innerHTML = `<i data-lucide="${meta.icon}" aria-hidden="true"></i><span>${meta.label}</span>`;
    elements.syncButton.setAttribute("aria-label", `${meta.label}，打开云端同步设置`);
    elements.sidebarSyncSummary.textContent = meta.summary;
    renderIcons();
  }

  function cleanRemoteOverrides(overrides) {
    const clean = {};
    if (!overrides || typeof overrides !== "object") return clean;
    Object.entries(overrides).forEach(([id, value]) => {
      if (taskIds.has(id) && typeof value === "boolean") clean[id] = value;
    });
    return clean;
  }

  async function apiRequest(path, options = {}) {
    if (!hasCloudSync()) throw new Error("云端同步尚未配置");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${state.syncConfig.apiBaseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${state.syncConfig.token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers
        }
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error("同步密钥不正确");
        throw new Error(`服务器返回 ${response.status}`);
      }
      return response.status === 204 ? null : response.json();
    } catch (error) {
      if (error.name === "AbortError") throw new Error("连接服务器超时");
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function syncFromServer({ interactive = false } = {}) {
    if (!hasCloudSync()) {
      setSyncState("local");
      return;
    }
    setSyncState("syncing");
    try {
      const remote = await apiRequest("/v1/progress");
      const cloudOverrides = cleanRemoteOverrides(remote.overrides);
      const localOverrides = cleanRemoteOverrides(state.overrides);
      if (remote.revision === 0 && !Object.keys(cloudOverrides).length && Object.keys(localOverrides).length) {
        await apiRequest("/v1/progress", {
          method: "PUT",
          body: JSON.stringify({ overrides: localOverrides })
        });
      } else {
        state.overrides = cloudOverrides;
        saveOverrides();
        renderAll();
      }
      setSyncState("synced");
      if (interactive) showToast("云端进度已同步");
    } catch (error) {
      setSyncState("error");
      if (interactive) throw error;
    }
  }

  function queueTaskSync(taskId, completed) {
    if (!hasCloudSync()) return;
    syncQueue = syncQueue.catch(() => undefined).then(async () => {
      setSyncState("syncing");
      try {
        await apiRequest(`/v1/progress/${encodeURIComponent(taskId)}`, {
          method: "PATCH",
          body: JSON.stringify({ completed })
        });
        setSyncState("synced");
      } catch {
        setSyncState("error");
      }
    });
  }

  async function replaceCloudProgress() {
    if (!hasCloudSync()) return;
    setSyncState("syncing");
    try {
      await apiRequest("/v1/progress", {
        method: "PUT",
        body: JSON.stringify({ overrides: cleanRemoteOverrides(state.overrides) })
      });
      setSyncState("synced");
    } catch {
      setSyncState("error");
    }
  }

  function setView(view) {
    state.activeView = view;
    elements.tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    elements.overviewView.hidden = view !== "overview";
    elements.tasksView.hidden = view !== "tasks";
    elements.noticesView.hidden = view !== "notices";
  }

  function sectionTasks(section) {
    return section.groups.flatMap((group) => group.tasks);
  }

  function renderNavigation() {
    const totalStats = getStats(allTasks);
    const navRows = [
      `<button class="nav-item${state.sectionId === "all" ? " is-active" : ""}" type="button" data-section-id="all">
        <span class="nav-index"><i data-lucide="layout-dashboard" aria-hidden="true"></i></span>
        <span class="nav-label">全部章节</span>
        <span class="nav-count">${totalStats.completed}/${totalStats.total}</span>
      </button>`
    ];

    plan.sections.forEach((section, index) => {
      const stats = getStats(sectionTasks(section));
      navRows.push(
        `<button class="nav-item${state.sectionId === section.id ? " is-active" : ""}" type="button" data-section-id="${section.id}">
          <span class="nav-index">${String(index).padStart(2, "0")}</span>
          <span class="nav-label">${escapeHtml(section.title)}</span>
          <span class="nav-count">${stats.completed}/${stats.total}</span>
        </button>`
      );
    });

    elements.sectionNav.innerHTML = navRows.join("");
    elements.sidebarProgress.textContent = `${totalStats.completed} / ${totalStats.total} 已完成`;
    elements.sidebarProgressBar.style.width = `${totalStats.percent}%`;
    elements.sidebarProgressBar.parentElement.setAttribute("aria-valuenow", String(totalStats.percent));
  }

  function renderOverview() {
    const stats = getStats(allTasks);
    const offset = circumference * (1 - stats.percent / 100);
    elements.ringValue.style.strokeDasharray = String(circumference);
    elements.ringValue.style.strokeDashoffset = String(offset);
    elements.overallPercent.textContent = `${stats.percent}%`;
    elements.completedCount.textContent = String(stats.completed);
    elements.remainingCount.textContent = String(stats.remaining);
    elements.totalCount.textContent = String(stats.total);

    if (stats.percent === 0) {
      elements.overviewTitle.textContent = "先打通三条项目链路";
      elements.overviewSummary.textContent = "从架构图、数据流和代码证据开始，优先完成 P0 交付。";
    } else if (stats.percent < 35) {
      elements.overviewTitle.textContent = "项目讲法正在成形，继续推进 P0";
      elements.overviewSummary.textContent = `已完成 ${stats.completed} 项，先让三个项目都能稳定承受三层追问。`;
    } else if (stats.percent < 70) {
      elements.overviewTitle.textContent = "项目讲法已有骨架，开始串联技术原理";
      elements.overviewSummary.textContent = "把 Java、Spring、MySQL 与真实项目链路连接起来，避免孤立背题。";
    } else if (stats.percent < 90) {
      elements.overviewTitle.textContent = "进入面试压测阶段";
      elements.overviewSummary.textContent = "集中补齐未完成 P0，并用限时手写和压力面试验证掌握程度。";
    } else {
      elements.overviewTitle.textContent = "达到投递验收线";
      elements.overviewSummary.textContent = "继续维护事实边界，用真实证据和失败方案巩固项目回答。";
    }

    const sourceDate = new Date(plan.sourceUpdatedAt);
    elements.sourceUpdated.textContent = Number.isNaN(sourceDate.getTime())
      ? ""
      : `源码更新 ${sourceDate.toLocaleDateString("zh-CN")}`;

    const priorityMeta = [
      { key: "P0", label: "P0 · 投递前", note: "必须完成并能连续回答" },
      { key: "P1", label: "P1 · 首面前", note: "补齐工程理解和细节" }
    ];

    elements.priorityLanes.innerHTML = priorityMeta.map((meta) => {
      const tasks = allTasks.filter((task) => task.priority === meta.key);
      const priorityStats = getStats(tasks);
      return `<div class="priority-lane" data-priority="${meta.key}">
        <div class="priority-lane-header">
          <div class="priority-identity"><span class="priority-dot"></span><strong>${meta.label}</strong></div>
          <span>${priorityStats.completed}/${priorityStats.total}</span>
        </div>
        <div class="progress-track" role="progressbar" aria-label="${meta.label}完成度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${priorityStats.percent}">
          <span style="width:${priorityStats.percent}%"></span>
        </div>
        <p>${meta.note}</p>
      </div>`;
    }).join("");

    elements.learningSequence.innerHTML = plan.recommendedOrder.map((item, index) =>
      `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(item)}</strong></li>`
    ).join("");

    elements.categoryProgressList.innerHTML = plan.sections.map((section, index) => {
      const categoryStats = getStats(sectionTasks(section));
      return `<button class="category-progress-row" type="button" data-open-section="${section.id}">
        <span class="category-title"><span>${String(index).padStart(2, "0")}</span><strong>${escapeHtml(section.title)}</strong></span>
        <span class="progress-track" role="progressbar" aria-label="${escapeHtml(section.title)}完成度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${categoryStats.percent}">
          <span style="width:${categoryStats.percent}%"></span>
        </span>
        <span class="category-count">${categoryStats.completed}/${categoryStats.total} · ${categoryStats.percent}%</span>
        <i data-lucide="chevron-right" aria-hidden="true"></i>
      </button>`;
    }).join("");
  }

  function renderNotices() {
    const count = plan.notices.reduce((sum, group) => sum + group.items.length, 0);
    elements.noticeCount.textContent = `${count} 条`;
    elements.noticeList.innerHTML = plan.notices.map((group) => `
      <section class="notice-group" aria-labelledby="${group.id}-title">
        <h3 id="${group.id}-title">${escapeHtml(group.title)}</h3>
        <ul>${group.items.map((item) => `<li>${inlineMarkup(item)}</li>`).join("")}</ul>
      </section>`).join("");
  }

  function taskMatches(task) {
    if (state.priority !== "all" && task.priority !== state.priority) return false;
    if (state.status === "done" && !isComplete(task)) return false;
    if (state.status === "todo" && isComplete(task)) return false;
    if (state.query && !task.text.toLocaleLowerCase("zh-CN").includes(state.query)) return false;
    return true;
  }

  function captureOpenGroups() {
    document.querySelectorAll(".task-group[open]").forEach((group) => {
      state.openGroups.add(group.dataset.groupId);
    });
  }

  function renderTaskGroups() {
    const selectedSection = state.sectionId === "all"
      ? null
      : plan.sections.find((section) => section.id === state.sectionId);
    const sections = selectedSection ? [selectedSection] : plan.sections;
    const groupMarkup = [];
    let visibleCount = 0;

    sections.forEach((section) => {
      section.groups.forEach((group) => {
        const tasks = group.tasks.filter(taskMatches);
        if (!tasks.length) return;
        visibleCount += tasks.length;
        const groupStats = getStats(group.tasks);
        const shouldOpen = Boolean(state.query) || state.openGroups.has(group.id) || groupMarkup.length === 0;
        const rows = tasks.map((task) => `
          <li class="task-item">
            <label class="task-label">
              <input class="task-checkbox" type="checkbox" data-task-id="${task.id}" ${isComplete(task) ? "checked" : ""}>
              <span class="task-text">${inlineMarkup(task.text)}</span>
              <span class="priority-badge" data-priority="${task.priority}">${formatPriority(task.priority)}</span>
            </label>
          </li>`).join("");

        groupMarkup.push(`<details class="task-group" data-group-id="${group.id}" ${shouldOpen ? "open" : ""}>
          <summary>
            <span class="task-group-title">
              <strong>${escapeHtml(group.title)}</strong>
              <span>${escapeHtml(section.title)}</span>
            </span>
            <span class="task-group-count">${groupStats.completed}/${groupStats.total}</span>
            <i class="task-group-chevron" data-lucide="chevron-down" aria-hidden="true"></i>
          </summary>
          <ul class="task-list">${rows}</ul>
        </details>`);
      });
    });

    elements.taskViewTitle.textContent = selectedSection ? selectedSection.title : "全部章节";
    elements.resultCount.textContent = `${visibleCount} 项`;
    elements.taskGroups.innerHTML = groupMarkup.join("");
    elements.emptyState.hidden = visibleCount !== 0;
  }

  function renderAll() {
    renderNavigation();
    renderOverview();
    renderTaskGroups();
    renderNotices();
    renderIcons();
  }

  function openSection(sectionId) {
    state.sectionId = sectionId;
    state.openGroups.clear();
    setView("tasks");
    renderAll();
    elements.sidebar.classList.remove("is-open");
    elements.menuButton.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  elements.menuButton.addEventListener("click", () => {
    const open = elements.sidebar.classList.toggle("is-open");
    elements.menuButton.setAttribute("aria-expanded", String(open));
  });

  elements.sectionNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section-id]");
    if (button) openSection(button.dataset.sectionId);
  });

  elements.categoryProgressList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-section]");
    if (button) openSection(button.dataset.openSection);
  });

  elements.searchInput.addEventListener("input", (event) => {
    captureOpenGroups();
    state.query = event.target.value.trim().toLocaleLowerCase("zh-CN");
    if (state.query) setView("tasks");
    renderTaskGroups();
    renderIcons();
  });

  elements.priorityFilter.addEventListener("change", (event) => {
    captureOpenGroups();
    state.priority = event.target.value;
    if (state.priority !== "all") setView("tasks");
    renderTaskGroups();
    renderIcons();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    captureOpenGroups();
    state.status = event.target.value;
    if (state.status !== "all") setView("tasks");
    renderTaskGroups();
    renderIcons();
  });

  elements.taskGroups.addEventListener("toggle", (event) => {
    const group = event.target.closest(".task-group");
    if (!group) return;
    if (group.open) state.openGroups.add(group.dataset.groupId);
    else state.openGroups.delete(group.dataset.groupId);
  }, true);

  elements.taskGroups.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-task-id]");
    if (!checkbox) return;
    captureOpenGroups();
    const task = allTasks.find((item) => item.id === checkbox.dataset.taskId);
    if (!task) return;
    if (checkbox.checked === Boolean(task.completed)) delete state.overrides[task.id];
    else state.overrides[task.id] = checkbox.checked;
    saveOverrides();
    queueTaskSync(task.id, checkbox.checked);
    renderAll();
  });

  elements.exportButton.addEventListener("click", () => {
    const payload = JSON.stringify({
      version: 1,
      title: plan.title,
      sourceUpdatedAt: plan.sourceUpdatedAt,
      exportedAt: new Date().toISOString(),
      overrides: state.overrides
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ict-review-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("进度已导出");
  });

  elements.importButton.addEventListener("click", () => elements.importInput.click());

  elements.importInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported || imported.version !== 1 || typeof imported.overrides !== "object") {
        throw new Error("invalid format");
      }
      const cleanOverrides = {};
      Object.entries(imported.overrides).forEach(([id, value]) => {
        if (taskIds.has(id) && typeof value === "boolean") cleanOverrides[id] = value;
      });
      state.overrides = cleanOverrides;
      saveOverrides();
      renderAll();
      await replaceCloudProgress();
      showToast(`已导入 ${Object.keys(cleanOverrides).length} 条进度记录`);
    } catch {
      showToast("导入失败：文件格式不正确");
    } finally {
      elements.importInput.value = "";
    }
  });

  elements.resetButton.addEventListener("click", () => elements.resetDialog.showModal());
  elements.confirmReset.addEventListener("click", async () => {
    state.overrides = {};
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
    await replaceCloudProgress();
    showToast("已恢复源码默认进度");
  });

  elements.syncButton.addEventListener("click", () => {
    elements.apiUrlInput.value = state.syncConfig.apiBaseUrl || DEFAULT_API_BASE_URL;
    elements.syncKeyInput.value = state.syncConfig.token;
    elements.syncDialogError.hidden = true;
    elements.disconnectSync.hidden = !hasCloudSync();
    elements.syncDialog.showModal();
  });

  elements.syncForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const apiBaseUrl = normalizeApiBaseUrl(elements.apiUrlInput.value);
    const token = elements.syncKeyInput.value.trim();
    if (!isAllowedApiUrl(apiBaseUrl) || !token) {
      elements.syncDialogError.textContent = "请输入 HTTPS API 地址和同步密钥。";
      elements.syncDialogError.hidden = false;
      return;
    }

    elements.connectSync.disabled = true;
    state.syncConfig = { apiBaseUrl, token };
    saveSyncConfig();
    try {
      await syncFromServer({ interactive: true });
      elements.syncDialog.close();
    } catch (error) {
      elements.syncDialogError.textContent = error.message || "无法连接云端服务。";
      elements.syncDialogError.hidden = false;
    } finally {
      elements.connectSync.disabled = false;
    }
  });

  elements.disconnectSync.addEventListener("click", () => {
    state.syncConfig = { apiBaseUrl: DEFAULT_API_BASE_URL, token: "" };
    localStorage.removeItem(SYNC_CONFIG_KEY);
    setSyncState("local");
    elements.syncDialog.close();
    showToast("已断开云端，本地进度保留");
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 900 || !elements.sidebar.classList.contains("is-open")) return;
    if (elements.sidebar.contains(event.target) || elements.menuButton.contains(event.target)) return;
    elements.sidebar.classList.remove("is-open");
    elements.menuButton.setAttribute("aria-expanded", "false");
  });

  renderAll();
  setView("overview");
  setSyncState(hasCloudSync() ? "syncing" : "local");
  syncFromServer();
})();
