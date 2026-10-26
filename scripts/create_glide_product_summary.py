from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "glide-product-summary.pdf"

INK = HexColor("#1d153d")
VIOLET = HexColor("#5b3df5")
CREAM = HexColor("#fff7ea")
MIST = HexColor("#f2eef9")
GREEN = HexColor("#137542")
MUTED = HexColor("#615b75")


def bullet(text, style):
    return Paragraph(f"<font color='#5b3df5'>•</font> {text}", style)


def section(title, body, title_style, body_style):
    return [Spacer(1, 4 * mm), Paragraph(title, title_style), Spacer(1, 1.5 * mm), Paragraph(body, body_style)]


def footer(canvas, document):
    canvas.saveState()
    canvas.setStrokeColor(HexColor("#ddd5e8"))
    canvas.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "Glide - Product and deployment summary")
    canvas.drawRightString(192 * mm, 10 * mm, f"{document.page}")
    canvas.restoreState()


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=17 * mm, bottomMargin=21 * mm
    )
    styles = getSampleStyleSheet()
    eyebrow = ParagraphStyle("Eyebrow", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=VIOLET, spaceAfter=3 * mm)
    title = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=29, leading=33, textColor=INK, spaceAfter=3 * mm)
    subtitle = ParagraphStyle("Subtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=11, leading=16, textColor=MUTED)
    heading = ParagraphStyle("Heading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=INK)
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.8, leading=14, textColor=INK)
    small = ParagraphStyle("Small", parent=body, fontSize=8.7, leading=12.2, textColor=MUTED)

    story = [
        Paragraph("GLIDE / 22 OCTOBER 2026", eyebrow),
        Paragraph("Travel that keeps moving with you.", title),
        Paragraph("A product and deployment summary for Glide's restored photo-led landing experience and WhatsApp-first travel concierge direction.", subtitle),
        Spacer(1, 7 * mm),
    ]

    status = Table(
        [
            [Paragraph("<b>Design location</b><br/><font color='#5b3df5'>Dokploy production target</font><br/>glide.alfalasi.io (pending release)", body), Paragraph("<b>Current product surface</b><br/>Public landing, local app demo, policy pages, and local n8n workflows", body)],
            [Paragraph("<b>Purpose</b><br/>Make planning, booking coordination, and itinerary changes easier for travelers.", body), Paragraph("<b>Operating rule</b><br/><font color='#137542'>Every purchase or booking change requires approval of the exact option, price, fees, and terms.</font>", body)],
        ], colWidths=[78 * mm, 78 * mm], rowHeights=[28 * mm, 29 * mm]
    )
    status.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), 0.65, HexColor("#e4d9c6")),
        ("INNERGRID", (0, 0), (-1, -1), 0.65, HexColor("#e4d9c6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
    ]))
    story += [status]

    story += section("What Glide is for", "Glide is a personal travel agent concept for vacations, business travel, and everyday journeys. It is being shaped around WhatsApp so a traveler can describe a trip in natural language, receive coordinated options, and stay informed when plans shift.", heading, body)
    story += section("What the product is designed to do", "The concierge gathers trip details, proposes a route and schedule, connects affected reservations, and explains the next best action when a plan changes. The local prototype demonstrates itinerary repair, downstream-impact reasoning, travel-pass presentation, and an approval boundary before any financial or booking action.", heading, body)

    story += [Spacer(1, 4 * mm), Paragraph("CAPABILITIES", heading), Spacer(1, 1.5 * mm)]
    capability_rows = [
        [bullet("Plan vacations, business trips, and regular trips from a conversation.", body), bullet("Collect dates, travelers, budget, preferences, and constraints.", body)],
        [bullet("Coordinate flights, stays, restaurants, ground travel, and a trip timeline.", body), bullet("Detect when a delay or late start affects following plans.", body)],
        [bullet("Present updated itinerary and wallet-pass style trip details.", body), bullet("Request clear approval before spending money or changing a reservation.", body)],
    ]
    capabilities = Table(capability_rows, colWidths=[78 * mm, 78 * mm], hAlign="LEFT")
    capabilities.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), MIST),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    story += [capabilities, Spacer(1, 5 * mm), HRFlowable(width="100%", thickness=0.6, color=HexColor("#ded7e7"))]

    story += [
        Spacer(1, 5 * mm), Paragraph("The product today", heading), Spacer(1, 1.5 * mm),
        Table([
            [Paragraph("<b>Available and verified locally</b>", body), Paragraph("<b>Intentionally pending external setup</b>", body)],
            [Paragraph("• Restored public landing page with responsive photo-led scroll narrative.<br/>• Local app screens and deterministic itinerary-agent demo.<br/>• n8n local test workflow for concierge messages.<br/>• Privacy Policy and Terms of Service pages.<br/>• Mobile layouts checked at 375px, 412px, and 768px widths.", small), Paragraph("• Meta WhatsApp Business account, phone number, and production webhook.<br/>• Booking, payment, hotel, flight, calendar, and wallet-provider APIs.<br/>• Production account/authentication setup.<br/>• App Store and Google Play listings and download links.", small)],
        ], colWidths=[78 * mm, 78 * mm], rowHeights=[9 * mm, 48 * mm])
    ]
    story[-1].setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), HexColor("#e8f5ee")),
        ("BACKGROUND", (1, 0), (1, 0), HexColor("#fff0ed")),
        ("BACKGROUND", (0, 1), (-1, 1), HexColor("#fbfafc")),
        ("BOX", (0, 0), (-1, -1), 0.6, HexColor("#ddd8e5")),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, HexColor("#ddd8e5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))

    story += section("Design direction", "The restored landing page tells Glide's story through a mountain-road hero, trip cards, cascading itinerary moves, wallet passes, and a dinner finale. The design uses a cream and deep-ink palette, editorial typography, travel photography, scrolling transitions, and reduced-motion support. It was built mobile-first so the story remains readable and composed across phone, tablet, and desktop widths.", heading, body)
    story += section("Technical outline", "The web product uses Next.js 16.4, React 19, Tailwind CSS, Framer Motion, Bun, and Capacitor. The workflow prototype is n8n running locally. The deployed website is intended to run from the repository Dockerfile through Dokploy.", heading, body)
    story += section("Release checks", "The release was checked with Bun unit tests for the local agent library, ESLint on the restored landing and policy surfaces, a production Next.js build, and browser checks for horizontal overflow and errors at mobile and tablet widths.", heading, body)
    story += [Spacer(1, 5 * mm), Paragraph("Product boundary: Glide currently demonstrates planning and coordination. It does not yet make real reservations, process payments, or send real WhatsApp messages.", ParagraphStyle("Boundary", parent=body, backColor=CREAM, borderColor=HexColor("#e4d9c6"), borderWidth=0.7, borderPadding=4 * mm))]

    document.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
