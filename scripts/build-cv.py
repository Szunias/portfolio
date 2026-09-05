#!/usr/bin/env python3
"""Build the dark A4 CV from src/cv/content.json. Requires reportlab."""

import argparse
from html import escape
import json
from pathlib import Path
import tempfile

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src' / 'cv'
PAGE_WIDTH, PAGE_HEIGHT = A4
BOTTOM = 22
SIDEBAR = 190
MAIN_X = SIDEBAR + 21
MAIN_WIDTH = PAGE_WIDTH - MAIN_X - 22
HEADER_HEIGHT = 146
INK = '#edf0f2'
BODY = '#c6ccd1'
SECONDARY = '#a5b0b8'
ACCENT = '#99bbd4'
RULE = '#343e46'


def register_fonts():
    for name in ('Regular', 'Semibold'):
        pdfmetrics.registerFont(TTFont(f'Inter-{name}', str(SOURCE / 'fonts' / f'Inter-{name}.ttf')))
    pdfmetrics.registerFontFamily('Inter-Regular', normal='Inter-Regular', bold='Inter-Semibold')


def style(name, size, leading, color=BODY):
    return ParagraphStyle(name, fontName='Inter-Regular', fontSize=size, leading=leading,
                          textColor=colors.HexColor(color), allowWidows=0, allowOrphans=0)


class Column:
    def __init__(self, document, x, y, width, bottom=BOTTOM):
        self.document, self.x, self.y, self.width, self.bottom = document, x, y, width, bottom
        self.body = style('Body', 9.6, 12.5)
        self.small = style('Detail', 8, 10.5, SECONDARY)
        self.title = style('Title', 10.2, 13.2, INK)

    def paragraph(self, text, text_style=None, after=0):
        paragraph = Paragraph(text, text_style or self.body)
        _, height = paragraph.wrap(self.width, PAGE_HEIGHT)
        if self.y - height < self.bottom:
            raise ValueError(f'CV text overflows its column at {text[:55]!r}. Edit content or spacing; type is not shrunk automatically.')
        paragraph.drawOn(self.document, self.x, self.y - height)
        self.y -= height + after

    def heading(self, title, number=None):
        prefix = f'<font color="{ACCENT}" size="8">{number} &nbsp; </font>' if number else ''
        self.paragraph(prefix + f'<b>{escape(title.upper())}</b>', style('Section', 10.1, 13, INK), after=5)
        self.document.setStrokeColor(colors.HexColor(RULE))
        self.document.setLineWidth(.55)
        self.document.line(self.x, self.y, self.x + self.width, self.y)
        self.y -= 9

    def gap(self, height):
        self.y -= height


def link(text, url, color=BODY):
    return f'<link href="{escape(url, quote=True)}" color="{color}">{escape(text)}</link>'


