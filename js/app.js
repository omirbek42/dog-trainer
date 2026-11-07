// ============================================================
// Главная логика приложения
// ============================================================

const App = {
  // ---------- Инициализация ----------
  init() {
    Store.load();
    this.renderBottomNav();

    if (!Store.state.profile) {
      this.renderOnboarding();
      UI.showScreen("screen-onboarding");
    } else {
      this.renderAll();
      UI.showScreen("screen-home");
    }

    // Проверяем напоминание (F-07, упрощённо): если сегодня ещё не было занятий и прошло 6+ часов с последнего
    this.checkReminder();
  },

  renderAll() {
    this.renderHome();
    this.renderProgram();
    this.renderLibrary();
    this.renderProblems();
    this.renderProgress();
  },

  // ---------- Онбординг (F-01) ----------
  renderOnboarding() {
    const root = document.getElementById("screen-onboarding");
    root.innerHTML = `
      <div class="onboarding">
        <div class="onboarding-hero">
          <div class="logo">🐕</div>
          <h1>Dog Trainer</h1>
          <p class="tagline">Персональный кинолог в кармане</p>
        </div>
        <form id="onboarding-form" class="onboarding-form">
          <div class="form-step active" data-step="1">
            <h2>Как зовут собаку?</h2>
            <input type="text" name="name" placeholder="Например, Рекс" required maxlength="30" />
            <button type="button" class="btn btn-primary btn-next">Дальше</button>
          </div>
          <div class="form-step" data-step="2">
            <h2>Порода или тип</h2>
            <input type="text" name="breed" placeholder="Кане корсо, овчарка, микс…" required maxlength="50" />
            <div class="chips">
              ${["Кане корсо", "Овчарка", "Лабрадор", "Спаниель", "Хаски", "Микс", "Другая"].map((b) => `<button type="button" class="chip" data-fill="breed" data-value="${b}">${b}</button>`).join("")}
            </div>
            <button type="button" class="btn btn-primary btn-next">Дальше</button>
          </div>
          <div class="form-step" data-step="3">
            <h2>Возраст</h2>
            <div class="option-cards">
              <label class="option-card">
                <input type="radio" name="ageGroup" value="puppy" required />
                <div class="option-content">
                  <div class="option-title">Щенок</div>
                  <div class="option-desc">до 6 месяцев</div>
                </div>
              </label>
              <label class="option-card">
                <input type="radio" name="ageGroup" value="junior" />
                <div class="option-content">
                  <div class="option-title">Юниор</div>
                  <div class="option-desc">6–18 месяцев</div>
                </div>
              </label>
              <label class="option-card">
                <input type="radio" name="ageGroup" value="adult" />
                <div class="option-content">
                  <div class="option-title">Взрослая</div>
                  <div class="option-desc">старше 1,5 лет</div>
                </div>
              </label>
            </div>
            <button type="button" class="btn btn-primary btn-next">Дальше</button>
          </div>
          <div class="form-step" data-step="4">
            <h2>Уровень подготовки</h2>
            <div class="option-cards">
              <label class="option-card">
                <input type="radio" name="level" value="beginner" required />
                <div class="option-content">
                  <div class="option-title">С нуля</div>
                  <div class="option-desc">ничего ещё не умеем</div>
                </div>
              </label>
              <label class="option-card">
                <input type="radio" name="level" value="basic" />
                <div class="option-content">
                  <div class="option-title">База</div>
                  <div class="option-desc">знает «Сидеть», «Ко мне»</div>
                </div>
              </label>
              <label class="option-card">
                <input type="radio" name="level" value="advanced" />
                <div class="option-content">
                  <div class="option-title">Опытный</div>
                  <div class="option-desc">хочу спорт/охрану/трюки</div>
                </div>
              </label>
            </div>
            <button type="button" class="btn btn-primary btn-next">Дальше</button>
          </div>
          <div class="form-step" data-step="5">
            <h2>Цели (можно несколько)</h2>
            <div class="option-cards multi">
              ${[
                { value: "obedience", title: "Послушание", desc: "слушается дома и на улице" },
                { value: "guard", title: "Охранное направление", desc: "«Голос»/«Тихо», управляемая охрана" },
                { value: "sport", title: "Спорт и трюки", desc: "аджилити, нюхательная работа" },
                { value: "correction", title: "Решение проблем", desc: "лай, поводок, страхи" },
              ].map((g) => `
                <label class="option-card">
                  <input type="checkbox" name="goals" value="${g.value}" />
                  <div class="option-content">
                    <div class="option-title">${g.title}</div>
                    <div class="option-desc">${g.desc}</div>
                  </div>
                </label>
              `).join("")}
            </div>
            <button type="button" class="btn btn-primary btn-next">Дальше</button>
          </div>
          <div class="form-step" data-step="6">
            <h2>Что мотивирует собаку сильнее?</h2>
            <div class="option-cards">
              <label class="option-card">
                <input type="radio" name="motivation" value="food" required />
                <div class="option-content">
                  <div class="option-title">🍖 Еда</div>
                  <div class="option-desc">за лакомство на всё согласна</div>
                </div>
              </label>
              <label class="option-card">
                <input type="radio" name="motivation" value="toy" />
                <div class="option-content">
                  <div class="option-title">🎾 Игра</div>
                  <div class="option-desc">мяч/перетяжка важнее еды</div>
                </div>
              </label>
              <label class="option-card">
                <input type="radio" name="motivation" value="both" />
                <div class="option-content">
                  <div class="option-title">🌟 И то, и другое</div>
                  <div class="option-desc">универсальная мотивация</div>
                </div>
              </label>
            </div>
            <button type="submit" class="btn btn-primary btn-lg">Создать программу ✨</button>
          </div>
          <div class="form-progress">
            <div class="form-progress-bar"><div class="form-progress-fill" id="form-progress-fill"></div></div>
            <div class="form-progress-text" id="form-progress-text">Шаг 1 из 6</div>
          </div>
        </form>
      </div>
    `;

    // Логика шагов
    const form = document.getElementById("onboarding-form");
    const steps = form.querySelectorAll(".form-step");
    let currentStep = 0;

    const showStep = (idx) => {
      steps.forEach((s, i) => s.classList.toggle("active", i === idx));
      document.getElementById("form-progress-fill").style.width = `${((idx + 1) / steps.length) * 100}%`;
      document.getElementById("form-progress-text").textContent = `Шаг ${idx + 1} из ${steps.length}`;
    };

    form.addEventListener("click", (e) => {
      if (e.target.classList.contains("chip")) {
        const input = form.querySelector(`input[name="${e.target.dataset.fill}"]`);
        if (input) {
          input.value = e.target.dataset.value;
          input.dispatchEvent(new Event("input"));
        }
      }
      if (e.target.classList.contains("btn-next")) {
        const currentInputs = steps[currentStep].querySelectorAll("input[required]");
        let valid = true;
        currentInputs.forEach((inp) => {
          if (inp.type === "radio") {
            const group = form.querySelectorAll(`input[name="${inp.name}"]`);
            const checked = Array.from(group).some((g) => g.checked);
            if (!checked) valid = false;
          } else if (!inp.value.trim()) {
            valid = false;
          }
        });
        if (!valid) {
          UI.toast("Заполните поле, чтобы продолжить", "warn");
          return;
        }
        if (currentStep < steps.length - 1) {
          currentStep += 1;
          showStep(currentStep);
        }
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const profile = {
        name: fd.get("name").trim(),
        breed: fd.get("breed").trim(),
        ageGroup: fd.get("ageGroup"),
        level: fd.get("level"),
        goals: fd.getAll("goals"),
        motivation: fd.get("motivation"),
        createdAt: Date.now(),
      };
      Store.setProfile(profile);
      const program = generateProgram(profile);
      Store.setProgram(program);
      Store.trackEvent("onboarding_completed", { ageGroup: profile.ageGroup, level: profile.level, goals: profile.goals });
      this.renderAll();
      UI.showScreen("screen-home");
      UI.toast(`Программа для ${profile.name} готова! 🎉`, "success");
    });

    showStep(0);
  },

  // ---------- Bottom Navigation ----------
  renderBottomNav() {
    const nav = document.getElementById("bottom-nav");
    nav.innerHTML = `
      <button class="nav-item" data-screen="screen-home"><span class="nav-icon">🏠</span><span>Главная</span></button>
      <button class="nav-item" data-screen="screen-program"><span class="nav-icon">📋</span><span>Программа</span></button>
      <button class="nav-item" data-screen="screen-library"><span class="nav-icon">📚</span><span>Команды</span></button>
      <button class="nav-item" data-screen="screen-problems"><span class="nav-icon">🛠</span><span>Проблемы</span></button>
      <button class="nav-item" data-screen="screen-progress"><span class="nav-icon">📈</span><span>Прогресс</span></button>
    `;
    nav.addEventListener("click", (e) => {
      const item = e.target.closest(".nav-item");
      if (item) UI.showScreen(item.dataset.screen);
    });
  },

  // ---------- Главный экран ----------
  renderHome() {
    const root = document.getElementById("screen-home");
    const profile = Store.state.profile;
    const stats = Store.getStats();
    const program = Store.state.program;

    if (!profile || !program) {
      root.innerHTML = `<div class="empty-state"><p>Профиль не найден</p><button class="btn btn-primary" onclick="App.resetAll()">Начать заново</button></div>`;
      return;
    }

    const currentWeek = Store.state.currentWeek;
    const weekData = program.weeks[currentWeek - 1];
    const todaySessions = Store.state.sessions.filter((s) => {
      const d = new Date(s.date);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;

    const greeting = new Date().getHours() < 12 ? "Доброе утро" : new Date().getHours() < 18 ? "Добрый день" : "Добрый вечер";

    root.innerHTML = `
      <div class="screen-content">
        <header class="home-header">
          <div>
            <div class="greeting">${greeting}!</div>
            <h1 class="dog-name">${UI.escapeHtml(profile.name)}</h1>
            <div class="dog-meta">${UI.escapeHtml(profile.breed)} • ${profile.ageGroup === "puppy" ? "щенок" : profile.ageGroup === "junior" ? "юниор" : "взрослая"}</div>
          </div>
          <div class="header-stats">
            <div class="streak-badge" title="Серия дней">🔥 ${stats.currentStreak}</div>
            <div class="points-badge" title="Баллы">⭐ ${stats.totalPoints}</div>
          </div>
        </header>

        <div class="progress-card">
          <div class="progress-header">
            <span>Неделя ${currentWeek} из ${program.weeks.length}</span>
            <span class="progress-percent">${Math.round(stats.programProgress * 100)}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${stats.programProgress * 100}%"></div></div>
          <div class="progress-focus">${UI.escapeHtml(weekData.focus)}</div>
        </div>

        <section class="section">
          <h2 class="section-title">Задания на эту неделю</h2>
          <div class="week-tasks">
            ${weekData.commands.length === 0 ? `
              <div class="empty-week">
                <p>Итоговая неделя! Повторите все команды и отметьте занятия.</p>
                <button class="btn btn-primary" onclick="App.openLogSession()">Отметить занятие</button>
              </div>
            ` : weekData.commands.map((cmdId) => {
              const cmd = COMMANDS.find((c) => c.id === cmdId);
              if (!cmd) return "";
              const isDone = Store.isCommandDone(cmdId);
              const doneSteps = cmd.steps.filter((_, i) => Store.isStepDone(cmdId, i)).length;
              return `
                <div class="task-card ${isDone ? "done" : ""}" onclick="App.openCommand('${cmdId}')">
                  <div class="task-icon">${isDone ? "✅" : "🎯"}</div>
                  <div class="task-info">
                    <div class="task-name">${cmd.name}</div>
                    <div class="task-progress">${doneSteps}/${cmd.steps.length} шагов</div>
                  </div>
                  <div class="task-arrow">›</div>
                </div>
              `;
            }).join("")}
          </div>
          ${weekData.note ? `<div class="week-note">💡 ${UI.escapeHtml(weekData.note)}</div>` : ""}
        </section>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Быстрые действия</h2>
          </div>
          <div class="quick-actions">
            <button class="quick-action" onclick="App.openLogSession()">
              <span class="quick-icon">✏️</span>
              <span>Отметить занятие</span>
            </button>
            <button class="quick-action" onclick="UI.showScreen('screen-library')">
              <span class="quick-icon">📚</span>
              <span>Библиотека</span>
            </button>
            <button class="quick-action" onclick="UI.showScreen('screen-problems')">
              <span class="quick-icon">🛠</span>
              <span>Проблема</span>
            </button>
            <button class="quick-action" onclick="App.nextWeek()" ${currentWeek >= 8 ? "disabled" : ""}>
              <span class="quick-icon">⏭</span>
              <span>След. неделя</span>
            </button>
          </div>
        </section>

        ${todaySessions > 0 ? `
          <section class="section">
            <h2 class="section-title">Сегодня</h2>
            <div class="today-summary">
              <div class="today-count">${todaySessions}</div>
              <div class="today-text">${this.plural(todaySessions, "занятие", "занятия", "занятий")} отмечено. Отличная работа!</div>
            </div>
          </section>
        ` : ""}

        <section class="section danger-zone">
          <button class="btn btn-text" onclick="App.resetAll()">Сбросить профиль и начать заново</button>
        </section>
      </div>
    `;
  },

  // ---------- Программа (F-02) ----------
  renderProgram() {
    const root = document.getElementById("screen-program");
    const program = Store.state.program;
    if (!program) {
      root.innerHTML = `<div class="empty-state"><p>Программа ещё не создана</p></div>`;
      return;
    }

    root.innerHTML = `
      <div class="screen-content">
        <header class="page-header">
          <h1>Программа 8 недель</h1>
          <p class="page-subtitle">Персональный план для ${UI.escapeHtml(Store.state.profile.name)}</p>
        </header>
        <div class="weeks-timeline">
          ${program.weeks.map((week, idx) => {
            const weekNum = idx + 1;
            const isCurrent = weekNum === Store.state.currentWeek;
            const isPast = weekNum < Store.state.currentWeek;
            const doneCmds = week.commands.filter((cid) => Store.isCommandDone(cid)).length;
            const totalCmds = week.commands.length;
            return `
              <div class="week-card ${isCurrent ? "current" : ""} ${isPast ? "past" : ""}">
                <div class="week-header" onclick="App.toggleWeekDetails(${weekNum})">
                  <div class="week-num">
                    <div class="week-num-circle">${isPast ? "✓" : weekNum}</div>
                    <div>
                      <div class="week-title">Неделя ${weekNum}</div>
                      <div class="week-focus">${UI.escapeHtml(week.focus)}</div>
                    </div>
                  </div>
                  <div class="week-meta">
                    ${totalCmds > 0 ? `<span class="week-progress">${doneCmds}/${totalCmds}</span>` : ""}
                    ${isCurrent ? `<span class="badge-current">Текущая</span>` : ""}
                  </div>
                </div>
                <div class="week-details" id="week-details-${weekNum}" style="display: ${isCurrent ? "block" : "none"}">
                  ${week.note ? `<p class="week-note-text">${UI.escapeHtml(week.note)}</p>` : ""}
                  ${week.commands.length === 0 ? `<p class="text-muted">Неделя интеграции — повторите всё, что выучили.</p>` : `
                    <div class="week-commands">
                      ${week.commands.map((cid) => {
                        const cmd = COMMANDS.find((c) => c.id === cid);
                        if (!cmd) return "";
                        const isDone = Store.isCommandDone(cid);
                        return `
                          <div class="command-chip ${isDone ? "done" : ""}" onclick="App.openCommand('${cid}')">
                            ${isDone ? "✓" : "○"} ${cmd.name}
                          </div>
                        `;
                      }).join("")}
                    </div>
                  `}
                  ${isCurrent && weekNum < program.weeks.length ? `
                    <button class="btn btn-secondary btn-sm" onclick="App.nextWeek()">Завершить неделю →</button>
                  ` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  },

  toggleWeekDetails(weekNum) {
    const el = document.getElementById(`week-details-${weekNum}`);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
  },

  nextWeek() {
    const current = Store.state.currentWeek;
    if (current < 8) {
      Store.setCurrentWeek(current + 1);
      Store.trackEvent("week_completed", { week: current });
      this.renderAll();
      UI.toast(`Неделя ${current} завершена! Начинаем неделю ${current + 1} 💪`, "success");
    }
  },

  // ---------- Библиотека команд (F-03) ----------
  renderLibrary() {
    const root = document.getElementById("screen-library");
    root.innerHTML = `
      <div class="screen-content">
        <header class="page-header">
          <h1>Библиотека команд</h1>
          <p class="page-subtitle">${COMMANDS.length} команд с пошаговыми уроками</p>
        </header>
        <div class="category-filter" id="category-filter">
          <button class="filter-chip active" data-cat="all">Все</button>
          ${CATEGORIES.map((c) => `<button class="filter-chip" data-cat="${c.id}">${c.name}</button>`).join("")}
        </div>
        <div class="commands-list" id="commands-list"></div>
      </div>
    `;

    const renderList = (filter) => {
      const list = document.getElementById("commands-list");
      const filtered = filter === "all" ? COMMANDS : COMMANDS.filter((c) => c.category === filter);
      list.innerHTML = filtered.map((cmd) => {
        const isDone = Store.isCommandDone(cmd.id);
        const doneSteps = cmd.steps.filter((_, i) => Store.isStepDone(cmd.id, i)).length;
        return `
          <div class="command-card ${isDone ? "done" : ""}" onclick="App.openCommand('${cmd.id}')">
            <div class="command-main">
              <div class="command-name">${cmd.name}</div>
              <div class="command-meta">
                <span class="command-category">${cmd.categoryLabel}</span>
                <span class="command-duration">~${cmd.duration}</span>
              </div>
            </div>
            <div class="command-progress">
              ${isDone ? `<span class="done-badge">✓</span>` : `<span class="steps-count">${doneSteps}/${cmd.steps.length}</span>`}
            </div>
          </div>
        `;
      }).join("");
    };

    document.getElementById("category-filter").addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderList(chip.dataset.cat);
    });

    renderList("all");
  },

  // ---------- Карточка команды ----------
  openCommand(commandId) {
    const cmd = COMMANDS.find((c) => c.id === commandId);
    if (!cmd) return;

    Store.trackEvent("lesson_opened", { commandId });

    const isDone = Store.isCommandDone(commandId);
    const stepsHtml = cmd.steps.map((step, idx) => {
      const stepDone = Store.isStepDone(commandId, idx);
      return `
        <div class="step-card ${stepDone ? "done" : ""}">
          <div class="step-checkbox" onclick="App.toggleStep('${commandId}', ${idx})">
            ${stepDone ? "✓" : idx + 1}
          </div>
          <div class="step-body">
            <div class="step-title">${UI.escapeHtml(step.title)}</div>
            <div class="step-text">${UI.escapeHtml(step.text)}</div>
          </div>
        </div>
      `;
    }).join("");

    const content = `
      <div class="command-detail">
        <div class="command-detail-header">
          <div class="command-category-badge">${cmd.categoryLabel}</div>
          <h2>${cmd.name}</h2>
          <p class="command-goal">${UI.escapeHtml(cmd.goal)}</p>
        </div>
        <div class="command-criteria">
          <div class="criteria-block">
            <div class="criteria-label">✅ Критерий перехода</div>
            <div class="criteria-text">${UI.escapeHtml(cmd.criteria)}</div>
          </div>
          <div class="criteria-block warning">
            <div class="criteria-label">⚠️ Типичная ошибка</div>
            <div class="criteria-text">${UI.escapeHtml(cmd.commonMistake)}</div>
          </div>
        </div>
        <div class="command-steps">
          <h3>Пошаговый план</h3>
          ${stepsHtml}
        </div>
        ${isDone ? `<div class="command-done-banner">🎉 Команда доведена до критерия!</div>` : ""}
        <div class="command-actions">
          <button class="btn btn-primary" onclick="App.openLogSession('${commandId}')">Отметить занятие</button>
        </div>
      </div>
    `;

    UI.openModal(content);
  },

  toggleStep(commandId, stepIndex) {
    Store.toggleStep(commandId, stepIndex);
    this.renderAll();
    this.openCommand(commandId); // Перерисовать модалку
  },

  // ---------- Модуль проблем (F-05) ----------
  renderProblems() {
    const root = document.getElementById("screen-problems");
    root.innerHTML = `
      <div class="screen-content">
        <header class="page-header">
          <h1>Решение проблем</h1>
          <p class="page-subtitle">Пошаговые планы на 4–8 недель по типичным проблемам поведения</p>
        </header>
        <div class="disclaimer">
          <strong>Важно:</strong> при агрессии к людям, укусах, панических страхах и резкой смене поведения — обратитесь к очному кинологу или зоопсихологу. Приложение не заменяет специалиста.
        </div>
        <div class="problems-list">
          ${PROBLEMS.map((p) => {
            const opened = Store.state.openedProblems[p.id];
            return `
              <div class="problem-card" onclick="App.openProblem('${p.id}')">
                <div class="problem-icon">${p.icon}</div>
                <div class="problem-info">
                  <div class="problem-title">${p.title}</div>
                  <div class="problem-meta">
                    <span>${p.duration}</span>
                    ${opened ? `<span class="opened-badge">Открыто</span>` : ""}
                  </div>
                  <div class="problem-desc">${UI.escapeHtml(p.description)}</div>
                </div>
                <div class="task-arrow">›</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  },

  openProblem(problemId) {
    const problem = PROBLEMS.find((p) => p.id === problemId);
    if (!problem) return;

    Store.markProblemOpened(problemId);
    Store.trackEvent("problem_module_opened", { problemId });

    const planHtml = problem.plan.map((week, idx) => `
      <div class="problem-week">
        <div class="problem-week-header">
          <div class="problem-week-num">${idx + 1}</div>
          <div>
            <div class="problem-week-title">${UI.escapeHtml(week.week)}</div>
            <div class="problem-week-goal">${UI.escapeHtml(week.goal)}</div>
          </div>
        </div>
        <ul class="problem-steps">
          ${week.steps.map((s) => `<li>${UI.escapeHtml(s)}</li>`).join("")}
        </ul>
      </div>
    `).join("");

    const redFlagsHtml = problem.redFlags.length > 0 ? `
      <div class="red-flags">
        <div class="red-flags-title">🚩 Красные флаги — сразу к специалисту:</div>
        <ul>
          ${problem.redFlags.map((f) => `<li>${UI.escapeHtml(f)}</li>`).join("")}
        </ul>
      </div>
    ` : "";

    const content = `
      <div class="problem-detail">
        <div class="problem-detail-header">
          <div class="problem-detail-icon">${problem.icon}</div>
          <h2>${problem.title}</h2>
          <p class="problem-duration">План на ${problem.duration}</p>
        </div>
        <div class="problem-why">
          <h3>Почему собака так себя ведёт</h3>
          <p>${UI.escapeHtml(problem.why)}</p>
        </div>
        ${redFlagsHtml}
        <div class="problem-plan">
          <h3>План работы</h3>
          ${planHtml}
        </div>
        <div class="problem-donts">
          <h3>Чего делать НЕ надо</h3>
          <ul>
            ${problem.donts.map((d) => `<li>${UI.escapeHtml(d)}</li>`).join("")}
          </ul>
        </div>
        <div class="command-actions">
          <button class="btn btn-primary" onclick="App.openLogSession()">Отметить занятие</button>
        </div>
      </div>
    `;

    UI.openModal(content);
    this.renderProblems(); // обновить отметку "Открыто"
  },

  // ---------- Трекер занятий (F-04) ----------
  openLogSession(prefilledCommandId) {
    const commandsOptions = COMMANDS.map((c) => `<option value="${c.id}" ${c.id === prefilledCommandId ? "selected" : ""}>${c.name}</option>`).join("");
    const content = `
      <div class="log-session">
        <h2>Отметить занятие</h2>
        <form id="log-session-form">
          <div class="form-group">
            <label>Команда (необязательно)</label>
            <select name="commandId">
              <option value="">Общее занятие</option>
              ${commandsOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Качество выполнения</label>
            <div class="quality-picker">
              ${[1, 2, 3, 4].map((q) => `
                <label class="quality-option">
                  <input type="radio" name="quality" value="${q}" ${q === 3 ? "checked" : ""} />
                  <div class="quality-face">${["", "😞", "😐", "🙂", "🤩"][q]}</div>
                  <div class="quality-label">${UI.qualityLabel(q)}</div>
                </label>
              `).join("")}
            </div>
          </div>
          <div class="form-group">
            <label>Заметка (необязательно)</label>
            <textarea name="note" rows="3" placeholder="Что получилось, над чем работать дальше…" maxlength="500"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg">Сохранить</button>
        </form>
      </div>
    `;

    UI.openModal(content);

    document.getElementById("log-session-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const session = Store.addSession({
        commandId: fd.get("commandId") || null,
        quality: parseInt(fd.get("quality"), 10),
        note: fd.get("note").trim(),
      });
      Store.trackEvent("session_logged", { commandId: session.commandId, quality: session.quality });
      UI.closeModal();
      this.renderAll();
      UI.toast("Занятие отмечено! +10 баллов 🔥", "success");
    });
  },

  // ---------- Прогресс (F-06) ----------
  renderProgress() {
    const root = document.getElementById("screen-progress");
    const stats = Store.getStats();
    const sessions = [...Store.state.sessions].sort((a, b) => b.date - a.date);

    root.innerHTML = `
      <div class="screen-content">
        <header class="page-header">
          <h1>Прогресс</h1>
          <p class="page-subtitle">Ваша история занятий и достижения</p>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalPoints}</div>
            <div class="stat-label">Баллов</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">🔥 ${stats.currentStreak}</div>
            <div class="stat-label">Дней подряд</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalSessions}</div>
            <div class="stat-label">Занятий</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.completedCommands}</div>
            <div class="stat-label">Команд освоено</div>
          </div>
        </div>

        <section class="section">
          <h2 class="section-title">Бейджи</h2>
          <div class="badges-grid">
            ${BADGES.map((badge) => {
              const earned = Store.hasBadge(badge.id);
              return `
                <div class="badge-card ${earned ? "earned" : "locked"}" title="${UI.escapeHtml(badge.description)}">
                  <div class="badge-icon">${badge.icon}</div>
                  <div class="badge-name">${badge.name}</div>
                </div>
              `;
            }).join("")}
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">История занятий</h2>
          ${sessions.length === 0 ? `
            <div class="empty-state">
              <p>Пока нет отмеченных занятий.</p>
              <button class="btn btn-primary" onclick="App.openLogSession()">Отметить первое занятие</button>
            </div>
          ` : `
            <div class="sessions-list">
              ${sessions.slice(0, 50).map((s) => {
                const cmd = s.commandId ? COMMANDS.find((c) => c.id === s.commandId) : null;
                return `
                  <div class="session-card">
                    <div class="session-date">
                      <div class="session-day">${UI.formatDate(s.date)}</div>
                      <div class="session-time">${UI.formatTime(s.date)}</div>
                    </div>
                    <div class="session-info">
                      <div class="session-command">${cmd ? UI.escapeHtml(cmd.name) : "Общее занятие"}</div>
                      <div class="session-quality">${UI.qualityStars(s.quality)} ${UI.qualityLabel(s.quality)}</div>
                      ${s.note ? `<div class="session-note">${UI.escapeHtml(s.note)}</div>` : ""}
                    </div>
                    <button class="session-delete" onclick="App.deleteSession('${s.id}')" title="Удалить">×</button>
                  </div>
                `;
              }).join("")}
            </div>
          `}
        </section>
      </div>
    `;
  },

  deleteSession(id) {
    if (confirm("Удалить запись о занятии?")) {
      Store.deleteSession(id);
      this.renderAll();
    }
  },

  // ---------- Напоминания (F-07, упрощённо) ----------
  checkReminder() {
    if (!Store.state.profile) return;
    const sessions = Store.state.sessions;
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    if (sessions.length === 0) {
      // Пользователь только установил, напомним о первом занятии через тост
      setTimeout(() => UI.toast("Не забудьте отметить первое занятие сегодня! 🐾", "info"), 5000);
      return;
    }

    const lastSession = Math.max(...sessions.map((s) => s.date));
    if (now - lastSession > 24 * 60 * 60 * 1000) {
      setTimeout(() => UI.toast("Давно не было занятий — самое время потренироваться! 💪", "warn"), 2000);
    } else if (now - lastSession > sixHours) {
      setTimeout(() => UI.toast("Не забудьте вечернее занятие! 🌙", "info"), 2000);
    }
  },

  // ---------- Сброс ----------
  resetAll() {
    if (confirm("Точно сбросить профиль и весь прогресс? Это действие нельзя отменить.")) {
      Store.reset();
      location.reload();
    }
  },

  // ---------- Утилиты ----------
  plural(n, one, few, many) {
    const n10 = n % 10;
    const n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
    return many;
  },
};

// Запуск
document.addEventListener("DOMContentLoaded", () => App.init());
