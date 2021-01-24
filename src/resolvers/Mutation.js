const { APP_SECRET, getUserId, getTokenPayload } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function signup(parent, args, context) {

    const password = await bcrypt.hash(args.password, 10);

    const newUser = await context.prisma.user.create({
        data: {
            ...args,
            password
        }
    });

    const token = jwt.sign({ userId: newUser.id }, APP_SECRET);

    return {
        token,
        newUser
    };
}

async function login(parent, args, context) {

    const user = await context.prisma.user.findUnique({ where: { email: args.email } });
    console.log('USER', user);
    if (!user) throw new Error('No such user found');

    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) throw new Error('Invalid password');

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
        token,
        user
    }
}

async function postLink(parent, { description, url }, context) {

    const { userId } = context;

    const newLink = await context.prisma.link.create({
        data: {
            url,
            description,
            postedBy: { connect: { id: userId } }
        }
    })

    context.pubsub.publish("NEW_LINK", newLink);

    return newLink;
}

async function deleteLink(parent, { id }, context) {

    const deletedLink = await context.prisma.link.delete({
        where: {
            id: parseInt(id)
        }
    });
    return deletedLink;
}

async function updateLink(parent, { id, url, description }, context) {

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

async function vote(parent, { linkId }, context) {
    const { userId } = context;
    // OR const userId = getUserId(context) 

    const vote = await context.prisma.vote.findUnique({
        where: {
            linkId_userId: {
                linkId: Number(linkId),
                userId: userId
            }
        }
    })

    if (Boolean(vote)) {
        throw new Error(`Already voted for link ${Number(linkId)}`)
    }

    // const user = await context.prisma.user.findUnique({ where: { id: userId }})
    // const link = await context.prisma.link.findUnique({ where: { id: linkId } });
    // const newVote = await context.prisma.vote.create({
    //     data: {
    //         user,
    //         link
    //     }
    // })
    // Not needed to find the user and link, because you can relate them using 'connect' and the ID's

    const newVote = await context.prisma.vote.create({
        data: {
            user: { connect: { id: userId }},
            link: { connect: { id: Number(linkId)}}
        }
    })

    context.pubsub.publish("NEW_VOTE", newVote);
    return newVote; 
}

module.exports = {
    signup,
    login,
    postLink,
    deleteLink,
    updateLink,
    vote
}