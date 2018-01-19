# Version: 1.0.0
FROM ubuntu:16.04
LABEL maintainer="smartmorozov@gmail.com"
# Set the working directory to /restapi
WORKDIR /restapi
# Copy the current directory contents into the container at /restapi
ADD . /restapi
# Install curl and https transport
RUN apt-get update &&\
    apt-get install -y curl &&\
    apt-get install apt-transport-https
# Install Node
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash &&\
    export NVM_DIR="$HOME/.nvm" &&\
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" &&\
    nvm install node &&\
    npm install
# Install MongoDB
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5  &&\
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list   &&\
    apt-get update    &&\
    apt-get install -y mongodb-org=3.6.2 mongodb-org-server=3.6.2 mongodb-org-shell=3.6.2 mongodb-org-mongos=3.6.2 mongodb-org-tools=3.6.2  &&\
    mkdir -p /data/db /data/configdb
EXPOSE 8080