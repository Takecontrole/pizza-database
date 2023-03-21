const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');


//creating an order

router.post('/', async(req, res)=> {
  const io = req.app.get('socketio');
  const {userId, cart, country, address, productId} = req.body;
  try {
    const user = await User.findById(userId);
    const order = await Order.create({owner: user._id, products: cart, country, address, productId});
    order.count = cart.count;
    order.total = cart.total;
    await order.save();
    user.cart =  {total: 0, count: 0};
    user.orders.push(order);
    const notification = {status: 'unread', message: `Новый заказ от ${user.name}`, time: new Date()};
    io.sockets.emit('new-order', notification);
    user.markModified('orders');
    await user.save();
    res.status(200).json(user)

  } catch (e) {
    res.status(400).json(e.message)
  }
})


// getting all orders;
router.get('/', async(req, res)=> {
  try {
    const orders = await Order.find().populate('owner', ['email', 'name']);
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json(e.message)
  }
})

router.get("/income", async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

//shipping order

router.patch('/:id/mark-shipped', async(req, res)=> {
  const io = req.app.get('socketio');
  const {ownerId} = req.body;
  const {id} = req.params;
  try {
    const user = await User.findById(ownerId);
    await Order.findByIdAndUpdate(id, {status: 'success'});
    const orders = await Order.find().populate('owner', ['email', 'name']);
    const notification = {status: 'unread', message: `Заказ ${id} доставлен успешно`, time: new Date()};
    io.sockets.emit("notification", notification, ownerId);
    user.notifications.push(notification);
    await user.save();
    res.status(200).json(orders)
  } catch (e) {
    res.status(400).json(e.message);
  }
})
module.exports = router;
