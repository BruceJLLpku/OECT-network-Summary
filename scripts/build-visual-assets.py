import argparse
import json
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "data/papers.json").read_text(encoding="utf-8"))
PAPERS = list(DATA["papers"].values())


def contact_sheets():
    destination = ROOT / "tmp/visual-review"
    destination.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 16)
    for batch_start in range(0, len(PAPERS), 5):
        sheet = Image.new("RGB", (1080, 5 * 525), "#dce3eb")
        draw = ImageDraw.Draw(sheet)
        for row_index, paper in enumerate(PAPERS[batch_start:batch_start + 5]):
            document = pdfium.PdfDocument(ROOT / "assets/pdf" / paper["pdf"].split("/")[-1])
            for page_index in range(min(3, len(document))):
                page = document[page_index]
                picture = page.render(scale=0.65).to_pil().convert("RGB")
                picture.thumbnail((350, 485))
                horizontal = page_index * 360 + (350 - picture.width) // 2
                vertical = row_index * 525 + 28
                sheet.paste(picture, (horizontal, vertical))
                draw.text((page_index * 360 + 8, row_index * 525 + 5), f"{batch_start + row_index} / PDF p.{page_index + 1}", fill="#122038", font=font)
                page.close()
            document.close()
        sheet.save(destination / f"contact-{batch_start // 5}.jpg", quality=88)
        print(destination / f"contact-{batch_start // 5}.jpg")


def assets():
    manifest = json.loads((ROOT / "data/visuals.json").read_text(encoding="utf-8"))
    destination = ROOT / "assets/figures"
    destination.mkdir(parents=True, exist_ok=True)
    for paper_id, visual in manifest["papers"].items():
        paper = DATA["papers"][paper_id]
        document = pdfium.PdfDocument(ROOT / "assets/pdf" / paper["pdf"].split("/")[-1])
        for figure in visual.get("figures", []):
            page = document[figure["page"] - 1]
            picture = page.render(scale=2.2).to_pil().convert("RGB")
            panels = []
            for rectangle in figure.get("panels", [figure["crop"]]):
                bounds = tuple(round(value * dimension) for value, dimension in zip(rectangle, (picture.width, picture.height, picture.width, picture.height)))
                panels.append(picture.crop(bounds))
            picture = Image.new("RGB", (sum(panel.width for panel in panels) + 24 * (len(panels) - 1), max(panel.height for panel in panels)), "white")
            horizontal = 0
            for panel in panels:
                picture.paste(panel, (horizontal, 0))
                horizontal += panel.width + 24
            picture.save(ROOT / figure["src"], "WEBP", quality=92, method=5)
            page.close()
        document.close()
        print(paper_id)


def later_pages():
    selections = [(1, 6), (3, 4), (5, 4), (8, 2), (10, 5), (10, 6), (15, 3), (16, 9), (18, 19), (24, 5), (28, 4), (34, 4), (36, 20)]
    destination = ROOT / "tmp/visual-review"
    destination.mkdir(parents=True, exist_ok=True)
    for paper_index, page_number in selections:
        paper = PAPERS[paper_index]
        document = pdfium.PdfDocument(ROOT / "assets/pdf" / paper["pdf"].split("/")[-1])
        page = document[page_number - 1]
        picture = page.render(scale=1.3).to_pil().convert("RGB")
        picture.save(destination / f"page-{paper_index}-{page_number}.jpg", quality=90)
        page.close()
        document.close()


def crop_review():
    manifest = json.loads((ROOT / "data/visuals.json").read_text(encoding="utf-8"))
    figures = [(paper_id, figure) for paper_id, record in manifest["papers"].items() for figure in record["figures"] if figure["kind"] == "structure"]
    destination = ROOT / "tmp/visual-review"
    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 14)
    for batch_index in range(0, len(figures), 16):
        sheet = Image.new("RGB", (1200, 960), "#e1e8f1")
        draw = ImageDraw.Draw(sheet)
        for position, (paper_id, figure) in enumerate(figures[batch_index:batch_index + 16]):
            row, column = divmod(position, 4)
            picture = Image.open(ROOT / figure["src"])
            picture.thumbnail((286, 200))
            sheet.paste(picture, (column * 300 + 7, row * 240 + 30))
            draw.text((column * 300 + 7, row * 240 + 5), f"{list(DATA['papers']).index(paper_id)} / p.{figure['page']}", fill="#122038", font=font)
        sheet.save(destination / f"crops-{batch_index // 16}.jpg", quality=92)


def source_pages():
    manifest = json.loads((ROOT / "data/visuals.json").read_text(encoding="utf-8"))
    destination = ROOT / "tmp/visual-review"
    for paper_id, record in manifest["papers"].items():
        figure = next((entry for entry in record["figures"] if entry["kind"] == "structure"), None)
        if figure is None:
            continue
        paper = DATA["papers"][paper_id]
        document = pdfium.PdfDocument(ROOT / "assets/pdf" / paper["pdf"].split("/")[-1])
        page = document[figure["page"] - 1]
        page.render(scale=1.2).to_pil().convert("RGB").save(destination / f"source-{list(DATA['papers']).index(paper_id)}.jpg", quality=90)
        page.close()
        document.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["contacts", "assets", "later", "review", "sources"])
    arguments = parser.parse_args()
    {"contacts": contact_sheets, "assets": assets, "later": later_pages, "review": crop_review, "sources": source_pages}[arguments.mode]()