def render(data, output):
    document = canvas.Canvas(str(output), pagesize=A4, invariant=1, pageCompression=1)
    document.setTitle('Igor Szuniewicz - Technical Sound Designer and Audio Programmer')
    document.setAuthor('Igor Szuniewicz')
    document.setSubject('Experience, projects, education and contact')
    document.setCreator('Portfolio CV builder')
    document.setKeywords('Igor Szuniewicz, technical sound design, audio programming, Wwise, Unreal, Unity')
    document.setFillColor(colors.HexColor('#0d1013'))
    document.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    document.setFillColor(colors.HexColor('#14191e'))
    document.rect(0, 0, SIDEBAR, PAGE_HEIGHT - HEADER_HEIGHT, fill=1, stroke=0)
    document.setFillColor(colors.HexColor('#090c0f'))
    document.rect(0, PAGE_HEIGHT - HEADER_HEIGHT, PAGE_WIDTH, HEADER_HEIGHT, fill=1, stroke=0)
    document.setStrokeColor(colors.HexColor(RULE))
    document.setLineWidth(.5)
    document.line(0, PAGE_HEIGHT - HEADER_HEIGHT, PAGE_WIDTH, PAGE_HEIGHT - HEADER_HEIGHT)
    document.line(SIDEBAR, 0, SIDEBAR, PAGE_HEIGHT - HEADER_HEIGHT)
    document.setFillColor(colors.HexColor(ACCENT))
    document.rect(0, PAGE_HEIGHT - 3, PAGE_WIDTH, 3, fill=1, stroke=0)

    # Original portrait and QR are extracted unchanged from the previous PDF.
    document.saveState()
    portrait_clip = document.beginPath()
    portrait_clip.roundRect(38, PAGE_HEIGHT - 126, 108, 108, 7)
    document.clipPath(portrait_clip, stroke=0)
    document.drawImage(str(SOURCE / 'portrait.png'), 38, PAGE_HEIGHT - 126, 108, 108, mask='auto')
    document.restoreState()
    header = Column(document, MAIN_X, PAGE_HEIGHT - 15, MAIN_WIDTH, PAGE_HEIGHT - HEADER_HEIGHT + 9)
    first, surname = data['name'].split(' ', 1)
    header.paragraph(f'<b>{escape(first.upper())}</b>', style('First name', 24, 26.5, INK))
    header.paragraph(f'<b>{escape(surname.upper())}</b>', style('Surname', 33, 36, ACCENT), after=5)
    header.paragraph(escape(data['role'].upper()), style('Role', 9, 12.5, SECONDARY), after=7)
    header.paragraph(escape(data['summary']), style('Profile', 9.1, 12.4))

    # Main reading column is emitted continuously before the sidebar.
    main = Column(document, MAIN_X, PAGE_HEIGHT - HEADER_HEIGHT - 17, MAIN_WIDTH)
    main.heading('Experience & research', '01')
    for index, item in enumerate(data['experience']):
        if index:
            main.gap(9)
        main.paragraph(escape(item['period'].upper()), main.small, after=2)
        main.paragraph(f'<b>{escape(item["title"])}</b>', main.title, after=2)
        main.paragraph(escape(item['text']))

    main.gap(15)
    main.heading('Selected projects', '02')
    for index, item in enumerate(data['projects']):
        if index:
            main.gap(8)
        short_role = 'SOLO' if item['role'] == 'Solo developer' else 'TEAM'
        project_title = link(item['name'], item['url'], INK)
        detail = escape(f'{short_role} / {item["period"]}')
        main.paragraph(f'<b>{project_title}</b> &nbsp; <font color="{SECONDARY}" size="7.6">{detail}</font>', main.title, after=2)
        main.paragraph(escape(item['text']))

    main.gap(15)
    main.heading('Education', '03')
    for index, item in enumerate(data['education']):
        if index:
            main.gap(8)
        period = f'<font color="{SECONDARY}" size="7.6"> / {escape(item["period"])}</font>'
        main.paragraph(f'<b>{escape(item["title"])}</b>{period}', main.title, after=1)
        main.paragraph(escape(item['institution']), style('Institution', 9, 12))
        if item.get('detail'):
            main.paragraph(escape(item['detail']), style('Thesis title', 8, 10.5, SECONDARY))

    side = Column(document, 18, PAGE_HEIGHT - HEADER_HEIGHT - 17, SIDEBAR - 36)
    side.body = style('Sidebar', 9.3, 14)
    side.heading('Skills')
    for skill in data['skills']:
        side.paragraph(escape(skill), after=2)
    side.gap(14)
    side.heading('Toolkit')
    for index, group in enumerate(data['tools']):
        if index:
            side.gap(9)
        side.paragraph(f'<b>{escape(group["title"])}</b>', style('Tool group', 8.1, 11, ACCENT), after=3)
        for line in group['lines']:
            side.paragraph(escape(line), style('Tools', 9, 12.6))
    side.gap(14)
    side.heading('Languages')
    for language in data['languages'].rstrip('.').split('; '):
        name, level = language.split(' - ', 1)
        side.paragraph(f'{escape(name)} <font color="{SECONDARY}" size="8"> / {escape(level)}</font>', after=2)
    side.gap(14)
    side.heading('Interests')
    side.paragraph(escape(data['interests']), style('Interests', 9, 12.6))

    contact = Column(document, 18, 184, SIDEBAR - 36)
    if side.y < contact.y + 18:
        raise ValueError('Sidebar text overlaps the contact section.')
    contact.heading('Contact')
    for item in data['contact']:
        text = item['text'] if item['text'] != 'LinkedIn' else 'LinkedIn / igorszuniewicz'
        contact.paragraph(link(text, item['url']), style('Contact', 8, 11.6), after=3)
    contact.gap(4)
    contact.paragraph(escape(data['location']), style('Location', 8.5, 12.2))
    document.drawImage(str(SOURCE / 'portfolio-qr.png'), 18, BOTTOM, 36, 36, mask='auto')
    qr_caption = Column(document, 63, BOTTOM + 29, SIDEBAR - 80, bottom=0)
    qr_caption.paragraph(link('Scan for portfolio', data['contact'][0]['url'], ACCENT), style('QR label', 8, 10.8), after=3)
    qr_caption.paragraph('igorszuniewicz.com', style('QR URL', 7, 10, SECONDARY))
    document.linkURL(data['contact'][0]['url'], (18, BOTTOM, 54, BOTTOM + 36), relative=0, thickness=0)
    document.showPage()
    document.save()
    return round(main.y - BOTTOM, 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'Igor_Szuniewicz_CV.pdf')
    args = parser.parse_args()
    register_fonts()
    data = json.loads((SOURCE / 'content.json').read_text(encoding='utf-8'))
    destination = args.output.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix='.pdf', delete=False) as temporary:
        candidate = Path(temporary.name)
    try:
        remaining = render(data, candidate)
        candidate.replace(destination)
    finally:
        candidate.unlink(missing_ok=True)
    print(f'CV: {destination} (one A4 page, {remaining} pt above the bottom margin)')


if __name__ == '__main__':
    main()
