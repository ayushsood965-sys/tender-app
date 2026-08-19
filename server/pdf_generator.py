import sys
import os
import json
import io

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from xhtml2pdf import pisa

def generate_pdf_from_json(input_json_path, output_pdf_path, logo_path, watermark_path):
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    pages = data.get("pages", [])

    # Clean HTML using BeautifulSoup to remove unsupported attributes (e.g. percentage heights on tables/cells)
    cleaned_pages = []
    for p in pages:
        soup = BeautifulSoup(p, "html.parser")
        for tag in soup.find_all(True):
            if tag.has_attr("height"):
                del tag["height"]
            if tag.has_attr("style"):
                # Remove height styles that cause TypeError in reportlab table calculation
                styles = tag["style"].split(";")
                filtered_styles = [s for s in styles if not s.strip().startswith("height") and not s.strip().startswith("min-height")]
                tag["style"] = "; ".join(filtered_styles)
        cleaned_pages.append(str(soup))

    # HTML page styling template compatible with xhtml2pdf / reportlab
    custom_css = """
    @page {
        size: a4 portrait;
        margin: 12mm 12mm 15mm 12mm;
        @frame content_frame {
            left: 12mm;
            top: 12mm;
            width: 186mm;
            height: 265mm;
        }
        @frame footer_frame {
            left: 12mm;
            top: 280mm;
            width: 186mm;
            height: 8mm;
        }
    }
    body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.35;
        color: #000;
    }
    .pdf-page {
        page-break-after: always;
    }
    .pdf-page:last-child {
        page-break-after: avoid;
    }
    .page-border-container {
        border: 2pt solid #006400;
        padding: 12pt;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4pt;
        margin-bottom: 6pt;
    }
    th, td {
        border: 0.5pt solid #333;
        padding: 4pt 5pt;
        font-size: 8.5pt;
        vertical-align: top;
    }
    th {
        background-color: #f0f0f0;
        font-weight: bold;
        text-align: left;
    }
    h1, h2, h3, h4 {
        margin-top: 3pt;
        margin-bottom: 3pt;
        color: #000;
    }
    .footer-num {
        text-align: right;
        font-weight: bold;
        font-size: 8.5pt;
        color: #555;
    }
    """

    body_html = ""
    for idx, page_html in enumerate(cleaned_pages):
        body_html += f"""
        <div class="pdf-page">
            <div class="page-border-container">
                {page_html}
            </div>
        </div>
        """

    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <style>
            {custom_css}
        </style>
    </head>
    <body>
        <div id="footer_content" class="footer-num">
            Page <pdf:pagenumber> of <pdf:pagecount>
        </div>
        {body_html}
    </body>
    </html>
    """

    with open(output_pdf_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(
            io.StringIO(full_html),
            dest=pdf_file,
            encoding='utf-8'
        )

    if pisa_status.err:
        print(f"PDF generation had errors: {pisa_status.err}")
        return False
    else:
        print(f"Generated complete styled PDF -> {output_pdf_path}")
        return True

import zipfile
import docx
from bs4 import BeautifulSoup

def generate_portal_package_zip(input_json_path, output_zip_path, profile, logo_path, watermark_path):
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    pages = data.get("pages", [])
    doc_name = data.get("name", "Tender_Document")
    temp_dir = os.path.dirname(output_zip_path)

    # 1. Generate main consolidated PDF
    main_pdf_path = os.path.join(temp_dir, f"main_temp_{os.path.basename(output_zip_path)}.pdf")
    generate_pdf_from_json(input_json_path, main_pdf_path, logo_path, watermark_path)

    # 2. Build ZIP package
    with zipfile.ZipFile(output_zip_path, 'w') as zout:
        if profile == "two_cover":
            # Separate technical pages vs financial bid page
            cover1_pages = []
            cover2_pages = []

            for idx, p in enumerate(pages):
                lower_p = p.lower()
                if "annexure-a" in lower_p or "financial bid submission" in lower_p or "price schedule" in lower_p:
                    cover2_pages.append(p)
                else:
                    cover1_pages.append(p)

            if not cover2_pages and len(pages) > 2:
                # If no explicit financial marker found, last page is cover 2
                cover2_pages = [pages[-1]]
                cover1_pages = pages[:-1]

            # Generate Cover 1 PDF
            c1_json = os.path.join(temp_dir, f"c1_{os.path.basename(output_zip_path)}.json")
            c1_pdf = os.path.join(temp_dir, f"c1_{os.path.basename(output_zip_path)}.pdf")
            with open(c1_json, 'w', encoding='utf-8') as f:
                json.dump({"pages": cover1_pages}, f)
            generate_pdf_from_json(c1_json, c1_pdf, logo_path, watermark_path)

            # Generate Cover 2 PDF
            c2_json = os.path.join(temp_dir, f"c2_{os.path.basename(output_zip_path)}.json")
            c2_pdf = os.path.join(temp_dir, f"c2_{os.path.basename(output_zip_path)}.pdf")
            with open(c2_json, 'w', encoding='utf-8') as f:
                json.dump({"pages": cover2_pages}, f)
            generate_pdf_from_json(c2_json, c2_pdf, logo_path, watermark_path)

            if os.path.exists(c1_pdf):
                zout.write(c1_pdf, "Cover_1_Technical_Bid_and_Annexures.pdf")
                os.remove(c1_pdf)
            if os.path.exists(c2_pdf):
                zout.write(c2_pdf, "Cover_2_Financial_Bid_Submission.pdf")
                os.remove(c2_pdf)
            if os.path.exists(c1_json): os.remove(c1_json)
            if os.path.exists(c2_json): os.remove(c2_json)

            # Add Checklist / Metadata summary
            checklist_txt = f"""HIMACHAL PRADESH UNIVERSITY
