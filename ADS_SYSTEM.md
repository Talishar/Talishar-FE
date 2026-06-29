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

## Key Files

| File | Role |
|------|------|
| `index.html` | `stopImmediatePropagation` override, hash blocking, rewarded slot interception — must run before any other script |
| `src/hooks/useAdScript.ts` | Rev.iq script injection, pointer-events locking, nav guard, iframe sandboxing, attribute stripping |
| `src/components/RustCounterPanel/RustCounterPanel.tsx` | "Watch Ad to Clear" button, calls `window._talishar_showRewarded` |

---

## Dead Ends (Do Not Retry)

- **CSS `pointer-events: none !important` in `<style>` tag** — Google's inline `!important` beats stylesheet `!important`
- **Blocking capture-phase `addEventListener`** — Google uses bubble phase, not capture
- **`isOurClick` (no currentTarget check)** — blocks game's own stopImmediatePropagation, breaks card play
- **Specific selector targeting** (`ins[id*="gpt_unit"]` etc.) — rev.iq injects with unpredictable IDs; use broad body-child sweep
- **Setting flag lazily from React** — ad script loads before React mounts; override must be unconditional from page load
