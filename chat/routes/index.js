var express = require('express');
var mongoskin = require('mongoskin');
var router = express.Router();
var crypto = require('crypto')
var bouncer = require('express-bouncer')(10000, 900000,10);
var db = mongoskin.db('mongodb://localhost:27017/chat')
var message = false
var sh = false;
// 		*****	Client connected *****

/* GET home page. */
/*router.get('/', bouncer.block,function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//   ****  Register GET Request ****
router.get('/register',bouncer.block,function(req,res,next){
if(req.session.loggedin){res.redirect('/login');
}
else{
res.render('reg_form') }
})
//   ****  Login POST Request ****
router.post('/login',function(req,res,next){

var db = mongo_required.db('mongodb://localhost:27017/reg_user');
var shasum = crypto.createHmac('sha256','My Secret Key').update(req.body.log_pas).digest('hex');

db.collection('user').find({name:req.body.log_user,pass:shasum}).toArray(function(err,result){if(err) throw err;

if(result[0])
{
	req.session.loggedin = true;
	req.session.name = req.body.log_user;
	bouncer.reset(req);
	res.redirect('/login');
}
else res.send('Unauthorized Access')																	})
})
//   ****  Register POST Request ****
router.post('/register',function(req,res,next){
var db = mongo_required.db('mongodb://localhost:27017/reg_user');
var shasum = crypto.createHmac('sha256','My Secret Key').update(req.body.pas).digest('hex');

db.collection('user').insert({name:req.body.user,pass:shasum},function(err){
if(err) throw err;
req.session.name = req.body.user
req.session.loggedin = true
//res.send("Registration Complete !"+req.body.user)
res.redirect('/login')
})

})
//   ****  Login GET Request ****
router.get('/login',function(req,res){
if(req.session.loggedin)
res.render('reg_form.jade',{user_name:req.session.name});
else
res.redirect('/register');
})
router.get('/login/:my_id',function(req,res){

res.render('reg_form.jade',{user_name:req.params.my_id});

})
router.get('/logout',function(req,res){

req.session.loggedin = false;
req.session.name = false;
res.redirect('/register')

})

*/
//		-----------------------------------------------------------------

// User accessing the site --->

router.get('/chat',function(req,res,next){
	if(req.session.logged_in) {
		db.collection('user').findOne({ _id : mongoskin.ObjectID(req.session.dbid)},function(err,ress){
			
			if(ress.image!=false)
				sh = true
			else
				sh = false
			res.render('main_page',{name:req.session.name,my_id:req.session.dbid,image:ress.image,show_image:sh})

		})
			
	}
	else{
		req.session.logged_in = false
		if(message){
		message = false
		res.render('login_page',{message:'Invalid username/password'})
		}
		else
			res.render('login_page')
	}

})

router.post('/register',function(req,res,next){
	
	var shasum = crypto.createHmac('sha256','My Secret Key').update(req.body.passw).digest('hex');
	db.collection('user').insert({name:req.body.name,pass:shasum,socket_id:false,image:false},function(err,result){
		if(err) throw err;
		req.session.logged_in = true
		req.session.name = req.body.name
		req.session.dbid = result[0]._id
		req.session.image = result[0].image
		console.log(req.session.dbid)
		res.redirect('/chat')
	})

})


router.post('/login',function(req,res,next){
	var shasum = crypto.createHmac('sha256','My Secret Key').update(req.body.passw).digest('hex');
	db.collection('user').find({name:req.body.name,pass:shasum}).toArray(function(err,result){if(err) throw err;

	if(result[0]){
		req.session.logged_in = true
		req.session.name = result[0].name
		req.session.dbid = result[0]._id
		if(result[0].image)
		 req.session.image= result[0].image
		

		res.redirect('/chat')
	}

	else
		{	message = true
		res.redirect('/chat')		
		}															})
	

})

router.get('/logout',function(req,res,next){
	req.session.destroy()
	res.redirect('/chat')
})

module.exports = router;
 
