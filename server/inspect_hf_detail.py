import zipfile

with zipfile.ZipFile(r"C:\Users\Ayush Sood\Downloads\XRD_070826.docx") as docx:
    print("=== HEADER 1 XML ===")
    print(docx.read('word/header1.xml').decode('utf-8'))
    print("\n=== FOOTER 1 XML ===")
    print(docx.read('word/footer1.xml').decode('utf-8'))
    print("\n=== HEADER 1 RELS ===")
    print(docx.read('word/_rels/header1.xml.rels').decode('utf-8'))
