import { HttpStatusCode } from '@angular/common/http';
import { DynamicObjectI } from './dynamic-object.interface';

export interface ResponseFromBackendI<
  T = string | number | DynamicObjectI | DynamicObjectI[] | string[] | number[],
> {
  frontFacingMessage: string;
  data: T;
  httpStatus: HttpStatusCode;
}
