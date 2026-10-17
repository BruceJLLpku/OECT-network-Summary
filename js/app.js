/* OECT 网络设计文献库 — app */
(function () {
  "use strict";

  const state = {
    data: null,
    category: null,
    mode: "about", // about | category | search
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function isNA(v) {
    if (v == null) return true;
    const s = String(v).trim();
    return s === "" || s === "未报道" || s === "-" || s === "—";
  }

  function cell(v) {
    if (isNA(v)) return '<span class="na">未报道</span>';
    return esc(v);
  }

  function pdfUrl(name) {
    if (!name) return null;
    const base = name.split("/").pop();
    return "assets/pdf/" + encodeURIComponent(base);
  }

  /* ---------- boot ---------- */
  async function boot() {
    try {
      const res = await fetch("data/papers.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      state.data = await res.json();
    } catch (err) {
      $("#library-status").textContent = "文献库加载失败：" + err.message;
      return;
    }
    renderSidebar();
    renderAbout();
    wireChrome();
    routeFromHash();
    window.addEventListener("hashchange", routeFromHash);
    $("#library-status").innerHTML =
      "共 <strong>" + Object.keys(state.data.papers || {}).length +
      "</strong> 篇 · <strong>" + (state.data.categories || []).length + "</strong> 类设计";
  }

  /* ---------- sidebar / about ---------- */
  function renderSidebar() {
    const nav = $("#categories");
    const cats = state.data.categories || [];
    nav.innerHTML = cats.map((c) => {
      const n = (c.papers || []).length;
      return `<button type="button" class="category" data-cat="${esc(c.id)}">
        <span>${esc(c.name)}</span><span class="count">${n}</span>
      </button>`;
    }).join("");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      location.hash = "#" + btn.getAttribute("data-cat");
      closeSidebar();
    });

    const sel = $("#search-topic");
    if (sel) {
      sel.innerHTML = '<option value="all">全部方案</option>' +
        cats.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    }
  }

  function renderAbout() {
    const wrap = $("#about");
    const cats = state.data.categories || [];
    wrap.innerHTML = cats.map((c) => {
      const n = (c.papers || []).length;
      const intent = (c.design_rules && c.design_rules.question) || c.summary || "";
      return `<a class="cat-tile" href="#${esc(c.id)}">
        <h3>${esc(c.name)}</h3>
        <p>${esc(intent.slice(0, 64))}${intent.length > 64 ? "…" : ""}</p>
        <span class="n">${n} 篇</span>
      </a>`;
    }).join("");
  }

  function setActiveCategory(id) {
    $$(".category").forEach((el) => {
      const on = el.getAttribute("data-cat") === id;
      el.setAttribute("aria-current", on ? "true" : "false");
    });
    $("#about-link").removeAttribute("aria-current");
    if (id == null) $("#about-link").setAttribute("aria-current", "page");
  }

  /* ---------- category view ---------- */
  function renderCategory(catId) {
    const cat = (state.data.categories || []).find((c) => c.id === catId);
    if (!cat) { location.hash = "#about"; return; }

    state.mode = "category";
    state.category = catId;
    setActiveCategory(catId);

    $("#introduction").hidden = true;
    $("#search-view").hidden = true;
    $("#category-view").hidden = false;

    $("#topic-title").textContent = cat.name;
    $("#topic-lede").textContent = cat.summary || cat.design_rules?.question || "";
    $("#topic-meta").innerHTML = [
      `<span class="chip">${(cat.papers || []).length} 篇文献</span>`,
      cat.design_rules?.crosslink_type ? `<span class="chip alt">${esc(cat.design_rules.crosslink_type)}</span>` : "",
    ].join("");

    const actions = $("#topic-actions");
    const firstPdf = (cat.papers || [])
      .map((id) => state.data.papers?.[id])
      .filter(Boolean)
      .find((p) => p.pdf);
    actions.innerHTML = firstPdf
      ? `<a class="btn" href="${pdfUrl(firstPdf.pdf)}" target="_blank" rel="noopener">打开本类 PDF 目录</a>`
      : "";

    const hasRules = !!(cat.has_design_rules || (cat.design_rules && cat.design_rules.question));
    $("#design-rules").hidden = !hasRules;
    if (hasRules) renderDesignRules(cat);
    renderPaperList($("#paper-list"), (cat.papers || []).map((id) => state.data.papers?.[id]).filter(Boolean));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function renderDesignRules(cat) {
    const dr = cat.design_rules || {};
    $("#dr-question").textContent = dr.question || cat.summary || "";
    const cards = [
      { h: "结构旋钮", items: dr.structural_knobs || [], wide: false },
      { h: "形貌后果", items: dr.morphology_effects || [], wide: false },
      { h: "电学后果", items: dr.electrical_effects || [], wide: false },
      { h: "配方共性", items: dr.recipe_notes ? [dr.recipe_notes] : [], wide: false },
      { h: "未决问题", items: dr.open_questions ? [dr.open_questions] : [], wide: true },
    ];
    $("#dr-grid").innerHTML = cards.filter((c) => c.items.length).map((c) => `
      <div class="dr-card${c.wide ? " wide" : ""}">
        <h3>${esc(c.h)}</h3>
        ${c.items.length === 1
          ? `<p>${esc(c.items[0])}</p>`
          : `<ul>${c.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`}
      </div>`).join("");
    $("#dr-causal").innerHTML = `<strong>因果链：</strong>${esc(dr.causal_chain || "（待补）")}`;
  }

  /* ---------- paper cards ---------- */
  function renderPaperList(container, papers) {
    if (!papers.length) {
      container.innerHTML = `<p class="search-status">本类暂无文献。</p>`;
      return;
    }
    container.innerHTML = papers.map((p, i) => paperCardHTML(p, i)).join("");
  }

  function paperCardHTML(p, i) {
    const pdf = pdfUrl(p.pdf);
    const st = p.structure || {};
    const oc = p.oect_conditions || {};
    const pr = p.properties || {};
    const cc = p.causal_chain || {};
    const states = pr.states || [];

    return `<details class="paper-card" id="paper-${esc(p.id)}">
      <summary>
        <div>
          <h3 class="pc-title">${esc(p.short_name || p.title_cn || p.title_en || p.id)}</h3>
          ${p.title_en ? `<p class="pc-title-en">${esc(p.title_en)}</p>` : ""}
          <div class="pc-meta">
            <span class="tag">${esc(p.year || "—")}</span>
            <span class="tag">${esc(p.journal || "—")}</span>
            <span>${esc(p.authors || "")}</span>
            ${p.doi ? `<span>DOI: ${esc(p.doi)}</span>` : ""}
          </div>
        </div>
        <span class="pc-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </summary>
      <div class="pc-body">
        ${p.design_intent ? `<p style="margin:12px 0 0;font-size:13.5px;line-height:1.85;color:#3a4a52"><strong>设计意图：</strong>${esc(p.design_intent)}</p>` : ""}

        <section class="pc-section">
          <h3>结构配方</h3>
          <table class="field-table">
            <tr><th>半导体</th><td>${cell(st.semiconductor)}${st.semiconductor_type ? ` <span class="tag">${esc(st.semiconductor_type)}</span>` : ""}</td></tr>
            <tr><th>交联剂</th><td>${cell(st.crosslinker)}</td></tr>
            <tr><th>交联剂用量</th><td>${cell(st.crosslinker_amount)}</td></tr>
            <tr><th>网络单体</th><td>${cell(st.network_monomer)}</td></tr>
            <tr><th>网络单体用量</th><td>${cell(st.network_monomer_amount)}</td></tr>
            <tr><th>比例 SC : 单体 : 交联</th><td>${cell(st.ratio_sc_monomer_xl)}</td></tr>
            <tr><th>交联类型</th><td>${cell(st.crosslink_type)}</td></tr>
            <tr><th>成膜/制备</th><td>${cell(st.film_prep)}</td></tr>
            ${st.notes ? `<tr><th>配方备注</th><td>${cell(st.notes)}</td></tr>` : ""}
          </table>
        </section>

        <section class="pc-section">
          <h3>OECT 条件</h3>
          <div class="subgrid">
            <div class="subcard">
              <h5>工作电解液</h5>
              <dl>
                <dt>溶液</dt><dd>${cell(oc.electrolyte?.solution)}</dd>
                <dt>溶剂</dt><dd>${cell(oc.electrolyte?.solvent)}</dd>
                <dt>离子</dt><dd>${cell(oc.electrolyte?.ions)}</dd>
                <dt>浓度</dt><dd>${cell(oc.electrolyte?.concentration)}</dd>
              </dl>
            </div>
            <div class="subcard">
              <h5>溶胀</h5>
              <dl>
                <dt>测试溶液</dt><dd>${cell(oc.swelling?.test_solution)}</dd>
                <dt>溶胀率</dt><dd>${cell(oc.swelling?.swelling_ratio)}</dd>
                <dt>方法</dt><dd>${cell(oc.swelling?.method)}</dd>
                <dt>备注</dt><dd>${cell(oc.swelling?.notes)}</dd>
              </dl>
            </div>
            <div class="subcard">
              <h5>电极</h5>
              <dl>
                <dt>源/漏</dt><dd>${cell(oc.electrodes?.source_drain)}</dd>
                <dt>栅极</dt><dd>${cell(oc.electrodes?.gate)}</dd>
                <dt>几何</dt><dd>${cell(oc.electrodes?.geometry)}</dd>
              </dl>
            </div>
            <div class="subcard">
              <h5>器件</h5>
              <dl>
                <dt>结构</dt><dd>${cell(oc.device?.architecture)}</dd>
                <dt>沟道</dt><dd>${cell(oc.device?.channel_dimensions)}</dd>
                <dt>V<sub>DS</sub></dt><dd>${cell(oc.device?.vds)}</dd>
                <dt>V<sub>G</sub> 范围</dt><dd>${cell(oc.device?.vg_range)}</dd>
              </dl>
            </div>
          </div>
        </section>

        <section class="pc-section">
          <h3>性质对照${pr.before_after_summary ? "" : "（分状态）"}</h3>
          ${pr.before_after_summary ? `<p style="margin:0 0 12px;font-size:13.5px;line-height:1.85">${esc(pr.before_after_summary)}</p>` : ""}
          ${pr.conditions_note ? `<p style="margin:0 0 12px;font-size:12px;color:#697780">${esc(pr.conditions_note)}</p>` : ""}
          ${states.map(stateBlockHTML).join("")}
        </section>

        <section class="pc-section">
          <h3>因果链</h3>
          <div class="causal-box">
            <h4>结构 → 形貌 → 电学</h4>
            <ol>
              <li><strong>结构 → 形貌：</strong>${cell(cc.structure_to_morphology)}</li>
              <li><strong>形貌 → 电学：</strong>${cell(cc.morphology_to_electrical)}</li>
              <li><strong>净效果：</strong>${cell(cc.net_effect)}</li>
            </ol>
            ${cc.evidence_quality ? `<p style="margin:10px 0 0;font-size:12px;color:#697780">证据强度：${esc(cc.evidence_quality)}</p>` : ""}
          </div>
        </section>

        ${takeawaysHTML(p)}
        ${quotesHTML(p)}

        <div class="pc-actions">
          ${pdf ? `<a class="btn primary" href="${pdf}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>
            下载原文 PDF
          </a>` : ""}
          ${p.doi ? `<a class="btn" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ""}
          <button class="btn" type="button" data-copy-cite="${esc(p.short_name || p.id)}">复制引用名</button>
        </div>
      </div>
    </details>`;
  }

  function stateBlockHTML(s) {
    const e = s.electrical || {};
    const m = s.morphology || {};
    return `<div class="state-block">
      <h4>${esc(s.label || "状态")}</h4>
      ${s.structure_delta ? `<p class="delta">结构差异：${esc(s.structure_delta)}</p>` : ""}
      <div class="subgrid">
        <div class="subcard">
          <h5>电学</h5>
          <dl>
            <dt>g<sub>m</sub></dt><dd>${cell(e.gm)}</dd>
            <dt>g<sub>m</sub>备注</dt><dd>${cell(e.gm_notes)}</dd>
            <dt>t<sub>on</sub></dt><dd>${cell(e.ton)}</dd>
            <dt>t<sub>off</sub></dt><dd>${cell(e.toff)}</dd>
            <dt>I<sub>on</sub>/I<sub>off</sub></dt><dd>${cell(e.ion_ioff)}</dd>
            <dt>开启电流</dt><dd>${cell(e.on_current)}</dd>
            <dt>V<sub>th</sub></dt><dd>${cell(e.vth)}</dd>
            <dt>循环稳定性</dt><dd>${cell(e.cycling)}</dd>
            <dt>其他稳定性</dt><dd>${cell(e.stability_other)}</dd>
          </dl>
        </div>
        <div class="subcard">
          <h5>形貌 / 表征</h5>
          <dl>
            <dt>SEM</dt><dd>${cell(m.sem)}</dd>
            <dt>TEM</dt><dd>${cell(m.tem)}</dd>
            <dt>AFM</dt><dd>${cell(m.afm)}</dd>
            <dt>UV-vis</dt><dd>${cell(m.uvvis)}</dd>
            <dt>亲疏水</dt><dd>${cell(m.wettability)}</dd>
            <dt>XRD/GIWAXS</dt><dd>${cell(m.xrd_giwaxs)}</dd>
            <dt>FTIR/XPS</dt><dd>${cell(m.ftir_xps)}</dd>
            <dt>原位溶胀</dt><dd>${cell(m.swelling_in_situ)}</dd>
            <dt>其他</dt><dd>${cell(m.other)}</dd>
          </dl>
        </div>
      </div>
    </div>`;
  }

  function takeawaysHTML(p) {
    const t = p.design_takeaways || [];
    const lim = p.limitations || [];
    if (!t.length && !lim.length) return "";
    return `<div class="takeaways">
      <h4>可借鉴点 / 局限</h4>
      ${t.length ? `<ul>${t.map((x) => `<li>✓ ${esc(x)}</li>`).join("")}</ul>` : ""}
      ${lim.length ? `<ul>${lim.map((x) => `<li>！ ${esc(x)}</li>`).join("")}</ul>` : ""}
    </div>`;
  }

  function quotesHTML(p) {
    const qs = p.quote_evidence || [];
    if (!qs.length) return "";
    return `<div class="quotes">
      <h4>原文证据</h4>
      ${qs.map((q) => `
        <div class="quote-item">
          <p class="en">“${esc(q.text)}”${q.page ? ` <span style="color:#697780;font-style:normal">— p.${esc(q.page)}</span>` : ""}</p>
          ${q.why ? `<p class="why">支撑：${esc(q.why)}</p>` : ""}
        </div>`).join("")}
    </div>`;
  }

  /* ---------- search ---------- */
  function paperSearchBlob(p) {
    const parts = [
      p.id, p.short_name, p.title_en, p.title_cn, p.authors, p.corr_author,
      p.journal, p.doi, p.design_intent, p.category_id,
    ];
    const st = p.structure || {};
    parts.push(st.semiconductor, st.crosslinker, st.crosslinker_amount,
      st.network_monomer, st.ratio_sc_monomer_xl, st.crosslink_type, st.film_prep, st.notes);
    const oc = p.oect_conditions || {};
    parts.push(oc.electrolyte?.solution, oc.electrolyte?.solvent, oc.electrolyte?.ions,
      oc.swelling?.test_solution, oc.swelling?.swelling_ratio,
      oc.electrodes?.source_drain, oc.electrodes?.gate, oc.device?.architecture);
    const pr = p.properties || {};
    parts.push(pr.before_after_summary, pr.conditions_note);
    (pr.states || []).forEach((s) => {
      parts.push(s.label, s.structure_delta);
      const e = s.electrical || {};
      parts.push(e.gm, e.ton, e.toff, e.ion_ioff, e.on_current, e.cycling, e.stability_other);
      const m = s.morphology || {};
      parts.push(m.sem, m.tem, m.afm, m.uvvis, m.wettability, m.xrd_giwaxs, m.other);
    });
    const cc = p.causal_chain || {};
    parts.push(cc.structure_to_morphology, cc.morphology_to_electrical, cc.net_effect);
    parts.push(...(p.design_takeaways || []), ...(p.limitations || []));
    return parts.filter(Boolean).join("\n").toLowerCase();
  }

  function runSearch(query, topicId) {
    const q = String(query || "").trim().toLowerCase();
    const keys = q.split(/\s+/).filter(Boolean);
    const papers = Object.values(state.data.papers || {});
    const hits = papers.filter((p) => {
      if (topicId && topicId !== "all" && p.category_id !== topicId) return false;
      if (!keys.length) return true;
      const blob = paperSearchBlob(p);
      return keys.every((k) => blob.includes(k));
    });
    return hits;
  }

  function highlight(text, keys) {
    let out = esc(text);
    keys.forEach((k) => {
      if (!k) return;
      const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      out = out.replace(re, (m) => `<mark>${m}</mark>`);
    });
    return out;
  }

  function openSearch() {
    $("#search-dialog").showModal();
    setTimeout(() => $("#search-input").focus(), 30);
  }

  function wireSearch() {
    const form = $("#search-form");
    const input = $("#search-input");
    const status = $("#search-status");
    const results = $("#search-results");

    function doSearch() {
      const q = input.value.trim();
      const topic = $("#search-topic").value;
      const keys = q.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = runSearch(q, topic);
      if (!keys.length) {
        status.textContent = "输入关键词，搜索全部文献。";
        results.innerHTML = "";
        return;
      }
      status.textContent = `找到 ${hits.length} 篇`;
      results.innerHTML = hits.map((p) => {
        const cat = (state.data.categories || []).find((c) => c.id === p.category_id);
        return `<button type="button" class="result-item" data-goto="${esc(p.id)}" data-cat="${esc(p.category_id)}">
          <div class="r-title">${highlight(p.short_name || p.title_en || p.id, keys)}</div>
          <div class="r-meta">${esc(cat?.name || p.category_id)} · ${esc(p.year || "")} · ${esc(p.journal || "")}</div>
          <div class="r-snippet">${highlight(p.causal_chain?.net_effect || p.design_intent || p.structure?.semiconductor || "", keys)}</div>
        </button>`;
      }).join("") || `<p class="search-help">没有命中。试试材料缩写或交联剂名。</p>`;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      doSearch();
    });
    input.addEventListener("input", () => {
      if (input.value.trim().length >= 2 || input.value.trim() === "") doSearch();
    });

    results.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-goto]");
      if (!btn) return;
      $("#search-dialog").close();
      const cat = btn.getAttribute("data-cat");
      const id = btn.getAttribute("data-goto");
      location.hash = "#" + cat;
      setTimeout(() => {
        const el = document.getElementById("paper-" + id);
        if (el) {
          el.open = true;
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    });

    $("#search-close").addEventListener("click", () => $("#search-dialog").close());
    $("#search-launch").addEventListener("click", openSearch);
  }

  /* ---------- chrome ---------- */
  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    const ov = $("#overlay");
    ov.classList.remove("open");
    ov.hidden = true;
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }

  function wireChrome() {
    wireSearch();

    $("#menu-toggle").addEventListener("click", () => {
      const sb = $("#sidebar");
      const open = !sb.classList.contains("open");
      sb.classList.toggle("open", open);
      const ov = $("#overlay");
      ov.hidden = !open;
      ov.classList.toggle("open", open);
      $("#menu-toggle").setAttribute("aria-expanded", String(open));
    });
    $("#overlay").addEventListener("click", closeSidebar);
    $$("[data-close-panel]").forEach((b) => b.addEventListener("click", closeSidebar));

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") closeSidebar();
    });

    document.addEventListener("click", (e) => {
      const copy = e.target.closest("[data-copy-cite]");
      if (!copy) return;
      const name = copy.getAttribute("data-copy-cite") || "";
      navigator.clipboard?.writeText(name).then(() => {
        copy.textContent = "已复制";
        setTimeout(() => { copy.textContent = "复制引用名"; }, 1200);
      });
    });

    $("#back-from-search")?.addEventListener("click", () => {
      location.hash = state.category ? "#" + state.category : "#about";
    });
  }

  /* ---------- routing ---------- */
  function routeFromHash() {
    const h = (location.hash || "#about").replace(/^#/, "");
    if (h === "about" || h === "") {
      state.mode = "about";
      state.category = null;
      setActiveCategory(null);
      $("#introduction").hidden = false;
      $("#category-view").hidden = true;
      $("#search-view").hidden = true;
      return;
    }
    renderCategory(h);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
