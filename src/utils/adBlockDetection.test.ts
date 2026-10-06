import { isAdBlocked } from './adBlockDetection';

describe('ad blocker detection', () => {
  let root: HTMLDivElement;
  let stylesheet: HTMLStyleElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    stylesheet = document.createElement('style');
    document.head.appendChild(stylesheet);
  });

  afterEach(() => {
    root.remove();
    stylesheet.remove();
  });

  it('does not flag a visible ad bait', () => {
    expect(isAdBlocked()).toBe(false);
    expect(root.childElementCount).toBe(0);
  });

  it('flags a bait hidden by an ad blocking rule', () => {
    stylesheet.textContent = '.adsbox { display: none !important; }';

    expect(isAdBlocked()).toBe(true);
    expect(root.childElementCount).toBe(0);
  });

  it('does not flag a page that hides all content', () => {
    root.style.visibility = 'hidden';

    expect(isAdBlocked()).toBe(false);
  });
});
