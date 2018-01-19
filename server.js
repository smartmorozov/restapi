/** Сервер */

//зависимости
const express     = require('express'); //фреймворк
const MongoClient = require('mongodb').MongoClient; //клиент для взаимодействия с базой данных
const assert      = require('assert'); //модуль проверок условий
const bodyParser  = require('body-parser'); //для работы с JSON
const dbconfig    = require('./config/db'); //настройки подключения к базе

const app = express(); //инициализация приложения
const port = 8080; //наш порт
app.use(bodyParser.json()); //использование бодипарсера, потому что express не может сам обрабатывать json
app.use(bodyParser.urlencoded({ extended: true })); //использование бодипарсера, потому что express не может сам обрабатывать формы в URL-кодировке

MongoClient.connect(dbconfig.url, (err, client) => { //подключаемся к базе
  assert.equal(null, err); //Проверка, что нет ошибок подключения к базе. В случае ошибки подключения она выводится в консоль, а программа завершается.
  console.log("Connected successfully to MongoDB server"); //выводим в консоль, что успешно подключились к серверу с базой
  const db = client.db(dbconfig.dbName); //переходим от клиента базы данных к самой базе данных
  const collection = db.collection(dbconfig.collectionName); //получаем нужную коллекцию
  
  require('./app/routes')(app, collection); //импортируем марштуры
  
  app.listen(port, () => { //запускаем приложение на прослушивание порта
    console.log('Server with RESTAPI are listening port ' + port); //при запуске выводим сообщение в консоль
  });
});