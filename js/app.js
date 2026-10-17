(function () {
  "use strict";
  const state = { data: null, visuals: null, category: "all", query: "", sort: "default", searchTimer: null };
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const categoryStyle = {
    density: { title: "交联密度", subtitle: "用量与性能的平衡", material: "P(g2T-T) / DtFDA", paper: "2024-yu-nanoenergy-high-loading-dtfda" },
    hyd_sc_xl_net: { title: "亲水双网络", subtitle: "半导体与第二网络", material: "p(g2T-T) / 刷状黏附单体", paper: "2023-wang-science-bap-bioadhesive-dn" },
    hyd_sc_hyd_xl: { title: "亲水单网络", subtitle: "直接交联 OMIEC", material: "PEDOT:PSS / PEGDA / LAP", paper: "2026-vandeburgt-am-pedot-pegda-sin" },
    hyd_sc_no_net: { title: "非交联体系", subtitle: "离子记忆与限域", material: "PEDOT:Tos / PTHF", paper: "2021-rivnay-natcommun-pthf-ion-memory" },
    hyph_sc_hyd_xl: { title: "亲水交联剂", subtitle: "在疏水半导体中引入离子通路", material: "P3HT / 4FPA-2SA-TEG", paper: "2025-chung-acsnano-4fpa-teg-p3ht" },
    hyph_sc_hyd_dn: { title: "疏水双网络", subtitle: "分配离子与电子通路", material: "P3HT / PBTTT / DtFGDA", paper: "2025-feng-smartmat-dtfgda-separated-conduction" },
    swell: { title: "溶胀与结构", subtitle: "分子结构如何影响吸水", material: "聚合物 / 交联剂 / 结晶性", paper: "2018-bao-chemmater-crosslinker-crystallinity" },
  };
  const fieldNames = { structure: "结构配方", oect_conditions: "测试条件", properties: "性质对照", causal_chain: "结构 → 形貌 → 电学", semiconductor: "半导体", semiconductor_type: "半导体类型", crosslinker: "交联剂", crosslinker_amount: "交联剂用量", network_monomer: "网络单体", network_monomer_amount: "单体用量", ratio_sc_monomer_xl: "配方比例", crosslink_type: "交联类型", film_prep: "成膜工艺", notes: "补充", electrolyte: "电解液", solution: "溶液", solvent: "溶剂", ions: "离子", concentration: "浓度", swelling: "溶胀", test_solution: "测试溶液", swelling_ratio: "溶胀率", method: "方法", electrodes: "电极", source_drain: "源 / 漏极", gate: "栅极", geometry: "几何", device: "器件", architecture: "器件结构", channel_dimensions: "沟道尺寸", vds: "漏极电压", vg_range: "栅压范围", conditions_note: "测试条件", states: "对照状态", label: "状态", structure_delta: "结构变化", electrical: "电学", morphology: "形貌", gm: "跨导", gm_notes: "跨导说明", ton: "开启时间", toff: "关闭时间", ion_ioff: "开关比", on_current: "开启电流", cycling: "循环稳定性", vth: "阈值电压", stability_other: "其他稳定性", sem: "SEM", tem: "TEM", afm: "AFM", uvvis: "UV-vis", wettability: "润湿性", xrd_giwaxs: "XRD / GIWAXS", ftir_xps: "FTIR / XPS", swelling_in_situ: "原位溶胀", other: "其他表征", before_after_summary: "前后变化", structure_to_morphology: "结构 → 形貌", morphology_to_electrical: "形貌 → 电学", net_effect: "设计结论", evidence_quality: "证据强度", design_takeaways: "可借鉴点", limitations: "局限", quote_evidence: "原文证据", page: "PDF 页码", text: "原文", why: "支持的结论", structural_knobs: "结构旋钮", morphology_effects: "形貌变化", electrical_effects: "电学变化", question: "设计问题", recipe_notes: "配方共性", open_questions: "未决问题" };

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }
  function shortText(value, length = 60) {
    const text = String(value || "");
    return text.length > length ? text.slice(0, length) + "…" : text;
  }
  function isMissing(value) {
    return !value || /^(未报道|未报告|—|-)\s*$/.test(String(value).trim());
  }
  function pdfUrl(paper, page) {
    return "assets/pdf/" + encodeURIComponent(paper.pdf.split("/").pop()) + (page ? "#page=" + page : "");
  }
  function visualFor(paper) {
    return state.visuals.papers[paper.id] || { figures: [], charts: [] };
  }
  function structureFor(paper) {
    return visualFor(paper).figures.find((figure) => figure.kind === "structure");
  }
  function paperTitle(paper) {
    return paper.short_name.replace(/^\d{4}\s+\S+\s+\S+\s*/, "") || paper.title_cn || paper.short_name;
  }
  function previewImage(paper) {
    const figure = structureFor(paper);
    return figure ? `<img src="${escapeText(figure.src)}" alt="${escapeText(figure.label)}" loading="lazy" decoding="async">` : `<span class="paper-no-image"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 6h17l8 8v28H12zM29 6v9h8M18 25h13M18 31h10"/></svg>在原文中查看结构</span>`;
  }
  function renderAtlas() {
    select("#atlas-grid").innerHTML = state.data.categories.map((category) => {
      const style = categoryStyle[category.id];
      return `<a class="atlas-tile" href="#${escapeText(category.id)}"><div class="tile-header"><div><h2>${escapeText(style.title)}</h2><p>${escapeText(style.subtitle)}</p></div><span class="tile-count">${category.papers.length} 篇</span></div><div class="tile-image">${previewImage(state.data.papers[style.paper])}</div><div class="tile-footer"><span class="material-label">${escapeText(style.material)}</span><span class="tile-arrow" aria-hidden="true">↗</span></div></a>`;
    }).join("");
    select("#library-count").innerHTML = `<b>${Object.keys(state.data.papers).length}</b> 篇文献 <span aria-hidden="true"> / </span> <b>${state.data.categories.length}</b> 类方案`;
  }
  function renderFilters() {
    select("#filters").innerHTML = [{ id: "all", title: "全部", count: Object.keys(state.data.papers).length }, ...state.data.categories.map((category) => ({ id: category.id, title: categoryStyle[category.id].title, count: category.papers.length }))].map((category) => `<button type="button" class="filter" data-category="${escapeText(category.id)}" aria-pressed="${state.category === category.id}">${escapeText(category.title)}<span>${category.count}</span></button>`).join("");
  }
  function renderGuide(category) {
    const guide = select("#category-guide");
    guide.open = false;
    guide.hidden = !category?.has_design_rules;
    if (guide.hidden) return;
    const rules = category.design_rules || {};
    select("#guide-content").innerHTML = `<div class="guide-columns">${[["结构", rules.structural_knobs], ["形貌", rules.morphology_effects], ["电学", rules.electrical_effects]].map(([label, values]) => `<div><h3>${label}</h3><p>${(values || []).map(escapeText).join("<br>")}</p></div>`).join("")}</div><details class="note-fold"><summary>完整设计规则</summary>${renderFields(rules)}</details>`;
  }
  function renderCards() {
    const category = state.data.categories.find((entry) => entry.id === state.category);
    const keywords = state.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let papers = (category ? category.papers.map((paperId) => state.data.papers[paperId]) : Object.values(state.data.papers)).filter(Boolean);
    papers = papers.filter((paper) => keywords.every((keyword) => JSON.stringify(paper).toLocaleLowerCase().includes(keyword)));
    if (state.sort === "newest") papers.sort((first, second) => second.year - first.year);
    if (state.sort === "oldest") papers.sort((first, second) => first.year - second.year);
    select("#library-title").textContent = keywords.length ? "搜索结果" : category ? categoryStyle[category.id].title : "全部文献";
    select("#library-subtitle").textContent = `${papers.length} 篇${keywords.length ? " · " + state.query : category ? " · " + categoryStyle[category.id].subtitle : " · 从结构进入精读"}`;
    select("#empty-state").hidden = papers.length !== 0;
    select("#paper-grid").innerHTML = papers.map((paper) => {
      const structure = paper.structure || {};
      const visual = visualFor(paper);
      const tags = [visual.materials?.semiconductor || structure.semiconductor, visual.materials?.crosslinker || structure.crosslinker].filter((value) => !isMissing(value) && !/^无|^未报道/.test(value));
      return `<article class="paper-card"><button type="button" class="paper-preview" data-paper="${escapeText(paper.id)}" aria-label="精读：${escapeText(paper.short_name)}"><div class="paper-preview-image">${previewImage(paper)}</div><div class="paper-card-body"><div class="paper-kicker"><span>${escapeText(paper.year)} / ${escapeText(paper.journal)}</span></div><h2>${escapeText(paperTitle(paper))}</h2><div class="paper-materials">${tags.map((tag, index) => `<span class="tag ${index ? "violet" : ""}" title="${escapeText(tag)}">${escapeText(shortText(tag, 24))}</span>`).join("")}</div></div></button><div class="card-foot"><span class="${visual.charts.length ? "visual-badge" : ""}">${visual.charts.length ? visual.charts.length + " 组数据图" : structureFor(paper) ? "原文化学结构" : "完整精读"}</span><a href="${pdfUrl(paper)}" target="_blank" rel="noopener" aria-label="打开 ${escapeText(paper.short_name)} 的 PDF">原文 ↗</a></div></article>`;
    }).join("");
    renderFilters();
    renderGuide(category);
  }
  function renderFields(value) {
    if (Array.isArray(value)) return value.map((entry, index) => typeof entry === "object" ? `<div class="nested-group"><h4>${escapeText(entry.label || "记录 " + (index + 1))}</h4>${renderFields(entry)}</div>` : `<p>${escapeText(entry)}</p>`).join("");
    if (value && typeof value === "object") return `<dl class="data-group">${Object.entries(value).filter(([, entry]) => entry !== "" && entry != null).map(([key, entry]) => `<dt>${escapeText(fieldNames[key] || key)}</dt><dd>${typeof entry === "object" ? renderFields(entry) : escapeText(entry)}</dd>`).join("")}</dl>`;
    return escapeText(value);
  }
  function figureHTML(paper, figure) {
    return `<figure class="figure-block"><button type="button" class="figure-button" data-enlarge="${escapeText(figure.src)}" data-caption="${escapeText(figure.label + ' · PDF p.' + figure.page)}" aria-label="放大 ${escapeText(figure.label)}"><img src="${escapeText(figure.src)}" alt="${escapeText(figure.label)}" decoding="async"></button><figcaption><span>${escapeText(figure.label)}</span><a href="${pdfUrl(paper, figure.page)}" target="_blank" rel="noopener">原文 p.${figure.page} ↗</a></figcaption></figure>`;
  }
  function emptyPanel(paper, text) {
    return `<div class="panel-empty">${escapeText(text)}<a href="${pdfUrl(paper)}" target="_blank" rel="noopener">打开原文 PDF ↗</a></div>`;
  }
  function structurePanel(paper) {
    const structure = paper.structure || {};
    const materials = visualFor(paper).materials || {};
    const figure = structureFor(paper);
    return `<div class="structure-layout"><div>${figure ? figureHTML(paper, figure) : emptyPanel(paper, "化学结构请以原文为准")}</div><dl class="composition">${[["半导体", materials.semiconductor || shortText(structure.semiconductor, 60)], ["交联剂", materials.crosslinker || shortText(structure.crosslinker, 60)], ["网络单体 / 组分", materials.monomer || shortText(structure.network_monomer, 50)], ["配方", structure.ratio_sc_monomer_xl]].filter(([, value]) => value && value !== "未报道").map(([label, value]) => `<div><dt>${label}</dt><dd class="${label === '配方' ? 'recipe' : ''}">${escapeText(value)}</dd></div>`).join("")}</dl></div><details class="note-fold"><summary>配方与测试条件</summary>${renderFields({ structure: paper.structure, oect_conditions: paper.oect_conditions })}</details>`;
  }
  function morphologyPanel(paper) {
    const figure = visualFor(paper).figures.find((entry) => entry.domains?.includes("morphology"));
    const observations = [];
    for (const property of (paper.properties?.states || [])) {
      for (const [key, value] of Object.entries(property.morphology || {})) {
        if (!isMissing(value) && !/^未报道/.test(value) && observations.length < 4) observations.push({ label: fieldNames[key] || key, value });
      }
    }
    return `<div class="morphology-layout"><div>${figure ? figureHTML(paper, figure) : emptyPanel(paper, "原始表征图见文献")}</div><div class="morphology-observations">${observations.map((observation) => `<div class="observation"><strong>${escapeText(observation.label)}</strong><p>${escapeText(shortText(observation.value, 140))}</p></div>`).join("")}</div></div><details class="note-fold"><summary>结构 → 形貌：证据与解释</summary>${renderFields({ structure_to_morphology: paper.causal_chain?.structure_to_morphology, morphology_to_electrical: paper.causal_chain?.morphology_to_electrical })}</details>`;
  }
  function chartHTML(paper, chart) {
    return `<section class="chart-card"><h3>${escapeText(chart.title)}<span class="chart-unit">${escapeText(chart.unit)}</span></h3>${window.OectCharts.render(chart)}<p class="chart-conditions">${escapeText(chart.condition)}</p><a class="chart-source" href="${pdfUrl(paper, chart.page)}" target="_blank" rel="noopener">原文 p.${chart.page} ↗</a><details class="chart-data"><summary>数值与来源</summary><table><thead><tr><th>状态</th><th>${escapeText(chart.unit)}</th></tr></thead><tbody>${chart.points.map((point) => `<tr><td>${escapeText(point.label)}</td><td>${window.OectCharts.number(point.value)}${point.error == null ? "" : " ± " + window.OectCharts.number(point.error)}</td></tr>`).join("")}</tbody></table>${[...new Set(chart.points.map((point) => point.source_text))].map((text) => `<p>${escapeText(text)}</p>`).join("")}</details></section>`;
  }
  function electricalPanel(paper) {
    const visual = visualFor(paper);
    const evidence = visual.figures.filter((entry) => entry.domains?.includes("electrical"));
    return `${visual.charts.length ? `<div class="chart-grid">${visual.charts.map((chart) => chartHTML(paper, chart)).join("")}</div>` : evidence.length ? `<div class="evidence-gallery">${evidence.map((figure) => figureHTML(paper, figure)).join("")}</div><p class="chart-conditions">原文图保留原始量纲；可核对的数值见完整精读。</p>` : emptyPanel(paper, "当前精读未整理可直接比较的定量图")}${paper.causal_chain?.net_effect ? `<details class="note-fold"><summary>设计结论</summary><p class="reading-note">${escapeText(paper.causal_chain.net_effect)}</p></details>` : ""}`;
  }
  function openPaper(paperId) {
    const paper = state.data.papers[paperId];
    if (!paper) return;
    select("#paper-content").innerHTML = `<header class="paper-dialog-header"><div class="paper-kicker"><span>${escapeText(paper.year)}</span><span>${escapeText(paper.journal)}</span><span>${escapeText(paper.corr_author || paper.authors)}</span></div><h2 id="paper-title">${escapeText(paperTitle(paper))}</h2><p class="paper-full-title">${escapeText(paper.title_en)}</p><button type="button" class="icon-button dialog-close" data-close-paper aria-label="关闭精读">×</button></header><div class="reading-tabs" role="tablist" aria-label="精读视角">${["结构", "形貌", "电学"].map((label, index) => `<button type="button" class="reading-tab" id="tab-${index}" role="tab" aria-selected="${index === 0}" aria-controls="panel-${index}" tabindex="${index === 0 ? 0 : -1}" data-panel="${index}"><span aria-hidden="true">${index + 1}</span>${label}</button>`).join("")}</div>${[structurePanel(paper), morphologyPanel(paper), electricalPanel(paper)].map((content, index) => `<section class="paper-panel" id="panel-${index}" role="tabpanel" aria-labelledby="tab-${index}" ${index ? "hidden" : ""}>${content}</section>`).join("")}<details class="full-notes"><summary>完整精读、条件与原文证据</summary><div class="note-section">${renderFields({ structure: paper.structure, oect_conditions: paper.oect_conditions, properties: paper.properties, causal_chain: paper.causal_chain, design_takeaways: paper.design_takeaways, limitations: paper.limitations, quote_evidence: paper.quote_evidence })}</div></details><footer class="paper-dialog-footer"><a href="${paper.doi ? 'https://doi.org/' + encodeURI(paper.doi) : pdfUrl(paper)}" target="_blank" rel="noopener">${paper.doi ? "DOI / 出版商 ↗" : "原始文献 ↗"}</a><a class="pdf-button" href="${pdfUrl(paper)}" target="_blank" rel="noopener">打开原文 PDF</a></footer>`;
    const dialog = select("#paper-dialog");
    select(".note-section", dialog).insertAdjacentHTML("afterbegin", renderFields({ "中文标题": paper.title_cn, "原文标题": paper.title_en, "作者": paper.authors, "通讯作者": paper.corr_author, "DOI": paper.doi }));
    const supplement = visualFor(paper).supplement;
    if (supplement) {
      const supplementLink = document.createElement("a");
      supplementLink.href = pdfUrl({ pdf: supplement });
      supplementLink.target = "_blank";
      supplementLink.rel = "noopener";
      supplementLink.textContent = "补充信息 SI ↗";
      select(".paper-dialog-footer", dialog).insertBefore(supplementLink, select(".pdf-button", dialog));
    }
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  function activatePanel(panelIndex) {
    selectAll(".reading-tab").forEach((tab) => {
      const active = tab.dataset.panel === String(panelIndex);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    selectAll(".paper-panel").forEach((panel, index) => { panel.hidden = index !== Number(panelIndex); });
  }
  function route() {
    const categoryId = decodeURIComponent(location.hash.slice(1) || "about");
    const atlas = categoryId === "about" && !state.query;
    state.category = state.data.categories.some((category) => category.id === categoryId) ? categoryId : "all";
    select("#atlas-view").hidden = !atlas;
    select("#library-view").hidden = atlas;
    selectAll("[data-nav]").forEach((link) => {
      if ((link.dataset.nav === "about") === atlas) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (!atlas) renderCards();
  }
  function wireEvents() {
    select("#search").addEventListener("input", (event) => {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => { state.query = event.target.value; route(); }, 120);
    });
    select("#sort").addEventListener("change", (event) => { state.sort = event.target.value; renderCards(); });
    document.addEventListener("click", (event) => {
      const category = event.target.closest("[data-category]");
      if (category) { location.hash = category.dataset.category; return; }
      const paper = event.target.closest("[data-paper]");
      if (paper) { openPaper(paper.dataset.paper); return; }
      if (event.target.closest("[data-close-paper]")) select("#paper-dialog").close();
      if (event.target.closest("[data-close-image]")) select("#image-dialog").close();
      const figure = event.target.closest("[data-enlarge]");
      if (figure) {
        select("#large-image").src = figure.dataset.enlarge;
        select("#large-image").alt = figure.dataset.caption;
        select("#large-image-caption").textContent = figure.dataset.caption;
        select("#image-dialog").showModal();
      }
      const tab = event.target.closest("[data-panel]");
      if (tab) activatePanel(tab.dataset.panel);
      if (event.target.closest("[data-nav],.brand")) { select("#search").value = ""; state.query = ""; route(); }
    });
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); select("#search").focus(); }
      if (event.target.matches("[role=tab]") && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const current = Number(event.target.dataset.panel);
        const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (current + (event.key === "ArrowRight" ? 1 : 2)) % 3;
        activatePanel(next);
        select("#tab-" + next).focus();
      }
    });
    selectAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }));
    window.addEventListener("hashchange", route);
  }
  async function boot() {
    try {
      const [paperResponse, visualResponse] = await Promise.all([fetch("data/papers.json"), fetch("data/visuals.json?v=2")]);
      if (!paperResponse.ok || !visualResponse.ok) throw new Error("Data request failed");
      state.data = await paperResponse.json();
      state.visuals = await visualResponse.json();
      renderAtlas();
      wireEvents();
      route();
    } catch (error) {
      select("#load-error").hidden = false;
      select("#library-count").textContent = "加载失败";
      console.error(error);
    }
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
