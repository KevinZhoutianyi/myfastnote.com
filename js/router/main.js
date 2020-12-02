
/* init */
var express = require('express');
const path = require('path');
var mysql      = require('mysql');
var dbConfig = require('../../database/DBConfig');//数据库登陆信息
var querySql = require('../../database/querysql');//
var bodyParser = require('body-parser');
var pool = mysql.createPool( dbConfig.mysql );//创建数据库池
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var qiniu = require("qiniu");
const multiparty = require('multiparty');
const fs = require('fs');
const JwtUtil = require('../jwt');
const { strict } = require('assert');
var router = express.Router();
var app = express();
//要上传的空间名
var bucket = 'onlydrinkwater'; 
var imageUrl = 'img.myfastnote.com'; // 域名名称
var accessKey = '3PoDKOO6j9uXap5iTeeb5TE6JsYN4_okFnX9nozI';
var secretKey = 'mXf52W_o7P8Q01HeT-lf1MehQeUxg0KtH-RnIxzo';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;


let query = function( sql, values ) {
    // 返回一个 Promise
   //  myprint(sql)
    return new Promise(( resolve, reject ) => {
      pool.getConnection(function(err, connection) {
        if (err) {
          reject( err )
        } else {
          connection.query(sql, values, ( err, rows) => {
  
            if ( err ) {
              reject( err )
            } else {

               // myprint(rows)
              resolve( rows )
            }
            // 结束会话
            connection.release()
          })
        }
      })
    })
    .catch(error => console.log('caught', error))
  }
 
 
 
  app.use(bodyParser.urlencoded({ extended: false }))
  app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
  app.use('/public', express.static('public'));
  app.use(bodyParser.json());//数据JSON类型
  
 
function getid(token) {
   
   var jwt = new JwtUtil(token);
   var ret;
   try{
      ret = jwt.verifyToken().id;
   }catch(e){
       ret = "-1";
   }
   return(ret)
}

function myprint(output){
   console.log(new Date(Date.now()))
   console.log(output)
}


