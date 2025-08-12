document.addEventListener("DOMContentLoaded", () => {
  // ===== Header Scroll Styles =====
  const header = document.querySelector("header");
  const sections = document.querySelectorAll(
    ".hero, .mission, .portfolio, .prices, .about, .faq"
  );
  let ticking = false;

  const updateHeader = () => {
    const headerHeight = window.innerWidth < 768 ? 66 : 97;
    let activeClass = "default";

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= headerHeight && rect.bottom > headerHeight) {
        if (sec.classList.contains("hero")) {
          activeClass = "hero";
        } else if (sec.classList.contains("prices")) {
          activeClass = "prices";
        } else if (sec.classList.contains("about")) {
          activeClass = "prices"; // общий стиль с блоком цен
        } else {
          activeClass = "default";
        }
      }
    });

    header.classList.remove(
      "header--hero",
      "header--prices",
      "header--default"
    );
    header.classList.add(`header--${activeClass}`);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
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
        requestAnimationFrame(() => {
          item.style.opacity = 1;
        });
      });

      loadMoreBtn.style.display = "none";
    });
  }

  // ===== About "Learn More" =====
  const aboutBtn = document.querySelector(".about__cta");
  const aboutContent = document.querySelector(".about__content");

  if (aboutBtn && aboutContent) {
    aboutBtn.addEventListener("click", () => {
      const hiddenTexts = aboutContent.querySelectorAll(
        '.about__text[style*="display: none"]'
      );

      hiddenTexts.forEach((text) => {
        text.style.display = "block";
        text.style.opacity = 0;
        text.style.transition = "opacity 0.5s ease";
        requestAnimationFrame(() => {
          text.style.opacity = 1;
        });
      });

      aboutBtn.style.display = "none";
    });
  }

  // ===== Prices Accordion =====
  const initPricesAccordion = () => {
    const accordionItems = document.querySelectorAll(".prices__item");
    const circles = document.querySelectorAll(".js-circles circle");
    if (!accordionItems.length) return;

    // Инициализация - все элементы закрыты
    accordionItems.forEach((item) => {
      const panel = item.querySelector(".prices__panel");
      const header = item.querySelector(".prices__header");

      item.classList.remove("is-active");
      panel.classList.remove("is-open");
      panel.hidden = true;
      header.setAttribute("aria-expanded", "false");
    });

    // Сброс кругов
    circles.forEach((circle) => {
      circle.style.stroke = "currentColor";
      circle.style.opacity = "0.2";
    });

    // Обработчики событий
    accordionItems.forEach((item, index) => {
      const header = item.querySelector(".prices__header");
      const panel = item.querySelector(".prices__panel");
      const circleIndex = index;

      header.addEventListener("click", () => {
        const isActive = item.classList.contains("is-active");

        // Закрываем все элементы
        accordionItems.forEach((otherItem) => {
          otherItem.classList.remove("is-active");
          const otherPanel = otherItem.querySelector(".prices__panel");
          otherPanel.classList.remove("is-open");
          otherPanel.hidden = true;
          otherItem
            .querySelector(".prices__header")
            .setAttribute("aria-expanded", "false");
        });

        // Сбрасываем все круги
        circles.forEach((circle) => {
          circle.style.stroke = "currentColor";
          circle.style.opacity = "0.2";
        });

        // Если элемент не был активен, открываем его
        if (!isActive) {
          item.classList.add("is-active");
          panel.classList.add("is-open");
          panel.hidden = false;
          header.setAttribute("aria-expanded", "true");

          // Подсветка круга
          if (circles[circleIndex]) {
            circles[circleIndex].style.stroke = "#A47764";
            circles[circleIndex].style.opacity = "1";
          }
        }
      });

      // Hover
      header.addEventListener("mouseenter", () => {
        if (!item.classList.contains("is-active") && circles[circleIndex]) {
          circles[circleIndex].style.opacity = "0.4";
        }
      });
      header.addEventListener("mouseleave", () => {
        if (!item.classList.contains("is-active") && circles[circleIndex]) {
          circles[circleIndex].style.opacity = "0.2";
        }
      });
    });
  };
  initPricesAccordion();

  // ===== FAQ Accordion (упрощенный, как в Prices) =====
  const initFAQAccordion = () => {
    const accordionItems = document.querySelectorAll(".faq__item");
    const circles = document.querySelectorAll(".faq__decor circle");
    if (!accordionItems.length) return;

    // Инициализация - все элементы закрыты
    accordionItems.forEach((item) => {
      const panel = item.querySelector(".faq__panel");
      const header = item.querySelector(".faq__question");

      item.classList.remove("is-active");
      panel.classList.remove("is-open");
      panel.hidden = true;
      header.setAttribute("aria-expanded", "false");
    });

    // Сброс кругов
    circles.forEach((circle) => {
      circle.style.stroke = "currentColor";
      circle.style.opacity = "0.2";
    });

    // Обработчики событий
    accordionItems.forEach((item, index) => {
      const header = item.querySelector(".faq__question");
      const panel = item.querySelector(".faq__panel");

      const toggle = (e) => {
        e.preventDefault();
        const isActive = item.classList.contains("is-active");

        // Закрываем все элементы
        accordionItems.forEach((otherItem) => {
          otherItem.classList.remove("is-active");
          const otherPanel = otherItem.querySelector(".faq__panel");
          otherPanel.classList.remove("is-open");
          otherPanel.hidden = true;
          otherItem
            .querySelector(".faq__question")
            .setAttribute("aria-expanded", "false");
        });

        // Сбрасываем все круги
        circles.forEach((circle) => {
          circle.style.stroke = "currentColor";
          circle.style.opacity = "0.2";
        });

        // Если элемент не был активен, открываем его
        if (!isActive) {
          item.classList.add("is-active");
          panel.classList.add("is-open");
          panel.hidden = false;
          header.setAttribute("aria-expanded", "true");

          // Подсветка круга
          if (circles[index]) {
            circles[index].style.stroke = "#A47764";
            circles[index].style.opacity = "1";
          }
        }
      };

      header.addEventListener("click", toggle);
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(e);
        }
      });

      // Hover
      header.addEventListener("mouseenter", () => {
        if (!item.classList.contains("is-active") && circles[index]) {
          circles[index].style.opacity = "0.4";
        }
      });
      header.addEventListener("mouseleave", () => {
        if (!item.classList.contains("is-active") && circles[index]) {
          circles[index].style.opacity = "0.2";
        }
      });
    });
  };
  initFAQAccordion();

  // ===== Cookie Notice =====
  class CookieNotice {
    constructor() {
      this.notice = document.getElementById("cookieNotice");
      this.acceptBtn = document.getElementById("acceptCookies");
      this.cookieName = "cookies_accepted";
      this.init();
    }

    init() {
      // Проверяем, было ли уже дано согласие
      if (!this.getCookie(this.cookieName)) {
        this.show();
      }

      // Обработчик кнопки "Принять"
      this.acceptBtn.addEventListener("click", () => {
        this.accept();
      });

      // Закрытие по Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !this.notice.hidden) {
          this.accept();
        }
      });
    }

    show() {
      this.notice.hidden = false;
      this.notice.setAttribute("aria-hidden", "false");

      // Анимация появления
      this.notice.style.opacity = "0";
      this.notice.style.transform = "translateY(100%)";

      requestAnimationFrame(() => {
        this.notice.style.transition = "all 0.3s ease";
        this.notice.style.opacity = "1";
        this.notice.style.transform = "translateY(0)";
      });
    }

    hide() {
      this.notice.style.opacity = "0";
      this.notice.style.transform = "translateY(100%)";

      setTimeout(() => {
        this.notice.hidden = true;
        this.notice.setAttribute("aria-hidden", "true");
      }, 300);
    }

    accept() {
      // Сохраняем согласие в cookies на год
      this.setCookie(this.cookieName, "true", 365);
      this.hide();

      // Можно добавить callback для аналитики
      this.onAccept();
    }

    onAccept() {
      console.log("Cookies accepted");
      // Здесь можно инициализировать аналитику и другие скрипты
    }

    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }

    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  }

  // Инициализация cookie notice
  const cookieNotice = new CookieNotice();
  // ===== Modal Manager =====
  (() => {
    const TRIGGER_SELECTOR = "[data-modal]";
    const CLOSE_SELECTOR = "[data-close]";

    let activeModal = null;
    let lastFocused = null;

    const portfolioGrid = document.querySelector(".portfolio__grid"); // делегирование сюда
    const delegationRoot = portfolioGrid || document;

    // Вычисляем ширину скроллбара и кладём в CSS-переменную
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
      // Не чистим --sbw: пригодится при повторном открытии
    }

    function getFocusable(container) {
      return Array.from(
        container.querySelectorAll(
          'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function trapFocus(e) {
      if (!activeModal) return;
      const dialog = activeModal.querySelector(".modal__dialog");
      if (!dialog) return;

      if (e.key !== "Tab") return;

      const focusables = getFocusable(dialog);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function onEscClose(e) {
      if (e.key === "Escape" && activeModal) {
        closeModal();
      }
    }

    function openModalById(id, triggerEl) {
      const modal = document.getElementById(id);
      if (!modal) {
        console.warn(`[Modal] Не найдена модалка с id="${id}"`);
        return;
      }
      if (activeModal && activeModal !== modal) {
        closeModal(false); // закрыть без возврата фокуса (вернём после открытия новой)
      }

      lastFocused = triggerEl || document.activeElement;

      // Открытие (плавно): просто добавляем класс — анимируются overlay и dialog
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      activeModal = modal;

      // Блокируем скролл документа
      lockScroll();

      // Фокус внутрь диалога
      const dialog = modal.querySelector(".modal__dialog");
      const autoFocusTarget =
        dialog.querySelector("[autofocus]") ||
        getFocusable(dialog)[0] ||
        modal.querySelector(".modal__close") ||
        dialog;

      // На следующий тик — чтобы DOM успел применить видимость
      requestAnimationFrame(() => autoFocusTarget && autoFocusTarget.focus());

      // Навешиваем глобальные слушатели
      document.addEventListener("keydown", trapFocus);
      document.addEventListener("keydown", onEscClose);
    }

    function closeModal(restoreFocus = true) {
      if (!activeModal) return;

      activeModal.classList.remove("is-open");
      activeModal.setAttribute("aria-hidden", "true");

      // Снимаем глобальные слушатели
      document.removeEventListener("keydown", trapFocus);
      document.removeEventListener("keydown", onEscClose);

      // Возврат фокуса на триггер
      if (restoreFocus && lastFocused && document.contains(lastFocused)) {
        lastFocused.focus();
      }
      lastFocused = null;
      activeModal = null;

      // Разблокируем скролл
      unlockScroll();
    }

    // Делегирование кликов по триггерам
    delegationRoot.addEventListener("click", (e) => {
      const trigger = e.target.closest(TRIGGER_SELECTOR);
      if (!trigger) return;
      const id = trigger.getAttribute("data-modal");
      if (!id) return;
      e.preventDefault();
      openModalById(id, trigger);
    });

    // Клавиатура (Enter/Space) по триггерам
    delegationRoot.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const trigger = e.target.closest(TRIGGER_SELECTOR);
      if (!trigger) return;
      const id = trigger.getAttribute("data-modal");
      if (!id) return;
      e.preventDefault();
      openModalById(id, trigger);
    });

    // Делегирование закрытия: клик по overlay или по элементам с data-close
    document.addEventListener("click", (e) => {
      if (!activeModal) return;

      // overlay
      if (e.target === activeModal.querySelector(".modal__overlay")) {
        closeModal();
        return;
      }
      // явные элементы закрытия
      const closeBtn = e.target.closest(CLOSE_SELECTOR);
      if (closeBtn && activeModal.contains(closeBtn)) {
        e.preventDefault();
        closeModal();
      }
    });

    // Адаптация под ресайз (скроллбар может измениться)
    window.addEventListener("resize", () => {
      if (activeModal) applyScrollbarCompensation();
    });
  })();
}); // Закрывающая скобка DOMContentLoaded

