const express = require('express');
var router = express.Router();
const userModel = require('../model/model.js');
const hmac = require('../hmac/hmac.js');
const product = require('../model/product.js');

router.use((req,res,next)=>{
	if (req.userInfo._id) {
		next();
	}else{
		res.json({
			code:10
		});
	}
});

router.get('/',(req,res)=>{
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		// console.log("getCart:::",user);
		user.getCart()
		.then(cart=>{
			res.json({
				code:0,
				data:cart
			});
		});

	});
});


module.exports = router;
