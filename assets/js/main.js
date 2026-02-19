(function () {
  "use strict";

  const intro = document.getElementById("intro");
  const introSkip = document.querySelector(".intro-skip");

  function hideIntro() {
    if (!intro) return;
    intro.classList.add("hide");
    setTimeout(() => { intro.style.display = "none"; }, 650);
  }

  try {
    const visited = localStorage.getItem("jibbab_intro_seen");
    if (visited === "1") {
      if (intro) intro.style.display = "none";
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => {
          hideIntro();
          localStorage.setItem("jibbab_intro_seen", "1");
        }, 500);
      });
    }
  } catch (e) {
    window.addEventListener("load", () => setTimeout(hideIntro, 500));
  }

  if (introSkip) {
    introSkip.addEventListener("click", () => {
      hideIntro();
      try { localStorage.setItem("jibbab_intro_seen", "1"); } catch (e) {}
    });
  }

  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.getElementById("drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => drawer.classList.toggle("open"));
    drawer.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => drawer.classList.remove("open"))
    );
  }

  const tabs = document.querySelectorAll(".tab");
  const formRegular = document.getElementById("form-regular");
  const formEvent = document.getElementById("form-event");

  function activateTab(target) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.target === target));
    if (!formRegular || !formEvent) return;

    if (target === "event") {
      formEvent.classList.remove("hidden");
      formRegular.classList.add("hidden");
    } else {
      formRegular.classList.remove("hidden");
      formEvent.classList.add("hidden");
    }
  }

  tabs.forEach(t => t.addEventListener("click", () => activateTab(t.dataset.target)));

  document.querySelectorAll("[data-intent]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const intent = btn.getAttribute("data-intent");
      const contact = document.getElementById("contact");
      if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        activateTab("regular");
        if (intent === "regular-service") {
          const r = document.querySelector('input[name="reg-service"][value="상시 단체급식"]');
          if (r) r.checked = true;
        } else if (intent === "regular-lunchbox") {
          const r = document.querySelector('input[name="reg-service"][value="도시락"]');
          if (r) r.checked = true;
        }
      }, 250);
    });
  });

  const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxHO9leErK1nnpGoI9HD2sEceEK4AiD64HhGOQSTI39xeuGqUMaqgs1psUZ08FIKqamGw/exec";

  async function submitToSheet(data, button) {
    if (!WEBAPP_URL || WEBAPP_URL.includes("PASTE_YOUR")) {
      alert("전송 설정이 아직 완료되지 않았습니다. 전화/카카오로 문의 부탁드립니다.");
      return;
    }

    const originalText = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.classList.add("is-sending");
      button.textContent = "전송 중...";
    }

    try {
      const res = await fetch(WEBAPP_URL, { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("HTTP " + res.status);

      if (button) {
        button.classList.remove("is-sending");
        button.classList.add("is-success");
        button.textContent = "전송 완료! 확인 후 연락드리겠습니다.";
      }
      alert("문의가 정상 접수되었습니다. 빠르게 연락드리겠습니다.");
    } catch (err) {
      console.error(err);
      if (button) {
        button.disabled = false;
        button.classList.remove("is-sending");
        button.textContent = originalText || "문의 전송하기";
      }
      alert("전송 중 문제가 발생했습니다.\n전화나 카카오채널로도 함께 연락 주시면 더 빠르게 도와드릴 수 있습니다.");
    }
  }

  if (formRegular) {
    const btn = formRegular.querySelector(".submit-btn");
    formRegular.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        type: "regular",
        company: document.getElementById("reg-company")?.value || "",
        name: document.getElementById("reg-name")?.value || "",
        phone: document.getElementById("reg-phone")?.value || "",
        service: (document.querySelector("input[name='reg-service']:checked") || {}).value || "",
        headcount: document.getElementById("reg-headcount")?.value || "",
        meals: Array.from(document.querySelectorAll("input[name='reg-meals']:checked")).map(x => x.value).join(", "),
        date: document.getElementById("reg-date")?.value || "",
        place: document.getElementById("reg-place")?.value || "",
        message: document.getElementById("reg-message")?.value || "",
        menu: ""
      };
      submitToSheet(data, btn);
    });
  }

  if (formEvent) {
    const btn = formEvent.querySelector(".submit-btn");
    formEvent.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        type: "event",
        company: "",
        title: document.getElementById("evt-title")?.value || "",
        name: document.getElementById("evt-name")?.value || "",
        phone: document.getElementById("evt-phone")?.value || "",
        service: (document.querySelector("input[name='evt-service']:checked") || {}).value || "",
        headcount: document.getElementById("evt-headcount")?.value || "",
        meals: "",
        date: document.getElementById("evt-date")?.value || "",
        place: document.getElementById("evt-place")?.value || "",
        message: document.getElementById("evt-message")?.value || "",
        menu: document.getElementById("evt-menu")?.value || ""
      };
      submitToSheet(data, btn);
    });
  }
})();
