const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const shortid = require('shortid');

const adapter = new FileSync(path.resolve(process.cwd(), "db.json"));
const db = low(adapter);

db.defaults({
  data: []
}).write();

module.exports = {
  addTablesForSession,
  getTablesForSession
}

function addTablesForSession(tables) {
  const id = shortid.generate();
  
  db.get('data')
    .push({ id, tables })
    .write();

  return id;
}

function getTablesForSession(id) {
  return db.get('data')
    .filter({ id })
    .head()
    .value();
}