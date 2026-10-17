import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "data/papers.json").read_text(encoding="utf-8"))
PAPERS = list(DATA["papers"].values())
VISUALS = {"version": 1, "papers": {}}


def figure(paper_index, kind, page, crop, label):
    paper = PAPERS[paper_index]
    record = VISUALS["papers"].setdefault(paper["id"], {"figures": [], "charts": []})
    record["figures"].append({"kind": kind, "page": page, "crop": crop, "label": label, "src": f"assets/figures/{paper['id']}-{kind}-{len(record['figures'])}.webp"})


STRUCTURES = [
    (0, 2, [.69, .116, .91, .175], "GOPS · Fig. 1 插图"),
    (1, 6, [.12, .06, .38, .19], "Homo-gDPP · Fig. 5a"),
    (2, 3, [.50, .065, .94, .23], "DtFDA 光交联反应 · Fig. 1c"),
    (3, 4, [.08, .09, .92, .255], "PBFDO 与 PR · Fig. 2a–b"),
    (4, 3, [.585, .08, .92, .24], "PEDOT:Tos 与 PTHF · Fig. 1a"),
    (6, 2, [.08, .39, .69, .505], "BBL 与 CPE-K · Fig. 1e"),
    (7, 3, [.085, .085, .475, .28], "PAAMPSA、PEDOT:PSS 与离子液体 · Fig. 1a"),
    (8, 2, [.14, .45, .66, .525], "刷状黏附单体与半导体 · Fig. 1E–F"),
    (9, 2, [.07, .26, .94, .35], "P(PyV) 与 DBS · Fig. 1D"),
    (11, 2, [.735, .275, .93, .44], "PAAc 与 p(g2T-T) · Fig. 1C"),
    (12, 3, [.10, .24, .61, .326], "固态电解质组成 · Fig. 1b"),
    (13, 3, [.09, .34, .93, .44], "PAM 凝胶组成 · Fig. 1a"),
    (14, 3, [.13, .055, .50, .27], "PEDOT:PSS、PEGDA、LAP 与 MPTMS · Fig. 1a"),
    (15, 3, [.22, .085, .82, .15], "PEDOT:PSS 与 DVS · Fig. 1"),
    (17, 2, [.06, .15, .50, .40], "OMIEC 与 Cin-Cell · Fig. 1"),
    (18, 19, [.32, .12, .55, .40], "GOPS、PEGDE、PEDOT:PSS · Fig. 1c–e"),
    (19, 2, [.07, .08, .94, .39], "双极聚合物结构 · Scheme 1"),
    (20, 2, [.10, .46, .91, .68], "OMIEC 与二氮杂环丙烷交联剂 · Scheme 1"),
    (21, 2, [.28, .355, .48, .515], "4Bx 与 p(g2T-T) · Fig. 1b"),
    (22, 3, [.12, .24, .94, .39], "OMIEC 与 DtFDA · Fig. 1"),
    (23, 2, [.19, .22, .78, .415], "PNIPAM、PEGDE、GOPS 与 PEDOT:PSS · Fig. 1b"),
    (24, 5, [.54, .134, .94, .27], "Pg2T-T、pDADMAC 与 DtFDA · Fig. 1b"),
    (25, 2, [.08, .08, .94, .44], "喹喔啉聚合物 · Scheme 1"),
    (26, 3, [.10, .045, .92, .16], "硒吩桥联聚合物 · Fig. 1a"),
    (27, 3, [.10, .18, .94, .55], "寡聚 OMIEC · Fig. 1b–c"),
    (28, 4, [.115, .28, .62, .43], "PDPP3T 与 3-NIPS · Fig. 1b"),
    (29, 2, [.11, .07, .61, .20], "4FPA-2SA-TEG · Fig. 1a"),
    (31, 2, [.07, .64, .50, .815], "P3HT、PBTTT 与 DtFGDA · Fig. 1a"),
    (32, 2, [.51, .32, .86, .48], "DPP-EDOT 与 PEGDMA · Fig. 1A"),
    (33, 2, [.07, .07, .93, .41], "聚合物与不同交联剂 · Scheme 1–2"),
    (35, 3, [.08, .10, .92, .59], "光交联反应结构 · Fig. 2"),
    (38, 3, [.145, .07, .515, .175], "p(g2T-T) 合成结构 · Fig. 1a"),
]

for paper_index, page_number, crop, label in STRUCTURES:
    figure(paper_index, "structure", page_number, crop, label)

