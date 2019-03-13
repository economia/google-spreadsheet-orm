// Third party
import { sheets_v4, google } from 'googleapis';
// Core
import { AbstractModel } from './models/AbstractModel';
import { SheetDesigner } from './sheets/SheetDesigner';
// Interfaces
import { Config } from './interfaces/Config';
import { ValuableMerge } from './interfaces/ValuableMerge';
import { ParsedRow } from './interfaces/ParsedRow';
import { WhereCondition } from './interfaces/WhereCondition';
// Decorators
import { SchemaColumns, column } from './decorators/column';
import { worksheet } from './decorators/worksheet';

/* eslint-disable */
declare global {
  namespace NodeJS {
    interface Global {
      models: (typeof AbstractModel)[];
    }
  }
}
/* eslint-enable */

// Singleton
let initialzed = false;

class SheetConnection {
  protected logger: Console;
  protected designer: SheetDesigner;
  protected config: Config;

  /**
   * Created new provider around logger
   * @param  {Logger} protectedlogger
   */
  private constructor(config: Config) {
    if (initialzed && !config.disableSingleton) throw new Error('SheetConnection can be used as singleton only!');
    this.config = Object.assign({}, config);
    this.logger = this.config.logger ? this.config.logger : console;
    this.designer = new SheetDesigner(this.config);
    initialzed = true;
  }

  static async connect(config: Config): Promise<SheetConnection>;
  static async connect(
    config: Config,
    email: string,
    key: any,
    keyId: any,
    scopes?: string[],
  ): Promise<SheetConnection>;
  static async connect(...args: any[]): Promise<SheetConnection> {
    let instance = new SheetConnection(args[0]);
    // build auth client
    if (args.length > 1 && !instance.config.authClient) {
      instance.config.authClient = SheetConnection.getAuthClient(args[1], args[2], args[3], args[4]);
    }
    await instance.validateModels();
    return instance;
  }

