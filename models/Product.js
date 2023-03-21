const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  description: {
    type: String,
    required: [true, "can't be blank"]
  },
  price: {
    type: String,
    required: [true, "can't be blank"]
  },
  brend: {
    type: String
  },
  category: {
    type: String,
    required: [true, "can't be blank"]
  },
  size: {
    type: Array
  },
  color: {
    type: Array
  },
  
  pictures: {
    type: Array,
    required: true
  }
}, {minimize: false});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