VISUALS["papers"][PAPERS[6]["id"]]["figures"][0]["panels"] = [[.08, .39, .27, .505], [.50, .39, .69, .505]]

for paper_index, page_number, crop, label in [
    (0, 3, [.53, .49, .94, .91], "跨导随 GOPS 含量变化 · Fig. 2"),
    (1, 3, [.08, .06, .94, .37], "栅压窗口与循环稳定性 · Fig. 1"),
    (2, 3, [.08, .06, .94, .63], "交联配方与薄膜表征 · Fig. 1"),
    (4, 3, [.07, .27, .94, .47], "分子量与器件响应 · Fig. 1b–c"),
    (7, 3, [.08, .29, .94, .66], "薄膜电导与光谱 · Fig. 1c–g"),
    (8, 3, [.08, .07, .94, .73], "形貌与力学表征 · Fig. 2"),
    (9, 3, [.08, .07, .94, .73], "器件电学与稳定性 · Fig. 2"),
    (10, 5, [.28, .60, .63, .81], "红外光谱 · Fig. 3"),
    (11, 3, [.08, .07, .94, .73], "水凝胶形成与形貌变化 · Fig. 2"),
    (12, 3, [.08, .27, .94, .59], "电解质形貌与力学 · Fig. 1"),
    (13, 3, [.08, .45, .94, .86], "全凝胶器件与制备 · Fig. 1"),
    (14, 3, [.08, .28, .94, .60], "器件转移与输出曲线 · Fig. 1"),
    (16, 9, [.14, .27, .88, .62], "MIP 栅极形貌与器件响应 · Fig. 1b–g"),
    (17, 3, [.06, .07, .94, .42], "垂直器件电学 · Fig. 2"),
    (21, 2, [.53, .425, .94, .675], "光学图像与拉伸电学 · Fig. 2"),
    (22, 3, [.12, .06, .94, .38], "沟道长度与器件结构 · Fig. 1"),
    (23, 2, [.13, .36, .86, .52], "热响应与光谱 · Fig. 1"),
    (26, 3, [.09, .19, .94, .45], "聚合物物性与载流子传输 · Fig. 1b–d"),
    (29, 2, [.08, .21, .94, .34], "交联前后输运表征 · Fig. 1"),
    (30, 3, [.08, .08, .91, .69], "水凝胶力学与界面 · Fig. 2"),
    (32, 2, [.08, .49, .94, .85], "共混前后器件响应 · Fig. 1"),
    (33, 3, [.07, .08, .94, .27], "结晶与光谱 · Fig. 1"),
    (37, 3, [.08, .27, .94, .59], "器件电学原图 · Fig. 2"),
    (38, 3, [.08, .25, .94, .57], "分子量与器件性能 · Fig. 1"),
]:
    figure(paper_index, "evidence", page_number, crop, label)


def chart(paper_index, title, unit, points, condition, field, page, chart_type="bars", axis="", lower=False):
    paper = PAPERS[paper_index]
    record = VISUALS["papers"].setdefault(paper["id"], {"figures": [], "charts": []})
    values = []
    for label, value, state_index, uncertainty in points:
        source = paper["properties"]["states"][state_index]
        values.append({"label": label, "value": value, "error": uncertainty, "state": state_index, "source_text": source["electrical"][field]})
    record["charts"].append({"title": title, "unit": unit, "points": values, "condition": condition, "source_field": field, "page": page, "type": chart_type, "axis": axis, "lower_better": lower})


for title, field, values, errors in [
    ("跨导", "gm", [342.9, 333.5, 331.2, 339.7, 220.7], [27.3, 20.4, 24.9, 21.4, 25.6]),
    ("开启时间", "ton", [6.09, 3.76, 3.04, 1.88, 1.04], [.86, .61, .54, .32, .18]),
    ("关闭时间", "toff", [9.58, 4.56, .73, .48, .16], [1.46, .92, .23, .19, .09]),
]:
    chart(2, title, "mS" if field == "gm" else "ms", [(label, value, state_index, uncertainty) for label, value, state_index, uncertainty in zip(["纯膜", "6:1", "3:1", "1:1", "1:3"], values, [0, 2, 2, 1, 3], errors)], "p 型 P(g2T-T)；冷却台制膜；同篇配方系列。", field, 5, "trend", "OMIEC : DtFDA 质量比", field != "gm")

