// ============================================================
// UI helpers: навигация, модалки, уведомления
// ============================================================

const UI = {
  // Навигация между экранами
  showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Обновляем нижнюю навигацию
    document.querySelectorAll(".nav-item").forEach((n) => {
      n.classList.toggle("active", n.dataset.screen === screenId);
    });
    // Скрываем/показываем bottom nav
    const bottomNav = document.getElementById("bottom-nav");
    if (bottomNav) {
      const hideOn = ["screen-onboarding", "screen-program-generating"];
      bottomNav.style.display = hideOn.includes(screenId) ? "none" : "flex";
    }
  },

  // Модалка
  openModal(content) {
    const modal = document.getElementById("modal");
    const body = document.getElementById("modal-body");
    body.innerHTML = content;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  closeModal() {
    const modal = document.getElementById("modal");
    modal.classList.remove("open");
    document.body.style.overflow = "";
  },

  // Тост
  toast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Уведомление о бейдже (F-06)
  showBadgeNotification(badge) {
    const content = `
      <div class="badge-unlock">
        <div class="badge-unlock-icon">${badge.icon}</div>
        <h3>Новый бейдж!</h3>
        <p class="badge-name">${badge.name}</p>
        <p class="badge-desc">${badge.description}</p>
        <button class="btn btn-primary" onclick="UI.closeModal()">Отлично!</button>
      </div>
    `;
    this.openModal(content);
  },

  // Форматирование даты
  formatDate(timestamp) {
    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === yesterday.toDateString()) return "Вчера";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  },

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  },

  qualityLabel(q) {
    return ["", "Слабо", "Средне", "Хорошо", "Отлично"][q] || "—";
  },

  qualityStars(q) {
    return "★".repeat(q) + "☆".repeat(4 - q);
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  },
};

// Закрытие модалки по клику на подложку
document.addEventListener("click", (e) => {
  if (e.target.id === "modal") UI.closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") UI.closeModal();
});
