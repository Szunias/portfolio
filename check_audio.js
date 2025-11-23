import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5176,
  path: '/assets/audio/tracks/caplanetechno.m4a',
  method: 'HEAD'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
