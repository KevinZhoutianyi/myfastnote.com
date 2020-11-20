/* ---------------------------------------加载----------------------------------------*/

/* 加载上次编辑文档，加载存七牛的token */
function loadData() {
    
    // to do : get the real data
    console.log("load lastsavedfile")
    $.ajax({ cache:false,
        url:"main/getdata",
        type: "post",
        data:{token:localStorage.token},
        success: function (returnValue) {
            // console.log("dataloaded:"+ JSON.stringify(returnValue) )
            document.getElementById("md-area").value = returnValue.content;
            localStorage.nowopenfileid = returnValue.id;
            m = document.getElementById("md-area");
            m.style.height='auto';
            m.style.height = m.scrollHeight + 50 + 'px';
            mdSwitch();
        },
        error: function (returnValue) {
            alert("load data fail");;
            location.href = "/"
                                    savecontent();
        }
    })
 
    
    
    
}
/* 加载上次编辑文档 */

/*用读取fileid对应的content*/
function loadfile(id) {
    $.ajax({ cache:false,
        url:"main/getfile",
        type: "post",
        data:{token:localStorage.token, fileid : id},
    
        success: function (returnValue) {
            // console.log("dataloaded:"+ JSON.stringify(returnValue) )
            document.getElementById("md-area").value= returnValue.content;
            localStorage.nowopenfileid = returnValue.fileid;
            m = document.getElementById("md-area");
            m.style.height='auto';
            m.style.height = m.scrollHeight + 50 + 'px';
            mdSwitch();
        },
        error: function (returnValue) {
            alert("load content fail");;
            location.href = "/"
                                    savecontent();
                                    
        }
    })      
    
}
/*用username得到userid存在本地，用读取fileid对应的content*/ 

/*加载目录*/
function loadcatalogue(command) {
    
        $("#folderxD #foldernamexD").each(function(i){
            folderid =  $(this).attr('name')
            if($(this).parent().children("#filecontainer").css('display') == 'flex'){
                localStorage.setItem("folderid"+folderid,0)
            }else{
                localStorage.setItem("folderid"+folderid,1)
            }
            
        });

    
    // to do : get the real data
   
    $.ajax({ cache:false,
        url:"main/getcatalogue",
        type: "post",
        data:{token:localStorage.token},
        success: function (returnValue) {
            var content = JSON.stringify(returnValue);
            var showhtml = "<br><br>";
            var foldersfileidarray =[];
            for (let index = 0; index < returnValue.length; index++) {
                if(returnValue[index].level == 0){
                    var temp = {};
                    temp.fileid = returnValue[index].fileid;
                    temp.filename = returnValue[index].filename;
                    foldersfileidarray.push(temp);
                }
                
            }
            
            // console.log("folder's file id and name" +JSON.stringify(foldersfileidarray)  )
            for (let i = 0; i < foldersfileidarray.length; i++) {
                showhtml += "<div id='folderxD' name='" + foldersfileidarray[i]  +"'>";
                showhtml += "<h2  id='foldernamexD' name = "+ foldersfileidarray[i].fileid+"  onclick='folderclick(this)' contenteditable='false'  tabindex='1' onblur='myblur(this);'   spellcheck='false'>" + foldersfileidarray[i].filename + "</h2>";
                showhtml+= "<div id='filecontainer'>"
                showhtml+="<div id='rowseperateline'></div>"
                for (let j = 0; j < returnValue.length; j++) {
                    if(returnValue[j].fatherid == foldersfileidarray[i].fileid)
                    {   
                        showhtml += "<h4  title='"+returnValue[j].filename+"' id = 'filexD' name = "+ returnValue[j].fileid+"  onclick = 'clickfile(this);'   tabindex='1' onblur='myblur(this);'contenteditable='false' style='display: block;' spellcheck='false' >" + returnValue[j].filename+ "</h4>";
                    }
                    
                }
                showhtml += "</div>";
                showhtml += "</div>";
            }
            
            
            
            document.getElementById("menutextarea").innerHTML = showhtml;

            if(command == 'first'){//第一次load的时候 把所有folder fold起来

                $("#folderxD #foldernamexD").each(function(i){
                    folderid =  $(this).attr('name')
                    localStorage.setItem("folderid"+folderid,1)
                });
        
            }

            $("#folderxD #foldernamexD").each(function(i){
                folderid = $(this).attr('name')
                if((localStorage.getItem("folderid"+folderid)!=null)&&(localStorage.getItem("folderid"+folderid)==1)){
                    $(this).parent().children("#filecontainer").hide();
                }else{
                    $(this).parent().children("#filecontainer").show();
                }
                
            });


       
        }
    })
    
}
/*加载目录*/

