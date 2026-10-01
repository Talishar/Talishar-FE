# Talishar Rewarded Ads System

## Overview

Talishar uses rev.iq as an ad management wrapper that loads Google's GPT (Google Publisher Tags) and other demand partners. Non-supporter players accumulate **rust counters** (max 3). When they reach 3, they can watch a rewarded ad to clear them via the **"Watch Ad to Clear"** button in `RustCounterPanel`.

---

## The Core Bug (Fixed June 2026)

### What was breaking

All buttons on the page became unresponsive ~2 seconds after page load (after the ad script finished loading). Clicking worked briefly at first, then stopped. This affected the main page, lobby, and in-game UI.

### Root cause

Google's ad SDK registers a **bubble-phase click listener on `document`** that calls `stopImmediatePropagation()` on every click. This prevents React's event delegation on `#root` from ever seeing the click — so no `onClick` handler in the entire app fires.

Confirmed via DevTools:
```
getEventListeners(document).click  →  all BUBBLE phase (not capture)
STOPIMMEDPROP target=_userDropdownTrigger_nrd79_231
  Event.stopImmediatePropagation @ VM...
  eval @ VM...:2984          ← Google's script
```

### The fix (`index.html`)

At the very top of the inline `<script>` in `<body>`, before any other script runs:

```javascript
(function() {
  var _origSP  = Event.prototype.stopPropagation;
  var _origSIP = Event.prototype.stopImmediatePropagation;
  function isExternalInterception(evt) {
    if (evt.type !== 'click') return false;
    var root = document.getElementById('root');
    if (!root || !evt.target || !root.contains(evt.target)) return false;
    var current = evt.currentTarget;
    // current inside #root  → our own game/UI code     → allow
    // current outside #root → external script           → block
    // current null          → post-dispatch call        → block (harmless)
    return !current || !root.contains(current);
  }
  Event.prototype.stopPropagation = function() {
    if (isExternalInterception(this)) return;
    return _origSP.call(this);
  };
  Event.prototype.stopImmediatePropagation = function() {
    if (isExternalInterception(this)) return;
    return _origSIP.call(this);
  };
})();
```

### Why `currentTarget` is the right check

| Who is calling stop | `currentTarget` | `root.contains(current)` | Result |
|---|---|---|---|
| Google's document listener | `document` | false | **blocked** ✓ |
| Game card click handler | element inside `#root` | true | allowed ✓ |
| React's onClick delegation | `#root` itself | true | allowed ✓ |
| Google post-dispatch call | `null` | — | **blocked** ✓ |

**Why it must be in `index.html` (not React):** The ad script loads ~2 seconds after page load. The override must be in place before that. React mounts too late.

**Why `currentTarget` null is blocked:** Google saves the event object and calls `stopImmediatePropagation` after dispatch ends (`currentTarget` becomes `null` per spec). At that point the event is done so blocking has no side effects, but it's still the right thing to do.

**What NOT to do:** An earlier version dropped `currentTarget` entirely (`isOurClick` — just checked if target was in `#root`). This blocked ALL stopImmediatePropagation for `#root` clicks, breaking in-game card interactions where game components use it legitimately.

---

## Ad Overlay Blocking (`useAdScript.ts`)

Google injects a transparent `position: fixed; width: 100vw; height: 100vh` overlay (`<ins id="gpt_unit_...">`) at `z-index: 2147483647`. Even invisible, it blocks pointer events.

### Fix: `lockNonRootBodyChildren()`

Runs on mount and every 150ms via `setInterval`:

```typescript
function lockNonRootBodyChildren() {
  if (!document.body) return;
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'root') continue;
    const h = el as HTMLElement;
    h.style.setProperty('pointer-events', 'none', 'important');
    h.querySelectorAll<HTMLElement>('*').forEach((child) => {
      child.style.setProperty('pointer-events', 'none', 'important');
    });
  }
}
```

Uses **inline `setProperty` with `'important'`** — this beats Google's stylesheet `!important`. CSS `<style>` tag approaches fail because inline `!important` beats stylesheet `!important`.

### Why broad targeting

Specific selector attempts (`ins[id*="gpt_unit"]`, etc.) failed because rev.iq also injects a `data-reviq-sticky-ad` div with `opacity: 0` (invisible but blocking). The broad "all non-root body children" approach catches everything regardless of ad network.

---

## Watch Ad to Clear Flow

### Button (`RustCounterPanel.tsx`)

```tsx
<button id="clearRust" onClick={() => (window as any)._talishar_showRewarded?.()}>
  Watch Ad to Clear
</button>
```