for paper_index, label_before, label_after, state_before, state_after, condition, page, values in [
    (8, "纯 p(g2T-T)", "BASC", 0, 1, "同篇脉冲响应时间 τ。", 4, [("响应时间 τ", "ton", "ms", 12.9, 11.4, None, None)]),
    (23, "GOPS", "PEGDE + GOPS", 1, 2, "PEDOT:PSS:PNIPAM = 1:2；22 °C；VD = −0.5 V；n = 5。", 5, [("跨导", "gm", "mS", 664, 400, 140, 26.2)]),
    (29, "纯 P3HT", "5% 亲水交联剂", 0, 1, "P3HT 与 5 wt% 4FPA-2SA-TEG；同篇器件对照。", 4, [("开启时间", "ton", "ms", 504, 112, None, None), ("关闭时间", "toff", "ms", 71, 10, None, None)]),
    (31, "纯 P3HT", "P3HT:DtFGDA = 1:4", 0, 1, "同篇 P3HT 器件；DtFGDA 共混质量比 1:4。", 5, [("跨导", "gm", "mS", 69.5, 131, 21, 46.9), ("开启时间", "ton", "ms", 266.7, 79.1, 15.5, 4.68), ("关闭时间", "toff", "ms", 250.6, 5.42, 9.1, .99)]),
    (32, "纯 DPP-EDOT", "PEGDMA 共混", 0, 1, "DPP-EDOT:PEGDMA = 1:1；此组为未交联共混对照。", 3, [("跨导", "gm", "mS", 21.87, 53.42, 2.57, 1.74), ("开启时间", "ton", "ms", 229.31, 7.82, 15.36, .36), ("关闭时间", "toff", "ms", 71.01, 1.95, 3.62, .21)]),
    (37, "边距 2 μm", "边距 100 μm", 0, 1, "BBL 垂直 OECT；只改变图案边缘余量 lM。", 3, [("跨导", "gm", "mS", 1.21, 2.39, .03, .12), ("开启时间", "ton", "ms", 2.16, 7.64, .11, .93), ("关闭时间", "toff", "ms", .43, 1.60, .07, .17)]),
    (38, "19 kDa", "143 kDa", 0, 1, "p(g2T-T)；仅比较同篇平面 cOECT 系列。", 3, [("跨导", "gm", "mS", 11.40, 2.20, .45, .15)]),
]:
    for title, field, unit, before, after, error_before, error_after in values:
        chart(paper_index, title, unit, [(label_before, before, state_before, error_before), (label_after, after, state_after, error_after)], condition, field, page, lower=field in ["ton", "toff"])

chart(14, "几何归一化跨导", "S/cm", [("GOPS", 33.2, 1, 1), ("PEGDA 700", 62.3, 0, 2.4)], "同篇干态几何归一化；不同于绝对跨导 mS。", "gm", 5)
chart(14, "PEGDA 分子量与跨导", "S/cm", [("250", 52.6, 3, 2.3), ("575", 55.9, 3, 1.4), ("700", 62.3, 3, 2.4)], "PEGDA 分子量系列；几何归一化。", "gm", 5, "trend", "PEGDA 分子量 (g/mol)")
chart(13, "厚度与跨导", "mS", [("0.59", 29.7, 1, None), ("1.8", 86.4, 1, None), ("4.4", 63.5, 1, None), ("267", 48, 1, None)], "PEDOT:PSS/PAM；薄膜厚度系列；横轴为离散厚度。", "gm", 4, "trend", "膜厚 (μm，离散配方)")

chart(38, "循环后电流保持率", "%", [("19 kDa", 52.6, 0, None), ("143 kDa", 14.70, 1, None)], "平面 cOECT；线性区；20 000 次循环后 ID 保持率。", "cycling", 4)

for paper_index, filename in [(8, "2023_Wang_Science_BAP生物黏附双网络_SI.pdf"), (11, "2024_Wang_Science_水凝胶半导体双网络_SI.pdf")]:
    VISUALS["papers"][PAPERS[paper_index]["id"]]["supplement"] = filename