TWO-COVER TENDER SUBMISSION PACKAGE
Tender Title: {doc_name}
Date Generated: {os.path.basename(output_zip_path)}

PACKAGE CONTENTS:
1. Cover_1_Technical_Bid_and_Annexures.pdf -> Technical specifications, eligibility documents, EMD/fee receipts, and all mandatory undertakings/annexures.
2. Cover_2_Financial_Bid_Submission.pdf    -> Commercial price schedule / Annexure-A financial bid form.

IMPORTANT INSTRUCTION FOR BIDDERS:
- Upload Cover 1 and Cover 2 in their respective online slots on the e-Procurement Portal (hptenders.gov.in / CPP Portal).
- Do not disclose prices in Cover 1; disclosing financial rates in technical cover will lead to immediate disqualification.
"""
            zout.writestr("Submission_Instructions_Checklist.txt", checklist_txt)

        else: # GeM Portal Profile
            if os.path.exists(main_pdf_path):
                zout.write(main_pdf_path, "GeM_ATC_Consolidated_Document.pdf")

            gem_txt = f"""HIMACHAL PRADESH UNIVERSITY - GeM ATC PORTAL UPLOAD PACKAGE
Document: {doc_name}

INSTRUCTIONS FOR GEM PORTAL UPLOAD:
1. Upload 'GeM_ATC_Consolidated_Document.pdf' in the Additional Terms and Conditions (ATC) upload section of the GeM Bid creation console.
2. Ensure the summary table metadata matches the parameters specified in the GeM Bid catalog.
"""
            zout.writestr("GeM_Upload_Guidelines.txt", gem_txt)

    if os.path.exists(main_pdf_path):
        os.remove(main_pdf_path)

    print(f"Generated Portal Export ZIP -> {output_zip_path}")
    return True

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python pdf_generator.py <input_json> <output_file> [--package <profile>]")
        sys.exit(1)

    in_json = sys.argv[1]
    out_file = sys.argv[2]
    script_dir = os.path.dirname(os.path.abspath(__file__))

    logo = os.path.join(script_dir, "assets", "hpu_logo.png")
    if not os.path.exists(logo):
        logo = os.path.join(script_dir, "..", "client", "public", "hpu_logo.png")

    watermark = os.path.join(script_dir, "assets", "hpu_watermark.png")
    if not os.path.exists(watermark):
        watermark = os.path.join(script_dir, "..", "client", "public", "hpu_watermark.png")

    if len(sys.argv) >= 5 and sys.argv[3] == "--package":
        profile = sys.argv[4]
        generate_portal_package_zip(in_json, out_file, profile, logo, watermark)
    else:
        generate_pdf_from_json(in_json, out_file, logo, watermark)
