const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => { // Function to simulate a fake Stripe API call
    const client_secret = 'someRandomValue';
    return { client_secret, amount };
}

const createOrder = async (req, res) => { // Function to create a new order
    const { items: cartItems, tax, shippingFee } = req.body;

    if (!cartItems || cartItems.lenght < 1) { // Check if cart items are provided
        throw new CustomError.BadRequestError('No cart items provided');
    }
    if (!tax || !shippingFee) { // Check if tax and shipping fee are provided
        throw new CustomError.BadRequestError(
            'Please provide tax and shipping fee'
        );
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) { // Iterate through cart items to validate and calculate order details
        const dbProduct = await Product.findOne({ _id: item.product });
        if (!dbProduct) { // Throw a NotFoundError if the product is not found
            throw new CustomError.NotFoundError(
                `No product with id : ${item.product}`
            );
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name,
            price, 
            image, 
            product: _id,
        };
        // add item to order
        orderItems = [...orderItems, singleOrderItem];
        // calculate subtotal
        subtotal += item.amount * price;
    };
    // calculate total
    const total = tax + shippingFee + subtotal;
    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency:'usd',
    });
    const order = await Order.create({ // Create a new order in the database
        orderItems, 
        total, 
        subtotal, 
        tax, 
        shippingFee, 
        clientSecret:paymentIntent.client_secret,
        user: req.user.userId,
    })
    // Send a JSON response with the status code 201 Created, the created order, and the client secret
    res.status(StatusCodes.CREATED).json({ order, clientSecret:order.clientSecret })
};
const getAllOrders = async (req, res) => { // Function to get all orders
    const orders = await Order.find({}); // Find all orders in the database
    // Send a JSON response with the status code 200 OK, orders, and the count of orders
    res.status(StatusCodes.OK).json({orders, count: orders.length});
};
const getSingleOrder = async (req, res) => { // Function to get a single order by ID
    const { id: orderId } = req.params
    const order = await Order.findOne({ _id:orderId }) // Find the order in the database based on the provided order ID
    if (!order) { // Throw a NotFoundError if the order is not found
        throw new CustomError.NotFoundError(
            `No order with id : ${orderId}`
        );
    }
    checkPermissions(req.user,order.user) // Check permissions to access the order (user authorization)
    res.status(StatusCodes.OK).json({ order }); // Send a JSON response with the status code 200 OK and the order
};
const getCurrentUserOrders = async (req, res) => { // Function to get all orders of the current user
    // Find all orders in the database for the current user
    const orders = await Order.find({ user: req.user.userId });
    // Send a JSON response with the status code 200 OK, orders, and the count of orders
    res.status(StatusCodes.OK).json({ orders, count: orders.lenght });
};
const updateOrder = async (req, res) => { // Function to update an order by ID
    const { id: orderId } = req.params;
    const{ paymentIntentId } = req.body;
    const order = await Order.findOne({ _id:orderId }) // Find the order in the database based on the provided order ID
    if (!order) {  // Throw a NotFoundError if the order is not found
        throw new CustomError.NotFoundError(
            `No order with id : ${orderId}`
        );
    }
    checkPermissions(req.user,order.user) // Check permissions to update the order (user authorization)
    order.paymentIntentId = paymentIntentId // Update the order with the provided payment intent ID and status
    order.status = 'paid'
    await order.save(); // Save the updated order
    res.status(StatusCodes.OK).json({ order }); // Send a JSON response with the status code 200 OK and the updated order
};

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
}