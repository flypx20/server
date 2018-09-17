const mongoose = require('mongoose');
const productModel = require('./product.js');

const cartListSchema = mongoose.Schema({
	checked:{
		type:Boolean,
		default:true
	},
	totalPrice:{
		type:Number
	},
	product:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'product'
	},
	boughtCount:{
		type:Number
	}

});

const cartSchema = mongoose.Schema({
	allChecked:{
		type:Boolean,
		default:true
	},
	AllPrice:{
		type:Number
	},
	allNum:{
		type:Number
	},
	cartList:{
		type:[cartListSchema]
	}
});

const shippingSchema = mongoose.Schema({
	name:String,
	province:String,
	city:String,
	address:String,
	phone:Number,
	zip:Number
});

const fzfSchema = mongoose.Schema({
		username:String,
		password:String,
		isAdmin:{
			type:Boolean,
			default:false
		},
		phone:Number,
		email:String,
		cart:{
			type:cartSchema
		},
		shipping:{
			type:[shippingSchema],
			default:[]
		}		
},{ timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }});

fzfSchema.methods.getCart =function(){
	return new Promise((resolve,reject)=>{
		if (!this.cart) {
			// console.log("null::",this.cart);
            resolve({
                cartList:[]
            });
		}
		let getCartItem =this.cart.cartList.map((cartItem) => {
			return productModel.findById(cartItem.product,'_id productName productPrice productNum imageList')
			.then((product)=>{
/*				product.productNum = 50;
				product.save();*/
				cartItem.product = product;
				cartItem.totalPrice = cartItem.boughtCount*product.productPrice;

				return cartItem;
			});
		});

		Promise.all(getCartItem)
		.then((items)=>{
			let price = 0;
			items.forEach((item) => {
				if (item.checked) {
					price+=item.totalPrice;					
				}

			});
			let notChecked = items.find((carts)=>{
				return carts.checked == false;
			});
			if (notChecked) {
				this.cart.allChecked = false;
			}else{
				this.cart.allChecked = true;				
			}
			this.cart.AllPrice = price;
			resolve(this.cart);
		});
	});
};

fzfSchema.methods.getOrderProductList = function(){
	return new Promise((resolve,reject)=>{
		if (!this.cart) {
			resolve({
				cartList:[]
			});
		}
		let checkedCartList = this.cart.cartList.filter((cartItem)=>{
			return cartItem.checked;
		});
		let getCartItems = checkedCartList.map(cartItem=>{
			// console.log('cartItem:::',cartItem)
			return productModel.findById(cartItem.product,'_id name price stock images')
			.then(product=>{
				// console.log('product:::',product);
				// cartItem.product = product;
				cartItem.productInfo = product;
				cartItem.totalPrice = cartItem.boughtCount*product.productPrice;
				// console.log('cartItem.product:::',cartItem.product);				
				return cartItem;
			});
		});
		Promise.all(getCartItems)
		.then(cartItems=>{
			// console.log('cartItems::::',cartItems)
			let totalCartPrice = 0;
			cartItems.forEach(item=>{
				// console.log("item:::",item)
				if (item.checked) {
					totalCartPrice += item.totalPrice;
				}
			});
			this.cart.AllPrice = totalCartPrice;

			//设置新的购物车列表
            this.cart.cartList = cartItems;
			resolve(this.cart);
			// console.log(this.cart)
		});
	});
};

const UserModle = mongoose.model('user',fzfSchema);

module.exports = UserModle;