import 'dotenv/config';
import { program, Command } from 'commander';
import packageJson from '../package.json';

import { db } from './db/connections';
import { resourceFiles } from './db/schema';

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

program.version(packageJson.version, '-v, --version');

program.command('test').action(async (options: any) => {
  const result = await db.select().from(resourceFiles);
  //const result = await db.execute('select 1');
  console.log(result);
});

program.parse(process.argv);
