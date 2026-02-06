(async () => {
  async function includePartials(){
    const nodes = document.querySelectorAll("[data-include]");
    await Promise.all([...nodes].map(async (el) => {
      const url = el.getAttribute("data-include");
      if(!url) return;

      try{
        const res = await fetch(url, { cache: "no-cache" });
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        el.innerHTML = await res.text();
      }catch(err){
        el.innerHTML = `<div style="color:#f66;font-size:12px;padding:8px;border:1px solid rgba(255,0,0,.3)">
          include failed: ${url} (${err.message})
        </div>`;
      }
    }));
  }

  function setActiveLinks(){
    const cur = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    const mark = (selector) => {
      document.querySelectorAll(selector).forEach(a => {
        const href = (a.getAttribute("href") || "").toLowerCase();
        if(!href || href.startsWith("http") || href.startsWith("#")) return;

        const file = href.split("/").pop().split("#")[0].split("?")[0];
        a.classList.toggle("active", file === cur);
      });
    };

    mark(".nav a");
    mark(".drawer a");
  }

  function initHeaderScroll(){
    const header = document.getElementById("siteHeader");
    if(!header) return;

    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initDrawer(){
    const drawer = document.getElementById("drawer");
    const backdrop = document.getElementById("drawerBackdrop");
    const openBtn = document.getElementById("openDrawer");
    const closeBtn = document.getElementById("closeDrawer");

    if(!drawer || !backdrop || !openBtn || !closeBtn) return;

    // 초기 aria 상태
    openBtn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");

    let lastFocus = null;
    const focusable = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function trapFocus(e){
      if(e.key !== "Tab") return;

      const items = [...drawer.querySelectorAll(focusable)].filter(el => !el.hasAttribute("disabled"));
      if(items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if(e.shiftKey && document.activeElement === first){
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }

    function closeDrawer(){
      drawer.classList.remove("open");
      backdrop.classList.remove("show");
      document.body.style.overflow = "";

      openBtn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");

      drawer.removeEventListener("keydown", trapFocus);
      window.removeEventListener("keydown", onKeydown);

      if(lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function onKeydown(e){
      if(e.key === "Escape") closeDrawer();
    }

    function openDrawer(){
      lastFocus = document.activeElement;

      drawer.classList.add("open");
      backdrop.classList.add("show");
      document.body.style.overflow = "hidden";

      openBtn.setAttribute("aria-expanded", "true");
      drawer.setAttribute("aria-hidden", "false");

      const first = drawer.querySelector(focusable);
      if(first) first.focus();

      drawer.addEventListener("keydown", trapFocus);
      window.addEventListener("keydown", onKeydown);
    }

    openBtn.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);
  }

  await includePartials();
  setActiveLinks();
  initHeaderScroll();
  initDrawer();
})();
