export interface WhereCondition {
  [key: string]: ((value: string | number) => boolean) | string;
}
