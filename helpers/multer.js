const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null, path.join(__dirname,'../Public/img/uploaded-images'));  
    },
    filename:function(req,file,callback){ 
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
  })
  const upload = multer({storage:storage});


module.exports = {upload} 