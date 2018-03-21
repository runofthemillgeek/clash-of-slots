const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  secret: 'ilovecats',
  resave: false
}));

app.use('/static', express.static(path.resolve(__dirname, '../static')));

app.get('/', function(req, res) {
  res.sendFile('/static/index.html', { root: process.cwd() });
});

app.get('/api/:id', function(req, res) {

});

app.listen(process.env.PORT || 3000);