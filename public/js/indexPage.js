
function trylogin(){
    $.ajax({
        //几个参数需要注意一下
            type: "POST",//方法类型
            url: "/login" ,//url
            data: $('#myform').serialize(),
            success: function (result) {
                location.href = "/main"
                localStorage.token = result;
            },
            error : function(result) {
                alert("fail");
            }
        });

}




 
 $(document).ready(function(){
    $.ajax({
        //几个参数需要注意一下
            type: "POST",
            url: "/checktoken" ,
            data:{token:localStorage.token},
            success: function (result) {
                location.href = "/main"
            },
            error : function(result) {
                console.log("token expire")
            }
        });
});