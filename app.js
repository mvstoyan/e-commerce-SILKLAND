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

app.set('trust proxy' , 1);
app.use(
  rateLimiter({
    winwowMs: 15 * 60 *1000,
    max: 60,
  })
);

app.use(helmet());
app.use(cors());
app.use(mongoSanitize());

// app.use(morgan('tiny'))
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use((req, res, next) => {
  // Clean user input in req.body
  req.body = sanitizeInput(req.body);

  next();
});

function sanitizeInput(input) {
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

app.use(express.static('./public'));
app.use(fileUpload());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();