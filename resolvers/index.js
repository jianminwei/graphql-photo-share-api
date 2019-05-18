const { GraphQLScalarType } = require('graphql')
const { authorizeWithGithub } = require('../lib')

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
        },

        async githubAuth(parent, { code }, { db }) {

            /*********************************************
             * You can test this mutation with below:
             * Note: the code has to be a newly obtained code each time:
             *       1.Use this link: https://github.com/login/oauth/authorize?client_id=<client_id>&scope=user
             *       2. Github will ask authorize
             *       3. After step 2, github will return a url with code.
             *       4. Use below mutation query.
             * 
            
             mutation {
                githubAuth(code: "7a18473821138800d22f") {
                    token
                    user {
                        githubLogin
                        name
                        avatar
                    }
                }
            }
            ************************************************/

            let {
              message,
              access_token,
              avatar_url,
              login,
              name
            } = await authorizeWithGithub({
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
              code
            })
      
            if (message) {
              throw new Error(message)
            }
      
            let latestUserInfo = {
              name,
              githubLogin: login,
              githubToken: access_token,
              avatar: avatar_url
            }
      
            const { ops:[user] } = await db
              .collection('users')
              .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })
      
            return { user, token: access_token }
          },        
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
