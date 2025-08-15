import { db } from '../db/connections';
import path from 'path';
import _ from 'lodash';
import fs from 'fs';
import { Parser } from '@json2csv/plainjs';
import { Json2CSVBaseOptions } from '@json2csv/plainjs/dist/mjs/BaseParser';

// 分割するファイルの数がこの数字を超えたら新しくディレクトリを作るようにする
const dividDirectoryFileCount = 100;
// ファイルを分割する行数(出来上がるSQLファイルのサイズが100MBを超えない範囲で調整)
const dividedLinesCount = 200000;

function loadSavedCsvRootDirPath(): string {
  const appDir = path.dirname(require.main?.filename || '');
  const saveSqlDirPath = path.join(appDir, `..`, 'data', 'csvs', `tables`);
  // cli.ts がある場所なのでSQLを保管する場所を指定する
  if (!fs.existsSync(saveSqlDirPath)) {
    fs.mkdirSync(saveSqlDirPath, { recursive: true });
  }
  return saveSqlDirPath;
}

export async function exportToCSV(tableNames: string[]) {
  for (const tableName of tableNames) {
    let rowCounter = 0;
    let saveFileCounter = 0;
    let dividedCsvFileStream: fs.WriteStream | undefined;
    await findByBatches({
      tableName: tableName,
      batchSize: 1000,
      inBatches: async (data) => {
        rowCounter = rowCounter + data.length;
        const csvParserOptions: Json2CSVBaseOptions<object, object> = {};
        const saveFileCount = Math.ceil(rowCounter / dividedLinesCount);
        if (saveFileCounter !== saveFileCount) {
          const splitDirCount = Math.ceil(saveFileCount / dividDirectoryFileCount);
          await dividedCsvFileStream?.close();
          const saveDirPath = path.join(loadSavedCsvRootDirPath(), tableName, splitDirCount.toString());
          if (!fs.existsSync(saveDirPath)) {
            fs.mkdirSync(saveDirPath, { recursive: true });
          }
          const willSaveFilePath = path.join(saveDirPath, `${tableName}_${saveFileCount}.csv`);
          if (fs.existsSync(willSaveFilePath)) {
            fs.unlinkSync(willSaveFilePath);
          }
          dividedCsvFileStream = fs.createWriteStream(willSaveFilePath);
          csvParserOptions.header = true;
        } else {
          csvParserOptions.header = false;
        }
        if (data.length > 0) {
          const parser = new Parser(csvParserOptions);
          const csv = parser.parse(data);
          dividedCsvFileStream?.write(`${csv}\n`);
        }
        saveFileCounter = saveFileCount;
      },
    });
    await dividedCsvFileStream?.close();
  }
}

async function findByBatches({
  tableName,
  batchSize = 1000,
  inBatches,
}: {
  tableName: string;
  batchSize: number;
  inBatches: (data: any[]) => Promise<void>;
}) {
  let lastId = 0;
  while (true) {
    const sql = `SELECT * from ${tableName} WHERE id > ${lastId} ORDER BY id ASC LIMIT ${batchSize};`;
    const queryResult = await db.execute(sql);
    const results: any[] = [];
    if (queryResult.rows) {
      for (const row of queryResult.rows) {
        results.push(row);
      }
    } else {
      const rows = _.uniq([queryResult[0]].flat());
      for (const row of rows) {
        results.push(row);
      }
    }

    inBatches(results);
    if (results.length < batchSize) {
      break;
    }
    const maxIdResult = _.maxBy(results, (cell) => cell.id);
    lastId = maxIdResult?.id || 0;
  }
}

export async function loadExistTableNames(): Promise<string[]> {
  const showTableSql = `SELECT table_name FROM information_schema.tables WHERE table_schema='public'AND table_type='BASE TABLE';`;
  const tables: string[] = [];
  const result = await db.execute(showTableSql);
  for (const row of result.rows) {
    if (row.table_name) {
      tables.push(row.table_name.toString());
    }
  }
  return tables;
}
