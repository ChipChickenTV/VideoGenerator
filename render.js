const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 1. Get output name from the first argument
const outputNameArg = process.argv[2];

// 2. Get input file from the second argument
const inputFile = process.argv[3];

// 3. Validate arguments
if (!outputNameArg || !inputFile) {
  console.error('❌ Incorrect arguments. Usage: npm run render:headless -- <outputName> <inputFile.json>');
  process.exit(1);
}

const outputLocation = path.join('out', `${outputNameArg}.mp4`);

let props;
try {
  // 4. Read and parse the props file
  const propsString = fs.readFileSync(inputFile, 'utf-8');
  props = JSON.parse(propsString);
} catch (error) {
  console.error(`❌ Error reading or parsing props file: ${inputFile}`);
  console.error(error);
  process.exit(1);
}

// 5. Stringify the props object, then stringify it again for safe command line passing on Windows
const propsStringForCli = JSON.stringify(JSON.stringify(props));

// 6. Construct the remotion render command using --props
const command = [
  'npx',
  'remotion',
  'render',
  'YouTubeShorts',
  outputLocation,
  `--props=${propsStringForCli}` // Pass the double-stringified props
].join(' ');

console.log(`🎬 Using input file: ${inputFile}`);
console.log(`🎬 Executing command...`);
console.log('---');

try {
  // 7. Execute the command
  execSync(command, { stdio: 'inherit' });

  console.log('---');
  console.log(`\n✅ Render completed successfully!`);
  console.log(`📽️  Output: ${outputLocation}`);

} catch (error) {
  console.error(`\n---`);
  console.error('❌ Render script failed.');
  process.exit(1);
}