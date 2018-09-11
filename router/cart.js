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
			user.cart.cartList.push({
				product:body.productId,
				boughtCount:body.count
			});
		}else{
			user.cart = {
				cartList:[{
					product:body.productId,
					boughtCount:body.count
				}]
			};
		}
		user.save()
		.then((err,data)=>{
			if (!err) {
				res.json({
					code:0,
					data:data
				});
			}else{
				res.json({
					code:1,
					message:'添加购车失败'
				});
			}
		});
	});
});


module.exports = router;
