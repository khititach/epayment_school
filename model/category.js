const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const category = new Schema({
    food_image:{ type:String },
    food_name:{ type:String , unique:true  },
    food_id:{ type:Number , unique:true  },
    food_price:{ type:Number },
    food_calories:{ type:Number },
    food_quantity:{ type:String }
})

var category_model = mongoose.model('category',category);

module.exports = category_model;