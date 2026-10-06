// A failed ad-network request can mean CORS, a network outage, or an unfilled
// placement. Only report an ad blocker when a local ad bait is actually hidden.
export function isAdBlocked(): boolean {
  if (!document.body) return false;

  const host = document.getElementById('root') ?? document.body;
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:absolute;left:-10000px;top:0;pointer-events:none';
  const control = document.createElement('div');
  const bait = document.createElement('div');
  bait.className = 'adsbox ad-banner ad-unit advertisement';
  wrapper.setAttribute('aria-hidden', 'true');
  control.style.cssText = bait.style.cssText = 'width:10px;height:10px';
  wrapper.append(control, bait);

  try {
    host.appendChild(wrapper);
    const hidden = (element: HTMLElement) => {
      const style = window.getComputedStyle(element);
      return (
        !element.isConnected ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        style.opacity === '0' ||
        parseFloat(style.width) === 0 ||
        parseFloat(style.height) === 0
      );
    };
    return !hidden(control) && (!bait.isConnected || hidden(bait));
  } catch {
    return false;
  } finally {
    wrapper.remove();
  }
}
