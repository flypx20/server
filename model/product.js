const mongoose = require('mongoose');
const pagination = require('../model/pagination.js');
const fzfSchema = mongoose.Schema({
	category:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'category'
	},
	detail:{
		type:String
	},
	imageList:{
		type:String
	},
	productIntro:{
		type:String
	},
	productName:{
		type:String
	},
	productNum:{
		type:Number
	},
	productPrice:{
		type:Number
	},
	status:{
		type:Number,
		default:0
	},
	order:{
		type:Number,
		default:0
	}						
},{timestamps:true});
fzfSchema.statics.findPagination = function(req,query={},projection='productName _id status productPrice order',sort={_id:-1}){

	return new Promise((resolve,reject)=>{
		pagination({
	        page:req.query.page,
	        model:this,
	        query:query,
	        projection:projection, //投影，
        	sort:sort,
        	populate:[{path:'category',select:'_id'}] //排序
	    })
        .then((data)=>{
        	resolve(data);
        });
	});
	
};
const productModle = mongoose.model('product',fzfSchema);


module.exports = productModle;