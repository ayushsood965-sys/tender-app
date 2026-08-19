import sys
import os
import json
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from bs4 import BeautifulSoup, NavigableString
import zipfile

def set_cell_border(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = f'w:{edge}'
            element = OxmlElement(tag)
            element.set(qn('w:val'), edge_data.get('val', 'single'))
            element.set(qn('w:sz'), str(edge_data.get('sz', 4)))
            element.set(qn('w:space'), str(edge_data.get('space', 0)))
            element.set(qn('w:color'), edge_data.get('color', '000000'))
            tcBorders.append(element)
    tcPr.append(tcBorders)

def set_cell_shading(cell, color_hex):
    shd_xml = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shd_xml)

def process_inline_nodes(p, elem, font_name="Montserrat", font_size=Pt(10.5)):
    """Recursively process inline text formatting"""
    for child in elem.children:
        if isinstance(child, NavigableString):
            text = str(child)
            if text:
                r = p.add_run(text)
                r.font.name = font_name
                r.font.size = font_size
        elif child.name in ['strong', 'b']:
            r = p.add_run(child.get_text())
            r.font.name = font_name
            r.font.size = font_size
            r.font.bold = True
        elif child.name in ['em', 'i']:
            r = p.add_run(child.get_text())
            r.font.name = font_name
            r.font.size = font_size
            r.font.italic = True
        elif child.name == 'u':
            r = p.add_run(child.get_text())
            r.font.name = font_name
            r.font.size = font_size
            r.font.underline = True
        elif child.name == 'span':
            # Check style
            is_bold = 'bold' in child.get('style', '') or 'bold' in child.get('class', [])
            r = p.add_run(child.get_text())
            r.font.name = font_name
            r.font.size = font_size
            if is_bold:
                r.font.bold = True
        else:
            r = p.add_run(child.get_text())
            r.font.name = font_name
            r.font.size = font_size

