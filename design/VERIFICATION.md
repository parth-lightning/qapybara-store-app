# Verification

2026-10-22. Physical Android 15 phone, ADB serial `82f1c8d5`. Only Stillform was installed or updated. No other app was uninstalled or changed.

## Release

- Expo SDK 58, Expo 58.0.17, React Native 0.88.0.
- Package `dev.qapybara.stillform`, application label Stillform, version 1.0.0.
- Release build, debug signing as permitted, arm64-v8a for the connected phone. Min SDK 24, target SDK 36, compile SDK 37.
- APK: `/home/shahid/codes/hackathons/qapybara-store-app/android/app/build/outputs/apk/release/app-release.apk`.
- 36,097,699 bytes, 34.43 MiB.
- SHA-256 `b6fa044aff64f81fbc5a2d20d9ac8734b89a919b0e8f9b63b6af13aac778b1e1`.
- `apksigner verify` passes. The installed phone APK has the identical SHA-256. Evidence: `release.json` and `device-apk-verification.json`.
- Full requested `expo prebuild --platform android` and Gradle `assembleRelease` completed. The first build took 27m 37s. Subsequent fixes were rebuilt with `:app:assembleRelease`; the final build succeeded in 1m. Logs: `android-build.log`, `android-final-build.log`.

## Automated checks

- `npx tsc --noEmit`: pass, no diagnostics (`typecheck.log`).
- `npm run lint`: pass, no warnings or errors (`lint.log`).
- `npx expo-doctor`: 20/20 checks pass (`expo-doctor.log`).
- `npm test`: 42 tests pass in one jest-expo suite (`unit-tests.log`). Pricing 5, cart operations/recovery 11, validation 9, auth 6, order placement 9, persistence boundaries 2.
- Tests cover standard and express delivery, free delivery, cents and tax, variant merging, combined stock, quantity/remove behavior, invalid addresses/credentials, duplicate accounts, signup then login, order revalidation, idempotency, immutable order prices, current-user-only cart clearing and storage round trips.
- Final byte comparisons pass for `design/tokens.ts`, `lib/catalog.ts`, `lib/pricing.ts`, `lib/schema.ts` against the website. Source website commit at verification: `3bfaf82`.

## Phone journey

All interaction used ADB shell input, UI Automator dumps and `adb exec-out screencap -p`. `scripts/phone.py` is the helper. The journey was iterated during fixes, with affected flows rechecked after rebuilding. Final APK smoke checks repeated auth, cart actions and switching between the saved accounts.

- Launch signed out. The app follows the dark system theme. Wrong demo credentials show the expected error. Show/hide changes the native password accessibility flag. Correct demo credentials sign in.
- Home hero, category navigation, all-products screen and search work. Dome search opens the matching detail. The gallery swipes to page 2 of 3. Soft white selection and detail add-to-bag work.
- Increase Dome to quantity 2. Badge shows 2; subtotal $378.00, standard delivery $0.00, tax $30.24, total $408.24. Force-stop and restart preserve the session, manual appearance and bag.
- Submit empty shipping. Inline field errors appear and the page returns to the fields. Enter a valid US address. The keyboard leaves focused fields visible. Select express and demo card, review the correct $426.24 total, then place the order.
- Order `SF-F8381DB9-80EC-4167-818A-9BB5917850BB` appears in confirmation, history and detail. The bag is empty. Force-stop and restart preserve the order.
- Switch manually between light and dark. Search, products, cart, checkout, orders and forms retain the Stillform theme.
- Sort by ascending price and apply $100 to $130 range. Exactly two lights remain, Line and Cone, in price order. Fold is out of stock; native add buttons are disabled in list and detail.
- Add Pivot from the list. Its $99.00 subtotal, $8.00 delivery and $7.92 tax produce $114.92. Remove it and verify the photographed empty bag. Add it again and complete standard delivery / pay-on-delivery checkout.
- Order `SF-6A7CA970-7254-4912-AA48-6C6E54B7B117` is confirmed at $114.92 and appears in history. Both payment choices are demo-only and take no charge.
- Sign out. Submit invalid signup, correct fields, register Taylor Reed (`phone20261022@qapybara.dev` / `Phone1234!`). The account-created message appears. Sign in with the new credentials. The new user sees no demo orders and an empty bag. A process restart preserves this registered session.
- Install the exact final APK. The registered session survives the update. Add Pivot, increase to quantity 2 ($221.84), remove, confirm empty, then add one Pivot again. Sign out. Repeat demo login failure, native password show/hide and successful login. Demo still has its own empty bag and two orders, while the registered user's saved Pivot remains separate.
- Empty search shows the real empty state; clear filters restores results. The floor category filter returns four lights.

Final phone state: demo account signed in, Light selected, demo bag empty, two verification orders. The separate registered test account has one Pivot in its saved bag. Fresh installations start with no accounts beyond the seeded demo login and no bags/orders; test data exists only on the verification phone.

## Findings fixed and rechecked

- Android edge-to-edge keyboard handling initially covered lower shipping fields. Explicit KeyboardAvoidingView behavior and the SDK's actual header height now size the form viewport correctly. The ADB helper also avoids keyboard-covered coordinates. Both shipping and signup were rechecked.
- Corrected fields initially retained stale validation styling until the next submit. Errors now clear as that field is edited. The final dark shipping keyboard capture shows valid fields without stale errors.
- Phosphor's direct source export passes an unsupported web-only className prop to native Svg. The pinned, idempotent postinstall fix removes that prop. Direct imports include five icons instead of the entire icon library, reducing the release graph from 4,816 to about 1,800 modules. No types are suppressed.
- A saved unavailable item can now be removed, and a delayed quantity event cannot recreate a removed line. Dedicated recovery tests pass; ordinary cart add/change/remove was rechecked on the exact final APK.
- One intermediate packaging attempt failed because dependency cleanup overlapped the build. Dependencies were stabilized and the build rerun sequentially. The final release succeeds.

No requested verification step remains blocked. This is intentionally an offline demo store with no real payment or fulfillment service.

## Screenshots

Native captures in `screenshots/` include both themes: login/errors, home, category/filter, search/empty search, gallery/detail/stock, cart/empty/restored cart, shipping validation and keyboard, payment/review/confirmation, orders/detail, signup/validation/success and registered-account isolation. Each PNG is an unedited full-device screencap.
