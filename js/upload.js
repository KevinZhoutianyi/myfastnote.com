var express = require('express');
var router = express.Router();
var fs = require('fs');
// 引入七牛模块  
var qiniu = require("qiniu");
//要上传的空间名
var bucket = ''; 
var imageUrl = ''; // 域名名称
var accessKey = '';
var secretKey = '';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

var options = {
  scope: bucket,
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;
// 图片上传
router.post('/upload', function(req, res, next){
    // 图片数据流
    var imgData = req.body.imgData;
    // 构建图片名
    var fileName = Date.now() + '.png';
    // 构建图片路径
    var filePath = './public/tmp/' + fileName;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(filePath, dataBuffer, function(err) {
        if(err){
          res.end(JSON.stringify({status:'102',msg:'文件写入失败'})); 
        }else{

            var localFile = filePath;
            var formUploader = new qiniu.form_up.FormUploader(config);
            var putExtra = new qiniu.form_up.PutExtra();
            var key = fileName;

            // 文件上传
            formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
              respBody, respInfo) {
              if (respErr) {
                res.end(JSON.stringify({status:'-1',msg:'上传失败',error:respErr}));   
              }
              if (respInfo.statusCode == 200) {
                var imageSrc = imageUrl + respBody.key;
                res.end(JSON.stringify({status:'200',msg:'上传成功',imageUrl:imageSrc}));   
              } else {
                res.end(JSON.stringify({status:'-1',msg:'上传失败',error:JSON.stringify(respBody)}));  
              }
              // 上传之后删除本地文件
              fs.unlinkSync(filePath);
            });
        }
    });
})

module.exports = router;