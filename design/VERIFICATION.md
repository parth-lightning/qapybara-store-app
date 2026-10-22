# Apparel release verification

Verified on 22 October 2026 in Asia/Kolkata. Website source commits: `7d6379a` and `8e86a75`. App: `dev.qapybara.stillform`. Phone: Redmi Note 10 Lite, serial `82f1c8d5`.

## Automated checks

- `npx jest --runInBand`: **50 tests pass**.
- `npx tsc --noEmit`: **passes**.
- `npx expo lint`: **passes**.
- `bash -n scripts/build-android.sh`: **passes**.
- Catalog, pricing, schema and design tokens match the website byte for byte.
- All 38 website WebP images are unchanged copies. Each image and the separately generated login banner was also found byte for byte inside the release APK.
- Tests cover category/product counts, both size sets, required and category-correct sizes, separate clothing-size lines and persisted snapshots, standard delivery below/at/above $150, express delivery, 8% tax, deterministic six-digit order numbers, authentication, account separation, combined stock validation, idempotent order placement and catalog upgrades.

`copy-audit.txt` records source matches for the requested words and long dash characters. Remaining matches are theme configuration, internal legacy login credentials, and website descriptions of lightweight apparel. There are no retired product references, long dash characters, gallery instructions, progress breadcrumbs or developer-facing shop notices. Bag and order history titles are shown once; order details use the short order number as their main content heading.

## Build and artifact

Expo prebuild and Gradle `assembleRelease` pass. The final incremental build completed in 2m 32s. Logs: `android-build.log` and `android-final-build.log`.

APK: `android/app/build/outputs/apk/release/app-release.apk`

- **38,358,763 bytes (36.58 MiB)**
- SHA-256: `104c6b7182129bb5d727d1f61105f955e828079e6550ba1d33a4d8e39c45a473`
- arm64-v8a; locally debug-signed release for device testing.
- Installed using `adb -s 82f1c8d5 install -r`.
- Artifact metadata: `release.json`. Installed APK comparison: `device-apk-verification.json`.

Gradle skipped an image-only change during an incremental build. The build script now explicitly invalidates the generated JS/assets bundle before assembly, and the new login image was verified inside the APK. Dependency deprecation warnings remain informational; there are no build errors.

## Physical-device journey

Airplane mode was enabled, Wi-Fi disabled and cellular data disabled during the entire app journey. All interactions used ADB input, UI Automator and screencap through `scripts/phone.py`; Artemis also confirmed the connected phone and initial screen. Screenshots are actual 1080 × 2400 phone captures.

1. Installed over the previous release without clearing data. Existing local account/session and appearance survived; retired catalog lines and orders were removed on restoration.
2. Signed out, checked rejected credentials, opened signup, checked inline validation, created Riley Stone's local account and signed in offline.
3. Browsed home and the Sneakers category. Cards show only photo, name, colour and price. Opened Court Leather, confirmed no size was selected, and tapped Add to bag to see "Please select a size". Chose US 9 and added it.
4. Verified bag size, badge and pricing. One pair: $135 subtotal + $8 delivery + $10.80 tax = **$153.80**. Increasing quantity to two changed the message to "You get free delivery." and shipping to $0; decreasing restored "Add $15.00 more for free delivery.".
5. Checked empty shipping validation, entered a US address, selected standard delivery and pay on delivery, reviewed, placed the sneaker order and opened its history/detail. Order **SF-573462**, size 9, **$153.80**.
6. Changed to dark appearance. Searched for Daily Tee and swiped to its second bundled photo. Checked missing-size validation, then added M and L. The same product appeared as two bag lines. Express delivery and Card were retained through review and placement. Order **SF-634504**, two sizes, **$93.60** ($70 + $18 + $5.60).
7. Restarted the app and installed the refreshed image APK without clearing data. Session, theme and both orders remained. Confirmed empty bag, signed out, checked dark login/signup and signed back in.
8. In light appearance, checked empty search and empty bag copy. Added an XL tee, force-stopped and relaunched the app, confirmed size XL remained, then removed it. Rechecked rejected and correct login.
9. Repeated the two-size clothing purchase on the final compact order layout with standard delivery. Order **SF-113268**, **$83.60** ($70 + $8 + $5.60). Switched the system between light and dark while Follow system was selected; the confirmation updated correctly in place. Both actions fit on screen. Restarted again and confirmed all three orders remained.
10. Refreshed order-list/detail, category and product screenshots in both themes. Screenshot review led to the wider login image, compact order grouping, removal of redundant order headings, and singular "1 product" copy.

The initial ADB sequence sent Back twice while dismissing the keyboard, returning to the bag. The automation timing was corrected and checkout was repeated successfully. This was a verification-script issue, with no app change needed.

