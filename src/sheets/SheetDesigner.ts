import { SheetProvider } from './SheetProvider';
import { Config } from '../interfaces/Config';

export class SheetDesigner extends SheetProvider {
  constructor(protected config: Config) {
    super(config);
  }

  /**
   * Returns collumn names of worksheet
   * @param  {number} worksheedId
   * @returns {string[]}
   */
  async getCollumns(worksheedId: number): Promise<string[]> {
    let sM = await this.getCollumnsMetadata(worksheedId, 'colname');
    if (sM.data.matchedDeveloperMetadata && sM.data.matchedDeveloperMetadata.length > 0) {
      return sM.data.matchedDeveloperMetadata.map(item => item.developerMetadata.metadataValue);
    }
    return [];
  }
  /**
   * Sets new metadata and headlines for collumns wiping od ones
   * @param  {number} worksheedId
   * @param  {string[]} cols
   */
  async setCollumns(worksheedId: number, cols: string[]) {
    await this.clearCollumnsMetadata(worksheedId, 'colname');
    await Promise.all([
      this.massCreateCollumnMetadata(worksheedId, 0, 'colname', cols),
      this.writeToGridRange(
        {
          sheetId: worksheedId,
          startColumnIndex: 0,
          startRowIndex: 0,
        },
        [cols],
      ),
    ]);
  }
  /**
   * Wipes specific worksheed
   * @param  {number} worksheedId
   */
  async clearWorksheet(worksheedId: number) {
    return this.clearGridRange({
      sheetId: worksheedId,
      startColumnIndex: 0,
      startRowIndex: 0,
    });
  }
}
