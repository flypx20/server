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
		tyep:[cartListSchema]
	}
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
		}
},{ timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }});

fzfSchema.methods.getCart = ()=>{
	return new Promise((resolve,reject)=>{
		if (!this.cart) {
			resolve(null);
		}
		let getCartItem =this.cart.cartList.map((cartItem) => {
			return productModel.findById(cartItem.product,'_id productName productPrice status productNum imageList')
			.then((product)=>{
				cartItem.product = product;
				cartItem.totalPrice = cartItem.boughtCount*product.productPrice;
				return cartItem;
			});
		});

		Promise.all(getCartItem)
		.then((items)=>{
			let price = 0;
			items.forEach((item) => {
				price+=item.totalPrice;
			});
			this.cart.AllPrice = price;
			resolve(this.cart);
		});
	});
};
const UserModle = mongoose.model('user',fzfSchema);

module.exports = UserModle;