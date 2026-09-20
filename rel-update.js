// Replace the v2.5.5 asset on the dist repo release with the latest build.
// Requires GTOKEN env. Usage: node rel-update.js
const https = require('https');
const fs = require('fs');

const TOKEN = process.env.GTOKEN || '';
const TAG = 'v2.5.5';
const APK_NAME = 'DSH-Remote-Direct-v2.5.5.apk';

function req(method, hostname, path, headers, bodyBuf) {
  return new Promise((resolve, reject) => {
    const r = https.request({ hostname, path, method, headers }, (res) => {
      let o = ''; res.on('data', (c) => { o += c; });
      res.on('end', () => resolve({ status: res.statusCode, text: o }));
    });
    r.on('error', reject);
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}

(async () => {
  const rel = await req('GET', 'api.github.com', '/repos/teslawei/dsh-remote-dist/releases/tags/' + TAG, {
    'User-Agent': 'rel', 'Authorization': 'Bearer ' + TOKEN,
  });
  const r = JSON.parse(rel.text);
  console.log('release:', r.id, 'assets:', (r.assets || []).map((a) => a.id + ':' + a.name).join(','));
  for (const a of r.assets || []) {
    if (a.name === APK_NAME) {
      const d = await req('DELETE', 'api.github.com', '/repos/teslawei/dsh-remote-dist/releases/assets/' + a.id, {
        'User-Agent': 'rel', 'Authorization': 'Bearer ' + TOKEN,
      });
      console.log('deleted old asset:', a.id, d.status);
    }
  }
  const apk = fs.readFileSync(__dirname + '/apk/' + APK_NAME);
  const up = await req('POST', 'uploads.github.com',
    '/repos/teslawei/dsh-remote-dist/releases/' + r.id + '/assets?name=' + APK_NAME, {
    'User-Agent': 'rel', 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/vnd.android.package-archive',
    'Content-Length': apk.length,
  }, apk);
  console.log(up.status === 201 ? 'asset uploaded (latest build)' : 'upload ' + up.status + ': ' + up.text.slice(0, 200));
  process.exit(0);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
