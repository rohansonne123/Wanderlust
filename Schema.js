//Schema validation
const Joi = require('joi');
module.exports.listingValidation=Joi.object({
    listing: Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        image:Joi.string().allow("",null),
        price:Joi.number().required().min(0),
        country:Joi.string().required(),
        location:Joi.string().required(),
    }).required(),
});

module.exports.listingreview=Joi.object({
    review:Joi.object({
        comment:Joi.string().required(),
        rating:Joi.number().required().min(1).max(5),
    }).required(),
})

