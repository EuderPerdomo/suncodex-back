'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'energiaSolar2024';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role:user.rol,
        iat: moment().unix(),
        exp: moment().add(1,'day').unix()
    }
    return jwt.encode(payload,secret);
}