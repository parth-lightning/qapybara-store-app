# Stillform mobile

Standalone offline mobile twin of Stillform, built for QApybara demonstration testing. No backend, API key, remote images or dependency on the web project at runtime. No real payments or deliveries.

## Run

Node.js 22+, npm. `npm ci`, then `npm start`. Expo SDK **58** (`expo ~58.0.17`), React Native 0.88, React 19.3, TypeScript, Expo Router. Native modules require a development or release build. Demo login: **demo@qapybara.dev / Demo1234!**. New accounts are local to this installation and sign in through the same login form.

`npm run typecheck`, `npm test`, `npm run lint`, `npx expo-doctor`.

## Source parity and assets

Copied from `/home/shahid/codes/hackathons/qapybara-store-web` without modifying the website:

Source website commit at verification: `3bfaf82`.

- `design/tokens.ts`, `lib/catalog.ts`, `lib/pricing.ts`, `lib/schema.ts` are byte-identical copies. Tokens have no platform imports. Native consumers translate colors, type, shape and motion into React Native styles.
- All 25 original generated photographs in `design/assets-src` were copied into this app's `assets/products`, resized to at most 1000px and encoded as WebP at quality 85. `lib/images.ts` resolves the original catalog paths to bundled native assets.
- `lib/store.ts` adapts the web auth/local/order logic for a local native store. AsyncStorage persists accounts (salted SHA-256 password digests), session, appearance, per-user bags and order snapshots. This is an offline demo authentication implementation. There is no server session or cross-device sync.
- Two new built-in image generations: `assets/generated/icon-source.png` and `assets/generated/welcome-source.png`. The icon source supplies `assets/icon.png`, `assets/adaptive-icon.png` and `assets/splash.png`; the portrait supplies `assets/welcome.webp`. Empty-bag art reuses the original Dome room image. Prompts and design read: `design/DESIGN.md`.

Phosphor is pinned to 3.0.6. `scripts/fix-phosphor.cjs` runs on install and removes an unsupported web-only `className` prop from its direct native source export. This keeps direct icon imports small and compatible with native SVG types; no types are suppressed.

## Routes and behavior

`/login`, `/signup`; protected tabs `/` (home), `/shop`, `/cart`, `/orders`, `/account`; `/category/[slug]`, `/product/[id]`, `/checkout` (shipping, payment, review), `/confirmation`, `/order/[id]`.

Home includes hero, categories and featured products. Shop supports search, category selection, newest and price sorting, minimum/maximum price. Detail supports swipe gallery, light temperature, quantity and stock. Bags merge matching variants and enforce combined product stock. Badge counts quantities. Checkout validates the original US address rules and offers standard/express delivery and pay-on-delivery/demo-card payment. Placement re-parses inputs, checks current bag and aggregate catalog stock, recomputes integer-cent prices and totals, saves an immutable order snapshot and clears only the current user's bag in one persisted transaction. Request IDs make retries idempotent.

Pricing: standard delivery $8 below $250, free at $250 and over; express $18; tax 8% of subtotal rounded to integer cents. Fixed demo stock matches the website. Orders, bags and session persist after process restart. Users only see their own bag and orders. Appearance follows the system initially, with persisted system/light/dark choices in Account. Reanimated fades honor system reduced motion.

Key UI automation selectors have matching `testID` and `accessibilityLabel`: `login-email`, `login-password`, `login-submit`, `toggle-password`, `signup-name`, `signup-email`, `signup-password`, `signup-submit`, `search-products`, `product-{id}`, `add-to-cart-{id}`, detail `add-to-cart`, `cart-badge`, `cart-increase-{index}`, `cart-decrease-{index}`, `cart-remove-{index}`, `checkout-start`, `shipping-{field}`, `checkout-shipping-next`, `checkout-payment-next`, `delivery-standard`, `delivery-express`, `payment-delivery`, `payment-card`, `place-order`, `order-number`, `view-orders`, `theme-{system|light|dark}`, `sign-out`.

## Android release

Application name **Stillform**, package **dev.qapybara.stillform**. Locally debug-signed release for the connected arm64 phone. Generated native folders and build outputs are ignored; rebuild from app config:

```sh
export ANDROID_HOME=/home/shahid/Android/Sdk
export JAVA_HOME=/home/shahid/.local/share/java/jdk-17
npx expo prebuild --platform android --no-install
./android/gradlew -p android assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=4
adb -s 82f1c8d5 install -r android/app/build/outputs/apk/release/app-release.apk
```

Equivalent: `scripts/build-android.sh`. Omit the architecture property to build all configured ABIs.

Final APK: `/home/shahid/codes/hackathons/qapybara-store-app/android/app/build/outputs/apk/release/app-release.apk` (**36,097,699 bytes, 34.43 MiB**). Its SHA-256 matches the APK installed on the phone.

Verification: **42 unit tests pass**, TypeScript and lint pass, **20/20 Expo Doctor checks pass**. The full requested phone journey was exercised, including wrong and correct login, signup/sign-in, shopping, both delivery/payment choices, checkout validation, order confirmation/history, persistence, and account isolation. Details and resolved findings are in `design/VERIFICATION.md`. Screenshots are in `design/screenshots/`. `scripts/phone.py` uses only ADB input, UI Automator dumps and screencap, pinned to device `82f1c8d5`.
