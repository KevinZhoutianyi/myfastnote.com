// function input() {
//     localStorage.username = document.getElementById("name").value;
// }

function trylogin(){
    $.ajax({
        //几个参数需要注意一下
            type: "POST",//方法类型
            url: "/login" ,//url
            data: $('#myform').serialize(),
            success: function (result) {
                location.href = "/main"
            },
            error : function(result) {
                alert("fail");
            }
        });

}
