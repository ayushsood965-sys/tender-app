import zipfile

with zipfile.ZipFile(r"C:\Users\Ayush Sood\Downloads\XRD_070826.docx") as docx:
    print("=== FOOTER 2 XML ===")
    print(docx.read('word/footer2.xml').decode('utf-8'))
    print("\n=== FOOTER 3 XML ===")
    print(docx.read('word/footer3.xml').decode('utf-8'))
