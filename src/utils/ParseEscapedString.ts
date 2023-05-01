const CARDRE = /{{(.+?)\|(.+?)(?:\|(.+?))?}}/g;

const COLOR_MAPPING: { [key: string]: string } = {
  '0': 'gray',
  '1': 'red',
  '2': 'yellow',
  '3': 'blue'
};

export const replaceText = (inputString: string): string => {
  return inputString.replace(CARDRE, (match, p1, p2, p3 = '0') => {
    const color = COLOR_MAPPING[p3];
    const imgPath = `./WebpImages/${p1}.webp`;
    return `<span onmouseover="ShowDetail(event, '${imgPath}')" onmouseout="HideCardDetail()" style="color:${color}">${p2}</span>`;
  });
};
