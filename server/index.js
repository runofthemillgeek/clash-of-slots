const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const RedisStore = require('connect-redis')(session);

const storage = require('./storage');

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  if (req.session.urlId) console.log(req.session.urlId);

  res.render('pages/index', {
    tables: null
  });
});

app.get('/u/:id', function(req, res) {
  const id = req.params.id;
  const { tables } = storage.getTablesForSession(id);

  if (!tables) {
    res.sendStatus(404);
    return;
  }

  res.render('pages/index', {
    tables
  });
});

app.post('/save', function(req, res) {
  if (req.body) {
    const id = storage.addTablesForSession(req.body.tables);
    req.session.urlId = id;

    res.json(200, id);    
  } else {
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);