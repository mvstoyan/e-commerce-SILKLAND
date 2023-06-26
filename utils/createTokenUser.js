const createTokenUser = (user) => {
    // Create a token-based user object using the provided user data
    // Extract relevant user data such as name, userId, and role
    return { name: user.name, userId: user._id, role: user.role };
};

module.exports = createTokenUser;