### `_talishar_showRewarded` (`index.html`)

```javascript
window._talishar_showRewarded = function() {
  if (_pendingMakeVisible) {
    window._talishar_unlockOverlays?.(); // re-enable pointer-events on ad overlay
    _pendingMakeVisible();               // GPT's makeRewardedVisible()
    _pendingMakeVisible = null;
  }
};
```

`_pendingMakeVisible` is stored from GPT's `rewardedSlotReady` event — we intercept it so the ad doesn't auto-show on any click:

```javascript
pubads.addEventListener = function(type, handler) {
  if (type !== 'rewardedSlotReady') return origOn(type, handler);
  return origOn(type, function(event) {
    _pendingMakeVisible = event.makeRewardedVisible.bind(event);
  });
};
```

After the ad closes (`rewardedSlotClosed` / `rewardedSlotGranted`), `lockNonRootBodyChildren` re-locks the overlay.

---

## Hash Blocking (`index.html`)

Google appends `#goog_rewarded` or `#google_vignette` to the URL to trigger ads. Stripped immediately, and `history.pushState`/`replaceState` are intercepted to prevent re-adding:

```javascript
var BLOCKED_HASHES = ['google_vignette', 'goog_rewarded'];
```

---

## `data-google-rewarded` Attribute Stripping (`useAdScript.ts`)

Google injects `data-google-rewarded="true"` on all `<button>` elements, making any button click trigger the rewarded ad. A `MutationObserver` strips these from every element except `#clearRust`:

```typescript
const REWARDED_ATTRS = ['data-google-rewarded', 'data-google-interstitial'];
// stripped from everything except id="clearRust"
```

---

## Floating Video Ad (`VideoAdDock.tsx`, `utils/videoAds.ts`)

The video player comes from a VidCrunch (Aniview) tag, `<script id="AV<tagId>" src="...vidcrunch.com/api/adserver/spt?AV_TAGID=...">`, which the provider injects into `<head>`. With no placement config the tag appends its player to the end of `<body>`, which is below the footer. `[data-ad="video"]` divs do nothing: rev.iq has no `video` placement and the tag never looks for them.

The tag reads `data-*` attributes on its own script element as config overrides. `installVideoAdTagConfig()` (called from `src/index.tsx`) watches `<head>`/`<body>` for the tag and sets:

| Attribute | Effect |
|------|------|
| `data-pos-selector="#talishar-video-ad"` | Build the player inside the dock's slot |
| `data-pos-timeout="1000000"` | Keep retrying every 250ms until a dock exists (the default gives up after 10s) |
| `data-destroy-on-host-removal="true"` | Destroy the player when the slot leaves the DOM, then disconnect the tag's body observer |
| `data-player-api="talisharVideoAdPlayer"` | Hand us the player so `AdStarted`/`AdImpression` reveal the dock even when the ad renders in a cross-origin iframe |

The slot carries `data-allow-click-listeners`. `index.html` silently drops `click` listeners added to elements inside `#root` (so ad SDKs can't wire Talishar's buttons), and without the exemption the player's pause, Stay/Next and mute buttons were dead while its pointer-driven timeline still worked.

The player's volume comes from the tag's own config: it starts "unmuted" at `volume.startValue` 0.001, and unmuting only clears the mute flag, so the speaker icon reads "on" at 0.1% volume. Only dragging the volume slider makes it audible.

`VideoAdDock` is rendered by `Header` and only mounts on `/`, `/game/load`, `/mastery`, `/learn`, `/about` and `/ads-test` (`isVideoAdRoute`). It stays `inert`, transparent and click-through until a video actually plays, so a loading or unfilled player never shows as a blank box or catches clicks. Moving between those pages keeps the same player; leaving them destroys it, and `restartVideoAdTagIfUsed()` re-inserts the tag when a dock mounts again. Desktop has no close button. Mobile (768px wide or less, or a touch-only device) gets a smaller dock with a close button, and closing it hides it until the next full page load.

---

## In-Game Ad (`InGameAd.tsx`)

The `in-game-block` placement sits under the chat in `RightColumn` on desktop, for non-supporters, when `VITE_IN_GAME_ADS_ENABLED=true`. It was pulled in July 2026 after a malicious creative escaped its slot, so it is fenced in on every side:

