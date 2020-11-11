
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
let router = express.Router();
var app = express();



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
 
 
 
  app.use(bodyParser.urlencoded({ extended: false }))
  app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
  app.use('/public', express.static('public'));
  app.use(bodyParser.json());//数据JSON类型
  
 



router.post('/getdata',urlencodedParser, async (req, res) => {
    var username = req.body.username;
    console.log("username:"+username+" is ask for data");
 
    const result = await query("select lastopenfileid from user where username = '"+username+"'");
    
    if(result.length==1){
 
       const result3 = await query("select userid from user where username = '"+username+"'");
    
 
       
       // console.log(result) 这里即使result是null也会有数据返回 解决方法是 用户注册完 在note里生成一个startnote.md 作为用户的lastopenfileid
       const result2 = await query("select content from note where fileid = '"+result[0].lastopenfileid+"'");
       if(result2.length>=1){
          var x = {content:result2[0].content,id:result[0].lastopenfileid,userid:result3[0].userid}
          res.send(x);
       }
    }
 });
 
 
 
 
 router.post('/getfile',urlencodedParser, function (req, res) {
    var username = req.body.username;
    var fileid = req.body.fileid;
    console.log("username:"+username+" is ask for file" + fileid);
 
    pool.getConnection(function(err,connection){
       console.log("getfile : connection to sql success")
       var qu = "select userid from user where username = '"+username+"'";
       connection.query(qu,function(err,result){
          if(result.length==1){
             qu = "select content from note where userid = '"+result[0].userid+"' and fileid ='" +fileid +"'";
             connection.query(qu,function(err,result2){
                if(result.length>=1){
                   var x = {content:result2[0].content,fileid:fileid,userid:result[0].userid}
                   res.send(x);
                }
                else{
                   console.log("getfile : connection to mysql fail")
                }    
                })
             connection.release();
             console.log("getfile : mysql release")
          }
          else{
             console.log("getfile : connection to mysql fail")
             connection.release();
          }    
          })
       })
 
 })
 
 
 
 
 
 router.post('/getcatalogue',urlencodedParser,  async (req, res) => {
    var username = req.body.username;
    console.log("username:"+username+" is ask for content");
 
 
    const result = await query("select userid from user where username = '"+username+"'");
 
    if(result.length>=1){
       const result2 = await query("select filename,isnote,level,fileid,fatherid from catalogue where userid = "+result[0].userid);
       if(result2.length>=1){
          res.send(result2)
       }  
       else{
          console.log(result2)
       }
    }   
    else{
       console.log(result)
    }
 })
 
 router.post('/savedata',urlencodedParser, function (req, res) {
    var content = req.body.content;
    var id = req.body.id;
    var userid = req.body.userid;
    console.log("is saving data for file " + id);
 
    pool.getConnection(function(err,connection){
       console.log("savedata : connection to sql success")
       var qu = "update note set content ='" + content + "'where fileid ="+id +" and userid="+userid+";";
       connection.query(qu,function(err,result){
          if(err){
             console.log('[UPDATE ERROR] - ',err.message);
             return;
          }  
          var qu2 = "update user set lastopenfileid ='" + id + "'where userid ="+userid+";";
          connection.query(qu2,function(err2,result2){
             if(err2){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
             } 
             connection.release();
             console.log("savedata : mysql release")
             res.send("success");
             })
          console.log("savedata : mysql release")
          })
       })
      
 
 })
 
 
 
 // deletefile
 router.post('/deletefile',urlencodedParser, function (req, res) {
    var fileid = req.body.fileid;
    var userid = req.body.userid;
    console.log("deletefolder id:" + fileid);
 
    pool.getConnection(function(err,connection){
       console.log("deletefolder : connection to sql success")
       var qu = "delete from catalogue where fileid = " + fileid + " and userid="+userid+";";
       connection.query(qu,function(err,result){
          if(err){
             console.log('[UPDATE ERROR] - ',err.message);
             return;
          } 
          // console.log(result[0])
          var qu2 = "delete from catalogue where fatherid = " +fileid+ " and userid="+userid+";";
          connection.query(qu2,function(err2,result2){
             if(err2){
                console.log('[UPDATE ERROR] - ',err2.message);
                return;
             } 
             
             console.log("delete a file in catalogue")
          })
          var qu3 = "delete from note where fatherid = " +fileid+ " and userid="+userid+";";
          connection.query(qu3,function(err3,result3){
             if(err3){
                console.log('[UPDATE ERROR] - ',err3.message);
                return;
             } 
          })
          })
          var qu4 = "delete from note where fileid = " +fileid+ " and userid="+userid+";";
          connection.query(qu4,function(err4,result4){
             if(err4){
                console.log('[UPDATE ERROR] - ',err4.message);
                return;
             } 
             res.send("success");
          })
          connection.release();
     })
       
 
 })
 
 
 
 
 
 
 
 
 
 
 
 
 
 // newfolder
 router.post('/newfolder',urlencodedParser, function (req, res) {
    var userid = req.body.userid;
    console.log("new a folder for  user:" + userid);
 
    pool.getConnection(function(err,connection){
       console.log("newfolder : connection to sql success")
       var qu = "select max(fileid) from catalogue where userid="+userid;
       connection.query(qu,function(err,result){
          if(err){
             console.log('[UPDATE ERROR] - ',err.message);
             return;
          } 
          // console.log(result[0])
          var qu2 = "insert into catalogue values("+userid+","+(result[0]["max(fileid)"]+1)+",'newfolder',0,0,null);";
          connection.query(qu2,function(err2,result2){
             if(err2){
                console.log('[UPDATE ERROR] - ',err2.message);
                return;
             } 
             
             res.json(((result[0]["max(fileid)"]+1)));
             })
          connection.release();
          })
       })
 
 })
 
 
 
 
 
 
 // newfile
 router.post('/newfile',urlencodedParser, function (req, res) {
    var userid = req.body.userid;
    var folderid = req.body.folderid;
    console.log("new a  file for  user:" + userid);
 
    pool.getConnection(function(err,connection){
       console.log("newfolder : connection to sql success")
       var qu = "select max(fileid) from catalogue where userid="+userid;
       connection.query(qu,function(err,result){
          if(err){
             console.log('[UPDATE ERROR] - ',err.message);
             return;
          } 
          // console.log(result[0])
          var qu2 = "insert into catalogue values("+userid+","+(result[0]["max(fileid)"]+1)+",'newfile',1,1,"+folderid+");";
          connection.query(qu2,function(err2,result2){
             if(err2){
                console.log('[UPDATE ERROR] - ',err2.message);
                return;
             } 
             })
          var qu3 = "insert into note values("+(result[0]["max(fileid)"]+1)+",'# newfile',"+userid+","+folderid +");";
          connection.query(qu3,function(err3,result3){
             if(err3){
                console.log('[UPDATE ERROR] - ',err3.message);
                return;
             } 
             
             
             })
          connection.release();
 
          res.json(((result[0]["max(fileid)"]+1)));
          })
       })
 
 })
 
 
 
 
 
 
 
 router.post('/savecatalogue',urlencodedParser, function (req, res) {
    var filename = req.body.filename;
    var fileid = req.body.fileid;
    console.log("is saving catalogue for file " + fileid);
 
    pool.getConnection(function(err,connection){
       console.log("savecatalogue : connection to sql success")
       var qu = "update catalogue set filename ='" + filename + "'where fileid ="+fileid;
       connection.query(qu,function(err,result){
          if(err){
             console.log('[UPDATE ERROR] - ',err.message);
             return;
          } 
          console.log("savecatalogue : mysql release")
          res.send("success");
 
 
 
          
          connection.release();
          })
       })
 
 })
 
 
 
 
 
 
 
 
 
 
 
 router.post("/upload",urlencodedParser,  async (req, res) => {
   let form = new multiparty.Form();
   form.parse(req, async(err,fields,file)=>{
      const result = await query("select max(fileid) from catalogue where userid="+fields["userid"])
      var maxindex = (result[0]["max(fileid)"])
      console.log("maxindex now  ：  "+maxindex)
      if(fields["folderid"]==-1){//不是目录，先创建一个目录
         result2 = await query( "INSERT INTO catalogue VALUES("+fields["userid"] +","+(maxindex+1)+",'newfolder',0,0,null)")
         for (let index = 2; index < (parseInt(fields["size"])+2); index++) {//每个文件存入该目录  
            orifilename = file["file"][index-1]["originalFilename"];
            filename = orifilename.substring(0,orifilename.indexOf("."))
            endname = orifilename.substring(orifilename.indexOf("."),orifilename.length)
            if(endname != ".md") 
               return;
            result2 = await query( "INSERT INTO catalogue VALUES("+fields["userid"] +","+(maxindex+index)+",'"+filename+"',1,1,"+(maxindex+1)+")")
            var data = fs.readFileSync(file["file"][index-2]["path"], 'utf-8');
            data = data.replace(/\\/g,"\\\\");
                data = data.replace(/\"/g,"\'\'");
                data =data.replace(/\'/g,"\"");
            result3 = await query( "INSERT INTO note VALUES("+(maxindex+index)+",'"+data+"',"+fields["userid"]+","+(maxindex+1)+")")
            res.send("success")
         }
      }else{
         for (let index = 1; index < (parseInt(fields["size"])+1); index++) {//每个文件存入该目录  
            orifilename = file["file"][index-1]["originalFilename"];
            filename = orifilename.substring(0,orifilename.indexOf("."))
            endname = orifilename.substring(orifilename.indexOf("."),orifilename.length)
            if(endname != ".md") 
               return;
            fatherid = fields["folderid"]
            result2 = await query( "INSERT INTO catalogue VALUES("+fields["userid"] +","+(maxindex+index)+",'"+filename+"',1,1,"+(fatherid)+")")
            var data = fs.readFileSync(file["file"][index-1]["path"], 'utf-8');
            data = data.replace(/\\/g,"\\\\");
                data = data.replace(/\"/g,"\'\'");
                data =data.replace(/\'/g,"\"");
            result3 = await query( "INSERT INTO note VALUES("+(maxindex+index)+",'"+data+"',"+fields["userid"]+","+(fatherid)+")")
            res.send("success")
         }
      }
  });
 });

 router.post("/uploadimg",urlencodedParser,  async (req, res) => {
      var userid = req.body.userid;
      var fileid = req.body.fileid;
      var size = req.body.size;
      var hash = req.body.hash;
      const result = await query("select size from user where userid="+userid)
      const result2 = await query("update user set size = "+(parseInt(result[0].size)+parseInt(size))+" where userid = "+userid);
      const result3 = await query("insert into img values("+fileid+","+userid+",'"+hash+"',"+size+") ")
 });

 router.post("/getleftsize",urlencodedParser,  async (req, res) => {
   var userid = req.body.userid;
   const result = await query("select maxsize from user where userid="+userid)
   const result1 = await query("select size from user where userid="+userid)
   ret = parseInt(result[0].maxsize) - parseInt(result1[0].size);
   res.json(ret)

});
 
 
 
 
 
 
router.get('/',urlencodedParser, function (req, res) {
   console.log("!")
   res.status(200).sendFile( path.resolve(__dirname + "/../../public/html/" + "notepage.html") );
});
 
 
 
 
 
 
 
  
 
 

 module.exports = router;