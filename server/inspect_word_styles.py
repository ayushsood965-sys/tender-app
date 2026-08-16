import zipfile
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

def inspect_docx_xml(docx_path):
    print("=" * 80)
    print(f"INSPECTING: {docx_path}")
    print("=" * 80)
    with zipfile.ZipFile(docx_path) as docx:
        for file in docx.namelist():
            if file.endswith('.xml') or file.endswith('.rels'):
                print(f"File in zip: {file}")
        
        # Read document.xml
        doc_xml = docx.read('word/document.xml').decode('utf-8', errors='replace')
        print(f"\nDocument.xml length: {len(doc_xml)}")
        
        # Check for page borders (pgBorders)
        if 'pgBorders' in doc_xml or 'pgMar' in doc_xml:
            print("Found page setup in document.xml!")
            # Print sectPr
            start = doc_xml.find('<w:sectPr')
            if start != -1:
                print("sectPr snippet:")
                print(doc_xml[start:start+1500])
        
        # Read styles.xml
        if 'word/styles.xml' in docx.namelist():
            styles_xml = docx.read('word/styles.xml').decode('utf-8', errors='replace')
            print(f"\nStyles.xml length: {len(styles_xml)}")
            # Check font names
            import re
            fonts = set(re.findall(r'w:ascii="([^"]+)"', styles_xml))
            print(f"Fonts used: {fonts}")

inspect_docx_xml(r"C:\Users\Ayush Sood\Downloads\XRD_070826.docx")
inspect_docx_xml(r"C:\Users\Ayush Sood\Downloads\Final Tender Document.docx")
