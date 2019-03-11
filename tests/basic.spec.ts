// import SheetConnection, { Config, AbstractModel, worksheet, column } from '../src';

// let key = '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC4lp44MrsbGRz/\n1l7SJX94JnuzeB18UM7Ec33s9Yt2Vs98GaUrMyQNL2/+0O16yPy3gwI5F15AaYnL\nMJVmpuvWx8K8nTJqw14h52D6FIBbij+Kan5QzwrSgwXpLC5PthO6RfwZUi71PofS\n/ULMv6wLT5c0ATbO1IifmrOQr7N82vxvhvWwky9TxF65P6+nOaaOQxw/7aPa4/Lt\nlBfcyNK/unuOAepvuXuRRdYvquGc85rqsofeERTrfjjRps6aVs2lfzCMEU/eaySG\nPWCvViRxbcpZz6N449X113ABAovCTZZUseq/wEdMp8Y0dzU2FybEtsWMntTp35Hc\nSGVUObVFAgMBAAECggEACVb1onpOpUxb/0XlflSPYpDv6WDGfSfJjn8ZfAfgiphR\n30Gc7dakmFYyIH6JxZCt2Ms0LZdVGYU9h55psMv5WuC4pbp+dpB0DtsaOQ0YgYk5\nNdO1mHkhXw1qGyY1IatgzCgGXXGfFqGXVcGiw6FfHyNjzynQkB6I2yqEs2lwd3y3\nAz09PMJHI1tC62HB1xRzj5Gt/GyspwcRB5O7iaX0tS4UmJIF+eJgwd80pqKmr6J2\nV76JwgvOc0/wq50VsvjEVKSiunMky1h2fIeS9Fc9sYgpyyzB/XAqj+RNGHAWmHPp\niv9gAeYS9iYr2r3T9TLRA710Rqgftc/3+zfCcB6fcQKBgQDpdZzEoz7cWRP32bsp\nKHJ6yVyiLRY5oNPTXH+nviQ38L5TQZfS+8GypVXTKZa94UOcJ60t2D+JM1Al3Rkb\nQnHV4Em8Er5rJmQ+tED2YNDLeT2H4R3p5XfFThdWGAZfMPfyHti0evulmgbvCP9U\nHEV1Usp7NFxmq9tqAhmKGusUmwKBgQDKaRDBaz5oKSIs7CBgwZypJIjJ5FCxRm/Z\nQ4K//mlw4K4zhQhP+Log6XhPKBnnpft/+yfSaXEo+DoeamG/sPLrAB25t47cMF04\nz/ld9ghu1cSJ21CrgpSEwwNYO1hF2Re56TGbdWYSFfnuQn+zKfi9mZGAEYMY3MRn\nOGOIyDPLnwKBgQDk5IJarO9R3ShdxiThep2bU1e2TdxPjiaBQVyLmzopeqkwOcxg\neKN1wvK9wTXhXz4JmUELBM1ueFfpd7hI6MFxf6Dre7kklxSMAfD7Xvr3tBwm4AmT\nLH9cfG8W4yFELV+8DJBNi5K0z6pirICh98IGALEzUKgTpgXPDtX5eODpZwKBgQCw\n1z6GXlY11so/CUX4gu+Gb577FPjTCUErRupzJ6mjrwlDhdUPWbX0j0ZHkjefxcqH\ntDzEfs8ZBlZwwG0Kd2SkoINYAOFVywOHYVzzFMOlYirGbtB6KCnuHBtN+PtUeylZ\nij2HHvjAkGa+HWdId0EVFZijlak+DZOiwwdjN9bY7QKBgQCGoOfSlUUxtFmehVHD\n7lOuATPeXKEcHEkmWM4Ag7xoA12gjFfN3d3N94AgFsGTkJiwyQVCbyFuwh+t9Q8R\nB21ZUF5XcUKe/DRBIgm5Dw7V/JzHo+Ayzr8eOADYYHSyXE5ZhlSryadmfYGDbOK/\nP3CDVBDrxPHJaIpXqTNSACkOyw==\n-----END PRIVATE KEY-----\n';

// let config: Config = {
// 	authClient: SheetConnection.getAuthClient('tester@testingorm.iam.gserviceaccount.com', key, 'c010442202e3b0abe0a2ea99d4cfcda7f3a96e09', ['https://www.googleapis.com/auth/spreadsheets']),
// 	migrate: 'drop',
// 	spreadsheetId: '1Vo30hV4PrtjneT5qOGDEQ3Lm2xK89yo7Fa7EFAUma60'
// }

// @worksheet(0)
// class TestModel extends AbstractModel {
// 	@column
// 	name: string;
// 	@column
// 	url: string;
// 	@column
// 	age: string;
// }

// let conProm = SheetConnection.connect(config);

describe('Performs basic testing of ORM', () => {
  it('nothing', () => {
    expect(true).toEqual(true);
  });
});
