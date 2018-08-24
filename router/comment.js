const Router = require('express').Router;
const CommentModel = require('../model/comment.js');

const router = Router();

//添加评论
router.post("/add",(req,res)=>{
	let body = req.body;
	console.log(body);
	new CommentModel({
		article:body.id,
		user:req.userInfo._id,
		content:body.content
	})
	.save()
	
	.then(doc=>{
		CommentModel.findPagination(req,{article:body.id})
		.then( data=>{
			res.json({
			code:0,
			data:data.docs,
			list:data.list,
			page:data.page,
			pages:data.pages
		});
		});
		
	});
})
.get('/delete/:id',(req,res)=>{
	let id = req.params.id;
	CommentModel.deleteOne({_id:id})
	.then((result)=>{
		if (result) {
			res.render('admin/success',{
				name:req.userInfo,
				url:"评论管理",
				message:'删除评论成功'
			});
		}else{
			res.render('admin/error',{
				name:req.userInfo,
				url:"评论管理",
				message:'删除失败,请检查网络'
			});
		}
	});
})
.get('/list',(req,res)=>{
	let id = req.query.category;
	let query = {};
	if (id) {
		query.article = id;
	}
	CommentModel.findPagination(req,query)
	.then(data=>{
		res.json({
			code:0,
			data:data.docs,
			list:data.list,
			page:data.page,
			pages:data.pages
		});
	});
});


module.exports = router;