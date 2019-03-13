import { JWT } from 'google-auth-library';

export interface Config {
  authClient?: JWT;
  spreadsheetId: string;
  migrate: 'drop' | 'safe';
  logger?: Console;
  disableSingleton?: boolean;
}
