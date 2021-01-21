const { ApolloServer } = require('apollo-server');
const { PrismaClient } = require('@prisma/client')
const fs = require('fs');
const path = require('path');
const { isObjectType } = require('graphql');

//Implementation of schema 
const resolvers = {
    Query: {
        info: () => 'This is the API of a Hackernews Clone',
        feed: async (parent, args, context) => {
            return context.prisma.link.findMany();
        }
    },
    Mutation: {
        addLink: (parent, { description, url }, context) => {
            const newLink = {
                url,
                description
            }
            return context.prisma.link.create({ data: newLink });
        },
        deleteLink: async (parent, { id }, context) => {
            const deletedLink = await context.prisma.link.delete({
                where: {
                    id: parseInt(id)
                }
            });
            return deletedLink;
        },
        updateLink: async (parent, { id, url, description }, context) => {
            const updatedLink = await context.prisma.link.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    url,
                    description
                }
            });
            return updatedLink; 
        }
    }
}

const prisma = new PrismaClient();

const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8'),
    resolvers,
    context: {
        prisma
    }
})

server.listen().then(({ url }) => {
    console.log(`Server is running on ${url}`)
})