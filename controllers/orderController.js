const createOrder = async (req, res) => {
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