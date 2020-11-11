
/* init */
var express = require('express');
var mysql      = require('mysql');
var dbConfig = require('./database/DBConfig');//数据库登陆信息
var querySql = require('./database/querysql');//
var bodyParser = require('body-parser');
const { send } = require('process');
var pool = mysql.createPool( dbConfig.mysql );//创建数据库池
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();
var qiniu = require("qiniu");
const multiparty = require('multiparty');
const fs = require('fs');
const JwtUtil = require('./js/jwt');


app.use(bodyParser.urlencoded({ extended: false }))
app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
app.use('/public', express.static('public'));
app.use(bodyParser.json());//数据JSON类型





app.use('/main', require('./js/router/main'));
app.use('/getqiniuyuntoken', require('./js/router/upload'));




let query = function( sql, values ) {
   // 返回一个 Promise
   // console.log(sql)
   return new Promise(( resolve, reject ) => {
     pool.getConnection(function(err, connection) {
       if (err) {
         reject( err )
       } else {
         connection.query(sql, values, ( err, rows) => {
 
           if ( err ) {
             reject( err )
           } else {
             resolve( rows )
           }
           // 结束会话
           connection.release()
         })
       }
     })
   })
 }

//read database
app.get('/query' , async (req, res) => {
   const rows = await query(querySql.read);
   res.end(JSON.stringify(rows));
})


app.get('/', function (req, res) {
   console.log( req.ip + "visit your server  \n");
   res.sendFile( __dirname + "/public/html/" + "index.html" );
})


app.post('/login',urlencodedParser, async (req, res) => {
  console.log(req.body.username+","+req.body.password+" try to login\n")
  const result = await query("select userid from user where username = '"+req.body.username+"' and password = '"+req.body.password+"'");
  if(result.length == 1){
    var content = {id:result[0].userid}
    let jwt = new JwtUtil(content);
    let token = jwt.generateToken();
    console.log("userid "+result[0].userid+" login success"+",his token is "+token)
    res.status(200).send(token)

  }else{
    res.status(400).send("fail")
  }
     
})



var server = app.listen(80, function () {
   console.log("server start!! lets get it \n\n")
})
