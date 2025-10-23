frappe.pages["form-manager"].on_page_load = function (wrapper) {
  console.log("✓ Form Manager page loading...");

  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "Form Manager",
    single_column: true,
  });

  // Mount INSIDE the Desk content column (respects left sidebar spacing)
  const $main = $(wrapper).find(".layout-main-section");
  $main.empty().append('<div id="root" class="fr-react-root"></div>');

  // Inject scoped CSS once
  if (!document.getElementById("form-manager-style")) {
    const style = document.createElement("style");
    style.id = "form-manager-style";
    style.textContent = `
      /* Container lives inside the Desk content column */
      .fr-react-root {
        position: relative;
        width: 100%;
        height: 400px; /* real height set below */
        overflow: auto;
      }
      .fr-react-root * { box-sizing: border-box; }

      /* 👇 Neutralize common full-screen utilities inside this page only */
      .fr-react-root .h-screen      { height: 100% !important; }
      .fr-react-root .min-h-screen  { min-height: 100% !important; }
      .fr-react-root .w-screen      { width: 100% !important; }
      .fr-react-root .min-w-screen  { min-width: 100% !important; }
      .fr-react-root .max-w-screen  { max-width: 100% !important; }

      /* If your shell uses fixed/absolute to pin to viewport, unpin it here */
      .fr-react-root .fixed         { position: relative !important; }
      .fr-react-root .absolute      { position: relative !important; inset: auto !important; }

      /* Avoid body/viewport scrolling conflicts under the navbar */
      body { overflow-y: auto; }
    `;
    document.head.appendChild(style);
  }

  // Size #root to fit under the top navbar + this page's header
  adjustReactRootHeight(wrapper);
  window.addEventListener("resize", resizeDebounced(() => adjustReactRootHeight(wrapper)));

  console.log("✓ React root ready:", document.getElementById("root"));

  // Load your Vite assets after the root exists
  loadReactAssets(page);
};

/** Compute available height under the navbar + page head, inside the content column */
function adjustReactRootHeight(wrapper) {
  const pageHeadH =
    $(wrapper).find(".page-head").outerHeight() ||
    $(wrapper).find(".page-head-content").outerHeight() ||
    64;

  const navbarEl =
    document.querySelector(".navbar") ||
    document.querySelector(".navbar-fixed-top");
  const navbarH = navbarEl ? navbarEl.getBoundingClientRect().height : 56;

  const h = Math.max(300, window.innerHeight - pageHeadH - navbarH);
  $("#root").css({ height: `${h}px` });
}

/** Debounce helper */
function resizeDebounced(fn, wait = 100) {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, wait);
  };
}

function loadReactAssets(page) {
  console.log("→ Calling get_assets method...");

  frappe.call({
    method: "dreamlink_forms.dreamlink_forms.page.form_manager.form_manager.get_assets",
    callback(r) {
      console.log("✓ get_assets response:", r);
      if (!r.message) {
        $("#root").html('<div style="padding:20px;color:red;">No assets found (empty response).</div>');
        return;
      }

      const cssFiles = r.message.css || [];
      const jsFiles = r.message.js || [];

      if (cssFiles.length === 0 && jsFiles.length === 0) {
        $("#root").html('<div style="padding:20px;color:red;">No assets returned. Check console.</div>');
        return;
      }

      // Load CSS first
      cssFiles.forEach((href) => {
        if (!$(`link[href="${href}"]`).length) {
          $("<link>", { rel: "stylesheet", type: "text/css", href }).appendTo("head");
        }
      });

      // Then JS (in order)
      loadScripts(jsFiles, 0);
    },
    error(err) {
      console.error("✗ Error calling get_assets:", err);
      $("#root").html('<div style="padding:20px;color:red;">Failed to load assets. See console.</div>');
    },
  });
}

function loadScripts(scripts, i) {
  if (i >= scripts.length) {
    console.log("✓ All scripts processed");
    return;
  }
  const src = scripts[i];

  if ($(`script[src="${src}"]`).length) {
    loadScripts(scripts, i + 1);
    return;
  }

  const el = document.createElement("script");
  el.src = src;
  el.type = "module";
  el.onload = () => loadScripts(scripts, i + 1);
  el.onerror = (e) => {
    console.error("✗ Failed to load script:", src, e);
    loadScripts(scripts, i + 1);
  };
  document.body.appendChild(el);
}
