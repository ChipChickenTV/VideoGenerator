const { execSync } = require('child_process');
const path = require('path');

// 1. Generate dynamic output name from command-line arguments or a timestamp
const argName = process.argv[2];
const outputName = argName || `youtube-shorts-${Date.now()}`;
const outputLocation = path.join('out', `${outputName}.mp4`);

// 2. Construct the remotion render command.
// We pass --propsFile to solve the NaN issue by letting Remotion handle data loading.
// Using npx ensures we use the locally installed Remotion CLI.
const command = [
  'npx',
  'remotion',
  'render',
  'YouTubeShorts',
  outputLocation,
  '--propsFile=input.json'
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