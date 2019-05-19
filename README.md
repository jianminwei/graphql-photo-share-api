#### git clone this project

    git clone https://github.com/jianminwei/graphql-photo-share-api.git

#### graphql-photo-share-api

You need manually add a ".env" file to the root directory of this project (same folder contains typeDefs.graphql) with below content.

    DB_HOST=mongodb://localhost:27017/test
    CLIENT_ID=<CLIENT_ID>
    CLIENT_SECRET=<CLIENT_SECRET_CODE>


#### Install MongoDB to your local PC

After installing MongoDB, run the mongo shell

    mongo

Create "users" collection with below data in mongo shell:

    let myUsers = [
        {
            "githubLogin" : "mHattrup",
            "name" : "Mike Hattrup",
            "githubToken" : "12345"
        },
        {
                "githubLogin" : "gPlake",
                "name" : "Glen Plake",
                "githubToken" : "12345"
        },
        {
                "githubLogin" : "sSchmidt",
                "name" : "Scot Schmidt",
                "githubToken" : "12345"
        }
    ]

    db.users.insertMany(myUsers)


Create "photos" collection with below data:

    let myPhotos = [
        {
                "name" : "Dropping the Heart Chute",
                "description" : "The heart chute is one of my favorite chutes",
                "category" : "ACTION",
                "githubUser" : "gPlake",
                "created" : "3-28-1977",
                "taggedUsers" : [
                        "gPlake"
                ]
        },

        {
                "name" : "Enjoying the sunshine",
                "category" : "SELFIE",
                "githubUser" : "sSchmidt",
                "created" : "1-2-1985",
                "taggedUsers" : [
                        "sSchmidt",
                        "mHattrup",
                        "gPlake"
                ]
        },

        {
                "name" : "Gunbarrel 25",
                "description" : "25 laps on gunbarrel today",
                "category" : "LANDSCAPE",
                "githubUser" : "sSchmidt",
                "created" : "2018-04-15T19:09:57.308Z",
                "taggedUsers" : [ ]
        }
    ]

    db.photos.insertMany(myPhotos);

#### Run following command

Run npm install (in project root directory) to install all the node dependencies.

    npm install   

Run npm start (in project root directory) to run the project

    npm start 