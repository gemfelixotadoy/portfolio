(() => {
  const replayButton = document.querySelector(".tour-replay");
  if (!(replayButton instanceof HTMLButtonElement)) return;

  const seenKey = "gem-portfolio-tour-seen";
  const steps = [
    { selector: ".hero h1", message: "Welcome to my portfolio. I’m Gem, a paraplanner." },
    { selector: ".social-links", message: "Here are my social links." },
    {
      selector: ".sidebar-nav",
      mobileSelector: ".mobile-nav",
      message: "Use this menu to explore the different pages of my portfolio."
    }
  ];
  const cursor = document.createElement("div");
  cursor.className = "tour-cursor";
  cursor.hidden = true;
  cursor.setAttribute("aria-hidden", "true");
  // Bibata Original pointer geometry by ful1e5/Bibata_Cursor, GPL-3.0.
  cursor.innerHTML = '<svg viewBox="0 0 256 256"><path d="M76.6287 46.6308 62.4993 34.144 62.5 53.0003 62.5058 208 62.5066 229.287 77.1681 213.855 122.261 166.392 188.193 164.895 209.894 164.403 193.629 150.028Z"/></svg>';

  const card = document.createElement("section");
  card.className = "tour-card";
  card.hidden = true;
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-labelledby", "tour-card-label");
  card.setAttribute("aria-describedby", "tour-card-message");
  card.innerHTML = `
    <p class="tour-card-label" id="tour-card-label"></p>
    <p class="tour-card-message" id="tour-card-message"></p>
    <div class="tour-card-controls">
      <button class="tour-skip" type="button">Skip tour</button>
    </div>
  `;

  document.body.append(cursor, card);

  const label = card.querySelector("#tour-card-label");
  const message = card.querySelector("#tour-card-message");
  const skipButton = card.querySelector(".tour-skip");
  if (
    !(label instanceof HTMLParagraphElement) ||
    !(message instanceof HTMLParagraphElement) ||
    !(skipButton instanceof HTMLButtonElement)
  ) {
    console.error("The portfolio tour could not initialize because required tour controls are missing.");
    return;
  }

  let currentStep = 0;
  let currentTarget = null;
  let previousFocus = null;
  let tourRunning = false;
  let advanceTimer = 0;

  function positionCard(target) {
    const rect = target.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const margin = 16;
    const left = Math.max(margin, Math.min(rect.left + rect.width / 2 - cardRect.width / 2, innerWidth - cardRect.width - margin));
    const below = rect.bottom + 42;
    const top = Math.min(innerHeight - cardRect.height - margin, below + cardRect.height <= innerHeight - margin
      ? below
      : Math.max(margin, rect.top - cardRect.height - margin));
    const cursorLeft = Math.max(margin, Math.min(rect.left + rect.width / 2 - 4, innerWidth - 34));
    const cursorTop = Math.max(margin, Math.min(rect.top + rect.height / 2 - 4, innerHeight - 39));

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    cursor.style.left = `${cursorLeft}px`;
    cursor.style.top = `${cursorTop}px`;
  }

  function showStep(index) {
    window.clearTimeout(advanceTimer);
    const step = steps[index];
    const target = [step.selector, step.mobileSelector]
      .filter(Boolean)
      .map((selector) => document.querySelector(selector))
      .find((element) => element instanceof HTMLElement && element.getClientRects().length > 0);
    if (!(target instanceof HTMLElement)) {
      console.error(`The portfolio tour target "${step.selector}" could not be found or is not visible.`);
      finishTour();
      return;
    }

    currentTarget?.classList.remove("tour-highlight");
    currentTarget = target;
    currentStep = index;
    currentTarget.classList.add("tour-highlight");
    label.textContent = "Gem";
    message.textContent = step.message;
    card.hidden = false;
    cursor.hidden = false;
    positionCard(target);
    requestAnimationFrame(() => {
      if (tourRunning && currentTarget === target) positionCard(target);
    });
    advanceTimer = window.setTimeout(() => {
      if (currentStep === steps.length - 1) {
        finishTour();
      } else {
        showStep(currentStep + 1);
      }
    }, 6500);
  }

  function startTour() {
    if (tourRunning) return;
    tourRunning = true;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    card.hidden = false;
    cursor.hidden = false;
    showStep(0);
    skipButton.focus({ preventScroll: true });

    try {
      localStorage.setItem(seenKey, "true");
    } catch (error) {
      console.warn("The portfolio tour could not save its completed state in this browser.", error);
    }
  }

  function finishTour() {
    if (!tourRunning) return;
    tourRunning = false;
    window.clearTimeout(advanceTimer);
    currentTarget?.classList.remove("tour-highlight");
    currentTarget = null;
    card.hidden = true;
    cursor.hidden = true;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }

  skipButton.addEventListener("click", finishTour);
  replayButton.addEventListener("click", startTour);

  document.addEventListener("keydown", (event) => {
    if (!tourRunning) return;
    if (event.key === "Escape") {
      event.preventDefault();
      finishTour();
      return;
    }
  });

  window.addEventListener("resize", () => {
    if (tourRunning && currentTarget) positionCard(currentTarget);
  });

  window.addEventListener("scroll", () => {
    if (tourRunning && currentTarget) positionCard(currentTarget);
  }, { passive: true });

  let shouldAutoStart = true;
  try {
    shouldAutoStart = localStorage.getItem(seenKey) !== "true";
  } catch (error) {
    shouldAutoStart = false;
    console.warn("The portfolio tour could not check whether it has already been shown.", error);
  }

  if (shouldAutoStart) {
    window.setTimeout(startTour, 900);
  }
})();
