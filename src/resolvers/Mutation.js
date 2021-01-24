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

module.exports = {
    signup,
    login,
    postLink,
    deleteLink,
    updateLink
}