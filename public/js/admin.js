var isLogin = 0;
function login(){
    console.log("login")
    $.ajax({
        //几个参数需要注意一下
            type: "POST",//方法类型
            url: "/admin/login" ,//url
            data: $('#myform').serialize(),
            success: function (result) {
                $('body').html($(result));
                isLogin = 1;
            },
            error : function(result) {
                alert("fail");
            }
        });

}
function query(){
    console.log("query")
    $.ajax({
        //几个参数需要注意一下
            type: "POST",//方法类型
            url: "/admin/query" ,//url
            data: {query:$('.query').val()},
            success: function (result) {
                
                $('#resultPart').text(JSON.stringify(result))
            },
            error : function(result) {
                alert("fail");
            }
        });

}

$(document).ready(function(){
    document.getElementById("name2").focus();
});



window.addEventListener("keydown", function(e) {
    
    if(e.keyCode == 13 && isLogin == 0){
        e.preventDefault();
        login()
       
    }

    if(e.keyCode == 13 && isLogin == 1){
        e.preventDefault();
        query()
       
    }
     
 
}, false);