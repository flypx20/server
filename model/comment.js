const mongoose = require('mongoose');
const pagination = require('../model/pagination.js');
const fzfSchema = mongoose.Schema({
	article:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'article'
	},
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'blog'
	},
	content:{
		type:String,
	}, 
	createdAt:{
		type:Date,
		default:Date.now
	}    
});
fzfSchema.statics.findPagination = function(req,query={}){

	return new Promise((resolve,reject)=>{
		pagination({
	        page:req.query.page,
	        model:this,
	        query:query,
	        populate:[{path:'user',select:'username'}]
	    })
        .then((data)=>{
        	resolve(data);
        });
	});
	
};

const commentModle = mongoose.model('comment',fzfSchema);


module.exports = commentModle;