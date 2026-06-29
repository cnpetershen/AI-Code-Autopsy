#!/usr/bin/env node
import('../dist/index.js').catch((err) => {
  console.error('Failed to load ai-code-autopsy CLI:', err.message);
  console.error('Run `npm install -g ai-code-autopsy` or `npx ai-code-autopsy`');
  process.exit(1);
});
