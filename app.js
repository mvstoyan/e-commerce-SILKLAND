require('dotenv').config();
require('express-async-errors')
// express

const express = require('express');
const app = express();

// rest of the packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const mongoSanitize = require('express-mongo-sanitize');

// Creating a DOMPurify object for sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


// database
const connectDB = require('./db/connect');

// routers

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Configuring the Express app

app.set('trust proxy' , 1); // Set trust proxy
app.use( // Rate limiter middleware to limit API requests
  rateLimiter({
    winwowMs: 15 * 60 *1000, // 15 minutes
    max: 60, // Maximum 60 requests per windowMs
  })
);

app.use(helmet()); // Helmet middleware for secure HTTP headers
app.use(cors()); // Cross-Origin Resource Sharing (CORS) middleware
app.use(mongoSanitize()); // Express MongoDB Sanitize middleware to prevent MongoDB query injection
// Middleware for logging HTTP requests (optional)
// app.use(morgan('tiny'))
app.use(express.json()); // JSON body parser middleware
app.use(cookieParser(process.env.JWT_SECRET)); // Cookie parser middleware with JWT secret

app.use((req, res, next) => { // Middleware to sanitize user input in req.body using DOMPurify
  // Clean user input in req.body
  req.body = sanitizeInput(req.body);

  next();
});

function sanitizeInput(input) { // Function to recursively sanitize user input
  if (typeof input === 'object') {
    // Recursively sanitize all properties of the object
    for (let key in input) {
      input[key] = sanitizeInput(input[key]);
    }
  } else if (typeof input === 'string') {
    // Sanitize the string from potentially dangerous elements
    input = DOMPurify.sanitize(input);
  }

  return input;
}

app.use(express.static('./public')); // Serve static files from the './public' directory
app.use(fileUpload()); // File upload middleware

// Mounting the routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);


app.use(notFoundMiddleware); // Not found middleware to handle invalid routes
app.use(errorHandlerMiddleware) // Error handler middleware

const port = process.env.PORT || 5000; // Starting the server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL) // Connect to the MongoDB database
    app.listen(port, () =>  // Start the Express server
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();