export class GenericResponseBean<T>{
  success: boolean;
  message: string;
  data: T;
  exceptionCode: string;
  exceptionMessage: string;
  timestamp?: string;
}
