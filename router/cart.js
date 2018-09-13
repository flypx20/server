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

router.post('/',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product = body.productId;
			});
			if (cartItem) {
				cartItem.boughtCount = cartItem.boughtCount+parseInt(body.count);
			}else{
				user.cart.cartList.push({
					product:body.productId,
					boughtCount:body.count
				});				
			}

		}else{
			user.cart = {
				cartList:[{
					product:body.productId,
					boughtCount:body.count
				}]
			};
		}
		user.save()
		.then((data)=>{
			if (data) {
				res.json({
					code:0,
					data:data
				});
			}
		});
	});
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
