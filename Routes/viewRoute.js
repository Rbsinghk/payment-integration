const express = require('express');
const router = new express.Router();

var Stripe_Publishable_Key = "pk_test_F5UFRy9rcym7iLRTtaH55jGu";

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/getStudent', (req, res) => {
    res.render('getStudent',{ 
        key: Stripe_Publishable_Key,
        name: req.body.in 
        })
})

module.exports = router;