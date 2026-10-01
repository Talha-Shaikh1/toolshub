from PIL import Image, ImageDraw, ImageFont
import math

def create_studio_icon(output_path: str):
    size = (256, 256)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Dark Rounded App Background
    margin = 12
    draw.rounded_rectangle(
        [margin, margin, 256 - margin, 256 - margin],
        radius=48,
        fill=(18, 20, 29, 255),
        outline=(245, 158, 11, 230), # Golden Amber border
        width=6
    )

    # 2. Sleek Inner Gradient / Film Reel circles
    center_x, center_y = 128, 115
    # Outer ring
    draw.ellipse(
        [center_x - 65, center_y - 65, center_x + 65, center_y + 65],
        fill=(28, 32, 46, 255),
        outline=(245, 158, 11, 160),
        width=4
    )

    # 3. Dynamic Play / Reel Triangle
    triangle_points = [
        (center_x - 20, center_y - 35),
        (center_x + 35, center_y),
        (center_x - 20, center_y + 35)
    ]
    draw.polygon(triangle_points, fill=(245, 158, 11, 255)) # Glowing Gold

    # 4. "4K" Badge at bottom
    badge_w, badge_h = 90, 36
    badge_x0 = (256 - badge_w) // 2
    badge_y0 = 185
    draw.rounded_rectangle(
        [badge_x0, badge_y0, badge_x0 + badge_w, badge_y0 + badge_h],
        radius=10,
        fill=(239, 68, 68, 255), # Vivid Red 4K badge
        outline=(255, 255, 255, 200),
        width=2
    )

    # Draw text "4K CC"
    # Using built-in bitmap font
    try:
        # Simple high contrast 4K letters
        draw.text((badge_x0 + 18, badge_y0 + 7), "4K  CC", fill=(255, 255, 255, 255))
    except Exception:
        pass

    # Save as true Windows multi-resolution icon
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    img.save(output_path, format="ICO", sizes=icon_sizes)
    print(f"Icon created successfully at {output_path}")

if __name__ == "__main__":
    create_studio_icon("C:/Work/reel-caption-tool/assets/app_icon.ico")
