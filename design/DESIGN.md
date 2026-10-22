# Stillform apparel

Reading this as: a restrained apparel shop for everyday wear, preserving Stillform's native Manrope typography, green accent, neutral surfaces, and 4px control corners. Design variance 5, motion 3, density 3.

The website at commits 7d6379a and 8e86a75 supplies all 16 products, four categories, prices, sizes, copy, facts and photography. Product cards contain only image, name, colour and price. Product details have a swipe gallery, large size controls with no initial selection, inline validation, quantity controls and a sticky purchase footer. Long product names wrap within their own column. Shopping titles appear once; checkout has concise shipping, payment and review headings with no progress breadcrumbs.

## Assets

All 38 WebP files in assets/products are exact copies of the website's public/images. assets/welcome.webp is a separately generated wide login photograph. No product photos were generated.

Built-in image generation created these three replacement assets:

- assets/generated/icon-source.png: "Use case: logo-brand. Create a square mobile app icon for Stillform, a restrained premium sneakers and everyday apparel shop. Center a single sculptural off-white folded fabric S ribbon on a muted deep forest green background (#245b4b). Clean studio aesthetic, soft tactile cotton weave, subtle shadow, generous empty margin with the emblem within the middle 50 percent for adaptive icon safe area. No letters other than the abstract S form, no text, no borders. 1024x1024." Resized into assets/icon.png and assets/adaptive-icon.png.
- assets/generated/splash-source.png: "Use case: logo-brand. Asset type: Stillform apparel shopping app splash emblem. A single sculptural S-shaped folded ivory cotton ribbon, soft woven texture, centered on a flat pale gray green background #f6f7f7. Restrained contemporary clothing brand studio aesthetic, generous empty space, emblem confined to central 50 percent, square image, no other objects, no text, no border. Soft subtle shadows. This should be a clean companion to a deep forest green app icon." Resized into assets/splash.png.

- assets/generated/welcome-source.png: "Use case: photorealistic-natural. Asset type: wide login banner for Stillform, a restrained everyday apparel shop. Landscape 3:2 composition, two models standing in a bright neutral fashion studio, one in a cream cotton tee and one in a navy chore jacket, clean premium editorial photography, diffuse daylight, warm gray plaster backdrop. Frame them from waist up, keep BOTH complete heads and faces comfortably inside the central horizontal band of the picture with very generous space above their heads. Designed to crop into a 2:1 horizontal banner without cutting off faces. Restrained natural styling, no logos, no text, no furniture, no product catalog photo replacement." Encoded as assets/welcome.webp. The portrait auth photograph was tested first; its crop did not suit the short native banner.

## Review

Preserve the original theme tokens byte for byte. Use only existing Manrope type and Phosphor icons, large tappable controls, restrained fades honoring reduced motion, safe area padding, keyboard-aware forms, and real bundled photographs. No decorative filler or quick-add buttons on cards. Phone verification and screenshots are recorded in VERIFICATION.md.
