import zipfile
import os

with zipfile.ZipFile(r"C:\Users\Ayush Sood\Downloads\XRD_070826.docx") as docx:
    for name in docx.namelist():
        if 'media' in name:
            filename = os.path.basename(name)
            with open(f"extracted_{filename}", 'wb') as f:
                f.write(docx.read(name))
            print(f"Extracted {name} -> extracted_{filename} ({len(docx.read(name))} bytes)")
