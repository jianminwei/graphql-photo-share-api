const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')
const resolvers = require('./resolvers')

// Call `express()` to create an Express application
var app = express()

// Create a new instance of the server.
// Send it an object with typeDefs (the schema) and resolvers
const server = new ApolloServer({ typeDefs, resolvers })

// Call `applyMiddleware()` to allow middleware mounted on the same path
server.applyMiddleware({ app })

// Create a home route
app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

// Listen on a specific port
app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running @http://localhost:4000${server.graphqlPath}`)
)