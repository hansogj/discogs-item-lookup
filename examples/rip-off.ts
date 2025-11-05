#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

// This is a TypeScript example script demonstrating how to use the 'discogs-lookup' library.
// It can be run directly using `ts-node` or compiled to JavaScript first.

// Node.js built-in modules
import { spawn } from 'node:child_process';
import { mkdir, readdir, rename as fsRename, unlink, writeFile } from 'node:fs/promises';
// FIX: Import `dirname` for ES module-compatible __dirname.
import path, { join, dirname } from 'node:path';
// FIX: Import `cwd` and `argv` to resolve type errors for process properties.
import { chdir, exit, cwd, argv } from 'node:process';
// FIX: Import `fileURLToPath` for ES module-compatible __dirname.
import { fileURLToPath } from 'node:url';

// Third-party modules
import { DiscogsApiError, lookupRelease, LookupResult } from '@hansogj/discogs-item-lookup';
import * as dotenv from 'dotenv';

// FIX: Define `__dirname` for ES modules since it's not a global.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Core Helper Functions ---

/**
 * A helper function to run shell commands and wait for them to complete.
 * It streams the command's output directly to the console.
 * @param command The command to execute (e.g., 'ls').
 * @param args An array of arguments for the command (e.g., ['-l']).
 * @returns A promise that resolves when the command finishes successfully.
 */
function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️  Running command: ${command} ${args.join(' ')}`);

    // Spawn the child process. 'inherit' connects the child's stdio to the parent's.
    const child = spawn(command, args, { stdio: 'inherit' });

    child.on('close', (code: number | null) => {
      if (code === 0) {
        console.log(`✅ Command finished successfully.`);
        resolve();
      } else {
        // The command failed.
        reject(new Error(`Command "${command}" exited with error code ${code}`));
      }
    });

    child.on('error', (err: Error) => {
      // Failed to start the command (e.g., command not found).
      reject(new Error(`Failed to start command "${command}": ${err.message}`));
    });
  });
}

/**
 * Replaces characters that are invalid in Windows/macOS/Linux file paths.
 * @param input The string to sanitize.
 * @returns A sanitized string safe for use as a file or folder name.
 */
function sanitizePath(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

/**
 * Sorts and formats the tracklist for the tracks.txt file.
 * @param tracks The tracklist array from the Discogs response.
 * @returns A formatted string of track titles, separated by newlines.
 */
function formatTracklist(tracks: { position: string; title: string }[]): string {
  return tracks
    .slice()
    .sort((t1, t2) => {
      const n1 = parseInt(String(t1.position), 10);
      const n2 = parseInt(String(t2.position), 10);
      if (!Number.isNaN(n1) && !Number.isNaN(n2)) return n1 - n2;
      if (!Number.isNaN(n1)) return -1;
      if (!Number.isNaN(n2)) return 1;
      return String(t1.position).localeCompare(String(t2.position), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    })
    .map(({ title }) => title.trim())
    .join('\n');
}

// --- Audio Processing Functions ---

/**
 * Converts WAV files in the current directory to FLAC format using the 'flac' CLI tool.
 */
async function convertWavFilesToFlac(): Promise<void> {
  console.log('\n💿 Converting .wav to .flac...');
  const wavFiles = (await readdir('.')).filter((f) => f.endsWith('.wav'));

  if (wavFiles.length === 0) {
    console.log('   No .wav files found to convert.');
    return;
  }

  for (const wavFile of wavFiles) {
    await runCommand('flac', ['--keep-foreign-metadata', wavFile]);
  }

  console.log('✅ Conversion to .flac complete.');
}

// --- Main Orchestration ---

/**
 * Main function to orchestrate the album lookup and ripping process.
 */
async function main(): Promise<void> {
  // FIX: Use imported `cwd` instead of `process.cwd`.
  const initialDir = cwd();
  dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });
  // FIX: Use imported `argv` instead of `process.argv`.
  const releaseId: string | undefined = argv[2];

  if (!releaseId) {
    console.error('❌ Error: Please provide a Discogs release ID as an argument.');
    console.error('   Usage: ts-node rip-album.ts <release-id>');
    exit(1);
  }

  try {
    // 1. Fetch release data from Discogs
    console.log(`🔍 Looking up Discogs release ID: ${releaseId}...`);
    const releaseData = await lookupRelease(releaseId, process.env.DISCOGS_TOKEN);
    console.log(`💿 Found: ${releaseData.artist} - ${releaseData.title}`);

    // 2. Prepare directory and tracklist file
    const safeArtist = sanitizePath(releaseData.artist);
    const safeTitle = sanitizePath(releaseData.title);
    const folderName = `${releaseData.masterYear} ${safeTitle}`;
    const fullPath = join(safeArtist, folderName);

    console.log(`\n📁 Creating directory: ${fullPath}`);
    await mkdir(fullPath, { recursive: true });

    const tracksContent = formatTracklist(releaseData.tracks);
    // Write tracks.txt to the initial directory so the relative path in the tag command works.
    const tracksFilePath = 'tracks.txt';
    console.log(`📝 Writing tracklist to: ${path.resolve(tracksFilePath)}`);
    await writeFile(tracksFilePath, tracksContent);

    // 3. Change into the new directory to process audio files
    console.log(`\n🔀 Changing directory to: ${fullPath}`);
    chdir(fullPath);
    // FIX: Use imported `cwd` instead of `process.cwd`.
    console.log(`   Current directory: ${cwd()}`);

    // This section assumes 'cdparanoia' has run and produced .wav files.
    // Ensure 'cdparanoia' and 'flac' are installed and in your system's PATH.

    // await runCommand('cdparanoia', ['-B']);
    await convertWavFilesToFlac();

    console.log('\n🏷️  Renaming .flac files...');
    await runCommand(path.resolve(__dirname, '../../scripts/wav2flac.sh'));

    console.log('\n🖼️  Fetching album cover...');
    await runCommand('ts-node', [path.resolve(__dirname, 'cover.photo.ts'), `-r ${releaseId}`]);

    // 4. Tag files and fetch album art
    console.log('\n✏️  Tagging tracks...');
    await runCommand(path.resolve(__dirname, '../../scripts/tag.tracks.sh'), ['-f', '../../tracks.txt']);

    // 5. Return to start and eject
    console.log(`\n🔀 Returning to starting directory: ${initialDir}`);
    chdir(initialDir);

    await runCommand('eject');

    console.log('\n🎉 All tasks completed successfully!');
  } catch (error) {
    // In case of an error, try to return to the original directory before exiting
    // FIX: Use imported `cwd` instead of `process.cwd`.
    if (cwd() !== initialDir) {
      console.log(`\n🔀 An error occurred. Returning to starting directory...`);
      chdir(initialDir);
    }

    // FIX: Properly handle unknown error types in catch block.
    // Safely handle different error types.
    if (error instanceof DiscogsApiError) {
      console.error(`\n❌ API Error: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`\n❌ An unexpected error occurred: ${error.message}`);
    } else {
      console.error('\n❌ An unknown and unexpected error occurred.');
    }

    exit(1);
  }
}

// Run the main function.
main();