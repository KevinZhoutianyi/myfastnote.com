// 转md
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


// 加载上次编辑文档
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
    // 加载目录
    function loadcatalogue() {
        // to do : get the real data
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
                    showhtml += "<h2  id='foldernamexD' name = "+ foldersfileidarray[i].fileid+"  onclick='folderclick(this)' contenteditable='false' onmousedown='mousedown(this);'  onmouseup='mouseup(this);' onmouseout  =' mouseout(this)' tabindex='1' onblur='myblur(this);'>" + foldersfileidarray[i].filename + "</h2>";
                    for (let j = 0; j < returnValue.length; j++) {
                        if(returnValue[j].fatherid == foldersfileidarray[i].fileid)
                        {
                            showhtml += "<h4  id = 'filexD' name = "+ returnValue[j].fileid+" onmousedown='mousedown(this);' onclick = 'clickfile(this);'  onmouseup='mouseup(this);' onmouseout  =' mouseout(this)' tabindex='1' onblur='myblur(this);'contenteditable='false' style='display: block;' >" + returnValue[j].filename+ "</h4>";
                        }
                        
                    }
                    showhtml += "</div>";
                }
                

                
                document.getElementById("menutextarea").innerHTML = showhtml;
            },
            error: function (returnValue) {
                alert("lose connection");
            }
        })
        
    }

// 按键保存 删除时候调整高度
//     document.onkeydown=function() {
//     if (event.keyCode == 8) {
//         if (document.activeElement.type == "text"||document.activeElement.type == "textarea"||document.activeElement.type == "password") {
//             if (document.activeElement.readOnly == false)
//                 m = document.getElementById("md-area");
//                 m.style.height='auto';
//                 m.style.height = m.scrollHeight - 50 + 'px';
//                 return true;
//         }
//         m = document.getElementById("md-area");
//         m.style.height='auto';
//         m.style.height = m.scrollHeight - 50 + 'px';
//         return false;
//     }
   
    
// }

    window.addEventListener("keydown", function(e) {
            //可以判断是不是mac，如果是mac,ctrl变为花键
            //event.preventDefault() 方法阻止元素发生默认的行为。
            if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                e.preventDefault();
                // Process event...
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';
                m = document.getElementById("md-area").value;
                

                m = m.replace(/\\/g,"\\\\");

                m = m.replace(/\"/g,"\'\'");
                m = m.replace(/\'/g,"\'\'");
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

// 锁
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
function folderclick(obj) {
    if($(obj).attr("contentEditable")=='false'){
        if($(obj).parent().children("#filexD").css('display') == 'block'){
    
            $(obj).parent().children("#filexD").hide();
        }else{
            
            $(obj).parent().children("#filexD").show();
        }

    }
}
function clickfile(obj) {
    loadfile($(obj).attr('name'));
}

// $(function(){
//     setInterval(function(){
//         console.log("123")
//         m = document.getElementById("md-area");
//         m.style.height='auto';
//         m.style.height = m.scrollHeight - 50 + 'px';
//     }, 3000);
// });

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


// div失去焦点 分点了一下 点了别的地方 和 编辑之后点了别的地方
// localedited用来 排除点了一下 div 之后点了别的地方的失去焦点
// undefined是 div blur的bug
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
function anim(obj) {
    $(obj).addClass("avaanim");
    timeout= setTimeout(function() {
        $(obj).removeClass("avaanim");
    }, 10000);//鼠标按下1秒后发生事件
}

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
//用localstorage在loadcatalogue之后展开folder
document.addEventListener("contextmenu", (e) => {
    console.log(e.path[0].id)
    let x = e.path[0].id
    
    $(".newfile").css("display","none");
    $(".newfolder").css("display","none");
    $(".trash").css("display","none");
    if(x=="filexD"|x=="foldernamexD"|x=="menutextarea"){//右键在file上
        

        if(x=="foldernamexD"){
            $(".trash").css("display","block");
            $(".newfile").css("display","block");
        }
        
        else if(x=="menutextarea"){
            $(".newfolder").css("display","block");
        }
        
        else if(x=="filexD"){
            $(".trash").css("display","block");
        }
        
        localStorage.contextmenufilename = $(e.path[0]).attr("name");
        localStorage.contextmenufileid = $(e.path[0]).attr("id");
        e.preventDefault();
        showMenu(e);
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
            const li = document.createElement("img");
            li.src = menu.name;
            $(li).attr("id","icon");
            $(li).attr("class",menu.class);
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
  
  $(document).on('mousewheel DOMMouseScroll', onMouseScroll);
  function onMouseScroll(e){
    hideMenu();
  }