| Layer | What it stops |
|------|------|
| `.inGameAdBox`: fixed size, `overflow: hidden`, `contain: strict`, `isolation: isolate` | A creative painting, expanding or `position: fixed`-ing itself outside the box. Paint containment makes the box the containing block for fixed descendants too |
| Placement only mounts when the column is at least `IN_GAME_AD_SIZE` wide | rev.iq rendering a cropped or hidden 250x250. Narrower columns show the member CTA alone |
| `useAdScript(..., contained = true)` while the game runs | Everything outside `#root` stays hidden, video players included (they are raised on the main pages) |
| Iframe insertion guard | See below |
| Navigation guard | See below |

The member CTA sits under the placement, so it shows while the ad loads, when nothing fills, and under an ad blocker. The placement layer is `pointer-events: none` except for iframes, so the CTA stays clickable until a creative lands. `IN_GAME_AD_SIZE` must match the `in-game-block` size in the rev.iq config (`js.rev.iq/talishar.net`).

## Navigation and Iframe Guards (`useAdScript.ts`)

**Navigation guard.** A `navigate` listener on the Navigation API cancels any top-level navigation to a host outside `TRUSTED_HOST_RE` (talishar.net, metafy.gg, patreon.com, fablazing.com). If the user clicked or the page has user activation, the URL opens in a new tab instead, so ad clicks still work but never replace the page. The event only fires for navigations started by this document or a same-origin (friendly) iframe; cross-origin frames are covered by the sandbox.

rev.iq runs its own `navigation-security` module on the same event. Its config has `d` (hosts allowed within `T` ms of a trusted `pointerup`) and `q` (hosts always allowed). Anything Talishar navigates to by script after an `await` (Metafy login, Patreon linking, the Fablazing OAuth redirect) has to be in `q`.

**Iframe insertion guard.** `Node.prototype.appendChild` and `insertBefore` (the only methods GPT uses) are wrapped once and gated by a flag. An ad iframe gets `sandbox` without any `allow-top-navigation*` token before it is connected; an existing provider sandbox only loses those tokens. GPT's own `safeFrame: { sandbox: true }` keeps `allow-top-navigation-by-user-activation`, which lets a click on a malicious SafeFrame replace the page. Nested frames inherit the sandbox, so Prebid and APS creatives rendered inside a GPT friendly iframe are covered too. In contained mode every iframe React did not render counts as an ad iframe.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | `stopImmediatePropagation` override, hash blocking, rewarded slot interception — must run before any other script |
| `src/hooks/useAdScript.ts` | Rev.iq script injection, pointer-events locking, navigation guard, iframe insertion guard, attribute stripping |
| `src/routes/game/components/rightColumn/InGameAd.tsx` | Contained in-game slot with the member CTA underneath |
| `src/components/RustCounterPanel/RustCounterPanel.tsx` | "Watch Ad to Clear" button, calls `window._talishar_showRewarded` |
| `src/utils/videoAds.ts` | VidCrunch tag config overrides and restart |
| `src/components/ads/VideoAdDock.tsx` | Floating video ad dock on the main pages |

---

## Dead Ends (Do Not Retry)

- **CSS `pointer-events: none !important` in `<style>` tag** — Google's inline `!important` beats stylesheet `!important`
- **Blocking capture-phase `addEventListener`** — Google uses bubble phase, not capture
- **`isOurClick` (no currentTarget check)** — blocks game's own stopImmediatePropagation, breaks card play
- **Specific selector targeting** (`ins[id*="gpt_unit"]` etc.) — rev.iq injects with unpredictable IDs; use broad body-child sweep
- **Setting flag lazily from React** — ad script loads before React mounts; override must be unconditional from page load
- **Video ad slot in the footer or a zero-size `body > [data-ad="video"]` anchor**: the VidCrunch tag ignores both and lands after the footer, where the overlay lock hides it only some of the time
- **VidCrunch `data-spa="true"`**: after the first player is destroyed, its body observer reruns the whole tag on every DOM mutation (about 0.2ms per React commit, in games too) for the rest of the session
- **Wrapping `Location.prototype.href`/`assign`/`replace`**: those members are unforgeable own properties of `window.location`, so `Location.prototype` has none of them and the old nav guard was a silent no-op. A cross-origin frame's `top.location = ...` never touches the top window's Location object anyway
- **Sandboxing ad iframes from a MutationObserver**: sandbox flags are fixed when a frame navigates, and GPT's frames load (or get `document.write`) as soon as they are connected, so a sandbox added afterwards only applies to their next navigation
- **In-game slot with `overflow: visible`**: the 250x250 creative spilled past the right column, which is narrower than 250px below about 2084x1250