/* ---------------------------------------加载----------------------------------------*/






/* ---------------------------------------主界面----------------------------------------*/

/*转md*/
var cycle = 10
function mdSwitch() {
    var mdValue = document.getElementById("md-area").value;
    mdValue = mdValue.replace(/\\/g,"\\\\");
    var html = marked(mdValue);
    for (let index = 0; index < 10; index++) {
        html += "<br>";
    }
    document.getElementById("show-area").innerHTML = html;
    if(cycle++%20==0){
        MathJax.typesetClear()
        console.log("clear")
    }
    MathJax.typeset(["#show-area"]);
    mdValue = ""
    html =""
}
/*转md*/

/*左半边的scroll同步右边*/
function syncDivsScrollPos() {
    var $divs = $('#left');
    var sync = function(e){
        if(localStorage.islock==1){
            var $other =$('#right'), other = $other.get(0);
            var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
            other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);

        }
    }
    $divs.on( 'scroll', sync);
}
/*左半边的scroll同步右边*/

/*ctrl s = 保存*/
window.addEventListener("keydown", function(e) {
    if(e.keyCode == 13 && localStorage.edited==1){
        e.preventDefault();

        var obj  = document.getElementsByName(localStorage.contextmenufilename)
        myblur(obj);
    }
    //可以判断是不是mac，如果是mac,ctrl变为花键
    //event.preventDefault() 方法阻止元素发生默认的行为。
    if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        localStorage.leftscrolltop = $("#left").scrollTop();
        localStorage.rightscrolltop = $("#right").scrollTop();
        // Process event...
        savecontent();
    }
    
 
}, false);
function savecontent() {
    m = document.getElementById("md-area");
        m.style.height='auto';
        m.style.height = m.scrollHeight + 50 + 'px';

        $("#left").scrollTop(localStorage.leftscrolltop);
        $("#right").scrollTop(localStorage.rightscrolltop);//调整高度后 不移动到最下面
        m = document.getElementById("md-area").value;
        m = m.replace(/\\/g,"\\\\");
        m = m.replace(/\"/g,"\\\"");
        m = m.replace(/\'/g,"\\\'");
        $.ajax({ cache:false,
            url:"main/savedata",
            type: "post",
            data:{token:localStorage.token,content : m,id :localStorage.nowopenfileid},
            success: function (returnValue) {
                $('<div>').appendTo('body').addClass('alert alert-success').html('Saved').show().delay(500).fadeOut();
            },
            error: function (returnValue) {
                console.log(returnValue.responseText);;
                console.log("save fail")
                alert("fail")
            }
        })
}
/*ctrl s = 保存*/

/*右下角extramenu*/
function mouseover() {
    $("#mouseoverarea").css("width",'0px');
    $("#extramenu").addClass("slidein");
    $("#extramenu").removeClass("slideout");
}

$(document).ready(function(){
    
    console.log("ready")
    $("#inpt_search").on('focus', function () {
	$(this).parent('label').addClass('active');
});

$("#inpt_search").on('blur', function () {
	if($(this).val().length == 0)
		$(this).parent('label').removeClass('active');
});
    $("#extramenu").mouseleave(function(){
        $("#mouseoverarea").css("width",'4em');
        $("#extramenu").addClass("slideout");
        $("#extramenu").removeClass("slidein");
      });
});
/*右下角extramenu*/

/*锁的切换*/
function lock(){
    if(localStorage.islock == 1){
        localStorage.islock = 0;
        $("#locked").hide();
        $("#notlocked").show();
    }else{
        localStorage.islock = 1;
        $("#locked").show();
        $("#notlocked").hide();
    }             
}
/*锁的切换*/


/*全屏切换*/
function fullscreen(){

    if(localStorage.isfull == 1){
        localStorage.isfull = 0;
        $("#smallscreen").hide();
        $("#fullscreen").show();
        $("#left").show();
        $("#right").css("width","50%");
        $("#show-area").css("width","100%");
        $("#seperateline").show();
        
        //防止 全屏 换文件 小屏 后 left高度不对
        localStorage.rightscrolltop = $("#right").scrollTop();
        // Process event...
        m = document.getElementById("md-area");
        m.style.height='auto';
        m.style.height = m.scrollHeight + 50 + 'px';
        $("#right").scrollTop(localStorage.rightscrolltop);//调整高度后 不移动到最下面
        
        //防止 全屏 换文件 小屏 后 left高度不对
    }else{
        localStorage.isfull = 1;
        $("#smallscreen").show();
        $("#fullscreen").hide();
        $("#left").hide();
        $("#right").css("width","100%");
        $("#show-area").css("width","50%");
        $("#seperateline").hide();
    }   
  }
  
/*全屏切换*/


/*图*/
function uploadmyimg() {
    //图 后上传
    $("#uploadcropimg").click();
}
function inputChange(e){
    flag = 1;
    var formData = new FormData();
    var file = $("#uploadcropimg")[0].files;
    function callback(blob){//回调获取压缩后的Blog
        if(blob){
            console.log("compressed ok")
            let compressedfile = new window.File(
                    [blob],
                    file[0]["name"],
                    { type: blob.type }
            );
            console.log(blob.type)
            formData.append('file', compressedfile);
            formData.append('fileid', localStorage.nowopenfileid);
            formData.append('token', localStorage.token);
            $.ajax({
                url: '/main/uploadimg' ,  
                type: 'POST',  
                data:formData,
                dataType: "formData",
                cache: false,
                contentType: false,
                processData:false,
                mimeType:"multipart/form-data",
            
                success: function (returnValue) {
                    
                },
                error: function (returndata) {
                    console.log("upload img success") 
                    hash = JSON.parse(returndata['responseText'])['hash'];
                    m = document.getElementById("md-area").value;
                    m += "\r\n![](http://img.myfastnote.com/"+ hash+"~resize1)";
                    document.getElementById("md-area").value = m;
                    localStorage.leftscrolltop = $("#left").scrollTop();
                    localStorage.rightscrolltop = $("#right").scrollTop();
                    m = document.getElementById("md-area")
                    m.style.height='auto';
                    m.style.height = m.scrollHeight + 50 + 'px';
                    mdSwitch();
                    $("#left").scrollTop(localStorage.leftscrolltop);
                    $("#right").scrollTop(localStorage.rightscrolltop);//调整高度后 不移动到最下面
                }
            })
        }else{
            alert("jpg/png only")
        }
    }
    
    this.compress(file[0], callback);
    

}

/*截图*/




/* 右上角帮助 */
function question(){
    if(localStorage.showhelp == 1){
        localStorage.showhelp = 0;
        $("#question").css('z-index',5);
        $("#questionpop").hide();
    }else{
        localStorage.showhelp = 1;
        $("#question").css('z-index', 12);
        $("#questionpop").show();
        // document.getElementById('md-area').focus();
    }            
    }
/* 右上角帮助 */

/* show menu*/
function arrow(){
    if(localStorage.isarrowdown == 1){
        localStorage.isarrowdown = 0;
        $("#downarrow").hide();
        $("#uparrow").show();
        $("#pop").show();
    }else{
        localStorage.isarrowdown = 1;
        $("#downarrow").show();
        $("#uparrow").hide();
        $("#pop").hide();
        // document.getElementById('md-area').focus();
    }          
}
/* show menu*/

/* ---------------------------------------主界面----------------------------------------*/




/* ---------------------------------------目录----------------------------------------*/
/*展开文件夹*/
function folderclick(obj) {
    if($(obj).attr("contentEditable")=='false'){
        if($(obj).parent().children("#filecontainer").css('display') == 'flex'){
            
            $(obj).parent().children("#filecontainer").hide();
        }else{
            
            $(obj).parent().children("#filecontainer").show();
        }

    }
}
/*展开文件夹*/

/*读取文件 显示content*/
function clickfile(obj) {
    loadfile($(obj).attr('name'));
}
/*读取文件 显示content*/


/* div失去焦点 分点了一下 点了别的地方 和 编辑之后点了别的地方
 localedited用来 排除点了一下 div 之后点了别的地方的失去焦点
 undefined是 div blur的bug*/
function myblur(obj) {
    
    if($(obj).html()==undefined)
    return;
    if(localStorage.edited == 1){
        localStorage.edited = 0;

        if($(obj).html().length<=2){
            alert("too short")
            loadcatalogue();
        }else{
            var s = "";
            s = $(obj).html();
            s = s.replace(/<div>/g, "");
            s = s.replace(/<\/div>/g, "");
            savecatalogue(s,$(obj).attr('name'));
        }
        // console.log($(obj).html())
        
        $(obj).attr("contentEditable",false)
        }
}
/* div失去焦点 分点了一下 点了别的地方 和 编辑之后点了别的地方
 localedited用来 排除点了一下 div 之后点了别的地方的失去焦点
 undefined是 div blur的bug*/

/*保存目录*/
function savecatalogue(filename,fileid) {
    // console.log("username: "+localStorage.username +" save file id: "+fileid)
        $.ajax({ cache:false,
            url:"main/savecatalogue",
            type: "post",
            data:{token:localStorage.token, fileid : fileid,filename:filename},
        
            success: function (returnValue) {
                console.log("save catalogue success")
                loadcatalogue();
            },
            error: function (returnValue) {
                alert(returnValue.responseText);;
                location.href = "/"
                                    savecontent();
            }
        })
}
/*保存目录*/

/*新建文件夹*/
function newfolder(){
    console.log("username: "+localStorage.username +" new file ")
        $.ajax({ cache:false,
            url:"main/newfolder",
            type: "post",
            data:{token:localStorage.token},
        
            success: function (returnValue) {
                loadcatalogue();

                localStorage.contextmenufilename = returnValue;
                setTimeout("rename()", 100 )
            },
            error: function (returnValue) {
                alert(returnValue.responseText);;
                location.href = "/"
                                    savecontent();
            }
        })
}
/*新建文件夹*/

/*新建文件和删除文件文件夹*/
function opfile(data) {
    if(data=="delete"){
        id = localStorage.contextmenufileid;
        name = localStorage.contextmenufilename;
        if(id=='foldernamexD'){
            //提示是否要删除文件和文件夹下所有内容
            var r=confirm("Sure to delete the folder and all files?");
            if (r==true){
                //ajax删除文件夹 和它下面的所有文件
                $.ajax({cache:false,
                    url:"main/deletefile",
                    type: "post",
                    data:{token:localStorage.token,fileid : name},
                
                    success: function (returnValue) {
                        loadcatalogue();
                    },
                    error: function (returnValue) {
                alert(returnValue.responseText);;
                        location.href = "/"
                                    savecontent();
                    }
                })
            }
            else{
            }
        }
        else if(id=='filexD'){
            //提示是否要删除文件
            var rr=confirm("是否要删除文件?");
            if (rr==true){
                $.ajax({ cache:false,
                    url:"main/deletefile",
                    type: "post",
                    data:{token:localStorage.token,fileid : name},
                
                    success: function (returnValue) {
                        loadcatalogue();
                    },
                    error: function (returnValue) {
                        alert(returnValue.responseText);;
                        location.href = "/"
                                    savecontent();
                    }
                })
            }
            else{
            }

        }

    }else if(data == "new"){
        id = localStorage.contextmenufileid;
        name = localStorage.contextmenufilename;
        if(id=='foldernamexD'){
            $.ajax({ cache:false,
                url:"main/newfile",
                type: "post",
                data:{token:localStorage.token, folderid:name},
            
                success: function (returnValue) {
                    loadcatalogue();
                    localStorage.contextmenufilename = returnValue;
                    
                    setTimeout("rename()", 100 )
                },
                error: function (returnValue) {
                    alert(returnValue.responseText);;
                    location.href = "/"
                                    savecontent();
                }
            })
        }
    }
    
}
/*新建文件和删除文件文件夹*/


/*从本地上传md文件*/
function upload() {
    $("#uploadbutton").trigger("click");
}
function doUpload() {  
    // var formData = new FormData($( "#uploadForm" )[0]); 
    var formData = new FormData();
    var file = $("#uploadbutton")[0].files;
    formData.append('size', file.length);
    formData.append('token', localStorage.token);
    if(localStorage.contextmenufileid=="foldernamexD"){
        formData.append('folderid', localStorage.contextmenufilename);

    }else{
        formData.append('folderid', -1);
    }
    for (let index = 0; index < file.length; index++) {
        formData.append('file', file[index]);
    }
    $.ajax({ cache:false,  
         url: 'http://myfastnote.com/main/upload' ,  
         type: 'POST',  
         data:formData,
         dataType: "formData",
         cache: false,
         contentType: false,
         processData:false,
         mimeType:"multipart/form-data",
         success: function (returndata) {  
            console.log("uploadfile:"+returndata.responseText)
             loadcatalogue();
         },  
         error: function (returndata) {  
            console.log("uploadfile:"+returndata.responseText)
            loadcatalogue();
         }  
    });  
}  
/*从本地上传md文件*/







/* 重命名 */
function rename() {
    console.log("renamefor " +(localStorage.contextmenufilename))
    var obj  = document.getElementsByName(localStorage.contextmenufilename)
    $(obj).attr("contentEditable",true)
    localStorage.edited = 1;
    $(obj).focus();
}
/* 重命名 */


/*右键的context menu*/
document.addEventListener("contextmenu", (e) => {
    // console.log(e.path[0].id)
    let x = e.path[0].id
    $(".newfile").css("display","none");
    $(".newfolder").css("display","none");
    $(".trash").css("display","none");
    $(".upload").css("display","none");
    $(".rename").css("display","none");
    if(x=="filexD"|x=="foldernamexD"|x=="menutextarea"|x=="folderxD"|x=="filecontainer"){//右键在file上
        
        // e.preventDefault();

        if(x=="foldernamexD"){
            $(".trash").css("display","flex");
            $(".newfile").css("display","flex");
            $(".upload").css("display","flex");
            $(".rename").css("display","flex");
        }
        
        else if(x=="menutextarea"||x=="folderxD"){
            $(".newfolder").css("display","flex");
            $(".upload").css("display","flex");
        }
        
        else if(x=="filexD"){

            $(".rename").css("display","flex");
            $(".trash").css("display","flex");
        }

        else if(x=="filecontainer"){
            $(".newfile").css("display","flex");
        }
        
        localStorage.contextmenufilename = $(e.path[0]).attr("name");
        localStorage.contextmenufileid = $(e.path[0]).attr("id");
        if(x=="filecontainer"){
            localStorage.contextmenufilename = $(e.path[1]).children("#foldernamexD").attr("name");
            localStorage.contextmenufileid = $(e.path[1]).children("#foldernamexD").attr("id");
        }

        console.log(localStorage.contextmenufilename+","+localStorage.contextmenufileid)
        showMenu(e);
    }else{
        hideMenu();
    }
  });
  const ContextMenu = function (options) {
    // 唯一实例
    let instance;
  
    // 创建实例方法
    function createMenu() {
        const ul = document.createElement("div");
        ul.classList.add("custom-context-menu");
        const { menus } = options;
        if (menus && menus.length > 0) {
          for (let menu of menus) {
            const li = document.createElement("div");
            li.style = "background-color:rgba(80, 79, 79, 0.657);";
            $(li).attr("id","icon");
            $(li).attr("class",menu.class);

            $(li).append( "<img src='"+menu.name+"' class='"+menu.class+"img'>")

            li.onclick = menu.onClick;
            ul.appendChild(li);
          }
        }
        const body = document.querySelector("body");
        body.appendChild(ul);
        return ul;
      }
  
    return {
      // 获取实例的唯一方式
      getInstance: function () {
        if (!instance) {
          instance = createMenu();
        }
        return instance;
      },
    };
  };
   const menuSinglton = ContextMenu({
    menus: [
      {
        name: "public/png/trashwhite.png",
        class: "trash",
        onClick: function (e) {
            opfile("delete");
        },
      },
      {
        name: "public/png/newfile.png",
        class: "newfile",
        onClick: function (e) {
            opfile("new");
        },
      },
      {
        name: "public/png/newfolder.png",
        class: "newfolder",
        onClick: function (e) {
            newfolder();
        },
      },
      {
        name: "public/png/upload.png",
        class: "upload",
        onClick: function (e) {
            upload();
        },
      },
      {
        name: "public/png/rename.png",
        class: "rename",
        onClick: function (e) {
            rename();
        },
      },
      
    ],
  });

  function showMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.top = `${e.clientY+10}px`;
    menus.style.left = `${e.clientX+10}px`;
    
  menus.style.display = "flex";
    
  }
  function hideMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.display = "none";
  }
  document.addEventListener("click", hideMenu);
  document.addEventListener("keypress", hideMenu);
