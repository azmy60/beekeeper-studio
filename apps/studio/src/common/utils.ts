// Copyright (c) 2015 The SQLECTRON Team

import fs from 'fs';
import {homedir} from 'os';
import path from 'path';
import mkdirp from 'mkdirp';
import { Error as CustomError } from '../lib/errors'
import _ from 'lodash';
import platformInfo from './platform_info';
import { format } from 'sql-formatter';

export function having<T, U>(item: T | undefined | null, f: (T) => U, errorOnNone?: string): U | null {
  if (item) return f(item)
  if (errorOnNone) throw new Error(errorOnNone)
  return null
}

export function fileExists(filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.stat(filename, (err, stats) => {
      if (err) return resolve(false);
      resolve(stats.isFile());
    });
  });
}


export function fileExistsSync(filename: string): boolean {
  try {
    return fs.statSync(filename).isFile();
  } catch (e) {
    return false;
  }
}


export function writeFile(filename: string, data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}


export function writeJSONFile(filename: string, data: any): Promise<boolean> {
  return writeFile(filename, JSON.stringify(data, null, 2));
}


export function writeJSONFileSync(filename: string, data: any): void {
  return fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}


export function readFile(filename: string): Promise<string> {
  const filePath = resolveHomePathToAbsolute(filename);
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(filePath), (err, data) => {
      if (err) return reject(err);
      resolve(data.toString());
    });
  });
}


export function readJSONFile(filename: string): Promise<any> {
  return readFile(filename).then((data) => JSON.parse(data));
}

export function readVimrc(): string[] {
  const vimrcPath = path.join(platformInfo.userDirectory, ".beekeeper.vimrc");
  if (fileExistsSync(vimrcPath)) {
    const data = fs.readFileSync(vimrcPath, { encoding: 'utf-8', flag: 'r'});
    const dataSplit = data.split("\n");
    return dataSplit;
  }

  return [];
}

export function readJSONFileSync(filename: string): any {
  const filePath = resolveHomePathToAbsolute(filename);
  const data = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return JSON.parse(data);
}

export function createParentDirectory(filename: string): Promise<string> {
  return mkdirp(path.dirname(filename))
}

export function createParentDirectorySync(filename: string): void {
  mkdirp.sync(path.dirname(filename));
}


export function resolveHomePathToAbsolute(filename: string): string {
  if (!/^~\//.test(filename)) {
    return filename;
  }

  return path.join(homedir(), filename.substring(2));
}



export function createCancelablePromise(error: CustomError, timeIdle = 100): any {
  let canceled = false;
  let discarded = false;

  const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  return {
    async wait() {
      while (!canceled && !discarded) {
        await wait(timeIdle);
      }

      if (canceled) {
        const err = new Error(error.message || 'Promise canceled.');

        Object.getOwnPropertyNames(error)
          .forEach((key: string) => err[key] = error[key]); // eslint-disable-line no-return-assign

        throw err;
      }
    },
    cancel() {
      canceled = true;
    },
    discard() {
      discarded = true;
    },
  };
}

export function makeString(value: any): string {
  if(value === BigInt(0)) return '0';
  return _.toString(value);
}

export function safeSqlFormat(
  ...args: Parameters<typeof format>
): ReturnType<typeof format> {
  try {
    return format(args[0], args[1]);
  } catch (ex) {
    return args[0];
  }
}
