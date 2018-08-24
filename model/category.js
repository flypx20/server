const mongoose = require('mongoose');

const fzfSchema = mongoose.Schema({
		name:String,
		order:{
			type:Number,
			default:0
		}
});

const CategoryModle = mongoose.model('category',fzfSchema);

module.exports = CategoryModle;