// script.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== Header Scroll Styles (hysteresis + sticky-safe) =====
  const siteHeader = document.querySelector("header");
  const trackedSections = [
    ...document.querySelectorAll(
      ".hero, .mission, .portfolio, .prices, .about, .order, .faq, .blog"
    ),
  ];

  let ticking = false;
  let lastHeaderClass = "default";

  const classForSection = (sec) => {
    if (
      sec.classList.contains("prices") ||
      sec.classList.contains("about") ||
      sec.classList.contains("order")
    )
      return "prices"; // тёмная тема
    return "hero"; // всё остальное — светлая
  };

  function updateHeader() {
    if (!siteHeader) return;
    const headerHeight = window.innerWidth < 768 ? 66 : 97;
    const y = headerHeight + 1; // 1px гистерезис против скачка на касании
    let nextClass = null;

    for (const sec of trackedSections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= y && rect.bottom > y) {
        nextClass = classForSection(sec);
        break;
      }
    }

    const targetClass = nextClass ?? "hero";
    if (targetClass !== lastHeaderClass) {
      siteHeader.classList.remove(
        "header--hero",
        "header--prices",
        "header--default"
      );
      siteHeader.classList.add(`header--${targetClass}`);
      lastHeaderClass = targetClass;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateHeader);
  updateHeader();

  // ===== Portfolio "Load More" =====
  const loadMoreBtn = document.querySelector(".portfolio__load-more");
  const portfolioGrid = document.querySelector(".portfolio__grid");
  if (loadMoreBtn && portfolioGrid) {
    loadMoreBtn.addEventListener("click", () => {
      const hiddenItems = portfolioGrid.querySelectorAll(
        '.portfolio__item[style*="display: none"]'
      );
      hiddenItems.forEach((item) => {
        item.style.display = "block";
        item.style.opacity = 0;
        item.style.transition = "opacity 0.5s ease";
        requestAnimationFrame(() => (item.style.opacity = 1));
      });
      loadMoreBtn.style.display = "none";
    });
  }

  // ===== About "Learn More" (image first-in / last-out) =====
  (() => {
    const wrap = document.querySelector(".about__more-wrap");
    const moreBtn = document.querySelector(".about__text-wrap .about__cta"); // кнопка справа «Узнать больше»
    const lessBtn = wrap?.querySelector(".about__cta-more"); // кнопка слева «Узнать меньше»
    const moreText = wrap?.querySelector(".about__more-text");
    const process =
      wrap?.querySelector("#about-process") ||
      wrap?.querySelector(".about__process");
    const img = wrap?.querySelector(".about__more-img img");

    if (!wrap || !moreBtn || !lessBtn || !moreText || !process || !img) return;

    // Базовые классы/состояния
    img.classList.toggle("about__img-fade", true); // упр. opacity через CSS
    if (moreText.style.display === "none")
      moreText.style.removeProperty("display");
    if (lessBtn.style.display === "none")
      lessBtn.style.removeProperty("display");

    const revealItems = [
      process.querySelector("h3"),
      ...process.querySelectorAll(".step"),
    ].filter(Boolean);

    revealItems.forEach((el) => {
      el.classList.add("reveal");
      el.classList.remove("reveal--in");
    });

    moreText.classList.add("is-collapsed"); // контент закрыт по умолчанию
    lessBtn.classList.add("is-hidden"); // «Узнать меньше» скрыта
    img.classList.remove("is-bright"); // картинка тусклая (opacity ~0.02 в CSS)

    // Тайминги (если надо — подстрой тут)
    const DUR = 280; // длительность анимации элемента
    const STAGGER = 140; // ступенчатая задержка между элементами
    const IMG_DUR = 380; // длительность проявления/затухания картинки

    let isBusy = false;

    // ——— ОТКРЫТЬ («Узнать больше») ———
    moreBtn.addEventListener("click", () => {
      if (isBusy) return;
      isBusy = true;

      moreBtn.setAttribute("aria-expanded", "true");
      moreBtn.classList.add("is-hidden");
      lessBtn.classList.remove("is-hidden");

      moreText.classList.remove("is-collapsed");
      moreText.style.removeProperty("display");

      // 1) СНАЧАЛА — картинка проявляется
      img.classList.add("is-bright");

      // 2) ПОСЛЕ КАРТИНКИ — по очереди показываем заголовок и шаги
      setTimeout(() => {
        revealItems.forEach((el, i) => {
          setTimeout(() => el.classList.add("reveal--in"), i * STAGGER);
        });

        const totalIn = (revealItems.length - 1) * STAGGER + DUR;
        setTimeout(() => {
          isBusy = false;
        }, totalIn + 60);
      }, IMG_DUR);
    });

    // ——— ЗАКРЫТЬ («Узнать меньше») ———
    lessBtn.addEventListener("click", () => {
      if (isBusy) return;
      isBusy = true;

      // скрываем кнопку сразу
      lessBtn.classList.add("is-hidden");

      // 1) СПЕРВА — сворачиваем элементы в обратном порядке
      const reversed = [...revealItems].reverse();
      reversed.forEach((el, i) => {
        setTimeout(() => el.classList.remove("reveal--in"), i * STAGGER);
      });

      const totalOut = (reversed.length - 1) * STAGGER + DUR;

      // 2) ПОСЛЕ ШАГОВ — только затем гасим картинку
      setTimeout(() => {
        img.classList.remove("is-bright");
      }, totalOut + 20);

      // 3) Закрываем контейнер и возвращаем кнопку «Узнать больше»
      setTimeout(() => {
        moreText.classList.add("is-collapsed");
        moreBtn.classList.remove("is-hidden");
        moreBtn.setAttribute("aria-expanded", "false");
        isBusy = false;
      }, totalOut + IMG_DUR + 60);
    });
  })();

  // ===== Prices Accordion =====
  const initPricesAccordion = () => {
    const items = document.querySelectorAll(".prices__item");
    const circles = document.querySelectorAll(".js-circles circle");
    if (!items.length) return;

    // Инициализация — все закрыты
    items.forEach((item) => {
      const panel = item.querySelector(".prices__panel");
      const head = item.querySelector(".prices__header");
      item.classList.remove("is-active");
      panel?.classList.remove("is-open");
      if (panel) panel.hidden = true;
      head?.setAttribute("aria-expanded", "false");
    });

    // Сброс кругов → базовое состояние (1px rgba(164,119,100,0.5))
    circles.forEach((c) => {
      c.style.stroke = "rgba(164, 119, 100, 0.5)";
      c.style.strokeWidth = "1px";
      c.style.opacity = "1";
    });

    // Обработчики
    items.forEach((item, index) => {
      const head = item.querySelector(".prices__header");
      const panel = item.querySelector(".prices__panel");
      if (!head || !panel) return;

      head.addEventListener("click", () => {
        const isActive = item.classList.contains("is-active");

        // Закрываем все
        items.forEach((other) => {
          other.classList.remove("is-active");
          const op = other.querySelector(".prices__panel");
          const oh = other.querySelector(".prices__header");
          if (op) {
            op.classList.remove("is-open");
            op.hidden = true;
          }
          if (oh) oh.setAttribute("aria-expanded", "false");
        });

        // Сброс кругов (база)
        circles.forEach((c) => {
          c.style.stroke = "rgba(164, 119, 100, 0.5)";
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        });

        // Открываем выбранный
        if (!isActive) {
          item.classList.add("is-active");
          panel.classList.add("is-open");
          panel.hidden = false;
          head.setAttribute("aria-expanded", "true");

          // Активный круг: 3px rgba(242,238,236,1)
          if (circles[index]) {
            const c = circles[index];
            c.style.stroke = "rgba(242, 238, 236, 1)";
            c.style.strokeWidth = "3px";
            c.style.opacity = "1";
          }
        }
      });

      // Hover кругов: 1px rgba(164,119,100,1) — только если не активен
      head.addEventListener("mouseenter", () => {
        if (!item.classList.contains("is-active") && circles[index]) {
          const c = circles[index];
          c.style.stroke = "rgba(164, 119, 100, 1)";
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        }
      });
      head.addEventListener("mouseleave", () => {
        if (!item.classList.contains("is-active") && circles[index]) {
          const c = circles[index];
          c.style.stroke = "rgba(164, 119, 100, 0.5)";
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        }
      });
    });
  };
  initPricesAccordion();

  // ===== FAQ Accordion (без hidden, один открыт, Safari-friendly, новые круги) =====
  (() => {
    const items = document.querySelectorAll(".faq__item");
    const circles = document.querySelectorAll(".faq__decor circle");
    if (!items.length) return;

    // База для кругов FAQ
    const BASE = "rgba(3, 40, 29, 0.2)"; // обычное 1px
    const HOVER = "rgba(3, 40, 29, 1)"; // hover 1px
    const ACTIVE = "rgba(164, 119, 100, 1)"; // выбранное 3px

    // Инициализация: все закрыты, aria, круги сброс
    items.forEach((item) => {
      const btn = item.querySelector(".faq__question");
      const panel = item.querySelector(".faq__panel");
      if (!btn || !panel) return;

      // если в HTML остался hidden — снимаем, дальше сами им управляем
      if (panel.hasAttribute("hidden") === false) panel.hidden = true;

      item.classList.remove("is-active");
      panel.classList.remove("is-open");
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");

      // div как кнопка
      if (btn.tagName !== "BUTTON") {
        btn.setAttribute("role", "button");
        if (!btn.hasAttribute("tabindex")) btn.setAttribute("tabindex", "0");
      }
    });

    // Сброс всех кругов в базу
    circles.forEach((c) => {
      c.style.stroke = BASE;
      c.style.strokeWidth = "1px";
      c.style.opacity = "1";
    });

    // Делегируем обработчики на каждый FAQ-item
    items.forEach((item, index) => {
      const btn = item.querySelector(".faq__question");
      const panel = item.querySelector(".faq__panel");
      if (!btn || !panel) return;

      const openItem = () => {
        // закрыть все
        items.forEach((other) => {
          if (other !== item) {
            other.classList.remove("is-active");
            const op = other.querySelector(".faq__panel");
            const oh = other.querySelector(".faq__question");
            if (op) {
              op.classList.remove("is-open");
              op.hidden = true;
            }
            if (oh) oh.setAttribute("aria-expanded", "false");
          }
        });

        // круги: базовые для всех
        circles.forEach((c) => {
          c.style.stroke = BASE;
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        });

        // открыть текущий
        item.classList.add("is-active");
        panel.classList.add("is-open");
        panel.hidden = false;
        btn.setAttribute("aria-expanded", "true");

        // активный круг — 3px ACTIVE
        if (circles[index]) {
          const c = circles[index];
          c.style.stroke = ACTIVE;
          c.style.strokeWidth = "3px";
          c.style.opacity = "1";
        }
      };

      const closeItem = () => {
        item.classList.remove("is-active");
        panel.classList.remove("is-open");
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        // вернуть круг к базовому состоянию
        if (circles[index]) {
          const c = circles[index];
          c.style.stroke = BASE;
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        }
      };

      const toggle = (e) => {
        e.preventDefault();
        if (item.classList.contains("is-active")) closeItem();
        else openItem();
      };

      // Click/keyboard
      btn.addEventListener("click", toggle);
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(e);
        }
      });

      // Hover на круг (только когда не активен)
      btn.addEventListener("mouseenter", () => {
        if (!item.classList.contains("is-active") && circles[index]) {
          const c = circles[index];
          c.style.stroke = HOVER;
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        }
      });
      btn.addEventListener("mouseleave", () => {
        if (!item.classList.contains("is-active") && circles[index]) {
          const c = circles[index];
          c.style.stroke = BASE;
          c.style.strokeWidth = "1px";
          c.style.opacity = "1";
        }
      });
    });
  })();

  // ===== Modal Manager (triggers: [data-modal]) =====
  (() => {
    const TRIGGER_SELECTOR = "[data-modal]";
    const CLOSE_SELECTOR = "[data-close]";
    let activeModal = null;
    let lastFocused = null;

    const delegationRoot =
      document.querySelector(".portfolio__grid") || document;

    function applyScrollbarCompensation() {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty("--sbw", `${sbw}px`);
    }
    function lockScroll() {
      applyScrollbarCompensation();
      document.body.classList.add("modal-open");
    }
    function unlockScroll() {
      document.body.classList.remove("modal-open");
    }
    function getFocusable(container) {
      return Array.from(
        container.querySelectorAll(
          'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
      );
    }
    function trapFocus(e) {
      if (!activeModal || e.key !== "Tab") return;
      const dialog = activeModal.querySelector(".modal__dialog");
      if (!dialog) return;
      const list = getFocusable(dialog);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    function onEscClose(e) {
      if (e.key === "Escape" && activeModal) closeModal();
    }
    function openModalById(id, triggerEl) {
      const modal = document.getElementById(id);
      if (!modal) {
        console.warn(`[Modal] Не найдена модалка с id="${id}"`);
        return;
      }
      if (activeModal && activeModal !== modal) closeModal(false);

      lastFocused = triggerEl || document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      activeModal = modal;
      lockScroll();

      const dialog = modal.querySelector(".modal__dialog");
      const autoFocusTarget =
        dialog.querySelector("[autofocus]") ||
        getFocusable(dialog)[0] ||
        modal.querySelector(".modal__close") ||
        dialog;

      requestAnimationFrame(() => autoFocusTarget && autoFocusTarget.focus());
      document.addEventListener("keydown", trapFocus);
      document.addEventListener("keydown", onEscClose);
    }
    function closeModal(restoreFocus = true) {
      if (!activeModal) return;
      activeModal.classList.remove("is-open");
      activeModal.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", trapFocus);
      document.removeEventListener("keydown", onEscClose);
      if (restoreFocus && lastFocused && document.contains(lastFocused))
        lastFocused.focus();
      lastFocused = null;
      activeModal = null;
      unlockScroll();
    }

    delegationRoot.addEventListener("click", (e) => {
      const trigger = e.target.closest(TRIGGER_SELECTOR);
      if (!trigger) return;
      const id = trigger.getAttribute("data-modal");
      if (!id) return;
      e.preventDefault();
      openModalById(id, trigger);
    });
    delegationRoot.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const trigger = e.target.closest(TRIGGER_SELECTOR);
      if (!trigger) return;
      const id = trigger.getAttribute("data-modal");
      if (!id) return;
      e.preventDefault();
      openModalById(id, trigger);
    });
    document.addEventListener("click", (e) => {
      if (!activeModal) return;
      if (e.target === activeModal.querySelector(".modal__overlay")) {
        closeModal();
        return;
      }
      const closeBtn = e.target.closest(CLOSE_SELECTOR);
      if (closeBtn && activeModal.contains(closeBtn)) {
        e.preventDefault();
        closeModal();
      }
    });
    window.addEventListener("resize", () => {
      if (activeModal) applyScrollbarCompensation();
    });
  })();

  // ===== Hero background video (Safari-friendly) =====
  (() => {
    const section = document.querySelector(".hero");
    const video = document.getElementById("heroVideo");
    const sphere = document.querySelector(".hero__sphere");
    if (!section || !video) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Гарантируем флаги до play()
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    let started = false;

    const reveal = () => {
      if (started) return;
      started = true;
      video.classList.add("is-visible");
      if (sphere) sphere.classList.add("is-hidden");
    };

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
    }
    video.addEventListener("playing", reveal, { once: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (started) tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(section);

    video.addEventListener("error", () => {
      video.classList.remove("is-visible");
      if (sphere) sphere.classList.remove("is-hidden");
    });
    video.addEventListener("stalled", () => {
      if (!started) {
        video.classList.remove("is-visible");
        if (sphere) sphere.classList.remove("is-hidden");
      }
    });
  })();
  (() => {
    "use strict";

    // ====== Константы/селекторы ======
    const SELECTOR_TRIGGER = "[data-modal-src]";
    const REMOTE_MODAL_ID = "remote-modal";
    const REMOTE_SLOT_SEL = "[data-remote-slot]";
    const LOADER_SEL = ".remote-modal__loader";

    // Порядок поиска фрагмента внутри загруженной страницы
    const FRAGMENT_CANDIDATES = [
      'article[data-fragment="modal"]',
      "main article",
      'main [role="main"]',
      "main",
      "article",
      "[data-fragment]",
      "body",
    ];

    // ====== Служебные ======
    const cache = new Map(); // url -> { html, time }
    const CACHE_TTL = 1000 * 60 * 10; // 10 минут
    const modalEl = document.getElementById(REMOTE_MODAL_ID);
    if (!modalEl)
      return console.error("[RemoteModal] Контейнер #remote-modal не найден");

    const dialogEl = modalEl.querySelector(".modal__dialog");
    const slotEl = modalEl.querySelector(REMOTE_SLOT_SEL);
    const loaderEl = modalEl.querySelector(LOADER_SEL);

    let lastActiveEl = null;
    let isOpen = false;

    // Утилита: показать/скрыть лоадер
    function setLoading(on) {
      if (!loaderEl) return;
      loaderEl.hidden = !on;
    }

    // Утилита: абсолютировать относительные пути внутри фрагмента
    function rebaseUrls(root, base) {
      const attrs = ["href", "src", "poster"];
      attrs.forEach((attr) => {
        root.querySelectorAll(`[${attr}]`).forEach((el) => {
          try {
            const val = el.getAttribute(attr);
            if (
              !val ||
              val.startsWith("data:") ||
              val.startsWith("mailto:") ||
              val.startsWith("tel:")
            )
              return;
            const abs = new URL(val, base).toString();
            el.setAttribute(attr, abs);
          } catch (e) {
            /* no-op */
          }
        });
      });

      // srcset отдельно (картинки responsive)
      root.querySelectorAll("[srcset]").forEach((el) => {
        const val = el.getAttribute("srcset");
        if (!val) return;
        const parts = val
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .map((part) => {
            const s = part.split(/\s+/);
            const url = s[0];
            const desc = s.slice(1).join(" ");
            try {
              const abs = new URL(url, base).toString();
              return desc ? `${abs} ${desc}` : abs;
            } catch (e) {
              return part;
            }
          });
        el.setAttribute("srcset", parts.join(", "));
      });
    }

    // Вынуть фрагмент из загруженного HTML
    function extractFragment(htmlText, baseUrl) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      let fragment = null;
      for (const sel of FRAGMENT_CANDIDATES) {
        fragment = doc.querySelector(sel);
        if (fragment) break;
      }
      if (!fragment) fragment = doc.body || doc.documentElement;

      // Создаём "чистый" контейнер и переносим содержимое
      const wrapper = document.createElement("div");
      wrapper.className = "remote-modal__inner";
      // Клонируем детей, не сам фрагмент (чтобы не подтягивать внешние стили/скрипты)
      Array.from(fragment.childNodes).forEach((n) =>
        wrapper.appendChild(n.cloneNode(true))
      );

      // Переписываем относительные пути
      rebaseUrls(wrapper, baseUrl);

      return wrapper;
    }

    // Кэш: проверка валидности
    function getCached(url) {
      const hit = cache.get(url);
      if (!hit) return null;
      if (Date.now() - hit.time > CACHE_TTL) {
        cache.delete(url);
        return null;
      }
      return hit.html;
    }

    // Загрузка HTML (с кэшем и graceful fallback)
    async function loadHtml(url, signal) {
      const cached = getCached(url);
      if (cached) return cached;

      const res = await fetch(url, { credentials: "same-origin", signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      cache.set(url, { html: text, time: Date.now() });
      return text;
    }

    // ====== Управление модалкой ======
    function lockScroll() {
      document.documentElement.style.scrollBehavior = "auto"; // чтобы не прыгало при focus
      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    }
    function unlockScroll() {
      document.body.style.overflow = document.body.dataset.prevOverflow || "";
      delete document.body.dataset.prevOverflow;
      document.documentElement.style.scrollBehavior = "";
    }

    function openModal() {
      if (isOpen) return;
      lastActiveEl = document.activeElement;
      modalEl.setAttribute("aria-hidden", "false");
      modalEl.classList.add("is-open");
      lockScroll();
      isOpen = true;
      // Фокус на диалог или кнопку закрытия
      const closeBtn = modalEl.querySelector('[data-close="button"]');
      (closeBtn || dialogEl).focus({ preventScroll: true });
    }

    function closeModal({ fromPopstate = false } = {}) {
      if (!isOpen) return;
      modalEl.classList.remove("is-open");
      modalEl.setAttribute("aria-hidden", "true");
      unlockScroll();
      isOpen = false;
      // Очистка контента оставляем (по желанию можно не чистить)
      // slotEl.innerHTML = '';
      if (lastActiveEl && typeof lastActiveEl.focus === "function") {
        lastActiveEl.focus({ preventScroll: true });
      }
      // Если закрыли вручную — откатываем URL (если стейт наш)
      if (!fromPopstate && history.state && history.state.__remoteModal) {
        history.back();
      }
    }

    // Trap TAB внутри диалога
    function handleTabTrap(e) {
      if (!isOpen || e.key !== "Tab") return;
      const focusables = dialogEl.querySelectorAll(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
        return;
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
        return;
      }
    }

    // ====== Открытие из src ======
    async function openFrom({ src, stateUrl, replaceState = false }) {
      if (!src) return;

      const ctrl = new AbortController();
      const { signal } = ctrl;

      setLoading(true);
      openModal();

      try {
        const html = await loadHtml(src, signal);
        const fragment = extractFragment(html, src);
        slotEl.innerHTML = "";
        slotEl.appendChild(fragment);
      } catch (err) {
        console.warn(
          "[RemoteModal] Ошибка загрузки, выполняю fallback navigate →",
          src,
          err
        );
        // graceful degradation: обычная навигация
        window.location.href = src;
        return;
      } finally {
        setLoading(false);
      }

      // Обновляем историю
      const state = { __remoteModal: true, modalSrc: src };
      if (replaceState) {
        history.replaceState(state, "", stateUrl || window.location.href);
      } else {
        history.pushState(state, "", stateUrl || window.location.href);
      }
    }

    // ====== Делегирование кликов по триггерам ======
    document.addEventListener("click", (e) => {
      // только ЛКМ без модификаторов
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      // Ищем ближайший элемент с data-modal-src
      const trigger = e.target.closest(SELECTOR_TRIGGER);
      if (!trigger) return;

      const src = trigger.getAttribute("data-modal-src");
      if (!src) return;

      // Если это ссылка — предотвращаем обычный переход
      const isAnchor = trigger.tagName === "A" || trigger.closest("a");
      if (isAnchor) e.preventDefault();

      const stateUrl =
        trigger.getAttribute("data-state-url") ||
        (isAnchor && (trigger.href || trigger.closest("a")?.href)) ||
        null;

      openFrom({ src, stateUrl }).catch(console.error);
    });

    // Клик по оверлею/кнопке закрытия
    modalEl.addEventListener("click", (e) => {
      if (
        e.target?.dataset?.close === "overlay" ||
        e.target?.dataset?.close === "button"
      ) {
        e.preventDefault();
        closeModal();
      }
    });

    // ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeModal();
      } else if (isOpen) {
        handleTabTrap(e);
      }
    });

    // popstate: закрыть или открыть нужный модал по стейту
    window.addEventListener("popstate", () => {
      const st = history.state;
      if (st && st.__remoteModal && st.modalSrc) {
        // возвращаемся на состояние с модалкой → повторно открываем (без push)
        openFrom({
          src: st.modalSrc,
          stateUrl: window.location.href,
          replaceState: true,
        }).catch(console.error);
      } else {
        // состояние без модалки → если открыта, закрываем без ещё одного back()
        closeModal({ fromPopstate: true });
      }
    });

    // Глубокая ссылка через ?modal=
    (function openFromQuery() {
      const q = new URLSearchParams(location.search);
      const modalParam = q.get("modal"); // например: ?modal=/portfolio/project-1.html
      if (!modalParam) return;
      openFrom({
        src: modalParam,
        stateUrl: window.location.href,
        replaceState: true,
      }).catch(console.error);
    })();
  })();
  // ===== CTA Modal (hero__cta -> #cta-modal) =====
  (() => {
    "use strict";
    const TRIGGER_SEL = "a.js-cta-modal"; // как мы и договаривались
    const modalEl = document.getElementById("cta-modal");
    if (!modalEl) return;
    const dialogEl = modalEl.querySelector(".modal__dialog");
    const overlayEl = modalEl.querySelector(".modal__overlay");
    let isOpen = false,
      lastActiveEl = null,
      anchorEl = null;

    function positionToAnchor(el) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      // якорь по центру кнопки (по X) и по верхнему краю (по Y)
      const anchorX = Math.round(r.left + r.width / 2);
      const anchorY = Math.round(r.top);
      modalEl.style.setProperty("--anchor-x", anchorX + "px");
      modalEl.style.setProperty("--anchor-y", anchorY + "px");

      // Страховка от переполнения по X (12px поля)
      const vpW = window.innerWidth;
      const modalW = 348; // совпадает с CSS
      let left = anchorX - modalW / 2;
      if (left < 12)
        modalEl.style.setProperty("--anchor-x", 12 + modalW / 2 + "px");
      if (left + modalW > vpW - 12)
        modalEl.style.setProperty("--anchor-x", vpW - 12 - modalW / 2 + "px");
    }

    function openModal() {
      if (isOpen) return;
      modalEl.classList.add("modal--popover"); // режим поповера
      lastActiveEl = document.activeElement;
      modalEl.setAttribute("aria-hidden", "false");
      modalEl.classList.add("is-open");
      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
      isOpen = true;
      dialogEl.focus({ preventScroll: true });
    }

    function closeModal() {
      if (!isOpen) return;
      modalEl.classList.remove("is-open");
      modalEl.setAttribute("aria-hidden", "true");
      document.body.style.overflow = document.body.dataset.prevOverflow || "";
      delete document.body.dataset.prevOverflow;
      isOpen = false;
      if (lastActiveEl?.focus) lastActiveEl.focus({ preventScroll: true });
    }

    // Клик по триггеру: считаем позицию и открываем
    document.addEventListener("click", (e) => {
      const a = e.target.closest(TRIGGER_SEL);
      if (
        !a ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      e.preventDefault();
      anchorEl = a;
      positionToAnchor(anchorEl);
      openModal();
    });

    // Перепозиционирование при ресайзе/скролле
    window.addEventListener(
      "resize",
      () => isOpen && positionToAnchor(anchorEl)
    );
    window.addEventListener(
      "scroll",
      () => isOpen && positionToAnchor(anchorEl),
      { passive: true }
    );

    // Закрытие по оверлею/ESC/клик по опциям — как было
    overlayEl?.addEventListener("click", (e) => {
      if (e.target === overlayEl) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeModal();
      }
    });
    dialogEl.addEventListener("click", (e) => {
      const link = e.target.closest("a, button");
      if (link) closeModal(); // не блокируем переход
    });
  })();
  // ===== Prices Table Inline Accordion (описание внутри первой ячейки) =====
  (() => {
    "use strict";

    const DEFAULT_TEXT =
      "У каждого сайта есть всего 4 секунды, чтобы задержать пользователя. Мы знаем, как с помощью лендинга не только привлечь внимание, но и увеличить продажи в несколько раз.";

    // получить текст для строки: приоритет data-details на <tr>
    function getDetailsText(tr) {
      const custom = tr.getAttribute("data-details");
      return custom && custom.trim() ? custom.trim() : DEFAULT_TEXT;
    }

    // закрыть все раскрытые описания внутри одной таблицы
    function closeAllInTable(table) {
      table.querySelectorAll(".prices__cell-details.is-open").forEach((el) => {
        el.classList.remove("is-open");
      });
      table
        .querySelectorAll("td.is-toggle[aria-expanded='true']")
        .forEach((td) => {
          td.setAttribute("aria-expanded", "false");
        });
      table
        .querySelectorAll("tr.has-open")
        .forEach((tr) => tr.classList.remove("has-open"));
    }

    // создать (или вернуть существующий) контейнер описания внутри первой ячейки
    function ensureDetailContainer(nameCell) {
      // оборачиваем исходный текст (название услуги) — по желанию
      if (!nameCell.querySelector(".prices__cell-title")) {
        const title = document.createElement("span");
        title.className = "prices__cell-title";
        // перемещаем весь текст ячейки в title, сохраним другие узлы, если были
        while (nameCell.firstChild) {
          title.appendChild(nameCell.firstChild);
        }
        nameCell.appendChild(title);
      }

      let details = nameCell.querySelector(".prices__cell-details");
      if (!details) {
        details = document.createElement("div");
        details.className = "prices__cell-details";
        nameCell.appendChild(details);
      }
      return details;
    }

    function initTable(table) {
      const rows = table.querySelectorAll("tbody > tr");
      rows.forEach((tr) => {
        const nameCell = tr.cells[0];
        if (!nameCell) return;

        // делаем первую ячейку интерактивной
        nameCell.classList.add("is-toggle");
        nameCell.setAttribute("role", "button");
        nameCell.setAttribute("tabindex", "0");
        nameCell.setAttribute("aria-expanded", "false");

        // предзаводим контейнер описания (пустой и скрытый)
        const details = ensureDetailContainer(nameCell);

        const open = () => {
          const tableEl = tr.closest("table");
          // сначала закрываем остальные в этой таблице
          closeAllInTable(tableEl);

          // наполняем текстом и открываем
          details.textContent = getDetailsText(tr);
          details.classList.add("is-open");
          nameCell.setAttribute("aria-expanded", "true");
          tr.classList.add("has-open");
        };

        const close = () => {
          details.classList.remove("is-open");
          nameCell.setAttribute("aria-expanded", "false");
          tr.classList.remove("has-open");
        };

        const toggle = (e) => {
          e.preventDefault();
          const expanded = nameCell.getAttribute("aria-expanded") === "true";
          if (expanded) close();
          else open();
        };

        nameCell.addEventListener("click", toggle);
        nameCell.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") toggle(e);
        });
      });
    }

    // Инициализация для всех таблиц в раскрывающихся панелях
    const tables = document.querySelectorAll(".prices__panel .prices__table");
    tables.forEach(initTable);

    // Когда панель скрывается (атрибут hidden) — закрываем все описания внутри неё
    const panels = document.querySelectorAll(".prices__panel");
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "attributes" && m.attributeName === "hidden") {
          const panel = m.target;
          if (panel.hidden) {
            panel.querySelectorAll(".prices__table").forEach(closeAllInTable);
          }
        }
      }
    });
    panels.forEach((panel) => mo.observe(panel, { attributes: true }));
  })();
  // ===== Order Form (order.html) =====
  (() => {
    "use strict";
    const form = document.getElementById("orderForm");
    if (!form) return;

    const statusEl = form.querySelector(".of-status");
    const submitBtn = form.querySelector(".of-submit");
    const phoneInput = form.querySelector(".js-phone");
    const servicesSelect = document.getElementById("servicesSelect"); // hidden <select multiple>, если есть

    // Маска телефона под +7 (999) 999-99-99
    phoneInput?.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.startsWith("8")) v = "7" + v.slice(1);
      if (!v.startsWith("7")) v = "7" + v;
      const p = v.padEnd(11, "_").slice(0, 11).split("");
      e.target.value =
        `+7 (${p[1]}${p[2]}${p[3]}) ${p[4]}${p[5]}${p[6]}-${p[7]}${p[8]}-${p[9]}${p[10]}`.replace(
          /[_-]+$/,
          ""
        );
    });

    function showError(input, msg) {
      const err = input.closest(".of-field")?.querySelector(".of-error");
      if (err) err.textContent = msg || "";
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    // Собираем услуги из hidden <select multiple>, fallback — чекбоксы
    function collectServices() {
      if (servicesSelect) {
        return Array.from(servicesSelect.selectedOptions).map((o) =>
          o.value.trim()
        );
      }
      return Array.from(
        form.querySelectorAll('input[name="services"]:checked')
      ).map((i) => i.value.trim());
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // honeypot: если заполнен — тихо выходим
      if (form.company && form.company.value.trim() !== "") {
        return;
      }

      // Базовая валидация
      let ok = true;
      ["name", "phone", "email"].forEach((n) => {
        const el = form.elements[n];
        if (!el) return;
        if (!el.value.trim()) {
          ok = false;
          showError(el, "Заполните поле");
        } else showError(el, "");
      });

      const consentEl = form.elements["consent"];
      if (!(consentEl && consentEl.checked)) {
        ok = false;
        alert("Подтвердите согласие на обработку данных");
      }
      if (!ok) return;

      // Payload под send.php
      const data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        services: collectServices(), // массив значений
        budget: (form.budget?.value || "").trim(),
        task: (form.task?.value || "").trim(),
        consent: true, // важно для валидации на сервере
        company: form.company?.value?.trim() || "", // honeypot (пусто у людей)
      };

      const SUBMIT_URL = "/send.php";

      submitBtn.disabled = true;
      statusEl.hidden = false;
      statusEl.textContent = "Отправляем…";

      try {
        const res = await fetch(SUBMIT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // send.php возвращает JSON {ok:true} либо {error:"...", fields?:[]}
        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.error) {
          const msg = json.error || `Ошибка отправки (HTTP ${res.status})`;
          throw new Error(msg);
        }

        statusEl.textContent = "Заявка отправлена. Свяжемся с вами!";
        form.reset();

        // Синхронизируем UI после reset:
        form
          .querySelectorAll(".chip input[type='checkbox']")
          .forEach((i) => (i.checked = false));
        if (servicesSelect) {
          Array.from(servicesSelect.options).forEach(
            (o) => (o.selected = false)
          );
        }
      } catch (err) {
        console.warn("[OrderForm] submit error:", err);
        statusEl.textContent = "Ошибка отправки. Попробуйте ещё раз.";
      } finally {
        submitBtn.disabled = false;
        setTimeout(() => (statusEl.hidden = true), 4000);
      }
    });
  })();

  // ===== Order "Need" circles: chips <-> 8 rings mapping =====
  (() => {
    "use strict";
    const section =
      document.querySelector(".order-form__need-inner") ||
      document.querySelector(".order-form__section .order-form__need-inner");
    if (!section) return;

    const circles = section.querySelectorAll(
      ".order-form__decor .js-circles circle"
    );
    const chipLabels = section.querySelectorAll(".chip-group .chip");
    const inputs = section.querySelectorAll(
      '.chip-group input[type="checkbox"]'
    );
    if (!circles.length || !chipLabels.length) return;

    // Визуальные константы (как в .prices)
    const BASE = "rgba(164, 119, 100, 0.5)"; // обычное 1px
    const HOVER = "rgba(164, 119, 100, 1)"; // hover 1px
    const ACTIVE = "rgba(242, 238, 236, 1)"; // выбранное 3px

    // Состояние
    const assigned = new Map(); // input -> circleIndex
    const used = new Set(); // занятые индексы колец

    // Helpers: стили колец
    function setBase(i) {
      const c = circles[i];
      if (!c) return;
      c.style.stroke = BASE;
      c.style.strokeWidth = "1px";
      c.style.opacity = "1";
      c.classList.remove("is-active", "is-hover");
    }
    function setHover(i) {
      const c = circles[i];
      if (!c) return;
      if (used.has(i)) return; // занято — не подсвечиваем hover
      c.style.stroke = HOVER;
      c.style.strokeWidth = "1px";
      c.style.opacity = "1";
      c.classList.add("is-hover");
      c.classList.remove("is-active");
    }
    function clearHover(i) {
      if (i == null || used.has(i)) return; // активные не трогаем
      setBase(i);
    }
    function setActive(i) {
      const c = circles[i];
      if (!c) return;
      c.style.stroke = ACTIVE;
      c.style.strokeWidth = "3px";
      c.style.opacity = "1";
      c.classList.add("is-active");
      c.classList.remove("is-hover");
    }

    function resetAll() {
      circles.forEach((_, i) => setBase(i));
    }
    resetAll();

    function nextFreeIndex() {
      for (let i = 0; i < circles.length; i++) {
        if (!used.has(i)) return i;
      }
      return -1;
    }

    // Наведение/фокус на чип — превью свободного кольца
    chipLabels.forEach((label) => {
      const input = label.querySelector('input[type="checkbox"]');
      if (!input) return;

      function handleEnter() {
        // если чип уже закреплён — подсветим его кольцо активным (ничего не меняем)
        const own = assigned.get(input);
        if (own != null) {
          setActive(own);
          return;
        }

        // иначе подсветим ближайшее свободное
        const idx = nextFreeIndex();
        if (idx === -1) return;
        label.dataset.previewIndex = String(idx);
        setHover(idx);
      }

      function handleLeave() {
        const own = assigned.get(input);
        if (own != null) {
          setActive(own);
          return;
        } // остаётся активным
        const p = label.dataset.previewIndex;
        if (p !== undefined) {
          clearHover(Number(p));
          delete label.dataset.previewIndex;
        }
      }

      label.addEventListener("mouseenter", handleEnter);
      label.addEventListener("mouseleave", handleLeave);
      label.addEventListener("focusin", handleEnter);
      label.addEventListener("focusout", handleLeave);
    });

    // Изменение чекбоксов — закрепление/освобождение колец
    inputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        // Снятие — освобождаем своё кольцо
        if (!input.checked) {
          const own = assigned.get(input);
          if (own != null) {
            assigned.delete(input);
            used.delete(own);
            setBase(own);
          }
          return;
        }

        // Выбор — если уже закреплён, просто подтверждаем
        if (assigned.has(input)) {
          setActive(assigned.get(input));
          return;
        }

        // Если лимит (все 8 заняты) — откатываем чекбокс
        if (used.size >= circles.length) {
          input.checked = false;
          // по UX можно мигнуть чем-то, но по ТЗ «ничего не происходит»
          return;
        }

        // Закрепляем ближайшее свободное (по порядку)
        const p = input.closest(".chip")?.dataset?.previewIndex;
        const idx = p !== undefined ? Number(p) : nextFreeIndex();
        if (idx === -1) {
          input.checked = false;
          return;
        }

        assigned.set(input, idx);
        used.add(idx);
        setActive(idx);

        // подчистим превью, если было
        const chip = input.closest(".chip");
        if (chip && "previewIndex" in chip.dataset)
          delete chip.dataset.previewIndex;
      });
    });

    // Если форму сбросят — всё вернуть к базовому
    const form = section.closest("form");
    form?.addEventListener("reset", () => {
      assigned.clear();
      used.clear();
      resetAll();
      // чипы снимутся сами через reset
    });
  })();
  const burger = document.getElementById("burgerBtn");
  const menu = document.getElementById("mobileMenu");

  if (!burger || !menu) return;

  const links = menu.querySelectorAll(".nav__link");
  let lastFocused = null;

  const openMenu = () => {
    lastFocused = document.activeElement;
    burger.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    // блокируем прокрутку страницы
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    // переводим фокус на первый пункт меню (если есть)
    const firstLink = menu.querySelector(".nav__link");
    if (firstLink) firstLink.focus();
    // вешаем ловушки закрытия
    document.addEventListener("keydown", onKeydownEscape);
    document.addEventListener("click", onClickOutside, true);
  };

  const closeMenu = () => {
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    // возвращаем прокрутку
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    // возвращаем фокус туда, откуда пришли
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      burger.focus();
    }
    // снимаем ловушки
    document.removeEventListener("keydown", onKeydownEscape);
    document.removeEventListener("click", onClickOutside, true);
  };

  const toggleMenu = () => {
    const isHidden = menu.getAttribute("aria-hidden") !== "false";
    isHidden ? openMenu() : closeMenu();
  };

  // Закрытие по клику вне меню
  const onClickOutside = (e) => {
    // если клик произошёл внутри меню или по бургеру — игнор
    if (menu.contains(e.target) || burger.contains(e.target)) return;
    closeMenu();
  };

  // Закрытие по Esc
  const onKeydownEscape = (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      closeMenu();
    }
  };

  // Триггеры
  burger.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // Закрытие по клику на любой пункт меню
  links.forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });
});
