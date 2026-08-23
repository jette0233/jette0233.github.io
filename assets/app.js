(() => {
  "use strict";

  const plan = window.STUDY_PLAN;
  if (!plan || !Array.isArray(plan.sections)) {
    document.body.innerHTML = "<p class=\"load-error\">学习清单载入失败，请重新生成 data/study-plan.js。</p>";
    return;
  }

  const STORAGE_KEY = "ict-fullstack-review-progress-v1";
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
    openGroups: new Set()
  };

  const elements = {
    sidebar: document.getElementById("sidebar"),
    sectionNav: document.getElementById("section-nav"),
    menuButton: document.getElementById("menu-button"),
    tabs: [...document.querySelectorAll("[data-view]")],
    overviewView: document.getElementById("overview-view"),
    tasksView: document.getElementById("tasks-view"),
    searchInput: document.getElementById("search-input"),
    priorityFilter: document.getElementById("priority-filter"),
    statusFilter: document.getElementById("status-filter"),
    exportButton: document.getElementById("export-button"),
    importButton: document.getElementById("import-button"),
    importInput: document.getElementById("import-input"),
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
    toast: document.getElementById("toast")
  };

  let toastTimer;

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

  function setView(view) {
    state.activeView = view;
    elements.tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    elements.overviewView.hidden = view !== "overview";
    elements.tasksView.hidden = view !== "tasks";
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
      elements.overviewTitle.textContent = "先守住事实边界，再补齐技术链路";
      elements.overviewSummary.textContent = "从三个项目的真实贡献与数据链路开始，优先处理 P0 任务。";
    } else if (stats.percent < 35) {
      elements.overviewTitle.textContent = "项目边界正在成形，继续推进 P0";
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
      { key: "P1", label: "P1 · 首面前", note: "补齐工程理解和细节" },
      { key: "BASE", label: "基础项", note: "规则、边界与验收标准" }
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
      showToast(`已导入 ${Object.keys(cleanOverrides).length} 条进度记录`);
    } catch {
      showToast("导入失败：文件格式不正确");
    } finally {
      elements.importInput.value = "";
    }
  });

  elements.resetButton.addEventListener("click", () => elements.resetDialog.showModal());
  elements.confirmReset.addEventListener("click", () => {
    state.overrides = {};
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
    showToast("已恢复源码默认进度");
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 900 || !elements.sidebar.classList.contains("is-open")) return;
    if (elements.sidebar.contains(event.target) || elements.menuButton.contains(event.target)) return;
    elements.sidebar.classList.remove("is-open");
    elements.menuButton.setAttribute("aria-expanded", "false");
  });

  renderAll();
  setView("overview");
})();
