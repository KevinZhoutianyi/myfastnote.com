
function trylogin(){//如果没token 用login去后端要token。notepage是需要token才能得到数据
    //新加了注册的逻辑，检查是否密码一致，一样就发送到后端

    if($("#btn").html()=="Sign In"){
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
    else if($("#btn").html()=="Sign Up"){
        if($(".firstPW").val() != $(".secondPW").val()){
            alert("Two password should be the same")
        }else{
            $.ajax({
                //几个参数需要注意一下
                    type: "POST",//方法类型
                    url: "/Signup" ,//url
                    data: $('#myform').serialize(),
                    success: function (result) {
                        location.href = "/"
                    },
                    error : function(result) {
                        alert("Username Exists");
                    }
                });
    

        }
       
    }
}

function blog() {
    location.href='/blog/2/0'
}
function tempnote() {
    location.href='/tempnote'
}
function signup() {
    // alert("Closed beta");
    $(".left").css("width","0%");
    $(".right").css("width","100%");
    $("#btn").html("Sign Up")
    $("#myform").html('<input type="text" name="username" id="name1" value="kevin" spellcheck="false"><input type="password" name="password" id="name2" class="firstPW" value="zhoutianyi" spellcheck="false"><input type="password" class="secondPW" name="password2" id="name2" value="zhoutianyi" spellcheck="false">')
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