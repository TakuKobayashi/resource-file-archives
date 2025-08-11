import { program, Command } from 'commander';
import packageJson from '../package.json';

import { config } from 'dotenv';
config();

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

program.version(packageJson.version, '-v, --version');

program.command('test').action(async (options: any) => {
  console.log('test');
});

program.parse(process.argv);
