import 'dotenv/config';
import { program, Command } from 'commander';
import packageJson from '../package.json';
import path from 'path';
import fg from 'fast-glob';
import crypto from 'crypto';
import fsPromise from 'fs/promises';
import { getTableName } from 'drizzle-orm';
import { reset } from 'drizzle-seed';
import _ from 'lodash';

import { db } from './db/connections';
import { resourceFiles } from './db/schema';
import * as schema from './db/schema';
import { exportToCSV, loadExistTableNames } from './utils/data-exporters';
import { loadCsvFileToObjects } from './utils/data-importers';
import { ThreedModelFileInfo, ImageFileInfo, PdfFileInfo, ResourceFileInfo, FileCategorys } from './utils/resource-file-types';

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

program.version(packageJson.version, '-v, --version');

const importCommand = new Command('import');
importCommand.description('import files info');

async function newResourceFile(resourceType: FileCategorys, filePath: string): Promise<typeof resourceFiles.$inferInsert> {
  const appDir = path.dirname(require.main?.filename || '');
  const resolveFilePath = path.resolve(filePath);
  const filepathFromRoot = resolveFilePath.replace(path.resolve(appDir, '..'), '').split(path.sep).join('/');
  const parsedPath = path.parse(resolveFilePath);
  const stat = await fsPromise.stat(resolveFilePath);
  const fileHash = await generateFileHash(resolveFilePath);
  return {
    name: parsedPath.name,
    path: filepathFromRoot,
    extension: parsedPath.ext,
    resource_type: resourceType,
    hash: fileHash,
    size: stat.size,
    updatedAt: new Date(stat.ctimeMs),
    createdAt: new Date(stat.birthtimeMs),
  };
}

async function generateFileHash(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fsPromise
      .readFile(filePath)
      .then((data) => {
        resolve(crypto.createHash('sha512').update(data).digest('hex'));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function loadFilePathsFromResourceInfo(resourceFileInfo: ResourceFileInfo): Promise<(typeof resourceFiles.$inferInsert)[]> {
  const appDir = path.dirname(require.main?.filename || '');
  const resourceFilePaths = fg.sync(
    [
      ...appDir.split(path.sep),
      `..`,
      'resources',
      resourceFileInfo.fileCategory,
      '**',
      `*.{${resourceFileInfo.fileExtensions.join(',')}}`,
    ].join('/'),
    { dot: true },
  );
  const resourceFileValuePromises: Promise<typeof resourceFiles.$inferInsert>[] = [];
  for (const filePath of resourceFilePaths) {
    resourceFileValuePromises.push(newResourceFile(resourceFileInfo.fileCategory, filePath));
  }
  return Promise.all(resourceFileValuePromises);
}

importCommand.command('glogfile').action(async (options: any) => {
  await reset(db, schema);
  for (const resourceFileInfo of [ImageFileInfo, ThreedModelFileInfo, PdfFileInfo]) {
    const resourceFileValues = await loadFilePathsFromResourceInfo(resourceFileInfo);
    await db.execute(`ALTER SEQUENCE ${getTableName(resourceFiles)}_id_seq RESTART WITH 1;`);
    await db.insert(resourceFiles).values(resourceFileValues).onConflictDoNothing();
  }
  await db.$client.end();
});

importCommand.command('dataCsvFile').action(async (options: any) => {
  await reset(db, schema);
  await loadCsvFileToObjects(getTableName(resourceFiles), async (objs) => {
    await db.execute(`ALTER SEQUENCE ${getTableName(resourceFiles)}_id_seq RESTART WITH 1;`);
    await db.insert(resourceFiles).values(objs).onConflictDoNothing();
  });
  await db.$client.end();
});

program.addCommand(importCommand);

const exportCommand = new Command('export');
exportCommand.description('export files info data');
exportCommand.command('csv').action(async (options: any) => {
  const tableNames = await loadExistTableNames();
  await exportToCSV(tableNames);
  await db.$client.end();
});

program.addCommand(exportCommand);

program.parse(process.argv);
