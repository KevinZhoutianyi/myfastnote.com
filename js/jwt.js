// 引入模块依赖
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { type } = require('os');
// 创建 token 类
class Jwt {
    constructor(data) {
        this.data = data;

    }

    //生成token
    generateToken() {
        let data = this.data;
        let created = Math.floor(Date.now() / 1000);
        const secret = 'zheshiyigesiyao';
        let token = jwt.sign(data, secret, { 
                          expiresIn: 6000
                      });
        return token;
    }

    // 校验token
    verifyToken() {
        return jwt.verify(this.data, 'zheshiyigesiyao')
    }
}

module.exports = Jwt;