export const FormatDate = (nowDate, num = 0) => {
  let newDate = new Date(nowDate);
  newDate.setDate(newDate.getDate() + num);
  let o = {
    'Y': 1900 + newDate.getYear(),
    'M': '0' + (newDate.getMonth() + 1),
    'D': '0' + newDate.getDate(),
    'HH': newDate.getHours(),
    'mm': newDate.getMinutes()
  };
  let nowTime = o.Y + '-' + o.M.substring(o.M.length - 2, o.M.length) + '-' + o.D.substring(o.D.length - 2, o.D.length);
  return nowTime;
};
