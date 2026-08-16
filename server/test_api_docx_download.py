import requests
import json
import zipfile

# 1. Create / Save a Document Version
save_payload = {
    "tenderId": 1,
    "name": "XRD Procurement - Final Submission",
    "pages": {
        "1": """<div style="text-align: center;"><h2>Himachal Pradesh University,</h2><h3>(NAAC Accredited 'A' Grade University)</h3><h3>"Department of Physics (Science Central Workshop)"</h3><p><img src="/hpu_logo.png" /></p><h1>Bid Document for<br/>Procurement of High Resolution X-ray Diffractometer (XRD)</h1><p><strong>Website:</strong> https://www.hpuniv.ac.in</p><p><strong>E-mail:</strong> physics.hpu@gmail.com</p></div>""",
        "2": """<div><h3>SUMMARY</h3><table><tr><th>Sr. No.</th><th>Description</th><th>Details</th></tr><tr><td>1.</td><td>Item Description</td><td>High Resolution X-ray Diffractometer (XRD)</td></tr><tr><td>2.</td><td>Quantity</td><td>01 Set</td></tr><tr><td>3.</td><td>Estimated Cost</td><td>INR 2,80,00,000/-</td></tr></table><p><strong>1.1 General Terms:</strong> All bidders must submit their bid online through the procurement portal.</p></div>""",
        "3": """<div><h4>SECTION 3: SCOPE OF SUPPLY AND TECHNICAL TERMS</h4><p><strong>3.1 Scope:</strong> The equipment must be supplied, installed, and commissioned at Department of Physics, HPU Shimla with 3 years comprehensive warranty.</p><p><strong>3.2 Liquidated Damages:</strong> In case of delay, liquidated damages at 0.5% per week up to maximum 10% will be levied.</p></div>"""
    }
}

res = requests.post("http://localhost:5000/api/documents", json=save_payload)
print("Save Document Response:", res.status_code, res.json().get("id"))
doc_id = res.json()["id"]

# 2. Download DOCX
docx_res = requests.get(f"http://localhost:5000/api/documents/{doc_id}/docx")
print("Download DOCX Response:", docx_res.status_code, "Length:", len(docx_res.content))

with open("downloaded_api_tender.docx", "wb") as f:
    f.write(docx_res.content)

print("Saved downloaded_api_tender.docx!")

# 3. Inspect generated DOCX
with zipfile.ZipFile("downloaded_api_tender.docx") as docx:
    print("Files in generated DOCX:", docx.namelist())
    doc_xml = docx.read('word/document.xml').decode('utf-8')
    has_borders = 'pgBorders' in doc_xml and 'thinThickThinSmallGap' in doc_xml
    has_watermark = 'word/header1.xml' in docx.namelist() and 'media/watermark.png' in docx.namelist()
    has_footer = 'word/footer1.xml' in docx.namelist()
    print(f"Has Triple Green Page Borders: {has_borders}")
    print(f"Has Embedded Watermark: {has_watermark}")
    print(f"Has Dynamic Footer: {has_footer}")
