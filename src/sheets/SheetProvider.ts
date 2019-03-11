import { google, sheets_v4 } from 'googleapis';
import { ParsedRow } from '../interfaces/ParsedRow.js';
import { Config } from '../interfaces/Config.js';
export const sheets = google.sheets('v4');

export abstract class SheetProvider {
  constructor(protected config: Config) {}

  /**
   * Sends a get query based on its parameters to the configured spreadsheet
   * @param	{sheets_v4.Schema$GetSpreadsheetByDataFilterRequest} filter?
   * @returns Promise
   */
  async readData(filter?: sheets_v4.Schema$GetSpreadsheetByDataFilterRequest): Promise<sheets_v4.Schema$Spreadsheet> {
    let axiosResponse = await sheets.spreadsheets.getByDataFilter({
      spreadsheetId: this.config.spreadsheetId,
      auth: this.config.authClient,
      requestBody: filter || undefined,
    });
    return axiosResponse.data;
  }
  async updateData(writerRanges: sheets_v4.Schema$DataFilterValueRange[]) {
    let axiosRepsonse = await sheets.spreadsheets.values.batchUpdateByDataFilter({
      auth: this.config.authClient,
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        data: writerRanges,
        valueInputOption: 'RAW',
      },
    });
    return axiosRepsonse.data;
  }
  /**
   * Gets worksheet, optionaly with data
   * @param	{number} worksheetId
   * @param	{boolean=false} withData
   */
  async getWorksheetByID(worksheetId: number, withData: boolean = false) {
    let sSheet = await this.readData({
      dataFilters: [{ gridRange: { sheetId: worksheetId } }],
      includeGridData: withData,
    });
    if (sSheet.sheets && sSheet.sheets.length > 0) {
      return sSheet.sheets[0];
    }
    return null;
  }

  async readFromGrindRange(grindRange: sheets_v4.Schema$GridRange, withData: boolean = false) {
    let sHeet = await this.readData({
      dataFilters: [{ gridRange: grindRange }],
      includeGridData: withData,
    });
    return sHeet;
  }
  /**
   * Writed data to specific range
   * Data are represented by 2D array
   * @param  {sheets_v4.Schema$GridRange} grindRange
   * @param  {any[][]} values
   */
  async writeToGridRange(grindRange: sheets_v4.Schema$GridRange, values: any[][]) {
    await sheets.spreadsheets.values.batchUpdateByDataFilter({
      spreadsheetId: this.config.spreadsheetId,
      auth: this.config.authClient,
      requestBody: {
        data: [
          {
            dataFilter: {
              gridRange: grindRange,
            },
            values: values,
          },
        ],
        valueInputOption: 'RAW',
      },
    });
  }
  async updateParsedRow(worksheedId: number, rowId: number, parsedRow: ParsedRow) {
    // google sheet cheat
    let emptyAr = Array(rowId).fill([]);
    // write data
    return this.updateData(
      Object.keys(parsedRow).map<sheets_v4.Schema$DataFilterValueRange>(col => {
        return {
          values: [...emptyAr, [parsedRow[col]]],
          majorDimension: 'ROWS',
          dataFilter: {
            developerMetadataLookup: {
              metadataKey: 'colname',
              metadataValue: col,
              metadataLocation: {
                sheetId: worksheedId,
              },
            },
          },
        };
      }),
    );
  }
  /**
   * Returns metadata for a key of all collumns
   * @param  {number} worksheetId
   * @param  {string} key?
   */
  async getCollumnsMetadata(worksheetId: number, key?: string) {
    return sheets.spreadsheets.developerMetadata.search({
      spreadsheetId: this.config.spreadsheetId,
      auth: this.config.authClient,
      requestBody: {
        dataFilters: [
          {
            developerMetadataLookup: {
              metadataKey: key,
              metadataLocation: {
                locationType: 'COLUMN',
                sheetId: worksheetId,
              },
            },
          },
        ],
      },
    });
  }
  /**
   * Wipes metdata of all collumns
   * Optionally based on key
   * @param  {number} worksheedId
   * @param  {string} key?
   */
  async clearCollumnsMetadata(worksheedId: number, key?: string) {
    return sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      auth: this.config.authClient,
      requestBody: {
        requests: [
          {
            deleteDeveloperMetadata: {
              dataFilter: {
                developerMetadataLookup: {
                  metadataKey: key,
                  metadataLocation: {
                    locationType: 'COLUMN',
                    sheetId: worksheedId,
                  },
                },
              },
            },
          },
        ],
      },
    });
  }
  /**
   * Sets metadata for more then one collumn
   * @param  {number} worksheedId
   * @param  {number} startColIndex
   * @param  {string} key
   * @param  {string[]} values
   */
  async massCreateCollumnMetadata(worksheedId: number, startColIndex: number, key: string, values: string[]) {
    return sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      auth: this.config.authClient,
      requestBody: {
        requests: values.map((value, index) => {
          return {
            createDeveloperMetadata: {
              developerMetadata: {
                metadataKey: key,
                metadataValue: value,
                visibility: 'DOCUMENT',
                location: {
                  dimensionRange: {
                    startIndex: index + startColIndex,
                    endIndex: index + startColIndex + 1,
                    dimension: 'COLUMNS',
                    sheetId: worksheedId,
                  },
                },
              },
            },
          };
        }),
      },
    });
  }
  /**
   * Sets metadata for specific collumn
   * @param  {number} worksheedId
   * @param  {number} colIndex
   * @param  {string} key
   * @param  {string} value
   */
  async createCollumnMetadata(worksheedId: number, colIndex: number, key: string, value: string) {
    return this.massCreateCollumnMetadata(worksheedId, colIndex, key, [value]);
  }
  /**
   * Wipes data from specific grid range
   * @param  {sheets_v4.Schema$GridRange} grindRange
   */
  async clearGridRange(grindRange: sheets_v4.Schema$GridRange) {
    await sheets.spreadsheets.values.batchClearByDataFilter({
      spreadsheetId: this.config.spreadsheetId,
      auth: this.config.authClient,
      requestBody: {
        dataFilters: [
          {
            gridRange: grindRange,
          },
        ],
      },
    });
  }
}
