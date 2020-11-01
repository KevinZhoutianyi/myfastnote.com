
/*转md*/
    function mdSwitch() {
        var mdValue = document.getElementById("md-area").value;
        mdValue = mdValue.replace(/\\/g,"\\\\");
        var html = marked(mdValue);
        for (let index = 0; index < 10; index++) {
            html += "<br>";
        }
        document.getElementById("show-area").innerHTML = html;
        MathJax.typeset();
    }
/*转md*/

/* 加载上次编辑文档 */
    function loadData() {
        // to do : get the real data
        console.log("username: "+localStorage.username + "loading data")
        $.ajax({
            url:"notepage/getdata",
            type: "post",
            data:{username : localStorage.username},
        
            success: function (returnValue) {
                // console.log("dataloaded:"+ JSON.stringify(returnValue) )
                document.getElementById("md-area").innerHTML= returnValue.content;
                localStorage.nowopenfileid = returnValue.id;
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';
                mdSwitch();
            },
            error: function (returnValue) {
                alert("lose connection");
                mdSwitch();
            }
        })
        
        
    }
/* 加载上次编辑文档 */

/*用username得到userid存在本地，用读取fileid对应的content*/
    function loadfile(id) {
        // to do : get the real data
        console.log("username: "+localStorage.username +" loading file id: "+id)
        $.ajax({
            url:"notepage/getfile",
            type: "post",
            data:{username : localStorage.username, fileid : id},
        
            success: function (returnValue) {
                // console.log("dataloaded:"+ JSON.stringify(returnValue) )
                document.getElementById("md-area").value= returnValue.content;
                localStorage.nowopenfileid = returnValue.fileid;
                localStorage.userid = returnValue.userid;
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';
                mdSwitch();
            },
            error: function (returnValue) {
                alert("lose connection");
                mdSwitch();
            }
        })      
        
    }
/*用username得到userid存在本地，用读取fileid对应的content*/ 

