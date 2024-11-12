const JWT = require('jsonwebtoken')
const createError = require('http-errors')


 module.exports = {
    signAccessToken: (userId) =>{
        return new Promise((resolve, reject) => {
            const payload = {
                aud: userId
            }
            const secret = "shhhhhh"
            const options = {
                expiresIn: "1h",
                issuer: "my api.com",
                
            }


            JWT.sign(payload, secret, options,(err, token) =>{
                if(err) reject(err)
                    resolve(token)
            })
        })
    }
 }