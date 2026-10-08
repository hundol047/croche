const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535 || !fs.existsSync(path.join(root,'index.html'))) throw new Error('Build the web export and choose a valid port first.');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer((req,res)=>{
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  let file;
  try {
    const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (name.includes('\0')) throw new Error('invalid path');
    file = path.resolve(root, '.'+name);
    if (file !== root && !file.startsWith(root+path.sep)) throw new Error('invalid path');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      if (name === '/favicon.ico') {res.writeHead(204);res.end();return;}
      if (path.extname(name)) {res.writeHead(404);res.end();return;}
      file = path.join(root,'index.html');
    }
  } catch {res.writeHead(400);res.end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  if (req.method === 'HEAD') {res.end();return;}
  fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>process.stdout.write(`FailTwin static web: http://127.0.0.1:${port}\n`));
