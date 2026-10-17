# OECT 网络设计图谱

[在线浏览](https://brucejllpku.github.io/OECT-network-Summary/)

40 篇文献、7 类方案、44 份原始 PDF。以原文化学结构图进入精读，按结构、形貌、电学切换，配方和完整证据按需展开。

## 本地预览

在仓库根目录运行 `python -m http.server 8766`，打开 `http://localhost:8766/`。站点使用原生 HTML、CSS、JavaScript，无构建依赖。

## 图源与数值

- `data/papers.json`：原始精读资料，保留全部字段。
- `data/visuals.json`：原文 PDF 页码、归一化裁剪范围、图表数值、单位、条件和对应精读原文。
- `assets/figures/`：从原始 PDF 裁取的结构与表征图；不以生成图替代真实结构。
- 图表仅整理同一论文内可明确区分的数值组；绝对跨导与归一化跨导分开。误差线沿用原始报告，未提供误差的点不补误差。
- 配比系列按离散配方排列；分子量使用真实数值间距；跨度较大的厚度使用明确标注的对数横轴。
- 尚无核实结构图或数值组的条目保留完整精读与原文入口。形貌与电学原图按内容分别展示。

## 更新图源

需要 Python、`pypdfium2`、Pillow。修改 `scripts/prepare-visual-data.py` 中经过核查的裁剪范围及数值组，再运行：

```powershell
python scripts/prepare-visual-data.py
python scripts/build-visual-assets.py assets
```

所有图表与裁图更新后应再次核对来源页并进行视觉检查。`contacts`、`later`、`sources`、`review` 为开发检查模式，临时图在被忽略的 `tmp/visual-review/`。

GitHub Pages 使用 `main` 分支根目录发布。文献与原图版权归作者和出版社，本站用于学术阅读与索引。
