const { execSync } = require('child_process');
const path = require('path');

// 1. Get output name from the first argument or generate a timestamped one.
const outputArg = process.argv[2];
const outputName = outputArg || `youtube-shorts-${Date.now()}`;
const outputLocation = path.join('out', `${outputName}.mp4`);

// 2. Get the input JSON file from the second argument, or use 'input.json' as a default.
const inputFile = process.argv[3] || 'input.json';

// 3. Construct the remotion render command.
// Using npx ensures we use the locally installed Remotion CLI.
const command = [
  'npx',
  'remotion',
  'render',
  'YouTubeShorts',
  outputLocation,
  `--propsFile=${inputFile}`
].join(' ');

console.log(`🎬 Executing command: ${command}`);
console.log('---');

try {
  // 3. Execute the command and show output in real-time.
  // stdio: 'inherit' pipes the child process's output directly to this process's output.
  execSync(command, { stdio: 'inherit' });

  console.log('---');
  console.log(`\n✅ Render completed successfully!`);
  console.log(`📽️  Output: ${outputLocation}`);

} catch (error) {
  // The error output from Remotion will be visible thanks to stdio: 'inherit'.
  // We just need to signal that the script failed.
  console.error(`\n---`);
  console.error('❌ Render script failed.');
  process.exit(1);
}