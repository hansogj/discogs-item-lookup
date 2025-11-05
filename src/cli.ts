#!/usr/bin/env node

import { Command } from 'commander';
import { lookupRelease, DiscogsApiError } from './index';
import pkg from '../package.json' assert { type: 'json' };
// Fix: Import `exit` and `argv` directly from `node:process` to ensure correct types are used.
import { exit, argv } from 'node:process';

const program = new Command();

const knownOptions = [
  '  -t, --token <token>   Discogs personal access token (overrides DISCOGS_TOKEN from .env)',
  '  -d, --disc <disc>     Return only the specified disc number (if multi-disc release)',
];

// Ensure unknown options throw, so we can catch and print our own help
program.allowUnknownOption(false);
program.exitOverride((err) => {
  if (err.code === 'commander.unknownOption') {
    // Extract the unknown option from the error message
    const match = err.message.match(/unknown option '([^']+)'/);
    const unknown = match ? match[1] : 'unknown';
    console.error(`❌ Error: unknown option '${unknown}'`);
    console.error('\nKnown options:');
    knownOptions.forEach((opt) => console.error(opt));
    program.outputHelp();
    exit(1);
  }
  if (err.code === 'commander.helpDisplayed') {
    exit(0);
  }
  throw err;
});

program
  .name('discogs-lookup')
  .version(pkg.version, '-V, --version', 'output the version number')
  .description(pkg.description)
  .argument('<release-id>', 'The numeric ID of the Discogs release')
  .option(
    '--token <token>',
    'Discogs personal access token (overrides DISCOGS_TOKEN from .env)',
  )
  .option(
    '--disc <disc>',
    'Return only the specified disc number (if multi-disc release)',
    (value) => parseInt(value, 10),
  )
  .action(async (releaseId, options) => {
    // Normalize disc option: support both -d and --disc
    let discOption = options.disc;
    if (discOption === undefined && options.d !== undefined) {
      discOption = options.d;
    }
    if (typeof discOption === 'string') {
      discOption = parseInt(discOption, 10);
    }
    // User instruction for missing releaseId (should not happen with .argument, but for safety)
    if (!releaseId) {
      console.error('❌ Error: You must provide a <release-id>.');
      program.outputHelp();
      exit(1);
    }
    // User instruction for invalid disc option
    if (discOption !== undefined && (isNaN(discOption) || discOption < 1)) {
      console.error('❌ Error: --disc must be a positive integer.');
      program.outputHelp();
      exit(1);
    }
    try {
      console.log(`🔍 Looking up Discogs release ID: ${releaseId}...`);
      let data;
      if (discOption) {
        data = await lookupRelease(releaseId, discOption, options.token);
      } else {
        data = await lookupRelease(releaseId, options.token);
      }

      console.log('\n--- Release Information ---');
      console.log(`Artist:       ${data.artist}`);
      const knownOptions = [
        '  --token <token>   Discogs personal access token (overrides DISCOGS_TOKEN from .env)',
        '  --disc <disc>     Return only the specified disc number (if multi-disc release)',
        '  -V, --version     Output the version number',
      ];
      console.log(`Title:        ${data.title}`);
      console.log(`Release Year: ${data.releaseYear}`);
      console.log(`Master Year:  ${data.masterYear}`);
      console.log(`Discogs URL:  ${data.discogsUrl}`);
      console.log('---------------------------\n');

      if (data.discs && data.discs.length > 0) {
        // If --disc is specified but not found, instruct user
        if (discOption && !data.discs.some((d) => d.disc === discOption)) {
          console.error(
            `❌ Error: Disc ${discOption} not found in this release.`,
          );
          const available = data.discs.map((d) => d.disc).join(', ');
          console.error(`   Available discs: ${available}`);
          console.error('\nKnown options:');
          knownOptions.forEach((opt) => console.error(opt));
          program.outputHelp();
          exit(1);
        }
        console.log('--- Tracklist ---');
        data.discs.forEach((disc) => {
          if (data.discs.length > 1 || discOption) {
            console.log(`Disc ${disc.disc}:`);
          }
          disc.tracks.forEach((track: { position: string; title: string }) => {
            console.log(`${(track.position || '').padEnd(5)} ${track.title}`);
          });
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
      exit(1);
    }
  });

// Fix: Use `argv` from `node:process` to pass command-line arguments to the parser.
program.parse(argv);