MATERIALS = {
    0: ["PEDOT:PSS", "GOPS", "无独立单体"],
    1: ["p(g2T-T) / Homo-gDPP", "DtFDA", "无独立单体"],
    2: ["P(g2T-T) / PEG-N2200", "DtFDA", "无独立单体"],
    3: ["PBFDO", "PR 聚轮烷", "无独立单体"],
    4: ["PEDOT:Tos", "无共价交联剂", "PTHF"],
    6: ["BBL / CPE-K", "见器件条件", "无独立单体"],
    7: ["PEDOT:PSS", "动态氢键 / 离子相互作用", "PAAMPSA / EMIM OTF"],
    8: ["p(g2T-T)", "见配方详情", "刷状 BAP 单体"],
    9: ["P(PyV)", "DBS", "PAM / PVA 等"],
    11: ["p(g2T-T)", "TEGDMA", "AAc"],
    12: ["BBL / P(g2T-TT)", "PEGDA", "ι-CGN 固态电解质"],
    13: ["PEDOT:PSS", "MBA", "AM"],
    14: ["PEDOT:PSS", "PEGDA", "PEGDA / LAP / MPTMS"],
    15: ["PEDOT:PSS", "DVS / GOPS", "无独立单体"],
    17: ["gDPP-g2T / Homo-gDPP", "Cin-Cell", "无独立单体"],
    18: ["PEDOT:PSS", "PEGDE / GOPS", "PNIPAM"],
    19: ["IDT 类双极聚合物", "DtFDA", "无独立单体"],
    20: ["p(g2T-T) / Homo-gDPP", "长 / 中 / 短链 DtFDA", "无独立单体"],
    21: ["p(g2T-T)", "4Bx", "无独立单体"],
    23: ["PEDOT:PSS", "PEGDE / GOPS", "PNIPAM"],
    24: ["Pg2T-T", "DtFDA", "pDADMAC 电解质"],
    25: ["TDQ 类双极聚合物", "DtFDA", "无独立单体"],
    26: ["P(gTDPPT) / P(gTDPPSe)", "DtFDA", "无独立单体"],
    27: ["寡聚 OMIEC", "DtFDA", "无独立单体"],
    28: ["PDPP3T", "3-NIPS", "无独立单体"],
    29: ["P3HT", "4FPA-2SA-TEG", "无独立单体"],
    31: ["P3HT / PBTTT 等", "DtFGDA", "无独立单体"],
    32: ["DPP-EDOT", "PEGDMA", "PEGDMA / PEGDME / PEG"],
    33: ["DPP-10C5DE（OFET）", "支化 / 线性交联剂", "无独立单体"],
    38: ["p(g2T-T) / BBL", "DtFDA / DtFGDA", "无独立单体"],
}
for paper_index, materials in MATERIALS.items():
    VISUALS["papers"][PAPERS[paper_index]["id"]]["materials"] = dict(zip(["semiconductor", "crosslinker", "monomer"], materials))

for paper_id, record in VISUALS["papers"].items():
    paper_index = list(DATA["papers"]).index(paper_id)
    for entry in record["figures"]:
        entry["domains"] = ["structure"] if entry["kind"] == "structure" else []
        if entry["kind"] == "evidence":
            if paper_index in [2, 7, 8, 10, 11, 12, 16, 21, 23, 29, 30, 32, 33]:
                entry["domains"].append("morphology")
            if paper_index in [0, 1, 4, 9, 14, 16, 17, 21, 26, 32, 37, 38]:
                entry["domains"].append("electrical")

PAGE_CORRECTIONS = {14: {"几何归一化跨导": 7}, 23: {"跨导": 8}, 29: {"开启时间": 5, "关闭时间": 5}, 31: {"跨导": 8, "开启时间": 8, "关闭时间": 8}, 37: {"跨导": 4, "开启时间": 5, "关闭时间": 5}, 38: {"跨导": 2}}
for paper_index, corrections in PAGE_CORRECTIONS.items():
    for entry in VISUALS["papers"][PAPERS[paper_index]["id"]]["charts"]:
        if entry["title"] in corrections:
            entry["page"] = corrections[entry["title"]]

for entry in VISUALS["papers"][PAPERS[14]["id"]]["charts"]:
    if entry["title"] == "PEGDA 分子量与跨导":
        entry["x_values"] = [250, 575, 700]
for entry in VISUALS["papers"][PAPERS[13]["id"]]["charts"]:
    entry["x_values"] = [.59, 1.8, 4.4, 267]
    entry["x_scale"] = "log"
    entry["axis"] = "膜厚 (μm，对数坐标)"
    entry["condition"] = "PEDOT:PSS/PAM；同篇薄膜厚度系列。"

(ROOT / "data/visuals.json").write_text(json.dumps(VISUALS, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(VISUALS['papers'])} visual records; {sum(len(record['figures']) for record in VISUALS['papers'].values())} figures; {sum(len(record['charts']) for record in VISUALS['papers'].values())} charts")
