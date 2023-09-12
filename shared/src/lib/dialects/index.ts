import { RedshiftData } from "@shared/lib/dialects/redshift";
import { BigQueryData } from "./bigquery";
import { Dialect, DialectData } from "./models";
import { MysqlData } from "./mysql";
import { PostgresData } from "./postgresql";
import { SqliteData } from "./sqlite";
import { SqlServerData } from "./sqlserver";

export function getDialectData(dialect: Dialect): DialectData  {
  console.log('DIALECT: ', dialect);
  switch (dialect) {
    case "postgresql":
      return PostgresData
    case "mysql":
      return MysqlData
    case "sqlserver":
      return SqlServerData
    case "sqlite":
      return SqliteData
    case 'redshift':
      return RedshiftData
    case 'bigquery':
      return BigQueryData
    default:
      return SqliteData
  }
}