// ===== Hero video bootstrap =====
(() => {
  const section = document.querySelector(".hero");
  const video = document.getElementById("heroVideo");
  const sphere = document.querySelector(".hero__sphere");

  if (!section || !video) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) {
    // Оставляем canvas, видео не трогаем
    return;
  }

  // iOS/Chrome policy: гарантируем mute/autoplay флаги и свойства
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  let canPlay = false;

  // Плавный ввод: как только буфер готов — показываем
  const onCanPlay = () => {
    canPlay = true;
    // Пробуем запустить
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        video.classList.add("is-visible");
        if (sphere) sphere.classList.add("is-hidden"); // мягко прячем canvas
      }).catch(() => {
        // Автоплей заблокирован → остаёмся на canvas
      });
    } else {
      // Старые браузеры
      video.classList.add("is-visible");
      if (sphere) sphere.classList.add("is-hidden");
    }
  };

  // Если видео уже было в кеше
  if (video.readyState >= 3) {
    onCanPlay();
  } else {
    video.addEventListener("canplaythrough", onCanPlay, { once: true });
  }

  // Управление воспроизведением по видимости (экономим батарейку/CPU)
  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting && canPlay) {
        // Возвращаем воспроизведение
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        // В паузу, когда секция вне экрана
        video.pause();
      }
    },
    { root: null, threshold: 0.2 }
  );

  io.observe(section);

  // Подстраховка: если вдруг ошибка/столк — остаёмся на canvas
  video.addEventListener("error", () => {
    video.classList.remove("is-visible");
    if (sphere) sphere.classList.remove("is-hidden");
  });
  video.addEventListener("stalled", () => {
    // Если зависло до старта — не показываем видео
    if (!canPlay) {
      video.classList.remove("is-visible");
      if (sphere) sphere.classList.remove("is-hidden");
    }
  });
})();
