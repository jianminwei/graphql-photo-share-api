const { GraphQLScalarType } = require('graphql')

module.exports ={
    Photo: {
        id: parent => parent.id || parent._id,
        url: parent => `http://yoursite.com/img/${parent._id}.jpg`,
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