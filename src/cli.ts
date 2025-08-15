import 'dotenv/config';
import { program, Command } from 'commander';
import packageJson from '../package.json';
import path from 'path';
import fg from 'fast-glob';
import crypto from 'crypto';
import fsPromise from 'fs/promises';

import { db } from './db/connections';
import { resourceFiles } from './db/schema';
import { exportToCSV, loadExistTableNames } from './utils/data-exporters';

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

program.version(packageJson.version, '-v, --version');

const importCommand = new Command('import');
importCommand.description('import files info');

async function newResourceFile(filePath: string): Promise<typeof resourceFiles.$inferInsert> {
  const appDir = path.dirname(require.main?.filename || '');
  const resolveFilePath = path.resolve(filePath);
  const filepathFromRoot = resolveFilePath.replace(path.resolve(appDir), '');
  const parsedPath = path.parse(resolveFilePath);
  const stat = await fsPromise.stat(resolveFilePath);
  const fileHash = await generateFileHash(resolveFilePath);
  return {
    name: parsedPath.name,
    path: filepathFromRoot,
    extension: parsedPath.ext,
    hash: fileHash,
    size: stat.size,
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

importCommand.command('glogfile').action(async (options: any) => {
  const appDir = path.dirname(require.main?.filename || '');
  const threedModelFilePaths = fg.sync([...appDir.split(path.sep), `..`, 'resources', '**', '*.{glb,fbx,obj}'].join('/'), { dot: true });
  const resourceFileValuePromises: Promise<typeof resourceFiles.$inferInsert>[] = [];
  for (const filePath of threedModelFilePaths) {
    resourceFileValuePromises.push(newResourceFile(filePath));
  }
  const resourceFileValues = await Promise.all(resourceFileValuePromises);
  await db.insert(resourceFiles).values(resourceFileValues).onConflictDoNothing();
  await db.$client.end();
});

importCommand
  .command('filepath')
  .option('-p, --path <filepaths...>', 'add filepaths')
  .action(async (options: any) => {
    console.log(options);
    //const result = await db.select().from(resourceFiles);
    const result = await db.execute(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public'AND table_type='BASE TABLE';`,
    );
    console.log(result.rows);
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
