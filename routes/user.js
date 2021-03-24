const express = require('express');
const router = express.Router();
const rat = require ('../middleware/limit');//limite le nombre de tentatives de connexion
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);//route inscription
router.post('/login', rat.limiter, userCtrl.login);//route login

module.exports = router;