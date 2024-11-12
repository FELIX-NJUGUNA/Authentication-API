const Joi = require('@hapi/joi')

// improve later
const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
})




module.exports = {
    authSchema
}