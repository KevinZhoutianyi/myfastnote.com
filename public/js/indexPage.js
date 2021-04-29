
function trylogin(){//如果没token 用login去后端要token。notepage是需要token才能得到数据
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
    location.href='/blog/2/0'
}
function tempnote() {
    location.href='/tempnote'
}
function signup() {
    alert("Closed beta");
}

 
 $(document).ready(function(){
     
    $(".background").hide();
    $.ajax({
        //几个参数需要注意一下
            type: "POST",
            url: "/checktoken" ,
            data:{token:localStorage.token},
            success: function (result) {
                $(".background").hide();
            setTimeout(() => {
                location.href = "/main"
                localStorage.token = result;
            }, 50);
                
            },
            error : function(result) {
                $(".background").show();
                console.log("token expire")
            }
        });
});


window.addEventListener("keydown", function(e) {
    
    if(e.keyCode == 13 ){
        e.preventDefault();
        trylogin()
       
    }
     
 
}, false);