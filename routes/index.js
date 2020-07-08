var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
 var bodyParser = require('body-parser');    



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


	router.post('/firmantes',bodyParser.json(), function (req, res, next) {
		//console.log(req.body);
		
		//gen_pdf(req.body.html)
		
		//dbxx2.collection('firma_doc').insert(req.body, function(err, newDoc) {
		//    if (newDoc !== null) {                        
		//        return res.status(200).send();
		//    } else {
		//        return res.status(500).send("error");
		//    }
		//});
		
		
	  // req.body contains the text fields
	  //return res.status(200).send();
	})			
	

	router.get("/get/a", function(req, res){
		console.log(req);
		res.send("GET res sent from webpack dev server")
	})

	router.post("/post/a", bodyParser.json(), function(req, res){
		console.log(req.body);
		res.send("POST res sent from webpack dev server")
	})
			


module.exports = router;
