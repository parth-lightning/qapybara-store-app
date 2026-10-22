# Stillform mobile

An offline Expo shopping app for sneakers and clothes. Accounts, sessions, per-user bags, orders and appearance are saved locally with AsyncStorage. All photography and fonts are bundled; no backend or network is required. Payments and fulfillment are simulated.

## Run

Node.js 22+, npm. Run `npm ci`, then `npm start`. Expo SDK 58, Expo Router, React Native 0.88, React 19.3 and TypeScript. Use a native development or release build for native modules.

Existing test login remains `demo@qapybara.dev` / `Demo1234!`. You can also create and sign into local accounts. Passwords are stored as salted SHA-256 digests; this local implementation does not provide server authentication or cross-device sync.

## Website parity

Source: `/home/shahid/codes/hackathons/qapybara-store-web`, commits `7d6379a` and `8e86a75`.

- `lib/catalog.ts`, `lib/pricing.ts`, `lib/schema.ts` and `design/tokens.ts` are byte-identical copies.
- All 38 `public/images/*.webp` files are copied unchanged into `assets/products`. `lib/images.ts` maps their website paths to bundled native modules. Login uses a new wide editorial image in `assets/welcome.webp`.
- The 16 products are split evenly across Sneakers, Tops, Bottoms and Outerwear. Prices, colours, descriptions, facts and sizes match the website.
- New built-in image generations supply the fabric S app icon, splash image and wide login photograph. Sources and exact prompts are recorded in `design/DESIGN.md`.

## Shopping

Protected routes: `/`, `/shop`, `/category/[slug]`, `/product/[id]`, `/cart`, `/checkout`, `/confirmation`, `/orders`, `/order/[id]`, `/account`. Signed-out users see `/login` and `/signup`.

Search, category filtering, newest/price sorting and price ranges work locally. Cards show photo, name, colour and price. Product details offer two swipeable photos, facts and care, quantity controls, and an always-visible purchase button. No size is preselected: sneakers use US 7 to 12; clothing uses XS to XL. Adding without a size shows "Please select a size". Matching product/size pairs merge; different sizes stay separate. Combined stock is enforced across sizes.

Standard delivery costs $8 below $150 and is free from $150. Express costs $18. Tax is 8% of subtotal, rounded to cents. Delivery estimates are 4 to 6 days standard and 1 to 2 days express. Checkout validates US addresses and supports pay on delivery or simulated card payment.

Order placement revalidates size, stock, current bag and address, recomputes totals, stores a product/size/price snapshot, and clears only the signed-in user's bag. Request UUIDs provide idempotency internally; displayed order numbers use the website's deterministic `SF-` plus six-digit format. Existing accounts, session and appearance survive the catalog upgrade; retired catalog bags and orders are removed during restoration. Invalid current-catalog data triggers the existing storage error/retry state.

Light, dark and system appearance persist through restarts. Reanimated fades respect reduced motion. Existing Phosphor compatibility fix in `scripts/fix-phosphor.cjs` runs after install.

## Checks and Android

```sh
npx jest --runInBand
npx tsc --noEmit
npm run lint
bash scripts/build-android.sh
adb -s 82f1c8d5 install -r android/app/build/outputs/apk/release/app-release.apk
```

The build script sets the local JDK/Android SDK paths, regenerates Android with `npx expo prebuild --platform android --no-install`, forces regeneration of the JavaScript/assets bundle so image-only updates are included, then runs Gradle `assembleRelease` for arm64. Release APKs are locally debug-signed for device testing. Generated native folders and APK outputs are ignored.

APK: `android/app/build/outputs/apk/release/app-release.apk`. Exact size, hash, test results and physical-device journey evidence are recorded in `design/VERIFICATION.md` and `design/release.json`. Current screenshots live in `design/screenshots`.

Automation labels include `login-*`, `signup-*`, `search-products`, `filter-{category}`, `product-{id}`, `size-{value}`, `add-to-cart`, `quantity-{increase|decrease}`, `cart-badge`, `cart-{increase|decrease|remove}-{index}`, `checkout-start`, `shipping-{field}`, `delivery-{standard|express}`, `payment-{delivery|card}`, `checkout-shipping-next`, `checkout-payment-next`, `place-order`, `order-number`, `view-orders`, `theme-{system|light|dark}`, and `sign-out`. `scripts/phone.py` uses ADB input, UI Automator and screencap on serial `82f1c8d5`.
