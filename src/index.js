const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');


let links = [{
    id: 'link-0',
    url: 'www.howtographql.com',
    description: 'Fullstack tutorial for GraphQL'
}]

let linksIdCount = links.length;

//Implementation of schema 
const resolvers = {
    Query: {
        info: () => 'This is the API of a Hackernews Clone',
        feed: () => links,
    },
    Mutation: {
        addLink: (parent, { description, url }) => {
            const newPost = {
                id: `link-${linksIdCount++}`,
                url,
                description
            }
            links.push(newPost);
            return newPost;
        },
        deleteLink: (parent, { id }) => {
            const indexOfLinkToDelete = links.findIndex(link => link.id === id);
            const linksToDelete = links.splice(indexOfLinkToDelete, 1);
            return linksToDelete[0];
        },
        updateLink: (parent, { id, url, description }) => {
            const newLink = {url, description};
            const linkToUpdate = links.find(link => link.id === id);
            return Object.assign(linkToUpdate, newLink); 
        }
    }
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8'),
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`Server is running on ${url}`)
})