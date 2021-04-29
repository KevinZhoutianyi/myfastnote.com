var read = 'SELECT * FROM user';
var add = 'INSERT INTO user(username,password) VALUES(?,?)';
var findUser = "select username from user where username = ? and password = ?";



module.exports = {
    read,
    add,
    findUser
}