## Storage and limits

Accounts, session and appearance survive the catalog update. Retired product bags/orders are removed; current-catalog storage still requires schema validation. New snapshots preserve product, size, quantity, price and short order number. Request UUIDs remain internal and are never displayed. Local authentication and simulated payment/fulfillment remain entirely offline, with no remote service or cross-device synchronization.

## Screenshots

All old screenshots were replaced. The full filename list follows; generated art sources and prompts are in `DESIGN.md`.

- [phone-dark-account.png](screenshots/phone-dark-account.png)
- [phone-dark-bag-two-sizes.png](screenshots/phone-dark-bag-two-sizes.png)
- [phone-dark-category.png](screenshots/phone-dark-category.png)
- [phone-dark-checkout-validation.png](screenshots/phone-dark-checkout-validation.png)
- [phone-dark-confirmation.png](screenshots/phone-dark-confirmation.png)
- [phone-dark-delivery.png](screenshots/phone-dark-delivery.png)
- [phone-dark-empty-bag.png](screenshots/phone-dark-empty-bag.png)
- [phone-dark-gallery.png](screenshots/phone-dark-gallery.png)
- [phone-dark-home.png](screenshots/phone-dark-home.png)
- [phone-dark-login.png](screenshots/phone-dark-login.png)
- [phone-dark-order-detail.png](screenshots/phone-dark-order-detail.png)
- [phone-dark-order-express.png](screenshots/phone-dark-order-express.png)
- [phone-dark-orders-restored.png](screenshots/phone-dark-orders-restored.png)
- [phone-dark-orders.png](screenshots/phone-dark-orders.png)
- [phone-dark-payment.png](screenshots/phone-dark-payment.png)
- [phone-dark-product-clothing.png](screenshots/phone-dark-product-clothing.png)
- [phone-dark-product-sneaker.png](screenshots/phone-dark-product-sneaker.png)
- [phone-dark-review.png](screenshots/phone-dark-review.png)
- [phone-dark-search.png](screenshots/phone-dark-search.png)
- [phone-dark-shipping.png](screenshots/phone-dark-shipping.png)
- [phone-dark-signup.png](screenshots/phone-dark-signup.png)
- [phone-dark-size-required.png](screenshots/phone-dark-size-required.png)
- [phone-dark-sizes-clothing.png](screenshots/phone-dark-sizes-clothing.png)
- [phone-light-account.png](screenshots/phone-light-account.png)
- [phone-light-bag-restored.png](screenshots/phone-light-bag-restored.png)
- [phone-light-bag-two-sizes.png](screenshots/phone-light-bag-two-sizes.png)
- [phone-light-bag.png](screenshots/phone-light-bag.png)
- [phone-light-category.png](screenshots/phone-light-category.png)
- [phone-light-checkout-validation.png](screenshots/phone-light-checkout-validation.png)
- [phone-light-confirmation.png](screenshots/phone-light-confirmation.png)
- [phone-light-delivery.png](screenshots/phone-light-delivery.png)
- [phone-light-empty-bag.png](screenshots/phone-light-empty-bag.png)
- [phone-light-empty-search.png](screenshots/phone-light-empty-search.png)
- [phone-light-free-delivery.png](screenshots/phone-light-free-delivery.png)
- [phone-light-home.png](screenshots/phone-light-home.png)
- [phone-light-login-error.png](screenshots/phone-light-login-error.png)
- [phone-light-login.png](screenshots/phone-light-login.png)
- [phone-light-order-detail.png](screenshots/phone-light-order-detail.png)
- [phone-light-order-sneaker.png](screenshots/phone-light-order-sneaker.png)
- [phone-light-orders.png](screenshots/phone-light-orders.png)
- [phone-light-payment.png](screenshots/phone-light-payment.png)
- [phone-light-product-clothing.png](screenshots/phone-light-product-clothing.png)
- [phone-light-product-sneaker.png](screenshots/phone-light-product-sneaker.png)
- [phone-light-review.png](screenshots/phone-light-review.png)
- [phone-light-search.png](screenshots/phone-light-search.png)
- [phone-light-shipping.png](screenshots/phone-light-shipping.png)
- [phone-light-signup-validation.png](screenshots/phone-light-signup-validation.png)
- [phone-light-signup.png](screenshots/phone-light-signup.png)
- [phone-light-size-required.png](screenshots/phone-light-size-required.png)
- [phone-light-sizes-sneaker.png](screenshots/phone-light-sizes-sneaker.png)

## Completion

All 50 screenshots were visually inspected, including the final compact confirmations and order details. The installed APK SHA-256 matches the built APK exactly. The phone's original network settings and system night mode were restored. Final app state: Riley Stone signed in, Light selected, empty bag, three local test orders. No requested step remains blocked.
