const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')
//const {resolvers} = require('./resolvers/index.js')
const { GraphQLScalarType } = require('graphql')

const { MongoClient } = require('mongodb')
require('dotenv').config()

const resolvers = {
    Query: {
        totalPhotos: (parent, args, { db }) =>
            db.collection('photos')
                .estimatedDocumentCount(),

        allPhotos: (parent, args, { db }) =>
            db.collection('photos')
                .find()
                .toArray(),

        totalUsers: (parent, args, { db }) =>
            db.collection('users')
                .estimatedDocumentCount(),
                
        allUsers: (parent, args, { db }) =>
            db.collection('users')
                .find()
                .toArray()
    },

    Mutation: {
        postPhoto(parent, args, { db, getSequence }) {

            /****************************************************
             * Post a new photo syntax:
             * 
                mutation newPhoto($input: PostPhotoInput!) {
                postPhoto(input: $input) {
                    name
                    url
                    description
                    category
                    postedBy{
                        githubLogin
                        name
                    }
                    taggedUsers {
                        name
                    }
                  }
                }

                *** Query Variable ***
                {
                    "input": {
                        "name": "React workshop",
                        "description": "Photo taked at react workshop",
                        "githubUser": "sSchmidt"
                    }
                }                

             ****************************************************/

            var newPhoto = {
                ...args.input,
                taggedUsers:[],
                created: new Date()
            }

            db.collection("photos").insertOne(newPhoto)
            return newPhoto
        }
    },

    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: (parent, args, { db }) => 
            db.collection('users')
            .findOne({githubLogin: parent.githubUser}),
        
        taggedUsers: (parent, args, { db }) =>
            db.collection('users')
            .find({githubLogin: {"$in": parent.taggedUsers} })
            .toArray()
    },

    User: {
        postedPhotos: (parent, args, { db }) =>
            db.collection('photos')
            .find({ githubUser: parent.githubLogin } )
            .toArray() ,

        inPhotos: (parent, args, { db }) =>
            db.collection('photos')
            .find({ taggedUsers: parent.githubLogin })
            .toArray()
    },

    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value.',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toLocaleString(),
        parseLiteral: ast => ast.value
    })
}

// 1. Create Asynchronous Function
async function start() {
    const app = express()
    const MONGO_DB = process.env.DB_HOST

    const client = await MongoClient.connect(
        MONGO_DB,
        { useNewUrlParser: true }
    )

    const db = client.db()

    const context = { db }
    const server = new ApolloServer({ typeDefs, resolvers, context })

    server.applyMiddleware({ app })

    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

    app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

    app.listen({ port: 4000 }, () =>
        console.log(
            `GraphQL Server running at http://localhost:4000${server.graphqlPath}`
        )
    )
}

// 5. Invoke start when ready to start
start()