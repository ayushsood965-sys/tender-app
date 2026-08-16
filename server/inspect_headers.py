import zipfile
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def inspect_headers_and_watermarks(docx_path):
    print("=" * 80)
    print(f"INSPECTING HEADERS/FOOTERS/MEDIA IN: {docx_path}")
    print("=" * 80)
    with zipfile.ZipFile(docx_path) as docx:
        for name in docx.namelist():
            if 'header' in name or 'footer' in name or 'media' in name:
                print(f"\n--- {name} ---")
                content = docx.read(name)
                if name.endswith('.xml'):
                    text = content.decode('utf-8', errors='replace')
                    # Check for watermark / v:shape / w:drawing
                    if 'watermark' in text.lower() or 'shape' in text.lower() or 'drawing' in text.lower() or 'pict' in text.lower():
                        print(">> Contains Shape/Drawing/Watermark:")
                        # Print shape snippet
                        for m in re.finditer(r'<[wv]:(?:shape|drawing|pict)[^>]*>.*?</[wv]:(?:shape|drawing|pict)>', text, re.DOTALL):
                            print(m.group(0)[:500])
                    else:
                        print("Text snippet:", text[:400])
                else:
                    print(f"Binary file size: {len(content)} bytes")

inspect_headers_and_watermarks(r"C:\Users\Ayush Sood\Downloads\XRD_070826.docx")
