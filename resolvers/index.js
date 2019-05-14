const { GraphQLScalarType } = require('graphql')

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

module.exports = resolvers
