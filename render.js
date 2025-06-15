const { execSync } = require('child_process');
const path = require('path');

// 1. Get input file from the first argument, default to 'input.json'
const inputFile = process.argv[2] || 'input.json';

// 2. Get output name from the second argument or generate a timestamped one
const outputArg = process.argv[3];
const outputName = outputArg || `youtube-shorts-${Date.now()}`;
const outputLocation = path.join('out', `${outputName}.mp4`);

// 3. Construct the remotion render command
const command = [
  'npx',
  'remotion',
  'render',
  'YouTubeShorts',
  outputLocation,
  `--propsFile=${inputFile}`
].join(' ');

console.log(`🎬 Using input file: ${inputFile}`);
console.log(`🎬 Executing command: ${command}`);
console.log('---');

try {
  // 4. Execute the command
  execSync(command, { stdio: 'inherit' });

  console.log('---');
  console.log(`\n✅ Render completed successfully!`);
  console.log(`📽️  Output: ${outputLocation}`);

} catch (error) {
  console.error(`\n---`);
  console.error('❌ Render script failed.');
  process.exit(1);
}