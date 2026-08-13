interface IApiSuccess<T> {
  success: true;
  data: T;
}

interface IApiErrorBody {
  code: string;
  message: string;
}

interface IApiError {
  success: false;
  error: IApiErrorBody;
}

type IApiResponse<T> = IApiSuccess<T> | IApiError;

export type { IApiSuccess, IApiErrorBody, IApiError, IApiResponse };
