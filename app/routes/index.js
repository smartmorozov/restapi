const routes = require('./routes');
module.exports = function(app, db) {
  routes(app, db);
  //здесь можно добавлять и другие маршруты, если потребуется
};