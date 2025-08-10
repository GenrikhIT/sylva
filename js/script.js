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
});
