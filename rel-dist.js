// Publish a release to the public dist repo. Usage: node rel-dist.js <tag> <title> <bodyFile>
const https = require('https');
const fs = require('fs');

const TOKEN = process.env.GTOKEN || '';
const [, , TAG, TITLE, BODY_FILE] = process.argv;
const BODY = fs.readFileSync(BODY_FILE, 'utf8');
const APK_NAME = 'DSH-Remote-Direct-' + TAG + '.apk';

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
  const meta = JSON.stringify({ tag_name: TAG, target_commitish: 'main', name: TITLE, body: BODY, draft: false, prerelease: false });
  let rel;
  const created = await req('POST', 'api.github.com', '/repos/teslawei/dsh-remote-dist/releases', {
    'User-Agent': 'rel', 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(meta),
  }, Buffer.from(meta));
  if (created.status === 201) {
    rel = JSON.parse(created.text);
    console.log('release created:', rel.id);
  } else {
    const tags = await req('GET', 'api.github.com', '/repos/teslawei/dsh-remote-dist/releases/tags/' + TAG, {
      'User-Agent': 'rel', 'Authorization': 'Bearer ' + TOKEN,
    });
    rel = JSON.parse(tags.text);
    console.log('release exists:', rel.id);
  }

  const apk = fs.readFileSync(__dirname + '/apk/' + APK_NAME);
  const up = await req('POST', 'uploads.github.com',
    '/repos/teslawei/dsh-remote-dist/releases/' + rel.id + '/assets?name=' + APK_NAME, {
    'User-Agent': 'rel', 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/vnd.android.package-archive',
    'Content-Length': apk.length,
  }, apk);
  console.log(up.status === 201 ? 'asset uploaded' : 'upload ' + up.status + ': ' + up.text.slice(0, 200));
  process.exit(0);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
