import 'reflect-metadata';
import { AbstractModel } from '../models/AbstractModel';
import SheetConnection from '../';

export type SchemaColumns = string[];
/**
 * Adds collumn name into collumns metadata of model class
 * @param  {any} target
 * @param  {string} key
 */
export const column = (target: AbstractModel, key: string) => {
  let colMeta = SheetConnection.getModelCollumns(target.constructor as typeof AbstractModel);
  colMeta.push(key);
  SheetConnection.setModeCollumns(target.constructor as typeof AbstractModel, colMeta);
};
