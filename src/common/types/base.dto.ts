export class BaseResponse<T> {
  ok: boolean;
  message: string;
  data?: T;
  error?: any;
}
