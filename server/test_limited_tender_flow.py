import requests
import json
import zipfile

# 1. Create a Limited Tender matching "sports final tender.docx"
payload = {
    "documentType": "Limited Tender Document",
    "tenderCategory": "goods",
    "tenderType": "limited",
    "departmentName": "Store Purchase Office",
    "departmentEmail": "spo@hpuniv.ac.in",
    "tenderInvitingAuthority": "Store Purchase Officer",
    "tenderName": "Purchase of Sports Items for Chief Warden (Boys Hostels)",
    "tenderNo": "1-13/2009-HPU (CW)",
    "procurementLocations": "Tagore Boys Hostel, SBS Tribal Boys Hostel, and Dr. Y.S. Parmar Boys Hostel of H.P. University, Summerhill, Shimla-171005",
    "estimatedCost": 229000,
    "estimatedCostWords": "Rupees Two Lakh Twenty-Nine Thousand only",
    "bidValidity": 90,
    "emdRequired": "5000",
    "emdAmount": 5000,
    "emdAmountWords": "Rupees Five Thousand Only",
    "pbgRequired": "10000",
    "pbgAmount": 10000,
    "pbgAmountWords": "Rupees Ten Thousand Only",
    "emdPledgeOfficer": "Finance Officer, H.P. University, Shimla-05",
    "publishDate": "2026-03-01",
    "bidEndDate": "2026-03-15",
    "bidEndTime": "5:00 P.M.",
    "techEvalDate": "2026-03-16",
    "techEvalTime": "11:30 A.M.",
    "openingVenue": "Store Purchase Office",
    "deliveryDays": 15,
    "warrantyDurable": "12 months",
    "warrantyConsumable": "6 months",
    "courtJurisdiction": "Courts in Shimla Urban",
    "itemsList": [
        { "srNo": 1, "name": "Table Tennis Table", "specs": "22mm Top with 75mm Wheel Size, TTFI approved", "quantity": "3" },
        { "srNo": 2, "name": "Table Tennis Bat", "specs": "Tournament Grade, Flared Grip, Ratings: Speed 70, Spin 70, Control 95", "quantity": "12" },
        { "srNo": 3, "name": "Badminton Racket", "specs": "Carbon material, Lightweight design", "quantity": "10" },
        { "srNo": 4, "name": "Carrom Board", "specs": "12mm Ply, 35\" Overall frame, 29\" Playing area, 3\" hand rest, with stand", "quantity": "5" },
        { "srNo": 5, "name": "Chess Board", "specs": "Foldable 19\"x19\" board with wooden chessmen", "quantity": "7" },
        { "srNo": 6, "name": "Table Tennis Balls", "specs": "3-Star standard, Pack of 3", "quantity": "4" },
        { "srNo": 7, "name": "Badminton Shuttle Cock", "specs": "Nylon material, Standard tournament grade", "quantity": "8" },
        { "srNo": 8, "name": "Cricket Bat", "specs": "Kashmir Willow", "quantity": "4" },
        { "srNo": 9, "name": "Volley Ball", "specs": "Leather material", "quantity": "2" },
        { "srNo": 10, "name": "Foot Ball", "specs": "Rubberised material, standard match quality", "quantity": "2" }
    ]
}

res = requests.post("http://localhost:5000/api/tenders", json=payload)
print("Create Tender Response:", res.status_code)
tender_data = res.json()
tender_id = tender_data.get("id")
print(f"Created Tender ID: {tender_id}")

# 2. Save a Document for this tender
doc_res = requests.post("http://localhost:5000/api/documents", json={
    "tenderId": tender_id,
    "name": "Sports Items Limited Tender v1",
    "pages": {
        "1": f"""<div style="font-size: 11pt; line-height: 1.5;"><div style="display: flex; justify-content: space-between;"><span><strong>No. {payload['tenderNo']}</strong></span><span><strong>Dated: {payload['publishDate']}</strong></span></div><div style="text-align: center;"><h2>Himachal Pradesh University</h2><h3>(NAAC Accredited ‘A’ Grade University)</h3><h3>“{payload['departmentName']}”</h3></div><p><strong>To</strong><br/>_____________________________________</p><p><strong>Subject:</strong> <u>Limited Tender/Sealed Quotations for the Purchase of {payload['tenderName']} for {payload['departmentName']}.</u></p><p>Sir,<br/>Sealed quotations are invited from eligible firms for the procurement of Sports Equipment for {payload['procurementLocations']}.</p><p>The approximate value of purchase is <strong>Rs. 2,29,000/- ({payload['estimatedCostWords']})</strong>.</p><h3>Submission of Bids</h3><p>Cover 1: Technical Bid. Cover 2: Financial Bid.</p></div>""",
        "2": f"""<div><h3>Instructions to Bidders</h3><p><strong>1. Earnest Money Deposit (EMD):</strong> ₹ 5,000/- ({payload['emdAmountWords']}) in favour of {payload['emdPledgeOfficer']}.</p><p><strong>2. Submission Deadline:</strong> {payload['bidEndDate']} till {payload['bidEndTime']}.</p><p><strong>3. Bid Opening:</strong> {payload['techEvalDate']} at {payload['techEvalTime']} in {payload['openingVenue']}.</p><h3>Additional Terms and Conditions</h3><p><strong>4. Completion Time:</strong> {payload['deliveryDays']} days.</p><p><strong>5. Warranty:</strong> Durable: {payload['warrantyDurable']}, Consumables: {payload['warrantyConsumable']}.</p><p style="text-align: right;">Yours faithfully,<br/><strong>{payload['tenderInvitingAuthority']}</strong><br/>H.P. University, Shimla-5.</p></div>""",
        "3": """<div><h2 style="text-align: center;">Annexure-A</h2><h3 style="text-align: center;">Financial Bid Submission Form</h3><table style="width: 100%; border-collapse: collapse;"><thead><tr><th>Sr. No.</th><th>Name of Articles</th><th>Specification / Dimensions</th><th>Total Qty</th><th>Base Rate (Excl. Tax)</th><th>GST (%)</th><th>Total Amount</th></tr></thead><tbody><tr><td>1.</td><td>Table Tennis Table</td><td>22mm Top with 75mm Wheel Size, TTFI approved.</td><td>3</td><td></td><td></td><td></td></tr><tr><td>2.</td><td>Table Tennis Bat</td><td>Tournament Grade, Flared Grip.</td><td>12</td><td></td><td></td><td></td></tr></tbody></table><p><strong>Declaration:</strong> We undertake to complete the supply within the specified time frame.</p></div>"""
    }
})
print("Save Document Response:", doc_res.status_code)
saved_doc_id = doc_res.json()["id"]

# 3. Export DOCX
docx_res = requests.get(f"http://localhost:5000/api/documents/{saved_doc_id}/docx")
print("Download DOCX status:", docx_res.status_code, "Size:", len(docx_res.content), "bytes")

with open("test_sports_limited_tender.docx", "wb") as f:
    f.write(docx_res.content)

with zipfile.ZipFile("test_sports_limited_tender.docx") as docx:
    print("Files in Sports Tender DOCX:", docx.namelist())
    doc_xml = docx.read("word/document.xml").decode("utf-8")
    print("Has Green Triple Border:", "thinThickThinSmallGap" in doc_xml)
    print("Has Watermark:", "word/header1.xml" in docx.namelist())
    print("Has Footer:", "word/footer1.xml" in docx.namelist())
