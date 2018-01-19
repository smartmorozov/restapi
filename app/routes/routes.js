const uuidv4 = require('uuid/v4');//для генерации UUID
//const ObjectID = require('mongodb').ObjectID;//нужно было бы, если бы поиск производили по айдишникам MongoDB

module.exports = function(app, collection) {
    app.get('/', (req, res) => { //вывод всех заметок
        console.log('get'); //выводим в консоль обращение get
        collection.find({}).project({_id:0}).toArray( (err, docs) => {//можно реализовать постраничный вывод добавив .skip(100).limit(50) после find({})
            if (err) {
                console.log(err);
                return res.status(500).send({error: 'Can not find notes in Database.'});
            }
            console.log('Found the following records:');
            console.log(docs);
            return res.send(docs); //отправляем найденные заметки
        });
    });
    app.post('/', (req, res) => { //добавление новой заметки
        //console.log(req.body);//отобразим в консоли тело запроса
        if ( !req.is('application/json') ) //проверка типа запроса
            return res.status(415).send({error: 'Content-Type must be application/json.'}); //принимаем только json
        if ( req.body.title===undefined || req.body.text===undefined ) //проверка наличия обязательных полей
            return res.status(400).send({error: 'Both fields "title" and "text" are required.'});
        var incorrectInput = //флаг некорректного ввода, получаем из функции
            cutNote(req); //проверка на длину строк
        const note = { //формируем заметку
            id: uuidv4(), 
            title: req.body.title, 
            text: req.body.text, 
            date_create: getTimestamp(),
            date_update: getTimestamp() 
        };
        collection.insertOne(note, (err, result) => { //вставляем заметку в базу
            if (err) {
                console.log(err);                
                return res.status(500).send({error: 'Can not insert note in Database.'});
            }
            console.log('Note inserted into collection');
            delete(note._id);//удаляем из заметки айдишник присвоенный MongoDB, потому что уже сгенерировали свой uuid
            if(incorrectInput!=null) { //если был неверный ввод
                console.log('and was cutted');
                note.warning = incorrectInput; //добавляем в ответ предупреждение с инфой, что было не так
                return res.status(202).send(note);
            }
            return res.status(201).send(note); //отправляем добавленную заметку
        });
    });
    app.put('/', (req, res) => { //правка одной заметки
        console.log(req.body);//отобразим в консоли тело запроса
        if ( !req.is('application/json') ) //проверка типа запроса
            return res.status(415).send({error: 'Content-Type must be application/json.'}); //принимаем только json
        if ( req.body.id===undefined || req.body.title===undefined || req.body.text===undefined ) //проверка наличия обязательных полей
            return res.status(400).send({error: 'All fields "id", "title" and "text" are required.'});
        var incorrectInput = //флаг некорректного ввода, получаем из функции
            cutNote(req); //проверка на длину строк
        const details = {id: req.body.id};//{_id: ObjectID(req.params.id)}
        const note = {
            title: req.body.title, 
            text: req.body.text, 
            date_update: getTimestamp() 
        };
        collection.findOneAndUpdate( //находим и обновляем заметку в базе
            details, //параметры поиска
            { $set: note }, //обновлённые поля
            { projection: {_id:0}, //поля для отображения/неотображения
              returnOriginal: false }, //возвращаемый объект исходный/обновлённый
            (err, result) => {
                if (err) {
                    console.log(err);                
                    return res.status(500).send({error: 'Can not update note in Database.'});
                }
                if (result.value===null) { //если ничего не было обновлено
                    console.log('Note was not updated, because the requested id must be not exist'); //скорее всего пытались обновить несуществующий id
                    return res.status(404).send({error: 'Note was not updated. The requested id could not be found.'});
                }
                console.log('Note was updated');
                if(incorrectInput!=null) { //если был неверный ввод
                    console.log('and was cutted');
                    result.value.warning = incorrectInput; //добавляем в ответ предупреждение с инфой, что было не так
                    return res.status(202).send(result.value);
                } 
                return res.send(result.value); //отправляем обновлённую заметку
            }
        );
    });
    app.delete('/', (req, res) => { //удаление одной заметки
        console.log(req.body);//отобразим в консоли тело запроса
        if ( !req.is('application/json') ) //проверка типа запроса
            return res.status(415).send({error: 'Content-Type must be application/json.'}); //принимаем только json
        if ( req.body.id===undefined ) //проверка наличия обязательных полей
            return res.status(400).send({error: 'Field "id" is required.'});
        const details = {id: req.body.id};//{_id: ObjectID(req.params.id)}, 
        collection.deleteOne( details, (err, result) => { //удаляем заметку из базы
            if (err) {
                console.log(err);                
                return res.status(500).send({error: 'Can not delete note in Database.'});
            } 
            if (result.deletedCount===0) { //если ничего не было удалено
                console.log('Note was not deleted, because the requested id must be not exist'); //скорее всего пытались удалить несуществующий id
                return res.status(404).send({error: 'Note was not deleted. The requested id could not be found.'});
            }
            return res.sendStatus(204); //отправляем только статус
        });
    });
};
function getTimestamp() { //текущее время в формате UNIX
    return Math.round(Date.now()/1000); //делим на 1000 потому что нужны секунды, а не миллисекунды
}
function cutNote(req) { //обрезка длинной заметки
    incorrectInput = null;//сбрасываем флаг некорректного ввода
    if (req.body.title.length > 30) { //если заголовок больше 30 символов
        req.body.title = req.body.title.slice(0, 30); //оставляем только первые 30
        incorrectInput = 'Title was too long.';
    }
    if (req.body.text.length > 500) { //если текст заметки больше 500 символов
        req.body.text = req.body.text.slice(0, 500); //оставляем только первые 500
        if (incorrectInput != null){
            incorrectInput += ' Text was too long.';
        } else {
            incorrectInput = 'Text was too long.';
        }
    }
    return incorrectInput;
}