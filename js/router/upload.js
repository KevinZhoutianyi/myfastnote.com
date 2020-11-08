var express = require('express');
var router = express.Router();
var fs = require('fs');
// 引入七牛模块  
var qiniu = require("qiniu");
//要上传的空间名
var bucket = 'onlydrinkwater'; 
var imageUrl = 'img.myfastnote.com'; // 域名名称
var accessKey = '3PoDKOO6j9uXap5iTeeb5TE6JsYN4_okFnX9nozI';
var secretKey = 'mXf52W_o7P8Q01HeT-lf1MehQeUxg0KtH-RnIxzo';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// var options = {
//   scope: bucket,
// };
// var putPolicy = new qiniu.rs.PutPolicy(options);
// var uploadToken = putPolicy.uploadToken(mac);

// var config = new qiniu.conf.Config();
// config.zone = qiniu.zone.Zone_z2;
// 图片上传
router.post('/', function(req, res, next){
  // 图片数据流
  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  let options = {
      scope: bucket,
      expires: 3600
  };
  let putPolicy =  new qiniu.rs.PutPolicy(options);
  let uploadToken= putPolicy.uploadToken(mac);
  if(uploadToken){
    res.send(uploadToken)
  }
  else{
    res.send('fail')
  }
  });

module.exports = router;