import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import fg from 'fast-glob';
import { parse } from 'csv-parse/sync';

export function loadCsvFileToObjectsSync(tableName: string): any[] {
  const appDir = path.dirname(require.main?.filename || '');
  const csvFilePathes = fg.sync([...appDir.split(path.sep), `..`, 'data', 'csvs', `tables`, tableName, '**', '*.csv'].join('/'), {
    dot: true,
  });
  const objects: any[] = [];
  for (const csvFilePath of csvFilePathes) {
    const csvData = fs.readFileSync(csvFilePath);
    const importValues = parse<any>(csvData, { columns: true });
    for (const importValue of importValues) {
      objects.push(importValue);
    }
  }
  return objects;
}

export async function loadCsvFileToObjects(tableName: string, csvObjectFunc: (csvObjects: any[]) => Promise<void>) {
  const appDir = path.dirname(require.main?.filename || '');
  const csvFilePathes = fg.sync([...appDir.split(path.sep), `..`, 'data', 'csvs', `tables`, tableName, '**', '*.csv'].join('/'), {
    dot: true,
  });
  const objects: any[] = [];
  for (const csvFilePath of csvFilePathes) {
    const csvData = fs.readFileSync(csvFilePath);
    const importValues = parse<any>(csvData, { columns: true });
    await csvObjectFunc(importValues);
  }
}
