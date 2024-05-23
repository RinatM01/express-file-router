export const handler = (req, res) => {
    const {username} = req.params;
    return `Welcome, ${username}!`
}