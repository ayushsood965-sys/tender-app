import requests
import json
import os
import sys
import io
import zipfile
import pypdf

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:5000/api"

def test_advanced_suite():
    print("==================================================")
    print("1. TESTING AI CLAUSE & ANNEXURE RECOMMENDER (OPENROUTER)")
    print("==================================================")
    ai_payload = {
        "tenderName": "Procurement of High Resolution XRD Spectrometer for Physics Lab",
        "documentType": "GeM ATC Document",
        "tenderCategory": "goods",
        "estimatedCost": 15000000,
        "departmentName": "Department of Physics"
    }
    r_ai = requests.post(f"{BASE_URL}/ai/recommend", json=ai_payload)
    assert r_ai.status_code == 200, f"AI Recommender failed: {r_ai.text}"
    ai_res = r_ai.json()
    print(f"✅ AI Source: {ai_res.get('source')}")
    print(f"✅ Recommended Term IDs ({len(ai_res.get('recommendedTermIds', []))}): {ai_res.get('recommendedTermIds')}")
    print(f"✅ Recommended Annexure IDs ({len(ai_res.get('recommendedAnnexureIds', []))}): {ai_res.get('recommendedAnnexureIds')}")
    print(f"✅ AI Rationale: {ai_res.get('rationale')}")
    assert len(ai_res.get("recommendedTermIds", [])) > 0, "Expected recommended terms from AI"

    print("\n==================================================")
    print("2. TESTING TENDER DUPLICATION / CLONING")
    print("==================================================")
    # Fetch a tender to clone
    r_tenders = requests.get(f"{BASE_URL}/tenders")
    tenders_list = r_tenders.json()
    assert len(tenders_list) > 0, "No tenders available to test duplication"
    target_tender = tenders_list[0]

    r_dup = requests.post(f"{BASE_URL}/tenders/{target_tender['id']}/duplicate")
    assert r_dup.status_code == 200, f"Duplication failed: {r_dup.text}"
    dup_tender = r_dup.json()
    print(f"✅ Original Tender: {target_tender['tenderName']} (ID: {target_tender['id']})")
    print(f"✅ Duplicated Tender: {dup_tender['tenderName']} (ID: {dup_tender['id']})")
    assert "(Copy)" in dup_tender["tenderName"], "Expected '(Copy)' in cloned tender name"

    print("\n==================================================")
    print("3. TESTING ANNEXURE VERSIONING & DEPRECATION")
    print("==================================================")
    # Create custom annexure to test versioning
    r_create_annex = requests.post(
        f"{BASE_URL}/annexures",
        json={
            "title": "Custom Test Annexure for Testing",
            "category": "custom",
            "contentTemplate": "<h2>Custom Annexure v1</h2><p>Original template</p>",
            "isMaster": False
        }
    )
    assert r_create_annex.status_code == 200, f"Create annexure failed: {r_create_annex.text}"
    target_annex = r_create_annex.json()
    initial_ver = target_annex.get("version", 1)

    # Update template to trigger version bump
    r_update = requests.put(
        f"{BASE_URL}/annexures/{target_annex['id']}",
        json={
            "title": target_annex["title"],
            "contentTemplate": target_annex["contentTemplate"] + "\n<!-- updated v2 -->",
            "changelog": "Added updated legal disclaimer section"
        }
    )
    assert r_update.status_code == 200, f"Update failed: {r_update.text}"
    updated_annex = r_update.json()
    print(f"✅ Version bumped from v{initial_ver} -> v{updated_annex.get('version')}")
    assert updated_annex.get("version") == initial_ver + 1, "Expected version increment"

    # Fetch version history
    r_hist = requests.get(f"{BASE_URL}/annexures/{target_annex['id']}/history")
    assert r_hist.status_code == 200, f"History fetch failed: {r_hist.text}"
    hist_data = r_hist.json()
    print(f"✅ Version History entries: {len(hist_data.get('history', []))}")
    assert len(hist_data.get("history", [])) > 0, "Expected at least 1 history record"

    # Test deprecation toggle
    r_dep = requests.patch(f"{BASE_URL}/annexures/{target_annex['id']}/deprecate")
    assert r_dep.status_code == 200, f"Deprecate failed: {r_dep.text}"
    print(f"✅ Deprecation toggle result: {r_dep.json().get('message')}")

    # Revert status back to active
    requests.patch(f"{BASE_URL}/annexures/{target_annex['id']}/deprecate")

    print("\n==================================================")
    print("4. TESTING DIRECT PDF GENERATION")
    print("==================================================")
    # Save a test document
    doc_payload = {
        "tenderId": dup_tender["id"],
        "name": "Full_Tender_Complete_Set",
        "pages": {
            "1": "<h2>Himachal Pradesh University</h2><p>Tender Document for High-End Lab Equipment</p>",
            "2": "<h3>Summary Table</h3><table><tr><th>Sr.</th><th>Parameter</th><th>Details</th></tr><tr><td>1.</td><td>Item</td><td>XRD System</td></tr></table>",
            "3": "<h2>Annexure-A</h2><h3>Financial Bid Submission Form</h3><p>Price details</p>"
        }
    }
    r_save = requests.post(f"{BASE_URL}/documents", json=doc_payload)
    assert r_save.status_code == 200, f"Document save failed: {r_save.text}"
    saved_doc = r_save.json()

    # Download PDF
    r_pdf = requests.get(f"{BASE_URL}/documents/{saved_doc['id']}/pdf")
    assert r_pdf.status_code == 200, f"PDF export failed: {r_pdf.status_code} - {r_pdf.text}"
    assert len(r_pdf.content) > 1000, "PDF file suspiciously small"

    temp_pdf_path = "temp_test_output.pdf"
    with open(temp_pdf_path, "wb") as f:
        f.write(r_pdf.content)

    reader = pypdf.PdfReader(temp_pdf_path)
    print(f"✅ Generated PDF Verified: {len(reader.pages)} pages")
    if os.path.exists(temp_pdf_path):
        os.remove(temp_pdf_path)

    print("\n==================================================")
    print("5. TESTING PORTAL-SPECIFIC MULTI-COVER ZIP EXPORTER")
    print("==================================================")
    # Download Two-Cover ZIP
    r_zip = requests.get(f"{BASE_URL}/documents/{saved_doc['id']}/export-package?profile=two_cover")
    assert r_zip.status_code == 200, f"ZIP export failed: {r_zip.status_code} - {r_zip.text}"
    assert len(r_zip.content) > 1000, "ZIP file suspiciously small"

    temp_zip_path = "temp_test_package.zip"
    with open(temp_zip_path, "wb") as f:
        f.write(r_zip.content)

    with zipfile.ZipFile(temp_zip_path, 'r') as zf:
        file_list = zf.namelist()
        print(f"✅ ZIP Archive Contents ({len(file_list)} files):")
        for fn in file_list:
            print(f"   ↳ {fn}")
        assert "Cover_1_Technical_Bid_and_Annexures.pdf" in file_list
        assert "Cover_2_Financial_Bid_Submission.pdf" in file_list
        assert "Submission_Instructions_Checklist.txt" in file_list

    if os.path.exists(temp_zip_path):
        os.remove(temp_zip_path)

    # Clean up test tender and document from MongoDB
    try:
        requests.delete(f"{BASE_URL}/tenders/{dup_tender['id']}")
        requests.delete(f"{BASE_URL}/annexures/{target_annex['id']}")
    except Exception:
        pass

    print("\n==================================================")
    print("🎉 ALL ADVANCED MODULAR FEATURES VERIFIED & TESTED!")
    print("==================================================")

if __name__ == '__main__':
    test_advanced_suite()
