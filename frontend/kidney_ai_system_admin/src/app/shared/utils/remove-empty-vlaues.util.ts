import { DynamicObjectI } from '../interfaces/dynamic-object.interface';
import { checkNullability } from './nullability.util';

export const removeEmptyValues = (data: DynamicObjectI): DynamicObjectI => {
  let fields: DynamicObjectI = {};
  Object.keys(data).forEach((key) =>
    checkNullability(data[key]) ? (fields[key] = data[key]) : key,
  );

  return fields;
};
