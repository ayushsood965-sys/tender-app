import docx
from docx.shared import Inches, Pt, RGBColor, Twips
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os
import zipfile
import shutil
from bs4 import BeautifulSoup

def create_styled_docx(pages_data, output_path, logo_path, watermark_path):
    # Create base document
    doc = docx.Document()
    
    # Configure A4 section
    for section in doc.sections:
        section.page_width = Inches(8.27) # 210mm
        section.page_height = Inches(11.69) # 297mm
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        section.header_distance = Inches(0.4)
        section.footer_distance = Inches(0.4)
        section.different_first_page_header_footer = False

    # Add Normal Style Font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Montserrat'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0, 0, 0)

    # Let's save a temp document to inspect/modify XML with borders and watermark
    temp_docx = "temp_styled.docx"
    doc.save(temp_docx)

    # Now let's enhance the docx package by injecting exact pgBorders and Watermark!
    with zipfile.ZipFile(temp_docx, 'r') as zin:
        with zipfile.ZipFile(output_path, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                if item.filename == 'word/document.xml':
                    doc_str = buffer.decode('utf-8')
                    # Inject pgBorders into sectPr
                    pg_borders_xml = '<w:pgBorders w:offsetFrom="page"><w:top w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/><w:left w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/><w:bottom w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/><w:right w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/></w:pgBorders>'
                    doc_str = doc_str.replace('</w:sectPr>', f'{pg_borders_xml}</w:sectPr>')
                    zout.writestr(item, doc_str.encode('utf-8'))
                else:
                    zout.writestr(item, buffer)

    print(f"Created styled docx at {output_path}")

create_styled_docx([], "test_output.docx", "assets/hpu_logo.png", "assets/hpu_watermark.png")
