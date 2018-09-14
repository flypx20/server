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
				return item.product == body.productId;
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
			user.getCart()
			.then(cart=>{
				res.json({
					code:0
				});
			});
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

router.post('/selectOne',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			user.cart.cartList.forEach((item) => {
				if (item.product == body.productId ) {
					item.checked = true;
				}
			});
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

router.post('/unselectOne',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			user.cart.cartList.forEach((item) => {
				if (item.product == body.productId ) {
					item.checked = false;
				}
			});
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

router.get('/selectAll',(req,res)=>{
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			user.cart.cartList.forEach((item) => {
				item.checked = true;
			});
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

router.get('/unselectAll',(req,res)=>{
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			user.cart.cartList.forEach((item) => {
				item.checked = false;
			});
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

router.get('/deleteOne',(req,res)=>{
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let newcartItem = user.cart.cartList.filter((item)=> {

				return item.product != req.query.productId;
			});
			user.cart.cartList = newcartItem;
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

router.get('/deleteSelect',(req,res)=>{
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let cartItem = user.cart.cartList.filter(function(item) {
				return !item.checked;
			});
			user.cart.cartList = cartItem;
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

router.post('/updateCount',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			});

			cartItem.boughtCount = body.boughtCount;
		}else{
			res.json({
				code:1,
				message:'请添加购物车'
			});
		}
		user.save()
		.then((data)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				});
			});
		});
	});
});

module.exports = router;
