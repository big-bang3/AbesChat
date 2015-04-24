var express = require('express');
var router = express.Router();

var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/compiler',function(req,res){

res.render('compiler');
});

router.post('/try',function(req,res){

res.end(req.body.text);



});

router.post('/submit',function(req,res){
	console.log('inside');
	var flag = true 
var terminal = require('child_process').spawn('bash');
fs.writeFile("file.c", req.body.code, function(err){
				if(!err){
						terminal.stdin.write('gcc file.c\n')
						if(flag){
						terminal.stdin.write('./a.out \n');
						terminal.stdin.write('rm a.out\n');
						}
						}
						});
			
terminal.stdout.on('data', function (data) {
     res.end(data);
    
      
});

terminal.stderr.on('data',function(error){
    flag = false;
    res.end(error);
    
});
	

})
module.exports = router;
