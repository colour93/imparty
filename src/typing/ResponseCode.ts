export interface ResponseBase {
  code: number;
  msg: string;
  data?: object;
}

const SUCCEED: ResponseBase = {
  code: 200,
  msg: "",
};

const UNAUTHORIZED: ResponseBase = {
  code: 401,
  msg: "未登录",
};

const NOT_FOUND: ResponseBase = {
  code: 404,
  msg: "未找到",
};

const BAD_REQUEST: ResponseBase = {
  code: 400,
  msg: "请求错误",
};

const CONFLICT: ResponseBase = {
  code: 409,
  msg: "已存在",
};

const INTERNAL_ERROR: ResponseBase = {
  code: 500,
  msg: "内部错误",
};

const NOT_MODIFIED: ResponseBase = {
  code: 304,
  msg: "无更改",
};

export const ResponseCode = {
  SUCCEED,
  UNAUTHORIZED,
  NOT_FOUND,
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_ERROR,
  NOT_MODIFIED,
};
