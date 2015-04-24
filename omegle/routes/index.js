var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/omegle',function(req,res){
	res.render('omegle')


})
module.exports = router;