router.post('/getdata',urlencodedParser, async (req, res) => {
    
    userid = getid(req.body.token)
    if(userid=="-1"){
       res.status(400).send("token expired")
       return;
    }
    myprint("userid:"+userid+" is ask for data");
 
    const result = await query("select lastopenfileid,lastopendbid from user where userid = '"+userid+"'");
    
    if(result.length==1){
   
       // console.log(result) 这里即使result是null也会有数据返回 解决方法是 用户注册完 在note里生成一个startnote.md 作为用户的lastopenfileid
       const result2 = await query("select content from note where fileid = '"+result[0].lastopenfileid+"' and userid="+userid+" and dbid = "+result[0].lastopendbid);
       if(result2.length>=1){
          var x = {content:result2[0].content,id:result[0].lastopenfileid,userid:userid,lastopendbid:result[0].lastopendbid}
          res.send(x);
       }
    }
 });
 
 
 
 
 router.post('/getfile',urlencodedParser, function (req, res) {
    var fileid = req.body.fileid;
    var dbid = req.body.dbid;
    userid = getid(req.body.token)
    if(userid=="-1"){
       res.status(400).send("token expired")
       return;
    }

    myprint("userid:"+userid+" is ask for file");
 
    pool.getConnection(function(err,connection){
      //  myprint("getfile : connection to sql success")
       
          
             qu = "select content from note where userid = '"+userid+"' and fileid ='" +fileid +"' and dbid =" +dbid;
             connection.query(qu,function(err,result2){
                if(result2.length>=1){
                   var x = {content:result2[0].content,fileid:fileid,userid:userid}
                   res.send(x);
                }
                else{
                  //  myprint("getfile : connection to mysql fail")
                }    
                })
             connection.release();
            //  myprint("getfile : mysql release")
          
             
         
       })
 
 })
 
 
 
 
 
 router.post('/getcatalogue',urlencodedParser,  async (req, res) => {
   userid = getid(req.body.token)
   dbid = req.body.dbid
   if(userid=="-1"){
      res.status(400).send("token expired")
      return;
   }
   myprint("userid:"+userid+" is ask for catalogue");
 
 
   const result2 = await query("select filename,isnote,level,fileid,fatherid from catalogue where userid = "+userid+" and dbid =" + dbid);
   if(result2.length>=1){
      res.send(result2)
   }  
   else{
      myprint(result2)
   }
    
 })
 
 router.post('/savedata',urlencodedParser, function (req, res) {
    var content = req.body.content;
    var id = req.body.id;
    var dbid = req.body.dbid;
    userid = getid(req.body.token)
    if(userid=="-1"){
       res.status(400).send("token expired")
       return;
    }
    myprint("userid:"+userid+" is saving file");
 
    pool.getConnection(function(err,connection){
      //  myprint("savedata : connection to sql success")
       var qu = "update note set content ='" + content + "'where fileid ="+id +" and userid="+userid+" and dbid = "+dbid+";";
       connection.query(qu,function(err,result){
          if(err){
             myprint('[UPDATE ERROR] - ',err.message);
             return;
          }  
          var qu2 = "update user set lastopenfileid ='" + id + "'where userid ="+userid+" and lastopendbid = "+ dbid +";";
          connection.query(qu2,function(err2,result2){
             if(err2){
                myprint('[UPDATE ERROR] - ',err.message);
                return;
             } 
             connection.release();
            //  myprint("savedata : mysql release")
             res.send("success");
             })
         //  myprint("savedata : mysql release")
          })
       })
      
 
 })
 
 
 
 // deletefile
 router.post('/deletefile',urlencodedParser, function (req, res) {
   var fileid = req.body.fileid;
   var dbid = req.body.dbid;
    userid = getid(req.body.token)
    if(userid=="-1"){
       res.status(400).send("token expired")
       return;
    }
    myprint("userid:"+userid+" is deleting folder id:" + fileid);
 
    pool.getConnection(function(err,connection){
      //  myprint("deletefolder : connection to sql success")
       var qu = "delete from catalogue where fileid = " + fileid + " and userid="+userid+" and dbid = "+dbid+";";
       connection.query(qu,function(err,result){
          if(err){
             myprint('[UPDATE ERROR] - ',err.message);
             return;
          } 
          // myprint(result[0])
          var qu2 = "delete from catalogue where fatherid = " +fileid+ " and userid="+userid+" and dbid = "+dbid+";";
          connection.query(qu2,function(err2,result2){
             if(err2){
                myprint('[UPDATE ERROR] - ',err2.message);
                return;
             } 
             
          });
          var qu3 = "delete from note where fatherid = " +fileid+ " and userid="+userid+" and dbid = "+dbid+";";
          connection.query(qu3,function(err3,result3){
             if(err3){
                myprint('[UPDATE ERROR] - ',err3.message);
                return;
             } 
          });
          });
          var qu4 = "delete from note where fileid = " +fileid+ " and userid="+userid+" and dbid = "+dbid+";";
          connection.query(qu4,function(err4,result4){
             if(err4){
                myprint('[UPDATE ERROR] - ',err4.message);
                return;
             } 
             res.send("success");
          });
          connection.release();
     });
       
 
 });
 
 
 
 
 
 
 
 
 
 
 
 
 
 // newfolder
 router.post('/newfolder',urlencodedParser, function (req, res) {
   userid = getid(req.body.token)
   let dbid = req.body.dbid;
   if(userid=="-1"){
      res.status(400).send("token expired")
      return;
   }
   myprint("userid:"+userid+" is newing folder");

    pool.getConnection(function(err,connection){
      //  myprint("newfolder : connection to sql success")
       var qu = "select max(fileid) from catalogue where userid="+userid+" and dbid = "+dbid;
       connection.query(qu,function(err,result){
          if(err){
             myprint('[UPDATE ERROR] - ',err.message);
             return;
          } 
          // myprint(result[0])
          var qu2 = "insert into catalogue values("+userid+","+(result[0]["max(fileid)"]+1)+",'newfolder',0,0,null,"+dbid+");";
          connection.query(qu2,function(err2,result2){
             if(err2){
                myprint('[UPDATE ERROR] - ',err2.message);
                return;
             } 
             
             res.json(((result[0]["max(fileid)"]+1)));
             });
          connection.release();
          });
       });
 
 });
 
 
 
 
 
 
 // newfile
 router.post('/newfile',urlencodedParser, function (req, res) {
   userid = getid(req.body.token)
   if(userid=="-1"){
      res.status(400).send("token expired")
      return;
   }
   myprint("userid:"+userid+" is newing file");

    var folderid = req.body.folderid;
    var dbid = req.body.dbid;
    
 
    pool.getConnection(function(err,connection){
      //  myprint("newfolder : connection to sql success");
       var qu = "select max(fileid) from catalogue where userid="+userid+" and dbid = "+ dbid;
       connection.query(qu,function(err,result){
          if(err){
             myprint('[UPDATE ERROR] - ',err.message);
             return;
          } 
          // myprint(result[0])
          var qu2 = "insert into catalogue values("+userid+","+(result[0]["max(fileid)"]+1)+",'newfile',1,1,"+folderid+","+dbid+");";
          connection.query(qu2,function(err2,result2){
             if(err2){
                myprint('[UPDATE ERROR] - ',err2.message);
                return;
             } 
             });
          var qu3 = "insert into note values("+(result[0]["max(fileid)"]+1)+",'# ',"+userid+","+folderid+","+dbid+");";
          connection.query(qu3,function(err3,result3){
             if(err3){
                myprint('[UPDATE ERROR] - ',err3.message);
                return;
             } 
             
             
             });
          connection.release();
 
          res.json(((result[0]["max(fileid)"]+1)));
          });
       });
 
 });
 
 
 
 
 
 
 
 router.post('/savecatalogue',urlencodedParser, function (req, res) {//rename
    var filename = req.body.filename;
    var fileid = req.body.fileid;
    var dbid = req.body.dbid;
    userid = getid(req.body.token)
   if(userid=="-1"){
      res.status(400).send("token expired")
      return;
   }
   myprint("userid:"+userid+" is saving catalogue for file " + fileid);
 
    pool.getConnection(function(err,connection){
      //  myprint("savecatalogue : connection to sql success")
       var qu = "update catalogue set filename ='" + filename + "'where fileid ="+fileid+" and userid ="+userid+" and dbid = " + dbid;
       connection.query(qu,function(err,result){
          if(err){
             myprint('[UPDATE ERROR] - ',err.message);
             return;
          } 
         //  myprint("savecatalogue : mysql release")
          res.send("success");
 
          connection.release();
          })
       })
 
 })




  
 router.post('/search',urlencodedParser, function (req, res) {//rename
   var key = req.body.key;
   var dbid = req.body.dbid;
   userid = getid(req.body.token)
  if(userid=="-1"){
     res.status(400).send("token expired")
     return;
  }
  myprint("userid:"+userid+" is searching key");

   pool.getConnection(function(err,connection){
     //  myprint("savecatalogue : connection to sql success")
      var qu = "select fileid from note where match(content) against('"+key+"' in boolean mode) and userid = "+userid+" and dbid = "+dbid+";";
      connection.query(qu,function(err,result){
         if(err){
            myprint('[UPDATE ERROR] - ',err.message);
            connection.release();
            res.status(400)
            return;
         } 
        //  myprint("savecatalogue : mysql release")
         res.status(200).send(result);
         connection.release();
         })
      })

})

 
 
 
 
 
 
 
 
 
 
 
 router.post("/upload",urlencodedParser,  async (req, res) => {
   let form = new multiparty.Form();
   
   form.parse(req, async(err,fields,file)=>{
      userid = getid(fields["token"][0])
      dbid = fields["dbid"]
      if(userid=="-1"){
         res.status(400).send("token expired")
         myprint("token expired!!!!!")
         return;
      }
      myprint("userid:"+userid+" is uploading file(md)");
      const result = await query("select max(fileid) from catalogue where userid="+userid+" and dbid = "+dbid)
      var maxindex = (result[0]["max(fileid)"])
      myprint("maxindex in catalogue ：  "+maxindex)
      if(fields["folderid"]==-1){//不是目录，先创建一个目录
         result2 = await query( "INSERT INTO catalogue VALUES("+userid +","+(maxindex+1)+",'newfolder',0,0,null,"+dbid+")")
         for (let index = 2; index < (parseInt(fields["size"])+2); index++) {//每个文件存入该目录  
            orifilename = file["file"][index-2]["originalFilename"];
            filename = orifilename.substring(0,orifilename.indexOf("."))
            endname = orifilename.substring(orifilename.indexOf("."),orifilename.length)
            if(endname != ".md") 
               return;
            result2 = await query( "INSERT INTO catalogue VALUES("+userid +","+(maxindex+index)+",'"+filename+"',1,1,"+(maxindex+1)+","+dbid+")")
            var data = fs.readFileSync(file["file"][index-2]["path"], 'utf-8');
            data = data.replace(/\\/g,"\\\\");
                data = data.replace(/\"/g,"\'\'");
                data =data.replace(/\'/g,"\"");
            result3 = await query( "INSERT INTO note VALUES("+(maxindex+index)+",'"+data+"',"+userid+","+(maxindex+1)+","+dbid+")")
            
         }
         res.send("success")
      }else{
         for (let index = 1; index < (parseInt(fields["size"])+1); index++) {//每个文件存入该目录  
            orifilename = file["file"][index-1]["originalFilename"];
            filename = orifilename.substring(0,orifilename.indexOf("."))
            endname = orifilename.substring(orifilename.indexOf("."),orifilename.length)
            if(endname != ".md") 
               return;
            fatherid = fields["folderid"]
            result2 = await query( "INSERT INTO catalogue VALUES("+userid +","+(maxindex+index)+",'"+filename+"',1,1,"+(fatherid)+","+dbid+")")
            var data = fs.readFileSync(file["file"][index-1]["path"], 'utf-8');
            data = data.replace(/\\/g,"\\\\");
                data = data.replace(/\"/g,"\'\'");
                data =data.replace(/\'/g,"\"");
            result3 = await query( "INSERT INTO note VALUES("+(maxindex+index)+",'"+data+"',"+userid+","+(fatherid)+","+dbid+")")
            
         }
         res.send("success")
      }
  });
 });

 router.post("/uploadimg",urlencodedParser,  async (req, res) => {
   
   let form = new multiparty.Form();
   
   form.parse(req, async(err,fields,file)=>{
      userid = getid(fields["token"][0])
      dbid = fields["dbid"]

      myprint("userid:"+userid+" is uploading img");
      if(userid=="-1"){
         res.status(400).send("token expired")
         return;
      }
      //1.判断大小够不够 不够返回400 没空间了
      //2.够的话上传到qiniu后更新usersize和hash
      const result = await query("select maxsize from user where userid="+userid)
      const result1 = await query("select size from user where userid="+userid )
      leftsize = parseInt(result[0].maxsize) - parseInt(result1[0].size);
      myprint("userid:"+userid+" size left: "+leftsize)
      filesize = parseInt(file["file"][0]["size"]);
      filename = (file["file"][0]["originalFilename"])
      fileid = parseInt(fields["fileid"][0]);
      if(leftsize<filesize){
         res.status(400).send("no enough space :(")
         return;
      }
      else{
         let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
         let options = {
               scope: bucket,
               expires: 3600
         };
         let putPolicy =  new qiniu.rs.PutPolicy(options);
         let uploadToken= putPolicy.uploadToken(mac);
         if(uploadToken){
         }
         else{
            myprint('get qiniuyun token fail')
            res.status(400).send('get qiniuyun token fail')
            return
         }
         var localFile = (file["file"][0]["path"])
         var formUploader = new qiniu.form_up.FormUploader(config);
         var putExtra = new qiniu.form_up.PutExtra();
         // 文件上传
         formUploader.putFile(uploadToken, null, localFile, putExtra, function(respErr,
         respBody, respInfo) {
         if (respErr) {
            throw respErr;
         }
         if (respInfo.statusCode == 200) {
            myprint("userid:"+userid+" finish upload img ")
            pool.getConnection(function(err,connection){
               qu1 = "update user set size = "+(parseInt(result1[0].size)+parseInt(filesize))+" where userid = "+userid;
               connection.query(qu1,function(err,result22){})
               connection.release();
            })
            pool.getConnection(function(err,connection){
               qu2 = "insert into img values("+fileid+","+userid+",'"+respBody.hash+"',"+filesize+","+dbid+") ";
               connection.query(qu2,function(err,result33){
               })
               connection.release();
            })
            // const result3 = await query()
            res.status(200).send(respBody)
         } else {
            myprint(respBody.error);
            res.status(400).send(respBody.error)
            return
         }
         });
      }
   })

 
})
 
 
 
 
router.get('/',urlencodedParser, function (req, res) {
   res.status(200).sendFile( path.resolve(__dirname + "/../../public/html/" + "notepage.html") );
});
 
 

 module.exports = router