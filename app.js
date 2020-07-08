var createError = require('http-errors');
var express = require('express');
var path = require('path');
var request = require("request");

var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer');
var mongoose = require('mongoose');
var Resource = require('resourcejs');
var cors = require('cors')
 var bodyParser = require('body-parser');    
var phantomJsCloud = require("phantomjscloud");
var fs = require('fs');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ccabreraq3@gmail.com',
        pass: 'ccabreraq1'
    }
});

const storage = multer.diskStorage({
    destination:path.join(__dirname,'public/uploads'),
    filename:(req,file,cb)=>{
        //cb(null,file.originalname);
        cb(null,"user1"+"_aa.pdf");
    }
});

var upload = multer({ storage: storage })
var upload1 = multer()



mongoose.connect('mongodb://datosg:ccabreraq12@ds029901.mlab.com:29901/datosg');



// load the database models
const Firma_doc = require('./mongoose/doc-model')
const Puntos = require('./mongoose/puntos-model')
const Users = require('./mongoose/user-model')



// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors({
			 //exposedHeaders: ['X-Total-Count', 3],

			}));


			
Resource(app, '', 'puntos', Puntos).rest();
Resource(app, '', 'users', Users).rest();

Resource(app, '', 'firma_doc', Firma_doc).rest({
  afterPost: function(req, res, next) {
		fs.copyFile('./public/uploads/user1_aa.pdf', './public/uploads/user1_archivo.pdf', (err) => {
		  if (err) throw err;
		  console.log('archivo copiado')
		  //return res.status(200).send({});
		}); 
        next()		
	  }
});	