/*加载目录*/
    function loadcatalogue() {
        // to do : get the real data
        $("#folderxD #foldernamexD").each(function(i){
            folderid =  $(this).attr('name')
            if($(this).parent().children("#filecontainer").css('display') == 'flex'){
                localStorage.setItem("folderid"+folderid,0)
            }else{
                localStorage.setItem("folderid"+folderid,1)
            }
            
        });
        console.log("username: "+localStorage.username+ "loading catalogue")
        $.ajax({
            url:"notepage/getcatalogue",
            type: "post",
            data:{username : localStorage.username},
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
                
                console.log("folder's file id and name" +JSON.stringify(foldersfileidarray)  )
                for (let i = 0; i < foldersfileidarray.length; i++) {
                    showhtml += "<div id='folderxD' name='" + foldersfileidarray[i]  +"'>";
                    showhtml += "<h2  id='foldernamexD' name = "+ foldersfileidarray[i].fileid+"  onclick='folderclick(this)' contenteditable='false' onmousedown='mousedown(this);'  onmouseup='mouseup(this);' onmouseout  =' mouseout(this)' tabindex='1' onblur='myblur(this);'   spellcheck='false'>" + foldersfileidarray[i].filename + "</h2>";
                    showhtml+= "<div id='filecontainer'>"
                    showhtml+="<div id='rowseperateline'></div>"
                    for (let j = 0; j < returnValue.length; j++) {
                        if(returnValue[j].fatherid == foldersfileidarray[i].fileid)
                        {   
                            showhtml += "<h4  id = 'filexD' name = "+ returnValue[j].fileid+" onmousedown='mousedown(this);' onclick = 'clickfile(this);'  onmouseup='mouseup(this);' onmouseout  =' mouseout(this)' tabindex='1' onblur='myblur(this);'contenteditable='false' style='display: block;' spellcheck='false' >" + returnValue[j].filename+ "</h4>";
                        }
                        
                    }
                    showhtml += "</div>";
                    showhtml += "</div>";
                }
                
                
                
                document.getElementById("menutextarea").innerHTML = showhtml;

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


/*ctrl s = 保存*/
    window.addEventListener("keydown", function(e) {
            //可以判断是不是mac，如果是mac,ctrl变为花键
            //event.preventDefault() 方法阻止元素发生默认的行为。
            if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                e.preventDefault();
                localStorage.leftscrolltop = $("#left").scrollTop();
                localStorage.rightscrolltop = $("#right").scrollTop();
                // Process event...
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';

                $("#left").scrollTop(localStorage.leftscrolltop);
                $("#right").scrollTop(localStorage.rightscrolltop);//调整高度后 不移动到最下面
                m = document.getElementById("md-area").value;
                m = m.replace(/\\/g,"\\\\");
                m = m.replace(/\"/g,"\'\'");
                m = m.replace(/\'/g,"\"");
                $.ajax({
                    url:"notepage/savedata",
                    type: "post",
                    data:{content : m,id :localStorage.nowopenfileid,userid : localStorage.userid},
                    success: function (returnValue) {
                        $('<div>').appendTo('body').addClass('alert alert-success').html('Saved').show().delay(500).fadeOut();
                    },
                    error: function (returnValue) {
                        console.log("save fail")
                    }
                })
            }
         
        }, false);
/*ctrl s = 保存*/


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
    // 目录 上下
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
        // myblur();       
    }
    // 右上角帮助
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
/*全屏切换*/



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




/*长按重命名*/
var timeout;//用于存储定时器的变量
// 长按
function mousedown(obj) {
    timeout= setTimeout(function() {
        $(obj).attr("contentEditable",true)
        localStorage.edited = 1;
        obj.focus();
    }, 700);//鼠标按下1秒后发生事件
}
function mouseup(obj) {
    clearTimeout(timeout);//清理掉定时器
}

function mouseout(obj) {
    // $(obj).attr("contentEditable",false)
    clearTimeout(timeout);//清理掉定时器 
}
/*长按重命名*/



/* div失去焦点 分点了一下 点了别的地方 和 编辑之后点了别的地方
 localedited用来 排除点了一下 div 之后点了别的地方的失去焦点
 undefined是 div blur的bug*/
function myblur(obj) {
    
    if($(obj).html()==undefined)
    return;
    if(localStorage.edited == 1){
        
        localStorage.edited = 0;
        
        console.log(localStorage.edited)
        
        if($(obj).html().length<=3){
            alert("too short")
            loadcatalogue();
        }else{
            var s = "";
            s = $(obj).html();
            s = s.replace(/<div>/g, "");
            s = s.replace(/<\/div>/g, "");
            savecatalogue(s,$(obj).attr('name'));
        }
        console.log($(obj).html())
        
        $(obj).attr("contentEditable",false)
        }
}
/* div失去焦点 分点了一下 点了别的地方 和 编辑之后点了别的地方
 localedited用来 排除点了一下 div 之后点了别的地方的失去焦点
 undefined是 div blur的bug*/




/*保存目录*/
function savecatalogue(filename,fileid) {
    console.log("username: "+localStorage.username +" save file id: "+fileid)
        $.ajax({
            url:"notepage/savecatalogue",
            type: "post",
            data:{username : localStorage.username, fileid : fileid,filename:filename},
        
            success: function (returnValue) {
                console.log("save catalogue success")
                loadcatalogue();
            },
            error: function (returnValue) {
                alert("lose connection");
            }
        })
}
/*保存目录*/


/*新建文件夹*/
function newfolder(){
    console.log("username: "+localStorage.username +" new file ")
        $.ajax({
            url:"notepage/newfolder",
            type: "post",
            data:{userid : localStorage.userid},
        
            success: function (returnValue) {
                console.log(returnValue)
                loadcatalogue();
            },
            error: function (returnValue) {
                alert("lose connection");
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
            var r=confirm("是否要删除文件夹下所有内容?");
            if (r==true){
                //ajax删除文件夹 和它下面的所有文件
                $.ajax({
                    url:"notepage/deletefile",
                    type: "post",
                    data:{fileid : name,userid:localStorage.userid},
                
                    success: function (returnValue) {
                        console.log(returnValue)
                        loadcatalogue();
                    },
                    error: function (returnValue) {
                        alert("lose connection");
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
                $.ajax({
                    url:"notepage/deletefile",
                    type: "post",
                    data:{fileid : name,userid:localStorage.userid},
                
                    success: function (returnValue) {
                        console.log(returnValue)
                        loadcatalogue();
                    },
                    error: function (returnValue) {
                        alert("lose connection");
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
            $.ajax({
                url:"notepage/newfile",
                type: "post",
                data:{userid : localStorage.userid, folderid:name},
            
                success: function (returnValue) {
                    console.log(returnValue)
                    loadcatalogue();
                },
                error: function (returnValue) {
                    alert("lose connection");
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
    formData.append('userid', localStorage.userid);
    if(localStorage.contextmenufileid=="foldernamexD"){
        formData.append('folderid', localStorage.contextmenufilename);

    }else{
        formData.append('folderid', -1);
    }
    for (let index = 0; index < file.length; index++) {
        formData.append('file', file[index]);
    }
    // console.log(formData)
    $.ajax({  
         url: 'http://myfastnote.com/main/upload' ,  
         type: 'POST',  
         data:formData,
         dataType: "formData",
         cache: false,
         contentType: false,
         processData:false,
         mimeType:"multipart/form-data",
         success: function (returndata) {  
             console.log(returndata)
             loadcatalogue();
         },  
         error: function (returndata) {  
            console.log(returndata)
            loadcatalogue();
         }  
    });  
}  
/*从本地上传md文件*/





/*右键的context menu*/
document.addEventListener("contextmenu", (e) => {
    // console.log(e.path[0].id)
    let x = e.path[0].id
    $(".newfile").css("display","none");
    $(".newfolder").css("display","none");
    $(".trash").css("display","none");
    $(".upload").css("display","none");
    if(x=="filexD"|x=="foldernamexD"|x=="menutextarea"|x=="folderxD"|x=="filecontainer"){//右键在file上
        
        e.preventDefault();

        if(x=="foldernamexD"){
            $(".trash").css("display","flex");
            $(".newfile").css("display","flex");
            $(".upload").css("display","flex");
        }
        
        else if(x=="menutextarea"||x=="folderxD"){
            $(".newfolder").css("display","flex");
            $(".upload").css("display","flex");
        }
        
        else if(x=="filexD"){
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


  
/*右下角extramenu*/
  function mouseover() {
      $("#mouseoverarea").css("width",'0px');
      $("#extramenu").addClass("slidein");
      $("#extramenu").removeClass("slideout");
  }
  function mouseout() {
      
    $("#mouseoverarea").css("width",'4em');
    $("#extramenu").addClass("slideout");
    $("#extramenu").removeClass("slidein");
      
  }
  function extramenuload() {
    $("#extramenu").mouseleave(function(){
        mouseout();
    });
  }
/*右下角extramenu*/
