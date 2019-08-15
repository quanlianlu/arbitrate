// 投诉类型
export const constant = {
  waybillNoRegular: () => {
    return /[A-Za-z0-9]{2}[0-9]{16}|[Y][0-9]{12}|[A-Za-z0-9]{2}[0-9]{10}|[A-Za-z0-9]{2}[0-9]{8}/;
  }
};
