# restapi
REST API с заметками. Тестовое задание для Napoleon IT.
---

_написано на JavaScript для запуска на Nodejs с использованием mongoDB, Express, body-parser, uuid_


**Cпособ запуска приложения с ипользованием Docker:**

**1.** [Скачать Docker](https://www.docker.com/community-edition#/download)

**2.** Скопировать данный репозиторий 

`git clone https://github.com/smartmorozov/restapi.git`

**3.** Собрать контейнер с использованием Dockerfile

`docker build -t smartmorozov/restapi .`

_smartmorozov – название репозитория, где будет храниться образ_

_restapi – имя образа_

_. - директория где находятся файлы проекта (в примере текущая)_

**4.** Запустить контейнер

`docker run -i -t --rm -p 8080:8080 smartmorozov/restapi`

**5.** Запустить приложение 

`mongod & node server.js`

Интерфейс будет доступен по адресу хоста, на котором запущен Docker, порт 8080.
