#!/usr/bin/env node
import { Command } from 'commander';
import { scanCommand } from './commands/scan.js';
import { explainCommand } from './commands/explain.js';
import { fixCommand } from './commands/fix.js';
import { roastCommand } from './commands/roast.js';
import { ciCommand } from './commands/ci.js';

const program = new Command();

program
  .name('ai-code-autopsy')
  .description('We autopsy AI-generated code and expose its structural risks.')
  .version('1.0.0');

program
  .command('scan <file>')
  .description('Run a full forensic autopsy on a file for AI-generated patterns')
  .option('-j, --json', 'Output as JSON')
  .option('-p, --preset <preset>', 'Use preset: strict, balanced, experimental')
  .action(async (file, options) => {
    await scanCommand(file, options);
  });

program
  .command('explain <file>')
  .description('Get detailed technical breakdown of AI patterns found')
  .option('-j, --json', 'Output as JSON')
  .option('-p, --preset <preset>', 'Use preset: strict, balanced, experimental')
  .action(async (file, options) => {
    await explainCommand(file, options);
  });

program
  .command('roast <file>')
  .description('Generate a viral, shareable roast of your AI-generated code')
  .option('-p, --preset <preset>', 'Use preset: strict, balanced, experimental')
  .action(async (file, options) => {
    await roastCommand(file, options);
  });

program
  .command('fix <file>')
  .description('Auto-fix detected AI patterns in your code')
  .option('-j, --json', 'Output as JSON')
  .option('-p, --preset <preset>', 'Use preset: strict, balanced, experimental')
  .option('-o, --output <path>', 'Output file path')
  .option('-d, --dry-run', 'Show changes without applying')
  .action(async (file, options) => {
    await fixCommand(file, options);
  });

program
  .command('ci <file>')
  .description('Run in CI mode with machine-readable JSON output and exit codes')
  .option('-t, --threshold <number>', 'Score threshold to fail CI (0.0-1.0, default: 0.5)')
  .action(async (file, options) => {
    await ciCommand(file, options);
  });

program.parse();
