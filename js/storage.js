// ============================================================
// Хранилище состояния в localStorage
// ============================================================

const STORAGE_KEY = "dogtrainer_v1";

const Store = {
  state: null,

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.state = raw ? JSON.parse(raw) : this.initial();
    } catch (e) {
      this.state = this.initial();
    }
    return this.state;
  },

  initial() {
    return {
      profile: null,          // F-01: онбординг
      program: null,          // F-02: программа
      sessions: [],           // F-04: трекер занятий { id, date, commandId, quality, note }
      currentWeek: 1,         // текущая неделя программы
      completedSteps: {},     // { "commandId:stepIndex": true }
      completedCommands: {},  // { commandId: true }
      openedProblems: {},     // { problemId: timestamp }
      badges: [],             // заработанные бейджи
      createdAt: Date.now(),
    };
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  reset() {
    this.state = this.initial();
    this.save();
  },

  // ---------- Профиль и программа ----------

  setProfile(profile) {
    this.state.profile = profile;
    this.save();
  },

  setProgram(program) {
    this.state.program = program;
    this.state.currentWeek = 1;
    this.save();
  },

  // ---------- Трекер занятий (F-04) ----------

  addSession({ commandId, quality, note }) {
    const session = {
      id: "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      date: Date.now(),
      commandId: commandId || null,
      quality: quality || 3,
      note: note || "",
    };
    this.state.sessions.push(session);
    this.checkBadges();
    this.save();
    return session;
  },

  deleteSession(id) {
    this.state.sessions = this.state.sessions.filter((s) => s.id !== id);
    this.save();
  },

  toggleStep(commandId, stepIndex) {
    const key = `${commandId}:${stepIndex}`;
    if (this.state.completedSteps[key]) {
      delete this.state.completedSteps[key];
    } else {
      this.state.completedSteps[key] = true;
    }
    // Проверяем, завершена ли команда (все шаги отмечены)
    const cmd = COMMANDS.find((c) => c.id === commandId);
    if (cmd) {
      const allDone = cmd.steps.every((_, i) => this.state.completedSteps[`${commandId}:${i}`]);
      if (allDone && !this.state.completedCommands[commandId]) {
        this.state.completedCommands[commandId] = true;
      } else if (!allDone && this.state.completedCommands[commandId]) {
        delete this.state.completedCommands[commandId];
      }
    }
    this.checkBadges();
    this.save();
  },

  isStepDone(commandId, stepIndex) {
    return !!this.state.completedSteps[`${commandId}:${stepIndex}`];
  },

  isCommandDone(commandId) {
    return !!this.state.completedCommands[commandId];
  },

  setCurrentWeek(week) {
    this.state.currentWeek = Math.max(1, Math.min(8, week));
    this.save();
  },

  markProblemOpened(problemId) {
    this.state.openedProblems[problemId] = Date.now();
    this.save();
  },

  // ---------- Статистика и бейджи (F-06) ----------

  getStats() {
    const sessions = this.state.sessions;
    const totalSessions = sessions.length;
    const perfectSessions = sessions.filter((s) => s.quality === 4).length;
    const completedCommands = Object.keys(this.state.completedCommands).length;

    // Прогресс программы
    let programProgress = 0;
    if (this.state.program) {
      const totalWeeks = this.state.program.weeks.length;
      let done = 0;
      this.state.program.weeks.forEach((week, idx) => {
        if (idx + 1 < this.state.currentWeek) done += 1;
        else if (idx + 1 === this.state.currentWeek) {
          // Частичный зачёт текущей недели
          const cmds = week.commands;
          if (cmds.length > 0) {
            const doneCmds = cmds.filter((cid) => this.state.completedCommands[cid]).length;
            done += doneCmds / cmds.length;
          }
        }
      });
      programProgress = totalWeeks > 0 ? done / totalWeeks : 0;
    }

    // Серия дней (streak)
    const streak = this.calculateStreak();

    return {
      totalSessions,
      perfectSessions,
      completedCommands,
      programProgress,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      totalPoints: this.calculatePoints(),
      sessionsThisWeek: this.sessionsThisWeek(),
      avgQuality: totalSessions > 0 ? sessions.reduce((sum, s) => sum + s.quality, 0) / totalSessions : 0,
    };
  },

  calculatePoints() {
    // Баллы: 10 за занятие + бонус за качество (quality * 2) + 50 за завершённую команду + streak * 5
    const sessions = this.state.sessions;
    const base = sessions.reduce((sum, s) => sum + 10 + s.quality * 2, 0);
    const commandsBonus = Object.keys(this.state.completedCommands).length * 50;
    const streakBonus = this.calculateStreak().current * 5;
    return base + commandsBonus + streakBonus;
  },

  calculateStreak() {
    const sessions = this.state.sessions;
    if (sessions.length === 0) return { current: 0, longest: 0 };

    const days = new Set();
    sessions.forEach((s) => {
      const d = new Date(s.date);
      days.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    });

    const sortedDays = Array.from(days).sort();
    let longest = 1;
    let current = 1;
    let temp = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        temp += 1;
        longest = Math.max(longest, temp);
      } else {
        temp = 1;
      }
    }

    // Текущая серия — считаем от сегодня/вчера назад
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (days.has(todayStr) || days.has(yesterdayStr)) {
      let count = 0;
      let checkDate = days.has(todayStr) ? new Date(today) : new Date(yesterday);
      while (true) {
        const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
        if (days.has(checkStr)) {
          count += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      current = count;
    } else {
      current = 0;
    }

    return { current, longest };
  },

  sessionsThisWeek() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // понедельник
    weekStart.setHours(0, 0, 0, 0);
    return this.state.sessions.filter((s) => s.date >= weekStart.getTime()).length;
  },

  checkBadges() {
    const stats = this.getStats();
    BADGES.forEach((badge) => {
      if (!this.state.badges.includes(badge.id) && badge.check(stats)) {
        this.state.badges.push(badge.id);
        // Уведомление о новом бейдже
        if (typeof UI !== "undefined" && UI.showBadgeNotification) {
          setTimeout(() => UI.showBadgeNotification(badge), 300);
        }
      }
    });
  },

  hasBadge(badgeId) {
    return this.state.badges.includes(badgeId);
  },

  // Аналитика (F-07, события по разделу 7 PRD) — простая in-app лента
  trackEvent(name, payload) {
    if (!this.state.analytics) this.state.analytics = [];
    this.state.analytics.push({ name, payload, at: Date.now() });
    // Ограничим хранение
    if (this.state.analytics.length > 500) this.state.analytics = this.state.analytics.slice(-500);
    this.save();
  },
};
