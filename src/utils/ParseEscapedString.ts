const CARDRE = /{{(.+?)\|(.+?)\|(.+?)}}/g;

export const replaceText = (inputString: string): string => {
  const mapping: { [key: string]: string } = {
    '0': 'gray',
    '1': 'red',
    '2': 'yellow',
    '3': 'blue'
  };

  return inputString.replace(CARDRE, (match, p1, p2, p3) => {
    const color = mapping[p3];
    const imgPath = `./WebpImages/${p1}.webp`;
    return `<span onmouseover="ShowDetail(event, '${imgPath}')" onmouseout="HideCardDetail()" style="color:${color}">${p2}</span>`;
  });
};
