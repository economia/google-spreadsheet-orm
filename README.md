# Google Spreadsheet ORM

Small tool to turn Google Spreadsheet into simple admin panel.

## Why

 When creating small projects it might be overkill to develop it's admin panel. Google Spreadsheets offers great things such as authorization, history backup, GUI etc. It has basically everything in order to make it useful suite for managing data for small project. This solution offers ORM-like tools to read and write data.

## Getting Started

### Installing

```
npm i --save @it-econonomia/google-spreadsheet-orm
```

### Establishing connection

First thing is to establish connection to Google Api via SheetConnection static method connect that returns own instance in Promise. SheetConnection can be established only once. Any further attempts to make connection will result in error.

```
// ES6
import SheetConnection from '@it-econonomia/google-spreadsheet-orm';
// CommonJS
const SheetConnection = require('@it-econonomia/google-spreadsheet-orm').default;

let sheetConnection = SheetConnection.connect(config);
```

Sheet connection has to be given a config object:

- `spreadsheetId: string` - id of the spreadsheet in the google drive
- `migrate: string`- strategy that will be applied when sheet doesn't match it's model, default `safe`
	- `safe` - warns about mismatch but attempts to use the sheet anyway
	- `drop` - clears the sheet and reformates it\
**Optional**\
- `authClient: JWT` - Google API's JSON WebToken, can be obtained from `SheetConnection.getAuthClient(email: string, key: any, keyId: any, scopes?: string[])`
- `logger: Console` - Custom logger that implements or extends `Console` object

When `authClient` is missing in config, `.connect(config)` can be passed additional arguments `email: string, key: any, keyId: any, scopes?: string[]`. Argument `scope: string[]` is optional. `scope` sets the permissions of the JWT user. If it's not passed default suficcient permision is used.

### Creating a model

Model represents the worksheet itself (worsheet is a list inside spreadhseet). Every model needs to extend abstract model class. Model needs to be decorated by `worksheet` decorator that is given worksheet id. Each property of the model has to be decorated by `column` decorator

```
// ES6
import { AbstractModel, worksheet, column } from '@it-econonomia/google-spreadsheet-orm';
// CommonJS
const AbstractModel = require('@it-econonomia/google-spreadsheet-orm').AbstractModel;
const worksheet = require('@it-econonomia/google-spreadsheet-orm').worksheet;
const column = require('@it-econonomia/google-spreadsheet-orm').column;

@worksheet(0)
class User extends AbstractModel {
	@column
	username;
	@column
	email;
	@column
	fullname;
}

```

### Using the model

Instance of `SheetConnection` offers a method for reading and a method for writing.

**Writing**
```
let newUser = new User();
newUser.username = 'foobar';
newUser.email = 'bar@foo.com';
newUser.fullname = 'Foo Bar';

await sheetConnetion.setInfo(newUser);
```

`SheetConnection.setInfo()` automaticaly knows which worskeet to use as the model class was decorated with it.

**Reading**
```
let whereCond = {
	username: 'foobar',
	email: (val) => val.split('@')[0] === 'bar'
};

let users[] = await sheetConnetion.getInfo(User, whereCond);

console.log(user[0]) // { username: 'foobar', email: 'bar@foo.com' ...}
```

`SheetConnection.getInfo()` needs to be given model class in order to read as it has to extract worsheet id. Optionaly `whereCondition` can be passed. A `whereCondition` is collection of collumn names and rules. If rule is function it has to follow `(value: string) => boolean` signature, where return indicates whether record fits. If `string` is passed instead equality of values is checked.

## References

### `class SheetConnection`

* `connect(config: Object): Promise<SheetConnection>`
* `connect(config: Object, email: string, key: any, keyId: any, scopes: string[]): Promise<SheetConnection>`
	* Connects to the Google API, returns established connection
* `validateModels(): Promise<void>`
	* Checks if worksheed matches it's model, either wipes the sheet or warns about mismatch
* `setInfo(info: T): Promise<T>`
	* Writes data to the sheet
* `getInfo(model: T): Promise<T[]>`
* `getInfo(model: T, where: OBject): Promise<T[]>`
	* Read all infos from a worksheet. Optionally applies where condition
* `static getModelCollumns(model: typeof AbstractModel): string[]`
	* Extracts collumn names from the model
* `static setModeCollumns(model: typeof AbstractModel, collumns: string[])`
	* Sets collumn names of the model. Should be used wisely
* `static getWorksheetID(model: typeof AbstractModel): number`
	* Extracts worksheet id from the model
* `setWorksheedID(model: typeof AbstractModel, worksheedId: number): void`
	* Sets worksheed id of the model. Should be used wisely
* `static getAuthClient(email: string, key: any, keyId: any, scopes?: string[])`
	* Creates JWT token

### `class AbstractModel`
* `get parsedRow(): Object`
	* Returns object of columnname-values pairs. If non-decorated property is present, it will be ignored
* `set parsedRow(prow: Object): void`
	* Sets value from the columnname-values pairs object

## Built With

* [TypeScript](https://www.typescriptlang.org)
* [GoogleAPIs](https://www.npmjs.com/package/googleapis)
* [Reflect-Metadata](https://www.npmjs.com/package/reflect-metadata)

## Authors

* **Blackbox Team** - [Economia](https://www.economia.cz/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
