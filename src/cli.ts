#!/usr/bin/env node

import { Command } from 'commander';
// FIX: Import `argv` and `exit` from `process` to resolve type errors related to Node.js globals.
import { argv, exit } from 'process';
import { lookupRelease, DiscogsApiError } from './index';
import pkg from '../package.json' assert { type: 'json' };

const program = new Command();

program
  .name('discogs-lookup')
  .version(pkg.version)
  .description(pkg.description)
  .argument('<release-id>', 'The numeric ID of the Discogs release')
  .option('-t, --token <token>', 'Discogs personal access token (overrides DISCOGS_TOKEN from .env)')
  .action(async (releaseId, options) => {
    try {
      console.log(`🔍 Looking up Discogs release ID: ${releaseId}...`);
      const data = await lookupRelease(releaseId, options.token);
      
      console.log('\n--- Release Information ---');
      console.log(`Artist:       ${data.artist}`);
      console.log(`Title:        ${data.title}`);
      console.log(`Release Year: ${data.releaseYear}`);
      console.log(`Master Year:  ${data.masterYear}`);
      console.log(`Discogs URL:  ${data.discogsUrl}`);
      console.log('---------------------------\n');

      if (data.tracks && data.tracks.length > 0) {
        console.log('--- Tracklist ---');
        data.tracks.forEach(track => {
          console.log(`${(track.position || '').padEnd(5)} ${track.title}`);
        });
        console.log('-----------------\n');
      } else {
        console.log('No tracklist available for this release.');
      }

    } catch (error) {
      if (error instanceof DiscogsApiError) {
        console.error(`❌ Error: ${error.message}`);
      } else if (error instanceof Error) {
        console.error(`❌ An unexpected error occurred: ${error.message}`);
      } else {
        console.error('❌ An unknown error occurred.');
      }
      // FIX: Use the imported `exit` function instead of `process.exit`.
      exit(1);
    }
  });

// FIX: Use the imported `argv` variable instead of `process.argv`.
program.parse(argv);