const notFound = (req, res) => res.status(404).send('Route does not exist')
// Define a middleware function named 'notFound' that handles 404 errors
// Set the HTTP status code to 404 (Not Found) and send a response with the error message
module.exports = notFound
