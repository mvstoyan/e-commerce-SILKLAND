const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { chechPermissions } = require('../utils');


const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;

    if (!cartItems || cartItems.lenght < 1) {
        throw new CustomError.BadRequestError('No cart items provided');
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError(
            'Please provide tax and shipping fee'
        );
    }
    res.send('create order')
};
const getAllOrders = async (req, res) => {
    res.send('get all orders')
};
const getSingleOrder = async (req, res) => {
    res.send('get single order')
};
const getCurrentUserOrders = async (req, res) => {
    res.send('get current user orders')
};
const updateOrder = async (req, res) => {
    res.send('update order')
};

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
}