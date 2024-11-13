const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                aud: userId
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                // you can add your expiry also here (eg. year = 1y)
                expiresIn: '1h',
                issuer: "my api.com",
            }

            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log('Error signing access token:', err.message)
                    reject(createError.InternalServerError())
                }
                    // you can add your EX(expiry time eg a year = 365 * 24 * 60 * 60)
                client.SET(String(userId), token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                    if (err) {
                        console.log('Redis SET Error:', err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    console.log('Token set in Redis successfully:', reply)
                })

                resolve(token)
            })
        })
    },

    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        
        console.log('Verifying access token:', token) // Added logging

        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                console.log('JWT verification failed:', message) // Added logging
                return next(createError.Unauthorized(message))
            }
            
            req.payload = payload
            next() // Fix: correctly invoke the next middleware
        })
    },

    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                aud: userId
            }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y',
                issuer: "my api.com",
            }

            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log('Error signing refresh token:', err.message)
                    reject(createError.InternalServerError())
                }

                resolve(token)
            })
        })
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            console.log('Verifying refresh token:', refreshToken) // Added logging

            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) {
                    console.log('JWT verification failed:', err.message) // Added logging
                    return reject(createError.Unauthorized())
                }

                const userId = payload.aud
                client.GET(String(userId), (err, result) => {
                    if (err) {
                        console.log('Redis GET Error:', err.message) // Added logging
                        reject(createError.InternalServerError())
                        return
                    }

                    if (refreshToken === result) {
                        console.log('Refresh token matched in Redis') // Added logging
                        return resolve(userId)
                    }

                    console.log('Refresh token mismatch in Redis') // Added logging
                    reject(createError.Unauthorized())
                })
            })
        })
    }
}
 