import math
from PIL import Image, ImageDraw, ImageFont

def create_porua_logo():
    # Size 512x512 with transparent background
    size = (512, 512)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Squircle with rich gradient
    # We will create a rich gradient from Emerald (#059669) to Teal (#0f766e) to Cyan (#0891b2)
    bg = Image.new("RGBA", size, (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)

    # Draw rounded rectangle container
    margin = 24
    radius = 110
    
    # Render gradient mask
    mask = Image.new("L", size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [margin, margin, size[0] - margin, size[1] - margin],
        radius=radius,
        fill=255
    )

    # Create smooth gradient
    grad = Image.new("RGBA", size)
    for y in range(size[1]):
        t = y / size[1]
        # Gradient: Top-left emerald (#10b981) to bottom-right deep teal (#042f2e)
        r = int(16 * (1 - t) + 4 * t)
        g = int(185 * (1 - t) + 47 * t)
        b = int(129 * (1 - t) + 46 * t)
        for x in range(size[0]):
            tx = x / size[0]
            # Blend horizontally towards cyan (#06b6d4)
            r_c = int(r * (1 - tx * 0.3) + 6 * (tx * 0.3))
            g_c = int(g * (1 - tx * 0.2) + 182 * (tx * 0.2))
            b_c = int(b * (1 - tx * 0.4) + 212 * (tx * 0.4))
            grad.putpixel((x, y), (r_c, g_c, b_c, 255))

    img.paste(grad, (0, 0), mask)

    # 2. Add subtle inner glow / ring border
    border = Image.new("RGBA", size, (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border)
    b_draw.rounded_rectangle(
        [margin, margin, size[0] - margin, size[1] - margin],
        radius=radius,
        outline=(255, 255, 255, 60),
        width=4
    )
    img = Image.alpha_composite(img, border)

    # 3. Draw Stylized "P" & Open Book Motif
    # Vector paths for book / knowledge wings
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    o_draw = ImageDraw.Draw(overlay)

    # Center: cx = 256, cy = 250
    # Left page / wing
    left_page = [
        (256, 350), # spine bottom
        (256, 210), # spine top
        (130, 240), # left wing outer top
        (120, 340), # left wing outer bottom
        (240, 360), # bottom curve
    ]
    # Right page / wing
    right_page = [
        (256, 350), # spine bottom
        (256, 210), # spine top
        (382, 240), # right wing outer top
        (392, 340), # right wing outer bottom
        (272, 360), # bottom curve
    ]

    # Draw left wing (white with 95% opacity)
    o_draw.polygon([(256, 345), (256, 220), (140, 245), (130, 335), (245, 352)], fill=(255, 255, 255, 245))
    # Draw right wing (white with 85% opacity for 3D depth)
    o_draw.polygon([(256, 345), (256, 220), (372, 245), (382, 335), (267, 352)], fill=(255, 255, 255, 220))

    # Inner leaf layers (mint color #6ee7b7)
    o_draw.polygon([(256, 335), (256, 240), (160, 260), (150, 325), (245, 342)], fill=(167, 243, 208, 255))
    o_draw.polygon([(256, 335), (256, 240), (352, 260), (362, 325), (267, 342)], fill=(110, 231, 183, 255))

    # Center spine crease
    o_draw.line([(256, 215), (256, 355)], fill=(5, 150, 105, 255), width=5)

    # 4. Floating Crown / Knowledge Spark / Graduation Cap Motif
    # Diamond / Star at (256, 160)
    spark = [
        (256, 120), # top
        (274, 160), # right
        (256, 200), # bottom
        (238, 160), # left
    ]
    o_draw.polygon(spark, fill=(254, 240, 138, 255)) # Soft golden yellow #fef08a
    # Inner bright core
    inner_spark = [
        (256, 135),
        (266, 160),
        (256, 185),
        (246, 160),
    ]
    o_draw.polygon(inner_spark, fill=(255, 255, 255, 255))

    # Side accent dots
    o_draw.ellipse([195, 175, 207, 187], fill=(255, 255, 255, 220))
    o_draw.ellipse([305, 175, 317, 187], fill=(255, 255, 255, 220))

    # 5. Clean "PORUA" typography banner at the bottom
    # We will draw a smooth modern base arc
    o_draw.arc([160, 370, 352, 420], start=0, end=180, fill=(255, 255, 255, 160), width=3)

    img = Image.alpha_composite(img, overlay)

    # Save to public directory
    img.save("c:/Code/1. TRUST IT/Porua.app/public/logo.png", "PNG")
    img.save("c:/Code/1. TRUST IT/Porua.app/public/apple-touch-icon.png", "PNG")
    
    # Generate 64x64 and 32x32 for favicon.ico
    fav = img.resize((64, 64), Image.Resampling.LANCZOS)
    fav.save("c:/Code/1. TRUST IT/Porua.app/public/favicon.ico", format="ICO")

    print("Successfully generated modern Porua logo.png, apple-touch-icon.png, and favicon.ico!")

if __name__ == "__main__":
    create_porua_logo()
