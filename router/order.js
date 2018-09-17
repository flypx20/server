const express = require('express');
var router = express.Router();
const userModel = require('../model/model.js');
const hmac = require('../hmac/hmac.js');
const orderModel = require('../model/order.js');
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

// 获取生成订单的商品列表
router.get('/orderProductList',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		user
		.getOrderProductList()
		.then(cart=>{
			res.json({
				code:0,
				data:cart
			});
		});
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'添加订单商品失败'
		});
	});
});
// 获取生成订单的商品列表
router.get('/list',(req,res)=>{
	let page = req.query.page;
	// console.log("req.userInfo:::",req.userInfo)
	let query = {
		user:req.userInfo._id
	};
	orderModel
	.getPaginationOrders(page,query)
	.then((result)=>{
		res.json({ 
			code:0,
			data:{
				current:result.current,
				total:result.total,
				list:result.list,
				pageSize:result.pageSize
			}
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取订单商品失败'
		});
	});
});

// 获取单个订单的商品列表
router.get('/',(req,res)=>{
	orderModel
	.findOne({orderNo:req.query.orderNo,user:req.userInfo._id})
	.then((order)=>{
		res.json({ 
			code:0,
			data:order
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取订单商品失败'
		});
	});
});

// 取消订单
router.put('/cancel',(req,res)=>{
	// console.log("req.userInfo._id:::",req.userInfo._id)
	// console.log("req.body.orderNo:::",req.body.orderNo)
	orderModel
	.findOneAndUpdate(
		{orderNo:req.body.orderNo,user:req.userInfo._id},
		{status:"20",statusDesc:"订单已取消"},
		{new:true}
	)
	.then((order)=>{
		res.json({ 
			code:0,
			data:order
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'更新订单数据失败'
		});
	});
});

// 创建订单
router.post('/',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		let order = {};
		user
		.getOrderProductList()
		.then(result=>{
			order.payment = user.cart.AllPrice;
			// 构建订单的商品
			let productList = [];
			result.cartList.forEach(item=>{
				// console.log("item::::",item)
				productList.push({
					productId:item.productInfo._id,
					count:item.count,
					totalPrice:item.totalPrice,
					price:item.productInfo.price,
					images:item.productInfo.images,
					name:item.productInfo.name
				});
				// console.log("productList:::",productList)
			});
			order.productList = productList;

			// 构建订单的地址信息
			let shipping = user.shipping.id(req.body.shippingId);
			order.shipping = {
				shippingId:shipping._id,
				name:shipping.name,
				province: shipping.province,
				city: shipping.city,
				address: shipping.address,
				phone: shipping.phone,
				zip: shipping.zip
			};

			// 构建订单号
			order.orderNo = Date.now().toString() + parseInt(Math.random() * 10000);

			// 赋值用户ID
			order.user = user._id;

			new orderModel(order)
			.save()
			.then(newOrder=>{
				userModel
				.findById(req.userInfo._id)
				.then(userUser=>{
					let newCartList = userUser.cart.cartList.filter((item)=>{
						return item.checked == false;
					});
					userUser.cart.cartList = newCartList;
					userUser
					.save()
					.then(newUser=>{
						res.json({
							code:0,
							data:newOrder
						});
					});
				});
			});
		});
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取订单商品失败'
		});
	});
});

router.put('/',(req,res)=>{
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
})
.get('/search',(req,res)=>{

    let keyword = req.query.keyword;
      orderModel.getPaginationOrders(req,{orderNo:new RegExp(keyword,'ig')})
      .then((result)=>{
        res.json({
            code:0,
            data:{
              total:result.count,
              current:result.page,
              list:result.docs,
              pageSize:result.pageSize,
              keyword:keyword
            },
            message:'查询成功'
        });
      });
  });


router.get('/detail',(req,res)=>{
	orderModel
	.findOne({orderNo:req.query.id})
	.then((order)=>{
		res.json({ 
			code:0,
			data:order
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取订单商品失败'
		});
	});
});

module.exports = router;
