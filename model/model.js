const mongoose = require('mongoose');

const fzfSchema = mongoose.Schema({
		username:String,
		password:String,
		isAdmin:{
			type:Boolean,
			default:false
		}
});

const UserModle = mongoose.model('user',fzfSchema);

module.exports = UserModle;