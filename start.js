const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const p = spawn('npm.cmd', ['run', 'dev'], {
  stdio: ['ignore', out, err],
  detached: true
});

p.unref();
console.log('Started server in background with pid:', p.pid);
