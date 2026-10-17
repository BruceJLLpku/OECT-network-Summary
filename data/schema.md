# OECT 网络设计文献库 · 数据 Schema

## 站点定位
按「设计方案」分类的 OECT 交联/网络文献精读库。每个文件夹 = 一种设计方案；
文件夹内含若干文献卡片 + 一份【总览设计规则】。

## papers.json

```json
{
  "site": {
    "title": "OECT 网络设计文献库",
    "subtitle": "交联网络 · 双网络 · 形貌—电学关联",
    "disclaimer": "组内学术交流使用，原文版权归出版社/作者所有。"
  },
  "categories": [
    {
      "id": "density",
      "name": "交联密度对OECT的影响",
      "folder": "交联密度对OECT的影响",
      "order": 1,
      "summary": "设计规则总览（markdown）",
      "design_rules": {
        "question": "这一类方案要解决什么问题？",
        "structural_knobs": ["交联剂用量", "双交联剂比例", "栅压窗口"],
        "morphology_effects": ["相分离尺度", "离子渗透通道", "膜致密度"],
        "electrical_effects": ["gm", "ton/toff", "Ion/Ioff", "循环稳定性"],
        "causal_chain": "结构 → 形貌 → 电学（叙述）",
        "recipe_notes": "配方共性/区间",
        "open_questions": "未决问题"
      },
      "papers": ["paper-id-1", "paper-id-2"]
    }
  ],
  "papers": {
    "paper-id": {
      "id": "2017-inal-mme-gops-density",
      "title_en": "The effect of 3-glycidoxypropyltrimethoxysilane (GOPS) content ...",
      "title_cn": "（可选中文短题）",
      "short_name": "2017 Inal MME 交联密度GOPS",
      "authors": "S. Inal et al.",
      "corr_author": "Sahika Inal",
      "year": 2017,
      "journal": "Macromol. Mater. Eng.",
      "doi": "10.1002/mame.201600497",
      "pdf": "pdf/2017-Inal-MME-GOPS.pdf",
      "category_id": "density",
      "design_intent": "本文想解决什么网络设计问题",

      "structure": {
        "semiconductor": "p(g2T-TT) / P3HT / PEDOT:PSS / BBL ...",
        "semiconductor_type": "亲水 | 疏水 | 两性 | PEDOT:PSS",
        "crosslinker": "GOPS / DtFDA / DVS / PEGDA / 4Bx ...",
        "crosslinker_amount": "1 wt%（相对PEDOT固含量）或 未报道",
        "network_monomer": "丙烯酰胺 / 无（仅交联半导体）/ PEGDA 单体…",
        "network_monomer_amount": "…或 未报道",
        "ratio_sc_monomer_xl": "1:x:y（推算则注明「推算」）或 未报道",
        "crosslink_type": "共价 | 动态/可逆 | 光交联 | 半互穿 | 非交联/物理",
        "film_prep": "旋涂/印刷/原位聚合 + 退火条件",
        "notes": "配方细节补充"
      },

      "oect_conditions": {
        "electrolyte": {
          "solution": "0.1 M NaCl aq. / PBS / 0.1 M NaCl in water:EG…",
          "solvent": "水 | 水:乙二醇 | 有机溶剂",
          "ions": "NaCl | PBS (Na+/K+, PO4^3-) | 未报道",
          "concentration": "0.1 M 或 未报道"
        },
        "swelling": {
          "test_solution": "溶胀测试用溶剂（若与工作电解液不同）",
          "swelling_ratio": "如 120% / 厚度膨胀 / 质量吸水率，或 未报道",
          "method": "QCM / 吸水率 / 原位成像 / 未报道",
          "notes": ""
        },
        "electrodes": {
          "source_drain": "Au / PEDOT:PSS / Pt / 碳糊…",
          "gate": "Ag/AgCl | Pt | Au | 有机离子凝胶栅…",
          "geometry": "平面/垂直/共面，沟道 W/L"
        },
        "device": {
          "architecture": "平面底栅 | 垂直 | 电解质栅 | …",
          "channel_dimensions": "W=… L=… 或 未报道",
          "vds": "-0.1 V 等",
          "vg_range": "0 ~ -0.6 V 等"
        }
      },

      "properties": {
        "conditions_note": "所有电学数字注明测试条件（电解液/扫描速率/循环圈数）",
        "states": [
          {
            "label": "未交联 / GOPS 1 wt% / 双网络…",
            "structure_delta": "相对对照改了什么",
            "electrical": {
              "gm": "mS 或 mS·cm^-2，注明归一化与否",
              "gm_notes": "",
              "ton": "ms / s",
              "toff": "ms / s",
              "ion_ioff": "10^x",
              "on_current": "μA / A·cm^-2",
              "cycling": "1000圈后保持 x% / 未报道",
              "vth": "或 未报道",
              "stability_other": "连续工作、偏压应力、水稳定"
            },
            "morphology": {
              "sem": "观察到的相分离/粗糙度/孔洞",
              "tem": "",
              "afm": "Rq / 相图 / 纤维直径",
              "uvvis": "吸收/聚集态变化",
              "wettability": "水接触角 / 表面能",
              "xrd_giwaxs": "π-π堆积、结晶",
              "ftir_xps": "交联程度证据",
              "swelling_in_situ": "原位溶胀",
              "other": "DSC、流变、纳米压痕…"
            }
          }
        ],
        "before_after_summary": "交联前→后一句话对比"
      },

      "causal_chain": {
        "structure_to_morphology": "改了结构后，形貌上发生了什么（要指认证据）",
        "morphology_to_electrical": "形貌如何导致电学变化",
        "net_effect": "净效果：值得抄的设计结论一句话",
        "evidence_quality": "强（多技术互证）| 中 | 弱（仅电学或仅推断）"
      },

      "design_takeaways": ["可直接借鉴的配方/工艺点"],
      "limitations": ["本文没说清/不适用的地方"],
      "quote_evidence": [
        {"page": 3, "text": "关键原文短句（英文）", "why": "支撑哪条结论"}
      ]
    }
  }
}
```

## 字段填写规则
1. 文献未写的数字/材料一律写 `"未报道"`，禁止编造。
2. 比例能从 wt%/摩尔比换算时写推算值并标注「推算」。
3. `states[]`：有对照组（未交联 vs 交联、不同密度、单网 vs 双网）就拆成多条。
4. 电学量纲写全；gm 若同时有绝对值和几何归一化，两者都记。
5. SEM/AFM/UV-vis 等没有就写空字符串或「未报道」，不要省略键。
6. SI（支持信息）与正文合并到同一 paper 条目。
7. 重复文献（副本、ChemRxiv + 正式版）合并为一条，`pdf` 取正式版。

## categories 固定 7 类（与文件夹同名，id 见 build 脚本）
| id | 文件夹 |
|---|---|
| density | 交联密度对OECT的影响 |
| hyd_sc_xl_net | 亲水OMIECs+交联网络 |
| hyd_sc_hyd_xl | 亲水OMIECs+疏水交联剂 单网络 |
| hyd_sc_no_net | 亲水OMIECs+非交联网络 |
| hyph_sc_hyd_xl | 疏水半导体+亲水交联剂 单网络 |
| hyph_sc_hyd_dn | 疏水半导体+亲水网络 双网络 |
| swell | 网络溶胀 + 亲水疏水研究 |
