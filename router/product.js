const Router = require('express').Router;
const path = require('path');


const router = Router();

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.use((req,res,next)=>{
    if(req.userInfo.isAdmin){
        next();
    }else{
        res.json({
            code:10
        });
    }
});

router.post('/uploadImage/',upload.single('image'),(req,res)=>{
    let path = "http://127.0.0.1:3000/uploads/"+req.file.filename;
    res.send(path);
});
router.post('/uploadetailImage/',upload.single('photo'),(req,res)=>{
    let path = "http://127.0.0.1:3000/uploads/"+req.file.filename;
    res.json({
  "success": true,
  "msg": "上传成功",
  "file_path":path
});
});
module.exports = router;