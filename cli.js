#!/usr/bin/env node

import { resolve } from 'path';
import { Command } from 'commander';
const program = new Command();
import { publish } from './index.js';

program
	.description('Publish Android App Bundle to Google Play')
	.requiredOption('-k, --keyFile <path>', 'set google api json key file')
	.requiredOption('-p, --packageName <name>', 'set package name (com.some.app)')
	.requiredOption('-a, --aabFile <path>', 'set path to .aab file')
	.requiredOption('-t, --title <title>', 'title for release')
	.option('-s, --status', 'Set the status at the store')
	.option('-e, --exit', 'exit on error with error code 1.')
	.parse(process.argv);

const options = program.opts();

publish({
	keyFile: resolve(options.keyFile),
	packageName: options.packageName,
	aabFile: resolve(options.aabFile),
	title: options.title,
	status: options.status || 'draft',
})
	.then(() => {
		console.log('Publish complete.');
	})
	.catch((error) => {
		console.error(error.message);
		process.exit(options.exit ? 1 : 0);
	});