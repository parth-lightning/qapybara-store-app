# Stillform mobile

Reading this as: a lighting store for design-conscious home shoppers, with a quiet architectural language and practical native shopping controls.

DESIGN_VARIANCE 6 / MOTION_INTENSITY 3 / VISUAL_DENSITY 4, matching the website. The design-taste-frontend skill is adapted to native: its palette, photography, typography, shape and copy rules apply; native safe areas, touch targets and keyboard behavior replace web layout prescriptions.

The immutable tokens are copied byte for byte from the web project. Manrope is bundled through @expo-google-fonts/manrope, Phosphor supplies all navigation icons. Both color themes use the original tokens. 4px controls, minimum 48pt buttons, 50pt inputs. Reanimated fades use ReduceMotion.System; navigation has no automatic transition. No gradients, emoji, ornamental badges or em dashes.

All original product photographs are copied locally and resized to at most 1000px with WebP quality 85. Empty bag uses the existing Dome room photograph. No network images.

## Generated assets

Built-in image generation tool, separate calls on 2026-10-22. Original raster sources retained in assets/generated.

- icon-source.png: Square Stillform architectural lighting app icon. One sculptural brushed silver aluminum mushroom lamp centered with safe margins on cool pale gray #ecefef. Photorealistic product photography, diffuse daylight from left, accurate brushed metal, subtle shadow. No text, logos, border, watermark or gradients. Derived icon.png, adaptive-icon.png and splash.png by resizing this generated source.
- welcome-source.png: Portrait editorial photograph of a calm contemporary living room, brushed silver mushroom table lamp on dark wooden sideboard, charcoal lounge chair, cool gray plaster walls, diffuse left daylight, natural materials and refined shadows. No people, text, logos or watermarks. Optimized as assets/welcome.webp.

## Pre-flight

One coherent theme on each screen, one green accent, original 4px radius, native Manrope, original photographs, no fake content or remote placeholders. Marketing home uses original brand copy. Buying screens use explicit field labels, inline validation, disabled sold-out controls, pending submit feedback, empty search/bag/orders, loading and storage error states. Forms use keyboard-aware scroll containers and safe areas. Core controls expose matching testID and accessibilityLabel values. Light and dark phone evidence is saved in screenshots.