def parse_html_elements_to_docx(soup, doc, logo_path=None):
    """Parse HTML elements into python-docx paragraphs and tables"""
    for elem in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'table', 'div', 'ul', 'ol'], recursive=False):
        
        # Flex container (e.g. No. on left, Dated on right)
        if elem.name == 'div' and 'display: flex' in elem.get('style', ''):
            spans = elem.find_all(['span', 'div', 'p'])
            if len(spans) >= 2:
                # Two column layout using transparent table
                t_flex = doc.add_table(rows=1, cols=2)
                t_flex.alignment = WD_TABLE_ALIGNMENT.CENTER
                row = t_flex.rows[0]
                row.cells[0].width = Inches(3.3)
                row.cells[1].width = Inches(3.3)
                
                p_left = row.cells[0].paragraphs[0]
                p_left.paragraph_format.space_before = Pt(2)
                p_left.paragraph_format.space_after = Pt(4)
                r_left = p_left.add_run(spans[0].get_text().strip())
                r_left.font.name = "Montserrat"
                r_left.font.bold = True
                r_left.font.size = Pt(10)

                p_right = row.cells[1].paragraphs[0]
                p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                p_right.paragraph_format.space_before = Pt(2)
                p_right.paragraph_format.space_after = Pt(4)
                r_right = p_right.add_run(spans[1].get_text().strip())
                r_right.font.name = "Montserrat"
                r_right.font.bold = True
                r_right.font.size = Pt(10)
                continue

        # Headings
        if elem.name in ['h1', 'h2', 'h3', 'h4', 'h5']:
            p = doc.add_paragraph()
            align = WD_ALIGN_PARAGRAPH.LEFT
            style_str = elem.get('style', '')
            if 'center' in style_str or elem.parent.get('style', '').find('center') != -1:
                align = WD_ALIGN_PARAGRAPH.CENTER
            elif 'right' in style_str:
                align = WD_ALIGN_PARAGRAPH.RIGHT

            p.alignment = align
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True

            size_map = {'h1': Pt(15), 'h2': Pt(13.5), 'h3': Pt(12), 'h4': Pt(11), 'h5': Pt(10.5)}
            process_inline_nodes(p, elem, font_name="Montserrat", font_size=size_map.get(elem.name, Pt(12)))
            p.runs[0].font.bold = True if len(p.runs) > 0 else None
            continue

        # Paragraphs
        if elem.name == 'p':
            text = elem.get_text().strip()
            if not text:
                continue

            # Check if paragraph contains logo image
            img = elem.find('img')
            if img and logo_path and os.path.exists(logo_path):
                p_logo = doc.add_paragraph()
                p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_logo.paragraph_format.space_before = Pt(8)
                p_logo.paragraph_format.space_after = Pt(12)
                p_logo.add_run().add_picture(logo_path, width=Inches(1.6))
                continue

            p = doc.add_paragraph()
            style_str = elem.get('style', '')
            align = WD_ALIGN_PARAGRAPH.LEFT
            if 'center' in style_str:
                align = WD_ALIGN_PARAGRAPH.CENTER
            elif 'right' in style_str:
                align = WD_ALIGN_PARAGRAPH.RIGHT
            elif 'justify' in style_str:
                align = WD_ALIGN_PARAGRAPH.JUSTIFY

            p.alignment = align
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            process_inline_nodes(p, elem, font_name="Montserrat", font_size=Pt(10.5))
            continue

        # Tables
        if elem.name == 'table':
            trs = elem.find_all('tr')
            if not trs:
                continue

            num_rows = len(trs)
            num_cols = max(len(tr.find_all(['th', 'td'])) for tr in trs)
            table = doc.add_table(rows=num_rows, cols=num_cols)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER

            # Column widths allocation
            total_width = Inches(6.6)
            if num_cols == 7: # Annexure-A schedule / Financial BOQ table
                col_widths = [Inches(0.5), Inches(1.5), Inches(1.8), Inches(0.6), Inches(0.8), Inches(0.6), Inches(0.8)]
            elif num_cols == 4: # Technical Compliance & Eligibility Fact Sheet
                col_widths = [Inches(0.6), Inches(3.0), Inches(2.0), Inches(1.0)]
            elif num_cols == 3: # Summary / 3-col tables
                col_widths = [Inches(0.8), Inches(2.2), Inches(3.6)]
            elif num_cols == 2: # Bidder Profile / Key-Value table
                col_widths = [Inches(2.8), Inches(3.8)]
            else:
                col_widths = [total_width / num_cols] * num_cols

            for r_idx, tr in enumerate(trs):
                cells = tr.find_all(['th', 'td'])
                row = table.rows[r_idx]
                is_header = (r_idx == 0 and tr.find('th') is not None)

                for c_idx, cell_data in enumerate(cells):
                    if c_idx >= num_cols:
                        break
                    cell = row.cells[c_idx]
                    cell.width = col_widths[c_idx]

                    set_cell_border(cell,
                        top={'sz': 4, 'val': 'single', 'color': '000000'},
                        bottom={'sz': 4, 'val': 'single', 'color': '000000'},
                        left={'sz': 4, 'val': 'single', 'color': '000000'},
                        right={'sz': 4, 'val': 'single', 'color': '000000'}
                    )

                    if is_header:
                        set_cell_shading(cell, "F0F0F0")

                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    p.paragraph_format.line_spacing = 1.1

                    cell_text = cell_data.get_text().strip()
                    r = p.add_run(cell_text)
                    r.font.name = "Montserrat"
                    r.font.size = Pt(9.5)
                    if is_header or cell_data.name == 'th' or cell_data.find(['strong', 'b']):
                        r.font.bold = True

            p_space = doc.add_paragraph()
            p_space.paragraph_format.space_before = Pt(2)
            p_space.paragraph_format.space_after = Pt(4)
            continue

        # Nested container div / box
        if elem.name == 'div':
            parse_html_elements_to_docx(elem, doc, logo_path)

def generate_docx_from_json(input_json_path, output_docx_path, logo_path, watermark_path):
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    pages = data.get("pages", [])
    doc = docx.Document()
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)
    section.header_distance = Inches(0.4)
    section.footer_distance = Inches(0.4)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Montserrat'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    for idx, page_html in enumerate(pages):
        soup = BeautifulSoup(page_html, 'html.parser')
        parse_html_elements_to_docx(soup, doc, logo_path)

        if idx < len(pages) - 1:
            doc.add_page_break()

    temp_raw = output_docx_path + ".temp"
    doc.save(temp_raw)

    # XML Templates for Watermark & Footers
    header_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w10="urn:schemas-microsoft-com:office:word">
    <w:p>
        <w:pPr><w:pStyle w:val="Header"/></w:pPr>
        <w:r>
            <w:pict>
                <v:shapetype id="_x0000_t75" coordsize="21600,21600" o:spt="75" o:preferrelative="t" path="m@4@5l@4@11@9@11@9@5xe" filled="f" stroked="f">
                    <v:stroke joinstyle="miter"/>
                    <v:formulas>
                        <v:f eqn="if lineDrawn pixelLineWidth 0"/>
                        <v:f eqn="sum @0 1 0"/>
                        <v:f eqn="sum 0 0 @1"/>
                        <v:f eqn="prod @2 1 2"/>
                        <v:f eqn="prod @3 21600 pixelWidth"/>
                        <v:f eqn="prod @3 21600 pixelHeight"/>
                        <v:f eqn="sum @0 0 1"/>
                        <v:f eqn="prod @6 1 2"/>
                        <v:f eqn="prod @7 21600 pixelWidth"/>
                        <v:f eqn="sum @8 21600 0"/>
                        <v:f eqn="prod @7 21600 pixelHeight"/>
                        <v:f eqn="sum @10 21600 0"/>
                    </v:formulas>
                    <v:path o:extrusionok="f" gradientshapeok="t" o:connecttype="rect"/>
                    <o:lock v:ext="edit" aspectratio="t"/>
                </v:shapetype>
                <v:shape id="WordPictureWatermark" o:spid="_x0000_s1029" type="#_x0000_t75" style="position:absolute;margin-left:0;margin-top:0;width:480pt;height:360pt;z-index:-251657216;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical:center;mso-position-vertical-relative:margin" o:allowincell="f">
                    <v:imagedata r:id="rId1" o:title="HPU Watermark" gain="19661f" blacklevel="22938f"/>
                    <w10:wrap anchorx="margin" anchory="margin"/>
                </v:shape>
            </w:pict>
        </w:r>
    </w:p>
