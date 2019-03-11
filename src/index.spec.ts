import { ParsedRow } from './interfaces/ParsedRow';
import SheetConnection from './';
import { WhereCondition } from './interfaces/WhereCondition';
const clearModule = require('clear-module');

const mockParsedRows: ParsedRow[] = [
  {
    name: 'John Doe',
    url: 'www.atlas.cz',
    age: '8',
  },
];
const mockParsedRowsMultiline: ParsedRow[] = [
  {
    name: 'John Doe',
    url: 'www.atlas.cz',
    age: '8',
  },
  {
    name: 'Zack MacFront',
    url: 'www.centrum.cz',
    age: '10',
  },
  {
    name: 'Elania Beer',
    url: 'www.atlas.cz',
    age: '8',
  },
];

const mockWhere: WhereCondition = {
  name: (val: string) => val === 'John Doe',
  url: 'www.atlas.cz',
  age: '8',
};

const mockWhereUniversal: WhereCondition = {
  url: 'www.atlas.cz',
  age: '8',
};

describe('Apply where condition', () => {
  beforeEach(() => {
    clearModule('./index.ts');
  });

  test('Multiple where condition on one item, return only one item', () => {
    let iP = new (SheetConnection as any)({ disableSingleton: true });
    expect((iP as any).applyWhere(mockParsedRows, mockWhere)).toMatchSnapshot();
  });
  test('Two where condition on multiple items, should return two items.', () => {
    let iP = new (SheetConnection as any)({ disableSingleton: true });
    expect((iP as any).applyWhere(mockParsedRowsMultiline, mockWhereUniversal)).toMatchSnapshot();
  });
  test('Without where condition should return all  items.', () => {
    let iP = new (SheetConnection as any)({ disableSingleton: true });
    expect((iP as any).applyWhere(mockParsedRowsMultiline, {})).toMatchSnapshot();
  });
});

describe('parseRowsFromMetaFilter', () => {
  beforeEach(() => {
    clearModule('./index.ts');
  });

  test('It should parse sheet data', () => {
    const fixture = require('./__fixtures__/parseRowsFromMetaFilter.js');
    const iP = new (SheetConnection as any)({ disableSingleton: true }) as any;
    const output = iP.parseRowsFromMetaFilter(fixture);
    expect(output).toMatchSnapshot();
  });
});
