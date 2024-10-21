// fancyTimeFormat.ts
function fancyTimeFormat(duration: number | undefined) {
  duration = duration ?? 0;
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  let ret = '';

  if (hrs > 0) {
    ret += '' + hrs + 'h' + (mins < 10 ? '0' : '');
  }

  ret += '' + mins + 'm' + (secs < 10 ? '0' : '');
  ret += '' + secs;

  return ret;
}

export { fancyTimeFormat };