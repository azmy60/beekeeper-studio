// Copyright (c) 2015 The SQLECTRON Team

import mysql, { knex as mysqlKnex } from './mysql';
import postgresql, { knex as postgresKnex } from './postgresql';
import sqlserver, { knex as sqlServerKnex } from './sqlserver';
import sqlite, { knex as sqliteKnex } from './sqlite';
import cassandra from './cassandra';
import bigquery from './bigquery.js';
import { Dialect } from '@shared/lib/dialects/models';
import { Knex } from 'knex';

export function knexOf(dialect: Dialect): Knex | undefined {
  if (dialect === 'mysql') return mysqlKnex
  if (dialect === 'postgresql') return postgresKnex
  if (dialect === 'sqlserver') return sqlServerKnex
  if (dialect === 'sqlite') return sqliteKnex
  return undefined
}

export function findClient(key: string): Client | undefined {
  const client = CLIENTS.find((cli) => cli.key === key);
  if(!client) return undefined;

  return {
    ...client,
    get supportsSocketPath(): boolean {
      return this.supports('server:socketPath');
    },
    supports(feature: string): boolean {
      return !client.disabledFeatures?.includes(feature);
    },
  };
}

interface Client extends ClientConfig {
  readonly supportsSocketPath: boolean,
  supports: (feature: string) => boolean,
}

interface ClientConfig {
  key: string,
  name: string,
  defaultPort?: number,
  defaultDatabase?: string,
  disabledFeatures?: string[],
}

/**
 * List of supported database clients
 */
export const CLIENTS: ClientConfig[] = [
  {
    key: 'cockroachdb',
    name: 'CockroachDB',
    defaultPort: 26257,
    disabledFeatures: [
      'server:domain',
      'server:socketPath'
    ],
  },
  {
    key: 'mysql',
    name: 'MySQL',
    defaultPort: 3306,
    disabledFeatures: [
      'server:schema',
      'server:domain',
    ],
  },
  {
    key: 'mariadb',
    name: 'MariaDB',
    defaultPort: 3306,
    disabledFeatures: [
      'server:schema',
      'server:domain',
    ],
  },
  {
    key: 'postgresql',
    name: 'PostgreSQL',
    defaultDatabase: 'postgres',
    defaultPort: 5432,
    disabledFeatures: [
      'server:domain',
    ],
  },
  {
    key: 'redshift',
    name: 'Amazon Redshift',
    defaultDatabase: 'postgres',
    defaultPort: 5432,
    disabledFeatures: [
      'server:domain',
      'server:socketPath'
    ],
  },
  {
    key: 'sqlserver',
    name: 'Microsoft SQL Server',
    defaultPort: 1433,
    disabledFeatures: [
      'server:socketPath'
    ],
  },
  {
    key: 'sqlite',
    name: 'SQLite',
    defaultDatabase: ':memory:',
    disabledFeatures: [
      'server:ssl',
      'server:host',
      'server:port',
      'server:socketPath',
      'server:user',
      'server:password',
      'server:schema',
      'server:domain',
      'server:ssh',
      'scriptCreateTable',
      'cancelQuery',
    ],
  },
  {
    key: 'cassandra',
    name: 'Cassandra',
    defaultPort: 9042,
    disabledFeatures: [
      'server:ssl',
      'server:socketPath',
      'server:schema',
      'server:domain',
      'scriptCreateTable',
      'cancelQuery',
    ],
  },
  {
    key: 'bigquery',
    name: 'BigQuery',
    defaultPort: 443,
    disabledFeatures: [
      'server:ssl',
      'server:socketPath',
      'server:user',
      'server:password',
      'server:schema',
      'server:domain',
      'server:ssh',
      'scriptCreateTable',
    ],
  },
];


export default {
  mysql,
  postgresql,
  sqlserver,
  sqlite,
  cassandra,
  redshift: postgresql,
  mariadb: mysql,
  cockroachdb: postgresql,
  bigquery,
};