  /**
   * Validates and synces models properties with table collumns
   * @param  {typeofAbstractModel[]} ...models
   */
  async validateModels() {
    await Promise.all(
      global.models.map(async model => {
        let workSheetId = SheetConnection.getWorksheetID(model);
        let colMeta = SheetConnection.getModelCollumns(model);

        let cols = await this.designer.getCollumns(workSheetId);
        let match = colMeta.every(item => cols.includes(item)) && colMeta.length === cols.length;

        if (!match) {
          if (this.config.migrate === 'drop') {
            this.logger.warn(
              `Collumns ${cols.join(', ')} didnt match model ${colMeta.join(', ')} so the table was wiped.`,
            );
            await this.designer.clearWorksheet(workSheetId);
            await this.designer.setCollumns(workSheetId, colMeta);
          } else {
            this.logger.warn(
              'Model and table do not fit each other. You might want to consider backing up data and changing migrate to "drop"!',
            );
          }
        } else {
          this.logger.info('Model and table fits each other');
        }
      }),
    );
  }
  /**
   * Writes specific infot to database to its position marked by rowId
   * @param  {T} info
   * @returns Promise
   */
  async setInfo<T extends AbstractModel>(info: T): Promise<T> {
    let rId = Number(info.rowId);
    if (!(rId && rId > 0)) throw new Error('Must have rowId indicated its row');

    let pR = info.parsedRow;
    let wsId = SheetConnection.getWorksheetID(info.constructor as typeof AbstractModel);
    await this.designer.updateParsedRow(wsId, rId, pR);

    return info;
  }
  /**
   * Query for all data based on passed model constructor
   * @param  {T} infoConstructor
   * @returns Promise
   */
  async getInfos<T extends AbstractModel>(infoConstructor: new () => T, where?: WhereCondition): Promise<T[]> {
    let cols = SheetConnection.getModelCollumns(infoConstructor as typeof AbstractModel);
    let wsId = SheetConnection.getWorksheetID(infoConstructor as typeof AbstractModel);

    let data = await this.designer.readData({
      includeGridData: true,
      dataFilters: cols.map<sheets_v4.Schema$DataFilter>(col => {
        return {
          developerMetadataLookup: {
            metadataKey: 'colname',
            metadataValue: col,
            locationType: 'COLUMN',
            metadataLocation: {
              sheetId: wsId,
            },
          },
        };
      }),
    });
    let prows = this.parseRowsFromMetaFilter(data.sheets[0]);
    if (where) prows = this.applyWhere(prows, where);
    // fill to object
    return prows.map(prow => {
      let ne = new (infoConstructor as any)();
      ne.parsedRow = prow;
      return ne;
    });
  }
  /**
   * Applies where condition on the queried data, because GSheets cannot Where by value
   * @param  {ParsedRow[]} pRows
   * @param  {WhereCondition} where
   * @returns ParsedRow
   */
  private applyWhere(pRows: ParsedRow[], where: WhereCondition): ParsedRow[] {
    let ruleNames = Object.keys(where);
    let nRows: ParsedRow[] = [];
    pRows.forEach(row => {
      if (
        ruleNames.every(ruleName => {
          let rule = where[ruleName];
          if (typeof rule === 'function') {
            return rule(row[ruleName]);
          }
          return rule === row[ruleName];
        })
      ) {
        nRows.push(row);
      }
    });
    return nRows;
  }
  /**
   * Creates parsed rows collection based on query outpu
   * @param  {sheets_v4.Schema$Sheet} sheet
   */
  private parseRowsFromMetaFilter(sheet: sheets_v4.Schema$Sheet) {
    if (!sheet.data || sheet.data.length === 0)
      throw new Error('It seems like table was not formatted properly. Try again.');

    const getRowValues = (row: sheets_v4.Schema$RowData) => row.values || [];
    const unshiftFlat = (nestedArray: any[]): any => nestedArray[0] || [];
    const getCellValue = (cell: sheets_v4.Schema$CellData) => cell.formattedValue || '';
    const trimMap = (string: string) => string.trim();
    const parseRows = (row: sheets_v4.Schema$RowData) => trimMap(getCellValue(unshiftFlat(getRowValues(row))));

    const valuableMerge: ValuableMerge[] = sheet.data
      .map((column, index) => {
        try {
          const developerMetadata = column.columnMetadata[0].developerMetadata;
          const colName = developerMetadata.find(entry => entry.metadataKey === 'colname').metadataValue;
          const values = column.rowData.map(parseRows);
          return { colName, values };
        } catch (e) {
          this.logger.warn('Could not read column metadata for column at index ' + index);
        }
        return null;
      })
      .filter(Boolean);

    let pRows: ParsedRow[] = [];
    let rowCount = Math.max(...valuableMerge.map(item => item.values.length));
    for (let i = 1; i < rowCount; i++) {
      let nr: ParsedRow = {};
      valuableMerge.forEach(item => {
        nr[item.colName] = item.values[i];
        nr.rowId = i;
      });
      pRows.push(nr);
    }

    return pRows;
  }
  /**
   * Lists all collumns in model
   * @param  {typeofAbstractModel} modelConstructor
   * @returns SchemaColumns
   */
  static getModelCollumns(modelConstructor: typeof AbstractModel): SchemaColumns {
    return ((Reflect.getMetadata('schema:collumns', modelConstructor) || []) as SchemaColumns).slice(0);
  }
  /**
   * Sets new collumn colleciton to model
   * @param  {typeofAbstractModel} modelConstructor
   * @param  {SchemaColumns} collumns
   */
  static setModeCollumns(modelConstructor: typeof AbstractModel, collumns: SchemaColumns) {
    Reflect.defineMetadata('schema:collumns', collumns, modelConstructor);
  }
  /**
   * Gets worksheed ID of model
   * @param  {typeofAbstractModel} modelConstructor
   * @returns number
   */
  static getWorksheetID(modelConstructor: typeof AbstractModel): number {
    return Number(Reflect.getMetadata('schema:workSheetId', modelConstructor));
  }
  /**
   * Sets worksheed ID to model
   * @param  {typeofAbstractModel} modelConstructor
   * @param  {number} worksheedId
   */
  static setWorksheedID(modelConstructor: typeof AbstractModel, worksheedId: number) {
    Reflect.defineMetadata('schema:workSheetId', worksheedId, modelConstructor);
  }

  static getAuthClient(email: string, key: any, keyId: any, scopes?: string[]) {
    return new google.auth.JWT({
      email: email,
      key: key.replace(/\\n/g, '\n'),
      keyId: keyId,
      scopes: scopes || ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
}

// Export all utilities
export default SheetConnection;
export { SheetConnection, Config, WhereCondition, ParsedRow, SchemaColumns, AbstractModel, column, worksheet };
