import SheetConnection from '..';
import { ParsedRow } from '../interfaces/ParsedRow';

export abstract class AbstractModel {
  readonly rowId: string;
  [col: string]: string | any;

  get parsedRow(): ParsedRow {
    let cols = SheetConnection.getModelCollumns(this.constructor as typeof AbstractModel);
    let pR: ParsedRow = {};
    cols.forEach(col => {
      pR[col] = this[col];
    });
    return pR;
  }
  set parsedRow(prow: ParsedRow) {
    let rKs = Object.keys(prow);
    rKs.forEach(rK => {
      this[rK] = prow[rK];
    });
  }
}