async function gen_pdf(html) {

    var apiKey = 'ak-e1b1d-chnt0-ra0y7-yemfh-ahrdt'; //leave undefined to use a demo key.  get a free key at https://Dashboard.PhantomJsCloud.com

    var myPromise = () => {
       return new Promise((resolve, reject) => {

			var browser = new phantomJsCloud.BrowserApi(apiKey);
			
			   var pageRequest = { url:"https://09a81fe2436a.ngrok.io/index2.html", renderType: "pdf",renderSettings: {pdfOptions: {format: "onepage"}} };

			   //console.log("about to request page from PhantomJs Cloud.  request =", JSON.stringify(pageRequest, null, "\t"));
			browser.requestSingle(pageRequest, function (err, userResponse) {
				if (userResponse.statusCode != 200) {
					console.log(" errror invalid status code" + userResponse.statusCode);
					reject("err") 
					//return ("")
				} else {
					//console.log(userResponse.content)
					
				
					fs.writeFile("prueba1.pdf", userResponse.content.data, {
						encoding: userResponse.content.encoding,
                        //resolve("ok");	
						
					}, function (err) {
						console.log("captured page written to " + userResponse.content.name);
                        //resolve("erro");				
						
					});
					resolve(userResponse.content.data);

				}
			});
	   })
    };
	
   //var result = await myPromise();
   ////console.log(result)
   ////continue execution
   //return result;   
	
};

	app.post('/upload', upload.single('file'), (req, res) => {
	  if (!req.file.mimetype.startsWith('application/*')) {
		  console.log(req.file)
		//return res.status(422).json({
		//  error :'El archivo debe ser PDF'
		//});
	  }

	  //const dimensions = sizeOf(req.file.path);
	  //
	  //if ((dimensions.width < 640) || (dimensions.height < 480)) {
	  //  return res.status(422).json({
	//	  error :'The image must be at least 640 x 480px'
	//	});
	//  }
	 //
	  return res.status(200).send(req.file);
	});
	
	app.post("/firma_doc_per", bodyParser.json(), function(req, res){
		console.log(req.body);
				
		var clave = req.body._id;
		var vuuid = req.body.uuid;
		
		Firma_doc.find({_id: clave}).
		  then(reg_docg => {              
			console.log(reg_docg); // 'A'
			
			// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
			var reg_doc = reg_docg[0];
			var rect = reg_doc.rect;
			var y;

			for (y of rect) {
					  cambia_rect(y, clave);;
			}
			// recooro vetor de personas buscando el que debe cambia
			var firmantes = reg_doc.firmantes
			var x;
			var cant_firmantes = 0

			for (x of firmantes) {
					  cambia_firmantes(x, clave);;
			}
			
			  async function cambia_rect(reg, clave) {						  
				  if (vuuid == reg.uuid) {
					 reg.status = 'firmado' 
				  }
			  }
			  async function cambia_firmantes(reg, clave) {						  
				  if (vuuid == reg.annotation) {
					 reg.content.status = 'firmado' 
					 reg.content.fecha = new Date();
				  }
				  if (reg.content.status == 'firmado') {
					 cant_firmantes = cant_firmantes + 1; 
				  }
		  
			  }
			
			// reviso si ya se firmaron todos los personas y si es asi cambio el status del registro,
			var vstatus = reg_doc.status
			if ( reg_doc.num_firmantes == cant_firmantes ) {
				vstatus = "finalizado"
			}
			// tengo que cambiar el total de firmas ya realizadas
			reg_camb = {status: vstatus, rect: reg_doc.rect, firmantes: reg_doc.firmantes, num_firmados: cant_firmantes}
			
			Firma_doc.updateOne(
			  {_id: clave},
			  //{status: "en firmas",firmantes[0].content.status: "enviado"}
			  //{status: "en firmas"}
			  reg_camb
			).then((rawResponse) => {
				console.log(rawResponse)
				res.status(200).send(rawResponse);

			})
			.catch((err) => {
			  // manejar error
			  res.status(500).send(err);
			});		
			
			
		  })				
		// cambia status a "en firmas"
		
		
		//res.status(200).send();
	})

	
	app.post("/inicia_firmas", bodyParser.json(), function(req, res){
		console.log(req.body);
				
		var clave = req.body._id
		
		var firmantes = req.body.firmantes
		var x;

		for (x of firmantes) {
		  		  envia1(x);;
		}
		
		// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
		  async function envia1(reg) {
			  
			  console.log(reg)
		  
			var mensajesms1 = "mensaje para firma de documento "+"http://localhost:3000/"+clave+"/"+reg.annotation
			var env_sms = await f_sms(mensajesms1,"57"+reg.content.celular);
			var env_mail = await f_mail(reg,req.body )
			console.log(env_sms)
		  }
		
		
		// cambia status a "en firmas"
		
		Firma_doc.updateOne(
		  {_id: clave},
		  //{status: "en firmas",firmantes[0].content.status: "enviado"}
		  {status: "en firmas"}
		).then((rawResponse) => {
		    res.status(200).send(rawResponse);

		})
		.catch((err) => {
		  // manejar error
		  res.status(500).send(err);
		});		
				

    	
		
		//res.status(200).send();
	})
	
	// envio mail por 
	const f_mail = function(firmante, reg) {
		
		var linkx = 'http://localhost:3000/#/Baz/'+reg._id+'/'+firmante.annotation
	
	   var mailOptions = {
		   from: 'Asistente EnterID', // sender address
		   to:firmante.content.email, // list of receivers
		   subject: 'Firma de documento xxxxx', // Subject line
		   html: "<HTML>\r\n<p>Datos del firmante:</p>\r\n"+
				 "<p>Nombre     : "+firmante.content.nombres+"</p>"+
				 "<p><a href='"+linkx+"'>Visit W3Schools.com!</a></p>"+
				 "\r\n</HTML>\r\n"
		   //html: {path:  'http://localhost:8080/form.html'}
		  //text: 'datos de emision', // plaintext body
	   };


	  // send mail with defined transport object
	  transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
		 res.send(200, {
			hits: 'ok'
		 });

	  });

	};	
	
	// envio sms por infobit 
	const f_sms = function(mensaje,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"PERFIL UNO",'+
		 '"destinatario":['+numero+'],'+
		 '"canal":"sms",'+
		 '"mensaje":"'+mensaje+'",'+
		 '"argumentosPersonalizados":{"nit":"12345"}}'  


		 
		 //console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
                      //var vurl = 'https://pre-idocumentos-mensajeria.azurewebsites.net/api/mensajeria/enviar';
					  var vurl = 'https://pro-apis-mensajeria-transfiriendo.azurewebsites.net/api/mensajeria/enviar';
                  }else{
                     // var vurl = 'http://pruebas.seguros.transfiriendo.com:8090/soatnetseapi/api/Vehicle/GetVehicle';
                      //var vurl = 'https://pre-idocumentos-mensajeria.azurewebsites.net/api/mensajeria/enviar';
					  var vurl = 'https://pro-apis-mensajeria-transfiriendo.azurewebsites.net/api/mensajeria/enviar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
					'Content-Type': 'application/json'
				  }				  
                 };
				 
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						var dato1 = JSON.parse(body); 
						//console.log(dato1)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(dato1);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};	
	

module.exports = app;
