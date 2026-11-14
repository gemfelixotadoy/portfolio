(() => {
  const data = window.portfolioData;
  if (!data) {
    console.error("The portfolio could not initialize because portfolio data is missing.");
    return;
  }

  const byId = (id) => document.getElementById(id);
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function renderTags(id, values) {
    const list = byId(id);
    if (!list) return;
    values.forEach((value) => list.append(element("li", "", value)));
  }

  function renderServices() {
    const grid = byId("video-services");
    if (!grid) return;
    data.videoServices.forEach((service, index) => {
      const card = element("article", "service-card");
      card.append(
        element("p", "meta", `0${index + 1}`),
        element("h3", "", service.title),
        element("p", "service-description", service.description)
      );
      grid.append(card);
    });
  }

  function renderExperience() {
    const timeline = byId("experience-timeline");
    if (!timeline) return;
    data.experience.forEach((entry) => {
      const item = element("li", "timeline-item");
      item.append(
        element("p", "timeline-date", entry.dates),
        element("div", "timeline-detail")
      );
      const detail = item.querySelector(".timeline-detail");
      detail.append(element("h4", "", entry.company), element("p", "timeline-role", entry.role));
      timeline.append(item);
    });
  }

  function renderExperiencePreview() {
    const list = byId("home-experience-list");
    if (!list) return;
    data.experience.forEach((entry) => {
      const item = element("li", "experience-preview-row");
      item.append(
        element("p", "experience-preview-year", entry.dates),
        element("h3", "", entry.role),
        element("p", "experience-preview-company", entry.company)
      );
      list.append(item);
    });
  }

  function renderRecommendations(id, preview = false) {
    const grid = byId(id);
    if (!grid) return;

    data.recommendations.forEach((recommendation) => {
      const card = element(
        "article",
        preview ? "recommendation-card recommendation-card--preview" : "recommendation-card"
      );
      const quoteMark = element("span", "recommendation-quote-mark", "“");
      quoteMark.setAttribute("aria-hidden", "true");

      const initials = recommendation.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
      const avatar = element("span", "recommendation-avatar", initials);
      avatar.setAttribute("aria-hidden", "true");

      const author = element("div", "recommendation-author");
      author.append(
        element("h3", "recommendation-name", recommendation.name),
        element("p", "recommendation-role", recommendation.details)
      );

      const attribution = element("footer", "recommendation-attribution");
      attribution.append(avatar, author);
      card.append(
        quoteMark,
        element("blockquote", "recommendation-quote", recommendation.quote),
        attribution
      );
      grid.append(card);
    });
  }

  function socialIcon(name) {
    const paths = {
      instagram: '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="18" cy="6" r="1"></circle>',
      linkedin: '<path d="M5 8v11M5 5v.1M9 19v-6a4 4 0 0 1 8 0v6M9 11v8"></path>',
      x: '<path d="M5 4l14 16M19 4 5 20"></path>',
      tiktok: '<path d="M14 4v11.2a4 4 0 1 1-3-3.87"></path><path d="M14 4c.5 2.4 2.2 4.1 4.8 4.5"></path>'
    };
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.innerHTML = paths[name] || "";
    return icon;
  }

  function renderSocials() {
    [byId("hero-social-links"), byId("social-links")].forEach((links) => {
      if (!links) return;
      data.socials.forEach((social) => {
        const link = element("a");
        link.href = social.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `${social.name} profile for Gem Felix Otadoy, opens in a new tab`);
        link.append(socialIcon(social.icon), element("span", "", social.handle), element("span", "", "↗"));
        links.append(link);
      });
    });
  }

  function renderProjects() {
    const grid = byId("work-grid");
    const filters = byId("work-filters");
    const previewGrid = byId("home-work-grid");
    const targetGrid = grid || previewGrid;
    if (!targetGrid) return;
    const isPreview = targetGrid.dataset.preview === "true";
    const categories = ["All", ...new Set(data.projects.map((project) => project.category))];

    if (filters) {
      categories.forEach((category, index) => {
        const button = element("button", "filter-button", category === "All" ? "All work" : category);
        button.type = "button";
        button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
        button.dataset.category = category;
        filters.append(button);
      });
    }

    data.projects.forEach((project, index) => {
      const card = element("article", "work-card");
      card.dataset.category = project.category;
      card.dataset.format = project.format || "landscape";

      const preview = isPreview
        ? element("a", "work-preview")
        : element("button", "work-preview");
      if (isPreview) {
        preview.href = targetGrid.dataset.projectsUrl;
        preview.setAttribute("aria-label", `View selected work: ${project.title}`);
      } else {
        preview.type = "button";
        preview.dataset.projectIndex = String(index);
        preview.setAttribute("aria-label", `Open video preview: ${project.title}`);
      }
      if (!isPreview && project.aspectRatio) preview.style.aspectRatio = project.aspectRatio;
      if (project.thumbnailFit) preview.dataset.thumbnailFit = project.thumbnailFit;
      if (project.thumbnail) {
        const image = element("img", "work-thumbnail");
        image.src = project.thumbnail;
        image.alt = project.thumbnailAlt || `Thumbnail for ${project.title}`;
        image.loading = "lazy";
        image.decoding = "async";
        preview.append(image);
      } else {
        const placeholder = element("span", "work-thumbnail-placeholder");
        placeholder.append(
          element("span", "meta", project.category),
          element("span", "thumbnail-title", project.title),
          element("span", "thumbnail-open", isPreview ? "View projects ↗" : "Open preview ↗")
        );
        preview.append(placeholder);
      }

      card.append(preview);
      targetGrid.append(card);
    });

    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      const category = button.dataset.category;
      filters.querySelectorAll("button[data-category]").forEach((filter) => {
        filter.setAttribute("aria-pressed", String(filter === button));
      });
      grid.querySelectorAll(".work-card").forEach((card) => {
        card.hidden = category !== "All" && card.dataset.category !== category;
      });
    });
  }

  function renderHomeTools() {
    renderTags("home-tools-list", data.videoTools);
  }

  function videoContent(url, title = "Video preview") {
    if (!url) return null;
    let parsed;
    try {
      parsed = new URL(url, window.location.href);
    } catch (error) {
      console.error("The configured video preview URL is invalid.", error);
      return null;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

    const host = parsed.hostname.toLowerCase();
    let embedUrl = "";
    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId && /^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}${youtubeStart(parsed)}`;
      }
    } else if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId && /^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}${youtubeStart(parsed)}`;
      }
      const embedMatch = parsed.pathname.match(/^\/embed\/([A-Za-z0-9_-]{6,})$/);
      if (embedMatch) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${embedMatch[1]}${youtubeStart(parsed)}`;
      }
    } else if (host === "vimeo.com" || host === "www.vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      if (videoId && /^\d+$/.test(videoId)) embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    if (embedUrl) {
      const iframe = element("iframe", "video-embed");
      iframe.src = embedUrl;
      iframe.title = title;
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";
      return iframe;
    }

    if (/\.(mp4|webm|ogg)(?:$|[?#])/i.test(parsed.pathname + parsed.search)) {
      const video = element("video", "video-embed");
      video.controls = true;
      video.playsInline = true;
      video.preload = "none";
      const source = element("source");
      source.src = parsed.href;
      video.append(source);
      return video;
    }

    return null;
  }

  function youtubeStart(url) {
    const start = Number(url.searchParams.get("start") || url.searchParams.get("time_continue"));
    return Number.isSafeInteger(start) && start > 0 ? `?start=${start}` : "";
  }

  function setupVideoDialog() {
    const dialog = byId("video-dialog");
    if (!dialog) return;
    const title = byId("video-dialog-title");
    const content = byId("video-dialog-content");
    const closeButton = dialog.querySelector(".video-dialog-close");

    function openVideo(name, url, placeholder) {
      title.textContent = name;
      content.replaceChildren();
      const player = videoContent(url, name);
      if (player) {
        content.append(player);
      } else {
        const message = element("div", "video-empty-state");
        message.append(
          element("p", "meta", "Preview not available yet"),
          element("p", "", placeholder
            ? "Add a video URL to this project in portfolio-data.js to enable playback."
            : "Add a YouTube, Vimeo, or direct video URL in portfolio-data.js.")
        );
        content.append(message);
      }
      if (!dialog.open) dialog.showModal();
    }

    document.addEventListener("click", (event) => {
      const preview = event.target.closest("[data-project-index]");
      if (preview) {
        const project = data.projects[Number(preview.dataset.projectIndex)];
        if (project) openVideo(project.title, project.videoUrl, project.placeholder);
        return;
      }
      if (event.target.closest("[data-video-id='showreel']")) {
        openVideo("Showreel", data.showreelUrl, true);
      }
    });

    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => content.replaceChildren());
  }

  function setupScrollReveal() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = document.querySelectorAll("[data-reveal]");
    sections.forEach((section) => section.classList.add("reveal-ready"));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    sections.forEach((section) => observer.observe(section));
  }

  function setupThemeControls() {
    const buttons = [...document.querySelectorAll("[data-theme-choice]")];
    if (!buttons.length) return;

    function selectTheme(theme, persist = true) {
      document.documentElement.dataset.theme = theme;
      buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
      });
      if (!persist) return;
      try {
        localStorage.setItem("portfolio-theme", theme);
      } catch (error) {
        console.warn("Could not save the theme preference.", error);
      }
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => selectTheme(button.dataset.themeChoice));
    });
    selectTheme(document.documentElement.dataset.theme || "system", false);
  }

  function setupPhilippinesClock() {
    const clock = byId("philippines-time");
    if (!clock) return;
    const formatter = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    const updateTime = () => {
      clock.textContent = `PH · ${formatter.format(new Date())}`;
    };
    updateTime();
    window.setInterval(updateTime, 60_000);
  }

  document.querySelectorAll("[data-portfolio-name]").forEach((node) => {
    node.textContent = data.name;
  });
  document.querySelectorAll("[data-portfolio-title]").forEach((node) => {
    node.textContent = data.title;
  });
  const heroTitle = byId("hero-title");
  if (heroTitle) heroTitle.textContent = data.name;
  const heroTagline = byId("hero-tagline");
  const titleChip = heroTagline?.querySelector("[data-title-chip]");
  if (heroTagline && titleChip && data.tagline.includes("{title}")) {
    const [beforeTitle, afterTitle] = data.tagline.split("{title}");
    heroTagline.replaceChildren(document.createTextNode(beforeTitle));
    titleChip.querySelector("[data-portfolio-title]").textContent = data.title;
    heroTagline.append(titleChip, document.createTextNode(afterTitle));
  } else if (heroTagline) {
    heroTagline.textContent = data.tagline.replace("{title}", data.title);
  }
  document.querySelectorAll("[data-contact-email]").forEach((link) => {
    link.href = `mailto:${data.email}`;
    const address = link.querySelector("span");
    if (address) address.textContent = data.email;
  });
  const emailLink = byId("contact-email");
  if (emailLink) {
    emailLink.href = `mailto:${data.email}`;
    const address = emailLink.firstChild;
    if (address?.nodeType === Node.TEXT_NODE) address.textContent = `${data.email} `;
  }
  const aboutBio = byId("about-bio");
  if (aboutBio) aboutBio.textContent = data.about;
  const contactLocation = byId("contact-location");
  if (contactLocation) contactLocation.textContent = data.location;
  renderTags("video-tools", data.videoTools);
  renderTags("additional-expertise", data.additionalExpertise);
  renderTags("additional-tools", data.additionalTools);
  renderServices();
  renderExperience();
  renderExperiencePreview();
  renderRecommendations("home-recommendation-grid", true);
  renderRecommendations("recommendation-grid");
  renderSocials();
  renderProjects();
  renderHomeTools();
  setupVideoDialog();
  setupScrollReveal();
  setupThemeControls();
  setupPhilippinesClock();
})();
