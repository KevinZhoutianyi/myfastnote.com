
/* init */
var express = require('express');
var mysql      = require('mysql');
var dbConfig = require('./database/DBConfig');//数据库登陆信息
var querySql = require('./database/querysql');//
var bodyParser = require('body-parser');
var pool = mysql.createPool( dbConfig.mysql );//创建数据库池
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();




app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
app.use('/public', express.static('public'));


//read database
app.get('/query' , function(req,res,next){
   pool.getConnection(function(err,connection){
   //var params = req.query || req.params;        //前端传的参数（暂时写这里，在这个例子中没用）
   connection.query(querySql.read,function(err,result){
      if(err){
         console.log('[SELECT ERROR] - ',err.message);
         return;
       }
      console.log(result);
      res.end(JSON.stringify(result));
      })
   })
})




app.get('/', function (req, res) {
   console.log( req.ip + "visit your server");
   res.sendFile( __dirname + "/" + "index.html" );
})
 

app.post('/process_get',urlencodedParser, function (req, res) {
   console.log("in pro get")
   // 输出 JSON 格式
   var response = {
       "username":req.body.username,
       "password":req.body.password
   };
   pool.getConnection(function(err,connection){
      console.log("connection to sql success")
      //var params = req.query || req.params;        //前端传的参数（暂时写这里，在这个例子中没用）
      var params = [];
      params[0] = response["username"];
      params[1] = response["password"];
      var qu = "select username from user where username = '"+params[0]+"' and password = '"+params[1]+"'";
      connection.query(qu,function(err,result){
         connection.release();
         if(result.length==1){
            console.log("login success")
            res.sendFile( __dirname + "/" + "notepage.html" );
         }
         else{
            console.log("login fail")
            res.sendFile( __dirname + "/" + "index.html" );
         }    
         })
      })
})
 















var server = app.listen(80, function () {
   console.log("server start!! lets get it")
})