</w:hdr>"""

    header_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/watermark.png"/>
</Relationships>"""

    footer_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:p>
        <w:pPr>
            <w:pStyle w:val="Footer"/>
            <w:jc w:val="right"/>
        </w:pPr>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:fldChar w:fldCharType="begin"/>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:instrText xml:space="preserve"> PAGE </w:instrText>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:fldChar w:fldCharType="separate"/>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:fldChar w:fldCharType="end"/>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:t>/</w:t>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:fldChar w:fldCharType="begin"/>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:instrText xml:space="preserve"> NUMPAGES </w:instrText>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:fldChar w:fldCharType="separate"/>
        </w:r>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Montserrat" w:hAnsi="Montserrat"/>
                <w:b/>
                <w:sz w:val="20"/>
            </w:rPr>
            <w:fldChar w:fldCharType="end"/>
        </w:r>
    </w:p>
</w:ftr>"""

    with open(watermark_path, 'rb') as f:
        watermark_bytes = f.read()

    with zipfile.ZipFile(temp_raw, 'r') as zin:
        with zipfile.ZipFile(output_docx_path, 'w') as zout:
            for item in zin.infolist():
                content = zin.read(item.filename)
                
                if item.filename == '[Content_Types].xml':
                    ct_str = content.decode('utf-8')
                    injections = ""
                    if 'Extension="png"' not in ct_str:
                        injections += '<Default Extension="png" ContentType="image/png"/>'
                    if 'header1.xml' not in ct_str:
                        injections += '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
                    if injections:
                        ct_str = ct_str.replace('</Types>', f'{injections}</Types>')
                    zout.writestr(item, ct_str.encode('utf-8'))

                elif item.filename == 'word/_rels/document.xml.rels':
                    rels_str = content.decode('utf-8')
                    if 'header1.xml' not in rels_str:
                        rels_str = rels_str.replace('</Relationships>', '<Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>')
                    zout.writestr(item, rels_str.encode('utf-8'))

                elif item.filename == 'word/document.xml':
                    doc_str = content.decode('utf-8')
                    pg_borders_xml = '<w:headerReference w:type="default" r:id="rIdHeader1"/><w:footerReference w:type="default" r:id="rIdFooter1"/><w:pgBorders w:offsetFrom="page"><w:top w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/><w:left w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/><w:bottom w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/><w:right w:val="thinThickThinSmallGap" w:sz="24" w:space="24" w:color="004821"/></w:pgBorders>'
                    doc_str = doc_str.replace('</w:sectPr>', f'{pg_borders_xml}</w:sectPr>')
                    zout.writestr(item, doc_str.encode('utf-8'))

                else:
                    zout.writestr(item, content)

            zout.writestr('word/header1.xml', header_xml.encode('utf-8'))
            zout.writestr('word/_rels/header1.xml.rels', header_rels.encode('utf-8'))
            zout.writestr('word/footer1.xml', footer_xml.encode('utf-8'))
            zout.writestr('word/media/watermark.png', watermark_bytes)

    if os.path.exists(temp_raw):
        os.remove(temp_raw)

    print(f"Generated complete styled docx -> {output_docx_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python docx_generator.py <input_json> <output_docx>")
        sys.exit(1)
    
    in_json = sys.argv[1]
    out_docx = sys.argv[2]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    logo = os.path.join(script_dir, "assets", "hpu_logo.png")
    if not os.path.exists(logo):
        logo = os.path.join(script_dir, "..", "client", "public", "hpu_logo.png")

    watermark = os.path.join(script_dir, "assets", "hpu_watermark.png")
    if not os.path.exists(watermark):
        watermark = os.path.join(script_dir, "..", "client", "public", "hpu_watermark.png")

    generate_docx_from_json(in_json, out_docx, logo, watermark)