/*右键的context menu*/




/* 搜索*/

function search(val) {
    $.ajax({
        cache:false,
        url:"main/search",
        type: "post",
        data:{token:localStorage.token,key:val},
        success: function (returnValue) {
            let list = []
            for (var i=0;i<returnValue.length;i++)
            { 
                list.push(returnValue[i]["fileid"])
            }
            
            console.log(list)
            $("#filecontainer #filexD").each(function(i){
                $(this).removeClass('findkey');
            });
            
                $("#filecontainer #filexD").each(function(i){
                    for (var i=0;i<list.length;i++)
                    { 
                        if($(this).attr("name") == list[i]){
                            $(this).addClass('findkey');

                        }
                    }
                    
                });
            
        },
        error: function (returnValue) {
            alert("load data fail");;
            location.href = "/"
            savecontent();
        }
    })
}


/* 搜索*/
/* ---------------------------------------目录----------------------------------------*/









/* ---------------------------------------lib----------------------------------------*/
//当图片宽度大于800时 进行等比例压缩，并返回Blob，否则返回false
function compress(fileObj, callback) {
    function dataURLtoBlob(dataurl) {//base64格式图片 转为Blob  
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
    if (typeof (FileReader) === 'undefined') {
        console.log("当前浏览器内核不支持base64图标压缩");
        return false;
    } else {
        try {
            var reader = new FileReader();
            var image = new Image();
            reader.readAsDataURL(fileObj);//开始读取指定的Blob中的内容。返回base64
            reader.onload = function (ev) {
                image.src = ev.target.result;
                image.onload = function () {
                    var imgWidth = this.width,
                        imgHeight = this.height; //获取图片宽高
                    if (imgWidth > 800) {//设置图片的最大宽度为800
                        imgWidth = 800;
                        imgHeight = 800 / this.width * imgHeight;//设置等比例高度
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        canvas.width = imgWidth;
                        canvas.height = imgHeight;
                        ctx.drawImage(this, 0, 0, imgWidth, imgHeight);//根据宽高绘制图片
                        var fullQuality = canvas.toDataURL("image/png", 1.0);//canvas转为base64
                        var blogData=dataURLtoBlob(fullQuality);
                        callback(blogData);
                    }else{
                        imgWidth = this.width;
                        imgHeight =this.height;//设置等比例高度
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        canvas.width = imgWidth;
                        canvas.height = imgHeight;
                        ctx.drawImage(this, 0, 0, imgWidth, imgHeight);//根据宽高绘制图片
                        var fullQuality = canvas.toDataURL("image/png", 1.0);//canvas转为base64
                        var blogData=dataURLtoBlob(fullQuality);
                        callback(blogData);
                    }
                }
            }
        } catch (e) {
            console.log("压缩失败!");
        }
    }
}
/* ---------------------------------------lib----------------------------------------*/
