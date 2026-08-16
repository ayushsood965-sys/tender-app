import zipfile

with zipfile.ZipFile("downloaded_api_tender.docx") as docx:
    print("=== DOCUMENT XML SECTPR ===")
    doc_xml = docx.read('word/document.xml').decode('utf-8')
    start = doc_xml.find('<w:sectPr')
    print(doc_xml[start:start+1200])

    print("\n=== HEADER 1 RELS ===")
    print(docx.read('word/_rels/header1.xml.rels').decode('utf-8'))

    print("\n=== FOOTER 1 XML ===")
    print(docx.read('word/footer1.xml').decode('utf-8'))
