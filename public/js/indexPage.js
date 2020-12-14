
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


function blog() {
    location.href='/blog'
}
function tempnote() {
    location.href='/tempnote'
}

 
 $(document).ready(function(){
    $.ajax({
        //几个参数需要注意一下
            type: "POST",
            url: "/checktoken" ,
            data:{token:localStorage.token},
            success: function (result) {
                $("#container").hide();
            setTimeout(() => {
                location.href = "/main"
                localStorage.token = result;
            }, 500);
                
            },
            error : function(result) {
                $("#container").show();
                console.log("token expire")
            }
        });
});
