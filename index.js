const { ApolloServer } = require('apollo-server')

const typeDefs = `
enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
}

# 1. Add Photo type definition
type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
}

# 2. Return Photo from allPhotos
type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
}

input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
}

# 3. Return the newly posted photo from the mutation
type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
}

`

let _id = 0
let photos = []

const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },

    Mutation: {
        postPhoto(parent, args) {
            var newPhoto = {
                id: _id++,
                ...args.input
            }
            photos.push(newPhoto)
            return newPhoto
        }
    },
    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`
    }
}

// 2. Create a new instance of the server.
// 3. Send it an object with typeDefs (the schema) and resolvers
const server = new ApolloServer({
    typeDefs,
    resolvers
})

// 4. Call listen on the server to launch the web server
server
.listen()
    .then(({ url }) => console.log(`GraphQL Service running on ${url}`))