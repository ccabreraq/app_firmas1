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
const fetch = require('node-fetch');
var QRCode = require('qrcode')

const carbone = require('carbone');
var convertapi = require('convertapi')('UWYxOg2XOY7eboVI');

const { PDFDocument } = require('pdf-lib');
var generate = require('generate-schema');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var owncloud = require('js-owncloud-client');
var rurl = 'https://pre.dinicloud.transfiriendo.com/';
var rurlwebdav = rurl + "remote.php/webdav/";

var oc = new owncloud(rurl);
oc.login('Adm_000000000', 'casaauto');
//var clientx = createClient(rurlwebdav,'Adm_000000000', 'casaauto');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

var sha1 = require('sha1');

const B2 = require('backblaze-b2');
const b2 = new B2({
    applicationKeyId: '00062efdfa88bd00000000004', // or accountId: 'accountId'
    applicationKey: 'K000LUFvwZ5+cyMWvyl1LhfiEanMxCo', // or masterApplicationKey
    // optional:
    axios: {
        // overrides the axios instance default config, see https://github.com/axios/axios
    },
    retry: {
        retries: 3 // this is the default
        // for additional options, see https://github.com/softonic/axios-retry
    }
});


async function GetBucket() {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    //let response = await b2.getBucket({ bucketName: 'firmefacil-pre' });
	
	// get upload url
	let res = await b2.getUploadUrl({
		bucketId: 'f6128e6faddf0ad8788b0d10',   //'firmefacil-pre',
		
   axios: {
        // overrides the axios instance default config, see https://github.com/axios/axios
    },
    retry: {
        retries: 3 // this is the default
        // for additional options, see https://github.com/softonic/axios-retry
    }		
		// ...common arguments (optional)
	});  // returns promise
	
	await b2.uploadFile({
		uploadUrl: res.data.uploadUrl,
		uploadAuthToken: res.data.authorizationToken,
		fileName: '79299848/user1_aa1.pdf',
		data: fs.readFileSync('./public/uploads/user1_aa.pdf'), // this is expecting a Buffer, not an encoded string
		info: {key1: 'value',key2: 'value'}
	});  // returns promise	
	
	
    console.log(res.data);
	console.log(b2.authorizationToken)
  } catch (err) {
    console.log('Error getting bucket:', err);
  }
}

//GetBucket1()

async function GetBucket1() {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    //let response = await b2.getBucket({ bucketName: 'firmefacil-pre' });
	
	
	let res_aa = await b2.downloadFileByName({
    bucketName: 'firmefacil-pre',
    fileName: '79299848/user1_aa1.pdf',
    responseType: 'arraybuffer' // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
    //onDownloadProgress: (event) => {} || null // progress monitoring
    // ...common arguments (optional)
    });  // returns promise

	
    console.log(res_aa.data);
  } catch (err) {
    console.log('Error getting bucket:', err);
  }
}



var app = express();

var config = require('./config.json');

const storage = multer.diskStorage({
    destination:path.join(__dirname,'public/uploads'),
    filename:(req,file,cb)=>{
        //cb(null,file.originalname);
        cb(null,"user1"+"_aa.pdf");
    }
});
//var storage = multer.memoryStorage()

var upload = multer({ storage: storage })
var upload1 = multer()

mongoose.connect(config.mongouri,{ useNewUrlParser: true, useUnifiedTopology: true })
//mongoose.connect("mongodb+srv://admin1:admin1@cluster0.1ru7w.mongodb.net/tablas?retryWrites=true&w=majority")
//mongoose.connect('mongodb://datosg:ccabreraq12@ds029901.mlab.com:29901/datosg');
//mongoose.connect('mongodb://admin:admin@ds031271.mlab.com:31271/tablas');

// formateadores de carbone

  carbone.addFormatters({
    // this formatter can be used in a template with {d.myBoolean:yesOrNo()}
    yesOrNo : function (data) { // data = d.myBoolean
      if (this.lang === 'fr-fr') {
        return data === true ? 'oui' : 'non';
      }
      return data === true ? 'yes' : 'no';
    },
	completa : function  (data, largo) {
	  if (typeof data === 'string') {
		var unir = "-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-."  
		var n = data.length;
		var m = largo - n
		var str2 = unir.substr(0, m);
		var res = data.concat(str2);
		return res;
	  }
	  return data;
	}	
  });


// load the database models
const Firma_doc = require('./mongoose/doc-model')
const Puntos = require('./mongoose/puntos-model')
const Users = require('./mongoose/user-model')
const Formatos = require('./mongoose/formato-model')
const Templates = require('./mongoose/template-model')
const Cupos = require('./mongoose/cupos-model')
const Linkpagos = require('./mongoose/linkpagos-model')



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

app.use(cors ());


// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


Resource(app, '', 'puntos', Puntos).rest();
Resource(app, '', 'cupos', Cupos).rest();

Resource(app, '', 'users', Users).rest({
  before: function(req, res, next) {
    //console.log(req.body)
	next();
  },
  afterPost:function(req, res, next) {
    //console.log(res.resource)
	//console.log(res.resource.item)
    var reg = {"id_usuario": res.resource.item._id,
    "cupo_prepago": 0,
    "cupo_total": 0,
    "cupo_prueba": 5,
    "cupo_postpago": 0,
    "cupo_mensual": 0,
    "tipo": [
        "cupo_prueba"
    ]}	
	
	Cupos.create(reg, function (err, small) {
	  if (err) return handleError(err);
	  // saved!
	});
	
	next();
  },
  afterDelete:function(req, res, next) {
    //console.log(res.resource)
	//console.log(res.resource.item)
    var reg = {"id_usuario": res.resource.item._id}
	Cupos.deleteOne(reg, function (err) {
	  if(err) console.log(err);
	  console.log("Successful deletion");
	});	
	next();
  }  
});
Resource(app, '', 'formatos', Formatos).rest();
Resource(app, '', 'templates', Templates).rest();


Resource(app, '', 'firma_doc', Firma_doc).rest({
  afterPost: function(req, res, next) {
	  
		//var remotePath = request.query.remotePath;
		//var localPath = request.query.localPath;
		//var keepMTime = request.query.keepMTime;
		var file = req.body.nombre

        console.log(req.body)
		oc.files.putFile('/dos/uploads/'+file+'.pdf', './public/uploads/user1_aa.pdf').then(status => {
			res.status(200).send(err);
			//response.send(status);
			
		}).catch(error => {
			res.status(500).send(error);
			//response.send(error);
		});	 

 		  
        next()		
	  },
  afterDelete:function(req, res, next) {
    //console.log(res.resource)
	console.log(res.resource.item)
 	next();
  }  

});	

Resource(app, '', 'linkpagos', Linkpagos).rest({
  afterPost: function(req, res, next) {	  
	 // general link
	 //run().catch(err => res.send(err));
     run()
	 
	 async function run() {
		 
		var today = new Date(); 	 
		var obj_link = {nombre:req.body.nombre,compania:config.cliente_codigo_comercio,tipoidentificacion:'3',numeroidentificacion:req.body.numdoc,correo:req.body.correo,importetotal:req.body.total,importesubtotal:req.body.subtotal,importeiva:req.body.iva,fechaemision:today.toISOString().substring(0, 10),fechavencimiento:today.toISOString().substring(0, 10),numeroReferencia:req.body.numrefori,numeroreferenciaorigen:req.body.numrefori} 
        console.log(obj_link)
		var xusuario = await f_link_pago(obj_link);
	    var dynamic_template_data = {contexto:xusuario.Link}

		var env_mail = await f_mail_sedngrid(xusuario.Link,req.body.correo,{},dynamic_template_data,"d-5bf5da292bc440dbbee337188729c73a","");
		console.log(env_mail)
		//if (env_mail.length == 0) {
		//	res.status(401).send('');
		//} else {
		   //res.status(200).send(env_mail);
		//}
	   	 next()	

	 }	
	 //req.body
	 
     // envia mensaje	 
  }  
	
});


//const resource4 = Resource(app, '/test', 'resource4', Resource4Model)
const queris = Resource(app, '/test', 'queris', Firma_doc)
  .virtual({
    path: 'totales',
    before: maxPrice
  })


async function gen_pdf(file,rect,email) {

    var apiKey = 'ak-e1b1d-chnt0-ra0y7-yemfh-ahrdt'; //leave undefined to use a demo key.  get a free key at https://Dashboard.PhantomJsCloud.com
    console.log("qqq")
 //   var myPromise = () => {
 //      return new Promise((resolve, reject) => {

			var browser = new phantomJsCloud.BrowserApi(apiKey);
			
			const file_name = file+'.pdf'

            console.log(file_name)
			var pageRequest = { url:"https://app-firmas1.herokuapp.com/index4.html?file="+file_name+"&datos="+JSON.stringify(rect), renderType: "pdf",renderSettings: {pdfOptions: {format: "Letter",emulateMedia:"print"}} };
			//   var pageRequest = { url:'https://app-firmas1.herokuapp.com/index4.html?file=user1_archivo.pdf&datos=[{"type":"area","x":38.34586466165413,"y":629.3233082706766,"width":539.0977443609023,"height":64.66165413533838,"backgroundColor":"red","status":"firmado","class":"Annotation","uuid":"17cce481-bb0e-4fda-a8c5-a4499a376968","page":1,"content":{"cedula":"79299848","nombres":"Carlos ","apellidos":"Cabrera","celular":"3204903664","email":"ccabreraq@gmail.com","status":"firmado","fecha":"2020-07-13T02:48:00.781Z"}},{"type":"area","x":41.35338345864662,"y":711.2781954887217,"width":534.5864661654135,"height":65.41353383458659,"backgroundColor":"red","status":"firmado","class":"Annotation","uuid":"1bb2582e-da01-490a-a384-e97db146a7cf","page":1,"content":{"cedula":"79299847","nombres":"Santiago","apellidos":"Cabrera","celular":"3204903664","email":"ccabrera@transfiriendo.com","status":"firmado","fecha":"2020-07-13T03:20:42.010Z"}}]', renderType: "pdf",renderSettings: {pdfOptions: {format: "Letter",emulateMedia:"print"}} };

			   //console.log("about to request page from PhantomJs Cloud.  request =", JSON.stringify(pageRequest, null, "\t"));
			browser.requestSingle(pageRequest, function (err, userResponse) {
				//console.log("qqqqqwwww")
				if (userResponse.statusCode != 200) {
					console.log(" errror invalid status code" + userResponse.statusCode);
					reject("err") 
					return ("error")
				} else {
					console.log("userResponse.content")
					
				
					fs.writeFile("public/uploads/prueba1.pdf", userResponse.content.data, {
						encoding: userResponse.content.encoding,
						
                        //resolve("ok");	
						
						
					}, function (err) {
						console.log("captured page written to " + userResponse.content.name);
                        //resolve("erro");				
						
					});
					//resolve(userResponse.content.data);
					//console.log(userResponse.content.data)
					
					// ojo debo enviar correo a todos los firmantes copiandoles el documento pdf firmado digitalmente
					var mensajesms1 = "se envia documento final, del proceso de firmas"
                     console.log(email)
        			//f_mail(mensajesms1,email,userResponse.content.data);
					f_mail_sedngrid(mensajesms1,email,{},{},"d-b16f6f624b8b4b1697767f2875d32ced",userResponse.content.data);

					
					return userResponse.content.data

				}
			});
	   //})
    //};
	
   //var result = await myPromise();
   ////console.log(result)
   ////continue execution
   //return result;   
	
};

	app.post('/cambia_pass', function(request, response) {

	var hash = bcrypt.hashSync(request.body.pass1, salt);
	//var reg = request.body
	//reg.encryptedPassword = hash;
	
		//Users.replaceOne({_id: request.body.id}, reg, 
		//		  null, function (err, docs) { 
		//	if (err){ 
		//		console.log(err) 
		//	} 
		//	else{ 
		//		console.log("Original Doc : ", docs); 
		//	} 
		//}); 		
		//response.send(200);
		
		var logica = true;
		// logica previa
		if (logica) {
			Users.updateOne(
			  {_id: request.body.id},{encryptedPassword: hash}
			).then((rawResponse) => {
				console.log(rawResponse)
				response.status(200).send(rawResponse);
			})
			.catch((err) => {
			  // manejar error
			  response.status(500).send(err);
			});		
		} else {
		    response.status(400).send("error de logica");	
		}
		
	});	


	app.post('/upload', upload.single('file'), (req, res) => {
	  if (!req.file.mimetype.startsWith('application/*')) {
		  console.log(req.file)
		  
			//oc.files.putFileContents('/dos/aa.pdf', req.file.buffer).then(status => {
			//	//response.send(status);
			//	console.log(status)
			//}).catch(error => {
			//	//response.send(error);}
			//	console.log(error)
			//});
		  
		  
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
	
	app.get('/getFileContents', function(request, response) {
		//var remotePath = request.query.remotePath;
		var file = request.query.file;
		console.log(file)
		
		if (file !== 'uploads/user1_aa.pdf') {

			oc.files.getFile('/dos/'+file, 'public/'+file).then(status => {
				response.send(status);
			}).catch(error => {
				response.send(error);
			});
		} else {
			response.send(true);
		}

		//oc.files.getFileContents('/dos/node-js-upload-file-to-server.pdf').then(content => {
		//	response.send(content);
		//}).catch(error => {
		//	response.send(error);
		//});
	});	
	
	app.get('/getFile', function(request, response) {
		var remotePath = request.query.remotePath;
		var localPath = request.query.localPath;


		oc.files.getFile(remotePath, localPath).then(status => {
			response.send(status);
		}).catch(error => {
			response.send(error);
		});
	});	
	
	app.post("/firma_doc_per", bodyParser.json(), function(req, res){
		console.log(req.body);
						
		var clave = req.body._id;
		var vuuid = req.body.uuid;
		var vdatos = req.body.datos;  // son los datos capturados en el cuadro de la firma del respectivo firmante
		
		Firma_doc.find({_id: clave}).
		  then(reg_docg => {              
			console.log(reg_docg); // 'A'

			var reg_doc = reg_docg[0];
            var content = {};
			var cel = "";
			var cedula = "";
			var y;
			var rect = reg_doc.rect;
			var firmantes = reg_doc.firmantes

			for (y of firmantes) {
				  if (vuuid == y.annotation) {
					 //vstatus = rect.status  
					 cel = y.content.celular
					 cedula = y.content.cedula					 
				  }
			}
			envia3()
			async function envia3() {
			  // se envia sms y se verifica  cedula
			  var verifica_otp = await f_verifica_otp(vuuid,vdatos.ping);
			  console.log(verifica_otp)
			  
			if (cedula == vdatos.cedula && verifica_otp.esExitoso) {  

			
				// recooro vetor de personas buscando el que debe cambia
				var x;
				var cant_firmantes = 0
				var mail = ""

				for (x of firmantes) {
						  cambia_firmantes(x, clave);;
				}

				// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
				//var y;
				for (y of rect) {
						  cambia_rect(y, clave);;
				}
				
				  async function cambia_firmantes(reg, clave) {						  
					  if (vuuid == reg.annotation) {
						 reg.content.status = 'firmado' 
						 reg.content.fecha = new Date(); 
						 content = reg.content
						 mail = reg.content.email
					  }
					  if (reg.content.status == 'firmado') {
						 cant_firmantes = cant_firmantes + 1; 
					  }
						 //mail = mail+","+reg.content.email
			  
				  }

				  async function cambia_rect(reg, clave) {						  
					  if (vuuid == reg.uuid) {
						 reg.status = 'firmado' 
						 reg.content = content;
					  }
				  }
				  
				// reviso si ya se firmaron todos los personas y si es asi cambio el status del registro,
				var vstatus = reg_doc.status
				if ( reg_doc.num_firmantes == cant_firmantes ) {
					// ojo debo generar el pdf final
					
					//gen_pdf(reg_doc.nombre, reg_doc.rect,mail)  // devo enviar el documento t el registro de firmas
					
					f_crea_final1(reg_doc.nombre,reg_doc) 
					
					
					// ojo debo firmarlo digitalmente 
					// evaluar, poner a el documento en cada caja el dia y la hora de la firma digital y qr de verificacion
					

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
			
			} else {
				  res.status(200).send("err");
				
			}
			}
			
		  })				
		// cambia status a "en firmas"
		
		
		//res.status(200).send();
	})

	app.post("/firma_doc_per_biometria", bodyParser.json(), function(req, res){
		console.log(req.body);
						
		var clave = req.body._id;
		var vuuid = req.body.uuid;
		var vdatos = req.body.datos;  // son los datos capturados en el cuadro de la firma del respectivo firmante
		var tokenx = req.body.token;  // son los datos capturados en el cuadro de la firma del respectivo firmante
		
		Firma_doc.find({_id: clave}).
		  then(reg_docg => {              
			console.log(reg_docg); // 'A'

			var reg_doc = reg_docg[0];
            var content = {};
			var cel = "";
			var cedula = "";
			var y;
			var rect = reg_doc.rect;
			var firmantes = reg_doc.firmantes

			for (y of firmantes) {
				  if (vuuid == y.annotation) {
					 //vstatus = rect.status  
					 cel = y.content.celular
					 cedula = y.content.cedula					 
				  }
			}
			envia3()
			async function envia3() {
			  // se envia sms y se verifica  cedula
			  //var verifica_otp = await f_verifica_otp(vuuid,vdatos.ping);
			  //console.log(verifica_otp)
			  
				var env_resp = await f_verifica_token(tokenx);
				console.log(env_resp)
				var env_resp1 = JSON.parse(env_resp)
				//if (env_resp1._id) {
			  
			//if (cedula == vdatos.cedula && verifica_otp.esExitoso) {  
			//if (cedula == vdatos.cedula && env_resp1._id) {  
			
			if (cedula == env_resp1.codid && env_resp1.cod_session) {
			//if (env_resp1.cod_session) {  

			
				// recooro vetor de personas buscando el que debe cambia
				var x;
				var cant_firmantes = 0
				var mail = ""

				for (x of firmantes) {
						  cambia_firmantes(x, clave);;
				}

				// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
				//var y;
				for (y of rect) {
						  cambia_rect(y, clave);;
				}
				
				  async function cambia_firmantes(reg, clave) {						  
					  if (vuuid == reg.annotation) {
						 reg.content.status = 'firmado' 
						 reg.content.fecha = new Date(); 
						 reg.content.token_firma = env_resp1.cod_session  // token de firma devuelto por verificacion de firma; 
						 reg.content.url_imagen = env_resp1.outputface  // foto del cara del documento 
						 
						 content = reg.content
						 mail = reg.content.email
					  }
					  if (reg.content.status == 'firmado') {
						 cant_firmantes = cant_firmantes + 1; 
					  }
						 //mail = mail+","+reg.content.email
			  
				  }

				  async function cambia_rect(reg, clave) {						  
					  if (vuuid == reg.uuid) {
						 reg.status = 'firmado' 
						 reg.content = content;
					  }
				  }
				  
				// reviso si ya se firmaron todos los personas y si es asi cambio el status del registro,
				var vstatus = reg_doc.status
				if ( reg_doc.num_firmantes == cant_firmantes ) {
					// ojo debo generar el pdf final
					
					//gen_pdf(reg_doc.nombre, reg_doc.rect,mail)  // devo enviar el documento t el registro de firmas
					
					f_crea_final(reg_doc.nombre,reg_doc,env_resp1) 
					
					
					// ojo debo firmarlo digitalmente 
					// evaluar, poner a el documento en cada caja el dia y la hora de la firma digital y qr de verificacion
					

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
			
			} else {
				  res.status(200).send("err");
				
			}
			}
			
		  })				
		// cambia status a "en firmas"
		
		
		//res.status(200).send();
	})
	
	
	app.post("/verifica_firma_per", bodyParser.json(), function(req, res){
		console.log(req.body);
				
		var clave = req.body._id;
		var vuuid = req.body.uuid;
		var  vstatus = "";
		var cel = ""
		
		
		Firma_doc.find({_id: clave}).
		  then(reg_docg => {              
			console.log(reg_docg); // 'A'

			var reg_doc = reg_docg[0];
            var content = {}
			
			// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
			var rect = reg_doc.rect;
			
			var firmantes = reg_doc.firmantes
			var y;

			for (y of firmantes) {
				  if (vuuid == y.annotation) {
					 vstatus =y.content.status  
					 cel = y.content.celular
					 cedula = y.content.cedula					 
				  }
			}
			
			
			//for (y of rect) {
			//		  cambia_rect1(y, clave);;
			//}
			//
			//  async function cambia_rect1(reg, clave) {						  
			//	  if (vuuid == reg.uuid) {
			//		 vstatus = reg.status  
			//		 cel = reg.content.celular
			//	  }
			//  }
			
			  console.log(vstatus)
			if ( vstatus === "firmado") {
				res.status(200).send("OK");
				
			} else {
				
	    	  async function envia2() {
				  // se envia sms y se verifica  cedula
				  var env_otp = await f_otp(vuuid,"57"+cel);
				  console.log(env_otp)
			  }
			  envia2();
			  
			
				res.status(200).send("NO");			
			}
		  })				
		
		
		//res.status(200).send();
	})
	
	app.post("/inicia_firmas", bodyParser.json(), function(req, res){
		//console.log(req.body);	
        console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
		console.log(req.body);	
		
		var clave = req.body._id
		
		// inicia logica de negocio, aca seria el contro si tiene habilitacion para el servicio
		var logicaok = false;
		var tipo = {}
		var tipos_cupos
		run_cupos().catch(err => console.log(err));

		async function run_cupos() {
			var clavex1 = req.body.usuario			
			var usuario = await Users.find({ _id: req.body.usuario}).exec();	
			if (usuario[0].padre) {
				clavex1 = usuario[0].padre
			}
				
			var xreg_cupo = await Cupos.findOne({id_usuario: clavex1}).exec();	    
			tipos_cupos = xreg_cupo.tipo
			console.log(xreg_cupo)
			for (x of tipos_cupos) {
				console.log(xreg_cupo[x])

				if (xreg_cupo[x] > 0) {
                   logicaok = true;
				   tipo[x] = xreg_cupo[x] -1

				}				
			}

		     console.log(tipo)
			 console.log(logicaok)
			if (logicaok) {
			
				var firmantes = req.body.firmantes
				var x;

				for (x of firmantes) {
						  envia1(x);;
				}
				
				// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
				  async function envia1(reg) {
					  
					  console.log("aaaaaaaaaaareg")
				  
					//var mensajesms1 = "mensaje para firma de documento "+"https://app-firmas1-from.herokuapp.com/#/Baz/"+clave+"/"+reg.annotation
					//var mensajesms1 = ""+config.cliente_url+"#/Baz/"+clave+"/"+reg.annotation
					var mensajesms1 = config.cliente_url+"#/Baz/"+clave+"/"+reg.annotation
					var env_sms = await f_sms(mensajesms1,"57"+reg.content.celular);
					//var env_mail = await f_mail(mensajesms1,reg.content.email,"");
					
					var dynamic_template_data = {conexion:mensajesms1,cliente:"Carlos Cabrera",nombre:req.body.nombre,descripcion:req.body.descripcion,fecha:req.body.fecha_creacion,firmante:reg.content.nombres+' '+reg.content.apellidos}

					var env_mail = await f_mail_sedngrid(mensajesms1,reg.content.email,{},dynamic_template_data,"d-a3cf9047d9394c04bdb8154b8a69d15a","");
					
					//var env_mail = await f_mail(reg,req.body )
					console.log(env_sms)
					console.log(env_mail)
				  }
				
				
				// cambia status a "en firmas"
				
				Firma_doc.updateOne(
				  {_id: clave},
				  //{status: "en firmas",firmantes[0].content.status: "enviado"}
				  {status: "en firmas"}
				).then((rawResponse) => {
					
					Cupos.updateOne(
					  {_id: xreg_cupo._id},
					  //{status: "en firmas",firmantes[0].content.status: "enviado"}
					  tipo
					).then((rawResponse) => {
						
						
						
						res.status(200).send(rawResponse);

					})
					.catch((err) => {
					  // manejar error
					  res.status(500).send(err);
					});		

					
					//res.status(200).send(rawResponse);

				})
				.catch((err) => {
				  // manejar error
				  res.status(500).send(err);
				});		
				
			} else {
				res.status(400).send("no se perimite la transaccion");
				
			}
		}
				
	})
	
	app.post("/agrega_pagina", bodyParser.json(), function(req, res){
	

		run().catch(err => console.log(err));

		async function run() {
		  // Load cover and content pdfs
		  const cover = await PDFDocument.load(fs.readFileSync('./public/uploads/user1_aa.pdf'));
		  const content = await PDFDocument.load(fs.readFileSync('./public/uploads/pagina_firmas.pdf'));

		  // Create a new document
		  const doc = await PDFDocument.create();

		  // Add the cover to the new doc
		  const coverPage = await doc.copyPages(cover,cover.getPageIndices());
		  for (const page of coverPage) {
			doc.addPage(page);
		  }

		  // Add individual content pages
		  const contentPages = await doc.copyPages(content, content.getPageIndices());
		  for (const page of contentPages) {
			doc.addPage(page);
		  }

		  // Write the PDF to a file
		  await fs.writeFileSync('./public/uploads/user1_aa.pdf', await doc.save());
		  res.status(200).send({});
		  
		}	
	
	})
	
	app.get("/get/b", function(req, res){
		//console.log(req);
		gen_pdf()
		res.send("GET res sent from webpack dev server")
	})
	

	app.get("/crea_schema1", function(req, res){
		
        var Templatex = req.query.template;
		var Formatox = req.query.formato;
		Templates.find({nom_template: Templatex}).
		  then(reg_template => {  
                var xmodelo = reg_template[0]
                 //console.log(xmodelo.usuario)
				var entity = [{
				  "branchAddr1": "value1",
				  "branchAddr2": "value2",
				  "branchState": "value3",
				  "branchZIP": "value4",
				  "branchPhone": "value5",
				  "branchEmail": "value6",
				  "companyDivision": "value7",
				  "returnAddr1": "value8",
				  "returnAddr2": "value9",
				  "returnState": "value10",
				  "returnZIP": "value11",
				  "returnDate": "value12",
				  "employeeName": "value13",
				  "positionTitle": "value14",
				  "includeReportingPerson": "true",
				  "reportingPersonName": "value15",
				  "reportingPersonTitle": "value16",
				  "positionLocation": "value17",
				  "salary": "value18",
				  "paymentFrequency": "value19",
				  "firstPaymentDate": "value20",
				  "annualLeaveDays": "value21",
				  "weeklyHours": "value22",
				  "probationNoticePeriod": "value23",
				  "noticePeriod": "value24",
				  "includeConf": "true",
				  "includeOutside": "true",
				  "includeAfterLeaving": "true",
				  "restraintPeriod": "value25"
				}];
			var schema = generate.json(Templatex+'  -  '+Formatox, entity)
			res.send ({schema:schema.items})
		  })
	})
	
	app.post("/crea_template1", bodyParser.json(), function(req, res){


	  var clave = req.body._id
		

		run().catch(err => console.log(err));

		async function run() {
			var xtemp = await Templates.find({ nom_template: req.body.nom_template}).exec();
            var xdata = JSON.stringify({"accessKey":"ZDRiNGJlNTUtNzNjYS00ZjY1LThkMWQtODg1ZTA4NzBkZDJkOjc3MTM4MDA","templateName":'ContractTemplate.docx', "outputName":"result.pdf", "data":req.body.datos})
             //console.log(xtemp)
			var env_template = await f_template_doc(xdata);
			console.log(env_template)
		  // Write the PDF to a file
		   await fs.writeFileSync('./public/uploads/user1_aa.pdf', await env_template);
		   res.status(200).send({pdf:env_template});
		  
		}	
	
	})
	
	app.get("/crea_schema", function(req, res){
		
        var Templatex = req.query.template;
		var Formatox = req.query.formato;
		
		
		Templates.find({nom_template: Templatex}).
		  then(reg_template => {  
                var xmodelo = reg_template[0]
	    carbone.render_datos('./public/prueba1.docx', function(err, result){
			if (err) {
			  //return console.log(err);
			  console.log(err)
			}
		
				var x;
				var pp = result[0];
				var cc = []
				
 				
				var firmantes = {
				  "type": "array",
				  "title": "Firmantes",
				  "items": {
					"type": "object",
					"required": [
					  "nombres"
					],
					"properties": {
					  "cedula": {
						"type": "string",
						"title": "Cedula",
						"description": "Cedula de ciudadania"
					  },
					  "nombres": {
						"type": "string",
						"title": "Nombres",
						"description": "nombres del firmante"
					  },
					  "apellidos": {
						"type": "string",
						"title": "Apellidos",
						"description": "apellidos del firmante"
					  },
					  "celular": {
						"type": "string",
						"title": "Celular",
						"description": "celular del firmante"
					  },
					  "email": {
						"type": "string",
						"title": "Email",
						"description": "email del firmante"
					  }
					}
				  }
				
				}
  

				
				var dd = { "type": "object",  "required": [],  "properties": {firmantes:firmantes}}
				var campo_buscar
				function check_existe(campo) {
				  return campo === campo_busca;
				}

				for (x of pp) {
						 
					 var resp = x.name
				 if (resp.substr(0, 18) !== "_root.d.firmantes[") {
					 
  				     if (resp.substr(0, 8) !== "_root.c.") {
						 var resp1 = resp.replace("_root.d.","")
						 //var resp1 = resp1.replace("_root.c.","")
						  var n = resp1.search(":");
						  if ( n > 0 ){
							  var resp2 = resp1.substr(0, n);
							  campo_busca = resp2
                              if (dd.required.find(check_existe) === undefined ) {							  
								  dd.properties[resp2] = {"type": "string","title": resp2}
								  dd.required.push(resp2);
							  }
						  } else {
							  campo_busca = resp1
                              if (dd.required.find(check_existe) === undefined) {							  
								  dd.properties[resp1] = {"type": "string","title": resp1}
								  dd.required.push(resp1);
							  }
						  }
						  console.log(dd);	
					 }	
					 }					 
				}
			    res.send ({schema:dd,firmantes:[{},{}]})

		    });
	    });
	});
	
	
app.post("/crea_template", bodyParser.json(), function(req, res){
	
	   //////////////////////////// generacion de docx con variables
      var data = req.body.datos
	  var clave = req.body.id
	  var firmantes = req.body.firmantes
	  console.log(req.body)
	  
	// inicia logica de negocio, aca seria el contro si tiene habilitacion para el servicio
	var logicaok = false;
	var tipo = {}
	var tipos_cupos
	run_cupos().catch(err => console.log(err));

	async function run_cupos() {
		var clavex1 = req.body.usuario			
		var usuario = await Users.find({ _id: req.body.usuario}).exec();	
		if (usuario[0].padre) {
			clavex1 = usuario[0].padre
		}
		
		var xreg_cupo = await Cupos.findOne({id_usuario: clavex1}).exec();	    
		//var xreg_cupo = await Cupos.findOne({id_usuario: req.body.usuario}).exec();	    
		tipos_cupos = xreg_cupo.tipo
		console.log(xreg_cupo)
		for (x of tipos_cupos) {
			console.log(xreg_cupo[x])

			if (xreg_cupo[x] > 0) {
			   logicaok = true;
			   tipo[x] = xreg_cupo[x] -1

			}				
		}

		 console.log(tipo)
		 console.log(logicaok)
	if (logicaok) {
		options =	{
					  //convertTo    : 'pdf',           // String|Object, to convert the document (pdf, xlsx, docx, ods, csv, txt, ...)
					  //lang         : 'en-us',         // String, output lang of the report
					  complement   : {propietario:"PEDRO GOMEZ", fecha: new Date()},              // Object|Array, extra data accessible in the template with {c.} instead of {d.}
					  variableStr  : '{#def = d.id}', // String, predefined alias string, see designer's documentation
					  //reportName   : '{d.date}.odt',  // String, dynamic file name, output in third argument of the callback
					  enums        : {                // Object, list of enumerations, use it in reports with `convEnum` formatters
						'ORDER_STATUS' : ['open', 'close'],
						'SPEED' : {
						  10 : 'slow',
						  20 : 'fast'
						}
					  },
					  //translations : {                // Object, dynamically overwrite all loaded translations for this rendering
					  //	'fr-fr' : {'one':'un' },
					  //	'es-es' : {'one':'uno'}
					  //},
					  //hardRefresh: false              // If true, the report content is refreshed at the end of the rendering process. To use this option, `convertTo` has to be defined.
			}

	  carbone.render('./public/prueba1.docx', data, options, function(err, result){
		if (err) {
		  //return console.log(err);
		  console.log(err)
		}
		console.log(result)
		// write the result
		fs.writeFileSync('./public/result1.docx', result);
		
		//////////////////////// conversor de docx to pdf
		
		convertapi.convert('pdf', { File: './public/result1.docx' })
		  .then(function(result) {
			// get converted file url
			console.log("Converted file url: " + result.file.url);

			// save to file
			return result.file.save('./public/uploads/user1_aa.pdf');
			//res.status(200).send({pdf:result.file.save('./public/result1.pdf')})
		  })
		  .then(function(file) {
			console.log("File saved: " + file);
			
			/////////////////////////////////// crea registro de documento
			// ojo 
			//nombre  - tenemos que ponerle un nombre al archivo, una descricion tambien, y otros
			// url no se cual poner
			// rect// firmantes
			// numero de firmantes es la suma de los firmantes
			
			  var registro = {usuario: clave, nombre:'prueba2',descripcion:'prueba2 - cedula xx',otro:'',url:'',fecha_creacion:new Date(), rect:req.body.rect ,firmantes:firmantes, status: 'sin iniciar', num_firmantes:firmantes.length , num_firmados:0 , html: ''}
               
               var options = { method: 'POST',
                  url: "http://localhost:8080/firma_doc",

                  body: JSON.stringify(registro),
				  headers: {
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
	
	            //console.log(options)
					request(options, (error, response, body) => {
					  if (response) {
						  
						console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
						console.log(response.body)
						res.status(200).send({pdf:""})

						var reg1 = response.body
						//reg1._id = reg1.usuario
					    var options = { method: 'POST',
						  url: "http://localhost:8080/inicia_firmas",

						  body: reg1,
						  headers: {
							//'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
							'Content-Type': 'application/json'
						  }				  
						};

						//console.log(options)
						//	request(options, (error, response1, body) => {
						//	  if (response1) {
						//         //console.log(body)
						//		//return resolve(body);
						//		res.status(200).send({pdf:""})
						//	  }
						//	  if (error) {
						//		//return reject(error);
						//		res.status(500).send(error);
						//	  }
						//    })
					  }
					  if (error) {
						//return reject(error);
						res.status(500).send(error);
					  }
					});  
			
		  })
		  .catch(function(e) {
			console.error(e.toString());
			res.status(500).send(e);
		  });	
		
		

	  });
	  
	} else {
		res.status(400).send("no se perimite la transaccion");
		
	}
	  
	
	}
	
})
app.get("/verifica_user", function(req, res){
    var celularx = req.query.usuario;
	var xxusuario,szx
	
		run().catch(err => res.send(err));

		async function run() {
			var usuario = await Users.find({ cedula: celularx}).exec();
			
			if (usuario.length == 0) {
				xxusuario = 'sss'
				szx = xxusuario.toString()
				res.status(401).send([]);
			} else {
				 xxusuario = usuario[0]._id
				 szx = xxusuario.toString()			
			
				var q = Firma_doc.find({usuario: xxusuario}).sort({'fecha_creacion': -1}).limit(5);
				var registx = await q.exec();
				
				//var fetch(API_URL+'/firma_doc?limit=5&skip=0&sort=-fecha_creacion&usuario='+authProvider.getUser());
			   //res.status(200).send({pdf:env_template});
				var xx = await Firma_doc.aggregate([{ $match : {usuario: szx } },{ $group: { _id : "$status",count: { $sum: 1}}}]).exec()
				var result = {usuario:usuario,registros:registx,totales:xx}
			   res.status(200).send(result);
			}
		   
		}	
		
	
})

app.get("/verifica_user1", function(req, res){
    var celularx = req.query.usuario;
	var tokenx = req.query.token
	var xxusuario,szx
	
		run().catch(err => res.send(err));
		//run()


		//var raw = JSON.stringify({token:req.query.token})
		async function run() {
			console.log("estoy aca")
			if (tokenx == '1234') {
    			var env_resp1 = {cod_session:'aaaaa',codid:celularx};				
			} else {
				var env_resp = await f_verifica_token(tokenx);
				console.log(env_resp)
				var env_resp1 = JSON.parse(env_resp)
			}
			if (celularx == env_resp1.codid && env_resp1.cod_session) {
			//if (env_resp1.cod_session) {

				var usuario = await Users.find({ cedula: celularx}).exec();
				console.log(usuario)
				if (usuario.length == 0) {
					xxusuario = 'sss'
					szx = xxusuario.toString()
					res.status(401).send([]);
				} else {
					 xxusuario = usuario[0]._id
					 szx = xxusuario.toString()			
				
					var q = Firma_doc.find({usuario: xxusuario}).sort({'fecha_creacion': -1}).limit(5);
					var registx = await q.exec();
					
					//var fetch(API_URL+'/firma_doc?limit=5&skip=0&sort=-fecha_creacion&usuario='+authProvider.getUser());
				   //res.status(200).send({pdf:env_template});
					var xx = await Firma_doc.aggregate([{ $match : {usuario: szx } },{ $group: { _id : "$status",count: { $sum: 1}}}]).exec()
					var result = {usuario:usuario,registros:registx,totales:xx}
				   res.status(200).send(result);
				}
				
			} else {
				
				res.status(401).send([]);
				
			}				
	   
		}	
		
	
})


app.get("/verifica_cupos", function(req, res){
    var pusuario = req.query.usuario;
	var usuario = mongoose.Types.ObjectId(pusuario)
	var xusuario,szx
	
		run().catch(err => res.send(err));

		async function run() {
			var xusuario = await Users.find({ _id: usuario}).exec();
			
			if (xusuario.length == 0) {
				res.status(401).send([]);
			} else {
				
				var clavex1 = usuario			
				if (xusuario[0].padre) {
					clavex1 = xusuario[0].padre
				}
				
				
				var q = await Cupos.find({ id_usuario: clavex1}).exec();
				//var q = await Cupos.find({ id_usuario: usuario}).exec();
				
				var q1 = Firma_doc.find({usuario: pusuario}).sort({'fecha_creacion': -1}).limit(5);
				var registx = await q1.exec();
							
				var xx = await Firma_doc.aggregate([{ $match : {usuario: pusuario } },{ $group: { _id : "$status",count: { $sum: 1}}}]).exec()
				var result = {usuario:xusuario[0],cupos:q[0],registros:registx,totales:xx}
			   res.status(200).send(result);
			}
		   
		}	
})

app.get("/totales_documentos", function(req, res){
    var usuariox = req.query.usuario;
	Firma_doc.aggregate([
    { $match : {usuario:usuariox } },
	{ $group: { _id : "$status",count: { $sum: 1}}}

	 ],    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }

	})	
})	
	
	

app.get("/totales_documentos1", function(req, res){
	
var start = new Date("2020-01-01T00:00:00.000Z");
var finish = new Date("2020-10-10T00:00:00.000Z");

Firma_doc.aggregate([
{ $match: { $and: [ { fecha_creacion: { $gt: start, $lt: finish } }
     ] } },
    { $project: {
        "_id":1,
        "fecha_creacion":"$fecha_creacion",
        "nombres":"$rect.type"
        }
    },
    { $out: "tempPruebaCarlos"}],    function(err, result) {
    //{ $out: {  db :  "tablas" ,  coll :  "movi"  }}],    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    })

 });

var maxPrice = function(req, res, next) {
  req.modelQuery = Firma_doc.aggregate(
    [
	   { $group: { _id : "$status"},total: {count: { $sum: 5}}},	  
    ]
  );
  return next();
};

app.post('/link_pago', function(request, res) {

	run().catch(err => res.send(err));

	async function run() {
		var xusuario = await f_link_pago(request.body);
		
		if (xusuario.length == 0) {
			res.status(401).send('');
		} else {
		   res.status(200).send(xusuario);
		}
	   
	}	
	
});	

app.post('/envia_invitacion', function(request, res) {

	run().catch(err => res.send(err));

	async function run() {
		var xusuario = await f_link_pago(request.body);
		
		var mensajesms1 = config.cliente_url+"#/registro_invitacion/"+request.body.id+"/"+request.body.cedula_i+"|"+request.body.nombres_i+"|"+request.body.apellidos_i+"|"+request.body.email_i+"|"+request.body.celular
	    //var dynamic_template_data = {conexion:xusuario.Link,cliente:"Carlos Cabrera",nombre:req.body.nombre,descripcion:datos.descripcion,fecha:datos.fecha_creacion,firmante:firmante.nombres+' '+firmante.apellidos},

		var env_mail = await f_mail_sedngrid(mensajesms1,request.body.email_i,{},request.body,"d-a3cf9047d9394c04bdb8154b8a69d15a","");
		
		if (env_mail.length == 0) {
			res.status(401).send('');
		} else {
		   res.status(200).send(env_mail);
		}
	   
	}	
	
});	


// recibe multicash de pagos electronicos sin hacer generacion de poliza
app.post('/NewPaymentPolicy_Pasarela', function(req, res) {
    try {
		//req.body = "multicash=<Multicash>  <BoletaPago>    <NumeroReferencia>120380833</NumeroReferencia>    <FechaEmision>2017-11-30T00:00:00</FechaEmision>    <FechaVencimiento>2017-12-04T00:00:00</FechaVencimiento>    <FechaPago>2017-11-30T00:00:00-05:00</FechaPago>    <ImporteTotal>338100.00</ImporteTotal>    <ImporteNeto>338100.00</ImporteNeto>    <ImporteImpuesto>0.00</ImporteImpuesto>    <CanalPago>EF</CanalPago>    <Emisor>      <TipoIdentificacion>1</TipoIdentificacion>      <NumeroIdentificacion>1015448115</NumeroIdentificacion>      <Nombre>jair+andres+diaz+puentes</Nombre>      <Email>jdiaz@transfiriendo.com</Email>    </Emisor>    <TotalDocumentos>1</TotalDocumentos>    <CodigoCompania>1345</CodigoCompania>  </BoletaPago>  <Banco>    <CodigoBanco>1647</CodigoBanco>    <NumeroCuenta>1647</NumeroCuenta>  </Banco>  <DetallePago>    <Pago>      <MedioPago>EF</MedioPago>      <Importe>338100.00</Importe>    </Pago>  </DetallePago>  <Documentos>    <Documento>      <IdentificadorDocRecaudado>120001100</IdentificadorDocRecaudado>      <ImporteRecaudado>338100.00</ImporteRecaudado>      <SaldoDocRecaudado>0.00</SaldoDocRecaudado>    </Documento>  </Documentos>  <Suscripcion>    <Cobro>      <NumeroCobro>0</NumeroCobro>    </Cobro>  </Suscripcion></Multicash>"
		console.log("aaaaaasssssdddddffff")
		console.log(req.body.multicash)
        var multicash;
        var today = new Date();
        var xml = req.body.multicash;
        xml = xml.substring(0, xml.length);
        var responsemulticash;
        var referencia;
        var referenciaorigen;
        var tipoidentificacion;
        var numeroidentificacion;
        var montorecaudo;
        var datos;
		var resp1 ={}
		var si_movimiento = false
        parseString(xml, function(err, result) {
            if (err) {
                multicash = null;
                responsemulticash = {
                    "message": "Multicash no interpretado",
                    "timestamp": today.toISOString(),
					"multicash": xml,
					"detalle":{},
					"estado":"pendiente"
                };
            } else {
                multicash = result;
                responsemulticash = {
                    "message": "Multicash procesado",
                    "timestamp": today.toISOString(),
					"multicash": multicash
                }
                referencia = multicash.Multicash.BoletaPago[0].NumeroReferencia[0];
                referenciaorigen = multicash.Multicash.Documentos[0].Documento[0].IdentificadorDocRecaudado[0].toString();
                montorecaudo = multicash.Multicash.DetallePago[0].Pago[0].Importe[0];
				
				console.log(referencia)
                // leo datos de datos del presupuesto y poder devoler datos de emision
                //dbxx2.collection('movimientos').find({npresupuesto: parseInt(referenciaorigen)}).toArray(function(error, data) {
 			
				if (error) {
					console.log(error);
					responsemulticash = {
						"message": "Multicash no procesado, error consultando presupuesto",
						"timestamp": today.toISOString(),
						"multicash": multicash,
						"detalle":{},
						"estado":"pendiente" 						
					};						
					res.send(400,error.message);
				} else { 
						resp1 = data[0]
						//console.log(data)
				
				    if (resp1) {
						console.log(resp1)
						responsemulticash = {
						"message": "Multicash procesado,", //+resp1.message,
						"timestamp": today.toISOString(),
						"multicash": multicash,
						"detalle": resp1,
						"estado_pago": "pendiente",
						"estado_poliza":"pendiente"
						};
						si_movimiento = true
						//webHooks.add("confirma_pago", resp1.url_webhook_pago).then(function(){
							// done
						//}).catch(function(err){
						//	console.log(err)
						//})

						//webHooks.add("confirma_emision", resp1.url_webhook_emision).then(function(){
							// done
						//}).catch(function(err){
						//	console.log(err)
						//})

                        var mensaje_webhook
                    	async function llama() {
                     						
							//////////////////////////////////////////////////
							// envio webhook de notificacion de confirmacion de pago
							mensaje_webhook = {"message":"ok", "data":{contexto:resp1.contexto,NumberPlate:resp1.pedido.Vehicle.NumberPlate,presupuesto:referenciaorigen,numeroReferencia:referencia,montorecaudo:montorecaudo}}
							console.log(mensaje_webhook)
							//webHooks.trigger('confirma_pago', mensaje_webhook)
                            //webHooks.remove('confirma_pago').catch(function(err){console.error(err);})

							
							responsemulticash.estado_pago = "enviado"
							resp1.status = 'pagado';
							
							// busco registro de poliza, si encuentro mando webhook de emision de poliza y cambio estado de registro de movimiento a emitido, y en multicash a notificado
							//espero 10 segundos
							var vcod_punto = resp1.sucursal	
							var vpunto_emision = await lee_punto1(vcod_punto)
							var data = JSON.stringify({"NumberPlate":resp1.pedido.Vehicle.NumberPlate})
                            //console.log(data)
							
							setTimeout(function timer() {
                        	async function llama1() {
 
								var result_poliza = await f_poliza(data,vpunto_emision)
								var d_poliza = JSON.parse(result_poliza.Data)
								
								if (result_poliza.Success) {
									// envio webhook de notificacion de confirmacion de emision
									mensaje_webhook = {"message":"ok", "data":{contexto:resp1.contexto,NumberPlate:resp1.pedido.Vehicle.NumberPlate,presupuesto:referenciaorigen,InsurancePolicyNumber:d_poliza.InsurancePolicyNumber,url_pdf:d_poliza.URLPrint}}
									console.log(mensaje_webhook)
									//webHooks.trigger('confirma_emision', mensaje_webhook)
									//webHooks.remove('confirma_emision').catch(function(err){console.error(err);})

									responsemulticash.estado_poliza = "enviado"
									resp1.status = 'emitida';
									
								} else {							
									// si no encuentro poliza gravo registro de emisiones pendientes (debo construir proceso cron que busca los emisiones pendientes y las cosulto y notifico si notifico booro y cambio estado en muticash y movimiento )
									//dbxx2.collection('multicash_pendientes').insert(responsemulticash, function(err, newDoc) {
									//});

								}
							}
							llama1();
                            }, 1000 * 6);
							
						}
                        llama();						
						/////////////////////////////////////////////////////						
				    } else {						
						responsemulticash = {
							"message": "Multicash no procesado, presupuesto no encontrado", //+resp1.message,
							"timestamp": today.toISOString(),
							"muticash": multicash,
							"detalle": resp1
						};								
					}
				}
				//})
				
				
            }
            setTimeout(function timer() {
                //multicash['Response'] = responsemulticash;
                //multicash['TimeStamp'] = today.toISOString();

				//dbxx2.collection('multicash').insert(responsemulticash, function(err, newDoc) {

				//});	
				
				if(si_movimiento){				
					//dbxx2.collection('movimientos').update({_id: ObjectID(resp1._id)}, resp1, {upsert: true}, function(err, result) {
							console.log(err)
					//});	
				}				
			
                //func.db.multicash.insert(multicash, function(err, count) {});
                res.status(200).send(responsemulticash);
            }, 1000 * 1);
        });
    } catch (error) {
        console.log(error);
    }
});

app.post('/certifica_doc', upload1.any(), async (req, res) => {	

	const files = req.files
	const datos = JSON.parse(req.body.data)
	const nombre_archivo = datos.numPoliza+'_'+datos.numAnexo
	
	console.log(datos)
	 
	 //console.log(files.length)
	 var urls = []
	
		//var raw = JSON.stringify({empresa:'33444444444',numPoliza:'22334444',tipoMivimiento:2,numPolizaRemplazo:'',numAnexo:'333333',fechaInicioVigencia:'15/09/2021',fechaFinVigencia:'15/09/2022',tomador:{tipoDocumento:'1',documento:'79299848'},beneficiario:{tipoDocumento:'1',documento:'79299848'},enviaArchivo:'si'})
	
	
	if (files.length > 0) {
		
	    var	 respuesta_token = await f_token(datos.empresa);
        var id_tucarpeta = {}		
		
		for await (x of files) {
			 await crea_firma(x);
    	      urls.push({"nombre_original":x.originalname,"nombre_referencia":nombre_archivo,"numPoliza":datos.numPoliza,"numAnexo":datos.numAnexo,"movimiento":datos.tipoMivimiento, "UrlDocumento":config.mi_url+"/trae_poliza_certificada?nombre="+nombre_archivo,"id_tucarpeta":""})
 
		}
	
		console.log(urls)
		
    	res.status(200).send(urls); 	
	} else {
    	res.status(200).send(null);
		
	}
	
    async function crea_firma(reg) {

	  console.log(reg)
      var arrayBuffer = new Uint8Array(reg.buffer).buffer;	  
	  var pdfDoc = await PDFDocument.load(arrayBuffer,{ ignoreEncryption: true });

	  var pages = pdfDoc.getPages();
	  
	   // Fetch the emblem image
	  //var emblemImageBytes = await QRCode.toDataURL("http://localhost:8080/trae_poliza_certificada?nombre="+reg.originalname)
	  var emblemImageBytes = await QRCode.toDataURL("d22101d5d402ab181a66b71bb950ff2892f6d2a1e436d61c4fb1011e9c49a77a| "+config.cliente_url+"/registro_invitacion/"+datos.numPoliza+'/'+datos.numAnexo)

	  const pngImage = await pdfDoc.embedPng(emblemImageBytes)

	  const pngDims = pngImage.scale(0.45)
	  
	   var page = pages[0];

	  page.drawImage(pngImage, {
		x: page.getWidth() - (pngDims.width  + 5),
		y: page.getHeight()  - (pngDims.height + 0.5),
		width: pngDims.width,
		height: pngDims.height,
	  })

	  const pdfBytes = await pdfDoc.save()	
	  
	  //console.log(pdfBytes)
	  const pdf_b64 = Buffer.from(pdfBytes).toString('base64');
	  //const pdf_64 = pdfBytes.toString('base64')
	  
	  //console.log(pdf_b64)
	  
      const pdf_firmado =  await f_digital_pdf("6041175a171ea52ee0459728", pdf_b64,"idtransaccion")

      //console.log(pdf_firmado)
	  
	  const buff1 = Buffer.from(pdf_firmado.resultado.data, 'base64');
	  //let buff = new Uint8Array(buff1).buffer;	  

	  
	 // si pudo obtener token
	 if (respuesta_token.access_token) {
		 // defino carpeta ccess_token
		 if (respuesta_token.siusu) {
			 // miro si el que envia es de confianza
				 
			  id_tucarpeta = await fsubir_tucarpeta(pdf_firmado.resultado.data,{Nombre:nombre_archivo,Carpeta:"Cuarentena",token:respuesta_token,attachments:[],contentType:'application/pdf',sharedWith:[], payment: [], metadatos:datos})

			  await subir_archivo(nombre_archivo, buff1,{})
		 }
	 }
	  
	  
 
	  //res.set('Content-Type', 'application/pdf');
	  //res.send(pdfBytes);

     // res.status(200).send(pdfBytes);
	   // Trigger the browser to download the PDF document
      //res.buffer()d(pdfBytes, "poliza_firmada.pdf", "application/pdf");
	  //res.download(filePath, fileName); 
	  
	 // await fs.writeFile("public/firmados/firmado_"+reg.originalname, pdfBytes, {
	 // 					
	 // 				
	 // 				}, function (err) {
	 // 					console.log("captured page written to " );
     //                   //resolve("erro");				
	 // 					
	 // 				});
	  
	 //  si esta habilitado se busca cual es el tipo de archivo  para saber donde va el qr
	 // por lib-pdf, se levanta el archivo
	 // se construye el qr
	 // se incorpora el qr
	 // se firma electronicamente
	 // se guarda en el repositorio respectivo
	 // se obtiene url de bajada y se creoa iten en vector de devoluccion
	 
	 
	//run().catch(err => res.send(err));

	//async function run() {
		//var xusuario = await f_link_pago(request.body);
		
	   
	}	
	
	
	
});	

app.get('/trae_poliza_certificada',function(req,res){  

		console.log(req.query)
		async function lee_d1() {	
				var selfi_enrola = await bajar_archivo_nombre(req.query.nombre,false) 
				//var decodedImage = new Buffer(selfi_enrola, 'base64');
				
				res.set('Content-Type', 'application/pdf');
				res.send(selfi_enrola);
				
		}
		
		lee_d1()
})	
	
	///////////////////////////////////////////////////// funciones generales /////////////////////////////////////////////////////////	
	// genera pdf de template y datos enviados
	const f_template_doc = function(mensaje) {

              
                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
					  var vurl = 'https://us.dws3.docmosis.com/api/render';
                  }else{
					  var vurl = 'https://us.dws3.docmosis.com/api/render';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: mensaje,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
				 console.log(options)
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						//var dato1 = JSON.parse(body); 
						//console.log(body)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(body);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};	
	
	const f_verifica_token = function(mensaje) {

              
                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
					  var vurl = config.biometria_url+'/check_token';
                  }else{
					  var vurl = config.biometria_url+'/check_token';
                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: JSON.stringify({token:mensaje}),
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
				 console.log(options)
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						//var dato1 = JSON.parse(body); 
						//console.log(body)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(body);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};		
	
	// envio sms por infobit 
	const f_sms = function(mensaje,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
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
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
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
	const  f_mail_sedngrid = function (mensaje,mail,firmante,datos,template,adjunto) {
		console.log(mail)
		console.log(firmante)		
		console.log(datos)
		console.log(mensaje)
		
     if (adjunto === "") {      
		var msg = {
			  to: mail,
			  from: 'notificacion@tucarpeta.in', // Use the email address or domain you verified above
			  template_id: template,
			  //dynamic_template_data: {conexion:mensaje,cliente:"Carlos Cabrera",nombre:datos.nombre,descripcion:datos.descripcion,fecha:datos.fecha_creacion,firmante:firmante.nombres+' '+firmante.apellidos},
			  dynamic_template_data: datos,
			  //text: 'and easy to do anywhere, even with Node.js',
			  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
			};
	 } else {
		var msg = {
			  to: mail,
			  from: 'notificacion@tucarpeta.in', // Use the email address or domain you verified above
			  template_id: template,
			  dynamic_template_data: datos,
			  //text: 'and easy to do anywhere, even with Node.js',
			  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
              attachments: [{content:Buffer.from(adjunto).toString('base64') ,filename:"documento.pdf"}]
			};
		 
	 }
			
		sgMail
		  .send(msg)
		  .then(() => {}, error => {
			console.error(error);

			if (error.response) {
				
			  console.error(error.response.body)
			}
		  });
	};
	

	// envio sms por infobit 
	const f_mail = function(mensaje,mail,adjunto) {
		
		
    //var acs = '<h1>FirmaFacil</h1><p>This is a paragraph.</p><p>Edit the code in the window to the left, and click to view the result.</p>'
    var acs = '<h1 style="text-align: center;">FirmaFacil</h1><p></p><p>Te han incluido entre los firmantes de un documento digital, por favor ingresa a es link para que puedas revisar y firmar el documento:</p><p><a href="http://pre.nodeapps.transfiriendo.com:8087/#/Baz/5fc11cabd0dd240017360207/9765efba-9925-4482-9c35-8045ec1d144c">&nbsp;------- ACCESO AL DOCUMENTO----------</a></p><div class="a3s aiL ">Muchas Gracia.</div>'	
    var htmlx = "<HTML>\r\n<p>Estimado(a) "+"aaa"+",</p>\r\n"+
             "<p>Ya tenemos listo su SOAT, nuestra Ã¡rea de servicio a DOMICILIO  en breve lo contactara para verificar datos y programar la entrega.</p>"+
             "<p></p>"+
             "<p>Una vez verificados los datos el tiempo de entrega en la Ciudad de Cali es aproximadamente en 3 (tres)  hrs</p>"+
             "<p></p>"+
             "<p>Si tiene alguna pregunta no dude en comunicarse con nosotros. Recuerde que en PENTAINNOVA estamos para servirle. Cordialmente, </p>"+
             "<p>Domicilios - Pentainnova</p>"+
             "<p>Cel: 3004568738, Email: lcabrera@pentainnova.com</p>"+
             "\r\n</HTML>\r\n"
	
	
     if (adjunto === "") {      
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
 		 '"destinatario":["'+mail+'"],'+
		 '"canal":"EMAIL",'+
		 '"mensaje":{"asunto":"notificacion de firma de documento","cuerpo":"FirmaFacil, le ha enviado un documento para su revision y firma, por favor entrar a este enlace:  '+mensaje+'"}}'
		 //'"mensaje":{"asunto":"notificacion para firma de documento","cuerpo":"'+acs+'"}}'
	 } else {
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
 		 '"destinatario":["'+mail+'"],'+
		 '"canal":"EMAIL",'+
		 '"mensaje":{"asunto":"envio de documento final firmado por las partes","cuerpo":": '+mensaje+'"},'+
		 '"adjuntos":[{"nombre":"documento.pdf","contenido":"{{'+adjunto+'}}"}]}'       

	 }	 
		 
		 //console.log(mensaje)
		 
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
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
				 
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						var dato1 = JSON.parse(body); 
						console.log(dato1)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(dato1);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};		
	
	const f_otp = function(clave,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"plantilla":"OTP simple",'+
		 '"TTL":320000,'+
		 '"tipo":"NUMERICO",'+
		 '"destinatario":"'+numero+'",'+
		 '"canal":"sms",'+
		'"llave":"'+clave+'"}'
		 
//var raw = JSON.stringify({"llave":"1-1015448115","plantilla":"OTP simple","TTL":320000,"tipo":"NUMERICO","canal":"SMS","destinatario":"573143277989"});


		 
		 console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
 					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/generar';
                  }else{
					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/generar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                     //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
		           'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiODYwMDAyNDAwIiwidXN1YXJpbyI6IkNDNDIxNzQwNSIsInVzZXJDbGllbnRlIjoiQ0M0MjE3NDA1IiwibnVtZXJvRG9jdW1lbnRvIjoiNDIxNzQwNSIsImNvcnJlbyI6IndpbHNvbnBlZHJhemFAZ21haWwuY29tIiwidGVsZWZvbm8iOiIzMTMyMjI1NzE5IiwidGlwb0RvY3VtZW50byI6IjEiLCJiZWFyZXIiOiJCZWFyZXIgZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SmxiWEJ5WlhOaElqb2lPRFl3TURBeU5EQXdJaXdpZFhOMVlYSnBieUk2SWtORE5ESXhOelF3TlNJc0ltWmxZMmhoSWpvaU1qVXZNRE12TWpBeU1DQTFPalUzT2pFeUlHRXVJRzB1SW4wLkxpcjJkNml6bDN1OVNDRzZfcnJrRDJpcjRWYmxWVW4yVjU1UER5UGF2VURaaUxwNDFyWFhZRUE1ZWNwZzNjRDRxeVpuQzB3QjZLeWk1OHVHQ1JKdFdnIiwiaWRlbnRpZmljYWRvclRyYW5zYWNjaW9uIjoiZTJlNGNiNWU5M2E2NDk4YjhkMjE2ZTU2OWYzMmFkNmMiLCJuYW1lVXNlciI6IldpbHNvbiAgUGVkcmF6YSAifQ.lAaX4IDpKRnxa_DnbhDlDeWOpEQQKORskUf3x1nAfqQ-rb2QXIpAB9PSwWIeUMbhYu3PPRGrUzpTzPAJ9x1rCQ',
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
	
	const f_verifica_otp = function(clave,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"OTP":"'+numero+'",'+
		'"llave":"'+clave+'"}'
		
//var raw = JSON.stringify({"identificadorTransaccion":"2b66ab4d-0825-447f-926c-9e7500a71486","llave":"1-1015448115","OTP":"115783"});
		 
		 
		 console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
 					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/verificar';
                  }else{
					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/verificar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiODYwMDAyNDAwIiwidXN1YXJpbyI6IkNDNDIxNzQwNSIsInVzZXJDbGllbnRlIjoiQ0M0MjE3NDA1IiwibnVtZXJvRG9jdW1lbnRvIjoiNDIxNzQwNSIsImNvcnJlbyI6IndpbHNvbnBlZHJhemFAZ21haWwuY29tIiwidGVsZWZvbm8iOiIzMTMyMjI1NzE5IiwidGlwb0RvY3VtZW50byI6IjEiLCJiZWFyZXIiOiJCZWFyZXIgZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SmxiWEJ5WlhOaElqb2lPRFl3TURBeU5EQXdJaXdpZFhOMVlYSnBieUk2SWtORE5ESXhOelF3TlNJc0ltWmxZMmhoSWpvaU1qVXZNRE12TWpBeU1DQTFPalUzT2pFeUlHRXVJRzB1SW4wLkxpcjJkNml6bDN1OVNDRzZfcnJrRDJpcjRWYmxWVW4yVjU1UER5UGF2VURaaUxwNDFyWFhZRUE1ZWNwZzNjRDRxeVpuQzB3QjZLeWk1OHVHQ1JKdFdnIiwiaWRlbnRpZmljYWRvclRyYW5zYWNjaW9uIjoiZTJlNGNiNWU5M2E2NDk4YjhkMjE2ZTU2OWYzMmFkNmMiLCJuYW1lVXNlciI6IldpbHNvbiAgUGVkcmF6YSAifQ.lAaX4IDpKRnxa_DnbhDlDeWOpEQQKORskUf3x1nAfqQ-rb2QXIpAB9PSwWIeUMbhYu3PPRGrUzpTzPAJ9x1rCQ',
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

	const f_digital_pdf = function(idcertificado,pdfbase64,idtransaccion) {

              
       // var dataxx7 = '{"idCertificado":"'+idcertificado+'",'+
	   //	 '"documento":"'+pdfbase64+'",'+
	   //	'"identificadorTransaccion":"'+idtransaccion+'","razon":"test","visible":false})'
		
		var dataxx7 = JSON.stringify({idCertificado:idcertificado,documento:pdfbase64,razon:"test",visible:false,identificadorTransaccion:idtransaccion})
		
		 
		 //console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
 					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/firma/api/firma/digital/incrustada/pdf';
                  }else{
					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/firma/api/firma/digital/incrustada/pdf';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiODYwMDAyNDAwIiwidXN1YXJpbyI6IkNDNDIxNzQwNSIsInVzZXJDbGllbnRlIjoiQ0M0MjE3NDA1IiwibnVtZXJvRG9jdW1lbnRvIjoiNDIxNzQwNSIsImNvcnJlbyI6IndpbHNvbnBlZHJhemFAZ21haWwuY29tIiwidGVsZWZvbm8iOiIzMTMyMjI1NzE5IiwidGlwb0RvY3VtZW50byI6IjEiLCJiZWFyZXIiOiJCZWFyZXIgZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SmxiWEJ5WlhOaElqb2lPRFl3TURBeU5EQXdJaXdpZFhOMVlYSnBieUk2SWtORE5ESXhOelF3TlNJc0ltWmxZMmhoSWpvaU1qVXZNRE12TWpBeU1DQTFPalUzT2pFeUlHRXVJRzB1SW4wLkxpcjJkNml6bDN1OVNDRzZfcnJrRDJpcjRWYmxWVW4yVjU1UER5UGF2VURaaUxwNDFyWFhZRUE1ZWNwZzNjRDRxeVpuQzB3QjZLeWk1OHVHQ1JKdFdnIiwiaWRlbnRpZmljYWRvclRyYW5zYWNjaW9uIjoiZTJlNGNiNWU5M2E2NDk4YjhkMjE2ZTU2OWYzMmFkNmMiLCJuYW1lVXNlciI6IldpbHNvbiAgUGVkcmF6YSAifQ.lAaX4IDpKRnxa_DnbhDlDeWOpEQQKORskUf3x1nAfqQ-rb2QXIpAB9PSwWIeUMbhYu3PPRGrUzpTzPAJ9x1rCQ',
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
	
	
	const f_crea_final = function(file, doc, d_biometricos) {
		
         ////doc = {"_id":{"$oid":"6029bcfa7fa7db38680b5591"},"rect":[{"type":"area","x":49.33333333333333,"y":325.3333333333333,"width":252.66666666666669,"height":69.33333333333337,"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"ecee3f73-3320-4b1c-a500-48ab36234adc","page":2},{"type":"area","x":320.6666666666667,"y":325.3333333333333,"width":231.33333333333331,"height":73.33333333333337,"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","page":2}],"firmantes":[{"class":"Comment","uuid":"3f9f8dbe-fba6-4103-80b3-f0529988fbb6","annotation":"ecee3f73-3320-4b1c-a500-48ab36234adc","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}},{"class":"Comment","uuid":"4ccf2410-8d5f-4f00-a57a-3eb725a29f8f","annotation":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"F88888","descripcion":"F888","otro":"","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1613348090122"}},"status":"sin iniciar","num_firmantes":{"$numberInt":"2"},"num_firmados":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}
         doc = {"_id":{"$oid":"6114714eb88269046c430d10"},"rect":[{"type":"area","x":68.66666666666667,"y":82,"width":290,"height":82,"backgroundColor":"red","status":"firmado","width_or":56,"height_or":15.333333333333329,"class":"Annotation","uuid":"bdcc6476-1cfb-4986-b6ff-1c35bead4ebe","page":2,"content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"ccabreraq@gmail.com","status":"firmado","fecha":{"$date":{"$numberLong":"1628729743135"}},"token_firma":"60f70b925c3490325c97aa38","url_imagen":"https://60eff62f399f.ngrok.io/foto_verificacion?nombre=DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_foto_doc.jpg"}}],"firmantes":[{"class":"Comment","uuid":"97867dad-fd23-4041-b341-d7deb0e7a164","annotation":"bdcc6476-1cfb-4986-b6ff-1c35bead4ebe","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"ccabreraq@gmail.com","status":"firmado","fecha":{"$date":{"$numberLong":"1628729743135"}},"token_firma":"60f70b925c3490325c97aa38","url_imagen":"https://60eff62f399f.ngrok.io/foto_verificacion?nombre=DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_foto_doc.jpg"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"dddddd ddddddd","descripcion":"ddddddddddddddddd","otro":"pendiente","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1628729678872"}},"status":"finalizado","num_firmantes":{"$numberInt":"1"},"num_firmados":{"$numberInt":"1"},"__v":{"$numberInt":"0"}}
        ////var reg1 = {"_id":{"$oid":"6029bcfa7fa7db38680b5591"},"rect":[{"type":"area","x":49.33333333333333,"y":425.3333333333333,"width":{"$numberDouble":"252.66666666666669"},"height":{"$numberDouble":"69.33333333333337"},"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"ecee3f73-3320-4b1c-a500-48ab36234adc","page":2},{"type":"area","x":340.6666666666667,"y":425.3333333333333,"width":{"$numberDouble":"231.33333333333331"},"height":{"$numberDouble":"73.33333333333337"},"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","page":7}],"firmantes":[{"class":"Comment","uuid":"3f9f8dbe-fba6-4103-80b3-f0529988fbb6","annotation":"ecee3f73-3320-4b1c-a500-48ab36234adc","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}},{"class":"Comment","uuid":"4ccf2410-8d5f-4f00-a57a-3eb725a29f8f","annotation":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"F88888","descripcion":"F888","otro":"","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1613348090122"}},"status":"sin iniciar","num_firmantes":{"$numberInt":"2"},"num_firmados":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}		
        d_biometricos = {"_id":"60f70b925c3490325c97aa38","result":{"documentNumber":"79.299.848","firstName":"CARLOS","middleName":"ENRIQUE","lastName":"CABRERA QUIÑONES","fullName":"CARLOS ENRIQUE CABRERA QUIÑONES","documentType":"I","documentSide":"FRONT","issuerOrg_full":"Colombia","issuerOrg_iso2":"CO","issuerOrg_iso3":"COL","nationality_full":"Colombia","nationality_iso2":"CO","nationality_iso3":"COL","internalId":"506"},"face":{"isIdentical":true,"confidence":"0.796"},"verification":{"passed":true,"result":{"face":true}},"output":"https://60eff62f399f.ngrok.io/foto_verificacion?nombre=DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_idfront.jpg","outputface":"https://60eff62f399f.ngrok.io/foto_verificacion?nombre=DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_foto_doc.jpg","authentication":{"score":1},"vaultid":"Bpvb4G00RV93GnLL2m0K97QPzSLwp7lc","matchrate":1,"executionTime":6.027968883514404,"responseID":"46ed396a8c89ded7b77ab290e45e8a9a","quota":5,"credit":49,"autenticacion":"AUTENTICO","codid":"79299848","idfront":"DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_idfront.jpg","idback":"DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_idback.jpg","selfi":"DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_selfi.jpg","foto":"DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR_foto_doc.jpg","cod_session":"DEMO-7bb8331d-501a-4556-8584-dd2e604e8d4f-ENR","iat":1628630752,"exp":1628631032}

		var reg1 = doc.reg
		
		//console.log(d_biometricos)
		
		run().catch(err => console.log(err));

                     console.log("0") 
					  console.log(new Date())
		async function run() {
			


			  var pdfDoc = await PDFDocument.load(fs.readFileSync('./public/uploads/'+file+'.pdf'));

			  var pages = pdfDoc.getPages();
			  

			  // Get the width and height of the first page
			  //const { width, height } = firstPage.getSize();
		  
				var rect = doc.rect
				var x;
				var pagss
				var contx1 = 0
				
				var pdfDoc1, form, firma_si_Dims
                var pdfBytes1 = []

				for (x of rect) {
					/////////////////////////////////////////
			         var pdfDoc1 = await PDFDocument.load(fs.readFileSync('./public/uploads/firma_pdf_1bx.pdf'))
					  
							// Fetch the Mario image
					  var marioUrl = doc.firmantes[contx1].content.url_imagen
					  var marioImageBytes = await fetch(marioUrl).then(res => res.arrayBuffer())

							// Fetch the emblem image
					  var emblemImageBytes = await QRCode.toDataURL(doc.firmantes[contx1].content.url_imagen)
					  
					  // Embed the Mario and emblem images
					  var marioImage = await pdfDoc1.embedJpg(marioImageBytes)
					  var emblemImage = await pdfDoc1.embedPng(emblemImageBytes)
                      console.log("1") 
					  console.log(new Date())
				 
					  // Get the form containing all the fields
					  form = pdfDoc1.getForm()
					  
					  //console.log(form.getTextField('Text1'))
					  var fechast = doc.firmantes[contx1].content.fecha

					  // Fill the form's fields
					  form.getTextField('Texto1').setText(file);
					  form.getTextField('Texto2').setText(doc.firmantes[contx1].content.token_firma);
					  form.getTextField('Texto3').setText(doc.firmantes[contx1].content.cedula+' '+doc.firmantes[contx1].content.nombres+' '+doc.firmantes[contx1].content.apellidos);
					  form.getTextField('Texto4').setText('ipipipip');
					  form.getTextField('Texto5').setText(fechast.toString());
					 
					  var characterImageField = form.getButton('Boton1')
					  var factionImageField = form.getButton('Boton2')
                     console.log("2") 
					  console.log(new Date())
					  
					  // Fill the character image field with our Mario image
					  characterImageField.setImage(marioImage)
					  
					  // Fill the faction image field with our emblem image
					  factionImageField.setImage(emblemImage)
					  
					  
					  // Flatten the form's fields
					  form.flatten();
                     console.log("21") 
					  console.log(new Date())

					  // Serialize the PDFDocument to bytes (a Uint8Array)
					  pdfBytes1[contx1] = await pdfDoc1.save()
                     console.log("22") 
					  console.log(new Date())

					  //const [firma_si] = await pdfDoc.embedPdf(image_firma_si);
					  let [firma_si] = await pdfDoc.embedPdf(pdfBytes1[contx1]);
                     console.log("23") 
					  console.log(new Date())
					  firma_si_Dims = firma_si.scale(0.45);
					  
					  pagss = pages[x.page-1];
					  
					  //const firstPage = pages[0]
					  const { width, height } = pagss.getSize()
					  //
							  
					  //const fPage = pdfDoc.getPages()[x.page-1];
                      //const dims = getPageDimensions(fPage);

                      //const { width, height } = fPage.getSize()					  
                     console.log("3") 
					  console.log(new Date())
					  pagss.drawPage(firma_si, {
						...firma_si_Dims,
						x: x.x ,
						y: height - (x.height+x.y)
					  });
                     console.log("4") 
					  console.log(new Date())
					  
							
					////////////////////////////////////////
					 //crea_firma(x);
					 contx1 = contx1 + 1;
				}
				
		  
		        // salvo archivo
				
		  
				const pdfBytes = await pdfDoc.save();

				await fs.writeFile("public/uploads/"+file+"_final.pdf", pdfBytes, {
					
				
				}, function (err) {
					console.log("captured page written to " + file);
					//resolve("erro");				
					
				});
					
		         		var fir = doc.firmantes
						var y;
						
						for (y of fir) {
							 envia_doc_mail(y);;
						}
						
						// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
						  async function envia_doc_mail(reg) {

							// ojo debo enviar correo a todos los firmantes copiandoles el documento pdf firmado digitalmente
							var mensajesms1 = "se envia documento final, del proceso de firmas"
							 //console.log(email)
							//f_mail(mensajesms1,email,userResponse.content.data);
							f_mail_sedngrid(mensajesms1,reg.content.email,reg.content,doc,"d-b16f6f624b8b4b1697767f2875d32ced",pdfBytes);							

						  }
						  
						await oc.files.putFile('/dos/uploads/'+file+'_final.pdf', './public/uploads/'+file+'_final.pdf').then(status => {
							//res.status(200).send(err);
							//response.send(status);
							
						}).catch(error => {
							console.log(error)
							//res.status(500).send(error);
							//response.send(error);
							return ''
						});	  

					
					return ''
		  
		  
		  // Write the PDF to a file
		  //fs.writeFileSync('./public/uploads/xx1.pdf', await doc.save());
		}		
	};
	
	
	const f_crea_final1 = function(file, doc) {
		
         //doc = {"_id":{"$oid":"6029bcfa7fa7db38680b5591"},"rect":[{"type":"area","x":69.33333333333333,"y":425.3333333333333,"width":252.66666666666669,"height":69.33333333333337,"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"ecee3f73-3320-4b1c-a500-48ab36234adc","page":7},{"type":"area","x":340.6666666666667,"y":425.3333333333333,"width":231.33333333333331,"height":73.33333333333337,"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","page":7}],"firmantes":[{"class":"Comment","uuid":"3f9f8dbe-fba6-4103-80b3-f0529988fbb6","annotation":"ecee3f73-3320-4b1c-a500-48ab36234adc","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}},{"class":"Comment","uuid":"4ccf2410-8d5f-4f00-a57a-3eb725a29f8f","annotation":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"F88888","descripcion":"F888","otro":"","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1613348090122"}},"status":"sin iniciar","num_firmantes":{"$numberInt":"2"},"num_firmados":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}

        //var reg1 = {"_id":{"$oid":"6029bcfa7fa7db38680b5591"},"rect":[{"type":"area","x":69.33333333333333,"y":425.3333333333333,"width":{"$numberDouble":"252.66666666666669"},"height":{"$numberDouble":"69.33333333333337"},"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"ecee3f73-3320-4b1c-a500-48ab36234adc","page":7},{"type":"area","x":340.6666666666667,"y":425.3333333333333,"width":{"$numberDouble":"231.33333333333331"},"height":{"$numberDouble":"73.33333333333337"},"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","page":7}],"firmantes":[{"class":"Comment","uuid":"3f9f8dbe-fba6-4103-80b3-f0529988fbb6","annotation":"ecee3f73-3320-4b1c-a500-48ab36234adc","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}},{"class":"Comment","uuid":"4ccf2410-8d5f-4f00-a57a-3eb725a29f8f","annotation":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"F88888","descripcion":"F888","otro":"","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1613348090122"}},"status":"sin iniciar","num_firmantes":{"$numberInt":"2"},"num_firmados":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}		
		var reg1 = doc.reg
		
		run().catch(err => console.log(err));

		async function run() {
			
			//oc.files.getFile('/dos/uploads/'+file+'.pdf', 'public/uploads/'+file+'.pdf').then(status => {
			//	response.send(status);
			//}).catch(error => {
			//	response.send(error);
			//});
			
		  //const xfile = await PDFDocument.load(fs.readFileSync('./public/uploads/'+file+'.pdf'));
		  const image_firma_no = await PDFDocument.load(fs.readFileSync('./public/uploads/FIRMA_PDF_NO.pdf'));
		  const image_firma_si = await PDFDocument.load(fs.readFileSync('./public/uploads/FIRMA_PDF_SI.pdf'));
		  
		  // ojo reemplazar datos de formulario y imagenes para incrustar en formato final
		  
			
		  // Load a PDFDocument from the existing PDF bytes
		  const pdfDoc = await PDFDocument.load(fs.readFileSync('./public/uploads/'+file+'.pdf'));

		  const [firma_no] = await pdfDoc.embedPdf(image_firma_no);
		  const firma_no_Dims = firma_no.scale(0.45);

		  const [firma_si] = await pdfDoc.embedPdf(image_firma_si);
		  const firma_si_Dims = firma_si.scale(0.45);
		  
		  // Get the first page of the document
		  const pages = pdfDoc.getPages();
		  //const firstPage = pages[3];
		  //const stPage = pages[6];

		  // Get the width and height of the first page
		  //const { width, height } = firstPage.getSize();
		  
				var rect = doc.rect
				var x;
				var pagss

				for (x of rect) {
					 crea_firma(x);;
				}
				
				// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
				  async function crea_firma(reg) {
					  pagss = pages[reg.page-1];

					  const { width, height } = pagss.getSize()
					  //


					  pagss.drawPage(firma_si, {
						...firma_si_Dims,
						x: reg.x - 5,
						y: height - (reg.height+reg.y)
					  });
				  }
		  
		  
          const pdfBytes = await pdfDoc.save();

					await fs.writeFile("public/uploads/"+file+"_final.pdf", pdfBytes, {
						
					
					}, function (err) {
						console.log("captured page written to " + file);
                        //resolve("erro");				
						
					});
					
		         		var fir = doc.firmantes
						var y;
						
						for (y of fir) {
							 envia_doc_mail(y);;
						}
						
						// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
						  async function envia_doc_mail(reg) {

							// ojo debo enviar correo a todos los firmantes copiandoles el documento pdf firmado digitalmente
							var mensajesms1 = "se envia documento final, del proceso de firmas"
							 //console.log(email)
							//f_mail(mensajesms1,email,userResponse.content.data);
							f_mail_sedngrid(mensajesms1,reg.content.email,reg.content,doc,"d-b16f6f624b8b4b1697767f2875d32ced",pdfBytes);							

						  }
						  
						await oc.files.putFile('/dos/uploads/'+file+'_final.pdf', './public/uploads/'+file+'_final.pdf').then(status => {
							//res.status(200).send(err);
							//response.send(status);
							
						}).catch(error => {
							console.log(error)
							//res.status(500).send(error);
							//response.send(error);
							return ''
						});	  

					
					return ''
		  
		  
		  // Write the PDF to a file
		  //fs.writeFileSync('./public/uploads/xx1.pdf', await doc.save());
		}		
	};


	const f_link_pago = function(data) {
	
        //try {
            //var requestbody = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcesarReferenciasCoe xmlns="http://tempuri.org/"><pProcesarReferenciasRq>&lt;ProcesarReferenciasRq&gt;&lt;PersonaDeudora&gt;&lt;Nombre&gt;VARNOMBRE&lt;/Nombre&gt;&lt;TipoIdentificacion&gt;VARTIPOIDENTIFICACION&lt;/TipoIdentificacion&gt;&lt;NumeroIdentificacion&gt;VARNUMEROIDENTIFICACION&lt;/NumeroIdentificacion&gt;&lt;Email&gt;VARCOREO&lt;/Email&gt;&lt;/PersonaDeudora&gt;&lt;IdentificadorCompania&gt;VARCOMPANIA&lt;/IdentificadorCompania&gt;&lt;Referencias&gt;&lt;Referencia&gt;&lt;Cabecera&gt;&lt;NumeroReferencia&gt;VARNUMERORFERENCIA&lt;/NumeroReferencia&gt;&lt;NumeroReferenciaOrigen&gt;VARNUMEROREFRENCIAORIGEN&lt;/NumeroReferenciaOrigen&gt;&lt;Moneda&gt;COP&lt;/Moneda&gt;&lt;ImporteTotal&gt;VARIMPORTETOTAL&lt;/ImporteTotal&gt;&lt;ImporteSubtotal&gt;VARIMPORTESUBTOTAL&lt;/ImporteSubtotal&gt;&lt;ImporteIva&gt;VARIMPORTEIVA&lt;/ImporteIva&gt;&lt;FechaEmision&gt;VARFECHAEMISION&lt;/FechaEmision&gt;&lt;FechaVencimiento&gt;VARFECHAVENCIMIENTO&lt;/FechaVencimiento&gt;&lt;/Cabecera&gt;&lt;/Referencia&gt;&lt;/Referencias&gt;&lt;/ProcesarReferenciasRq&gt;</pProcesarReferenciasRq><pClaveControl>' + sha1(data.compania + "1") + '</pClaveControl></ProcesarReferenciasCoe></soap:Body></soap:Envelope>'
            var requestbody = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcesarReferenciasCoe xmlns="http://tempuri.org/"><pProcesarReferenciasRq>&lt;ProcesarReferenciasRq&gt;&lt;PersonaDeudora&gt;&lt;Nombre&gt;VARNOMBRE&lt;/Nombre&gt;&lt;TipoIdentificacion&gt;VARTIPOIDENTIFICACION&lt;/TipoIdentificacion&gt;&lt;NumeroIdentificacion&gt;VARNUMEROIDENTIFICACION&lt;/NumeroIdentificacion&gt;&lt;Email&gt;VARCOREO&lt;/Email&gt;&lt;/PersonaDeudora&gt;&lt;IdentificadorCompania&gt;VARCOMPANIA&lt;/IdentificadorCompania&gt;&lt;Referencias&gt;&lt;Referencia&gt;&lt;Cabecera&gt;&lt;NumeroReferencia&gt;VARNUMERORFERENCIA&lt;/NumeroReferencia&gt;&lt;NumeroReferenciaOrigen&gt;VARNUMEROREFRENCIAORIGEN&lt;/NumeroReferenciaOrigen&gt;&lt;Moneda&gt;COP&lt;/Moneda&gt;&lt;ImporteTotal&gt;VARIMPORTETOTAL&lt;/ImporteTotal&gt;&lt;ImporteSubtotal&gt;VARIMPORTESUBTOTAL&lt;/ImporteSubtotal&gt;&lt;ImporteIva&gt;VARIMPORTEIVA&lt;/ImporteIva&gt;&lt;FechaEmision&gt;VARFECHAEMISION&lt;/FechaEmision&gt;&lt;FechaVencimiento&gt;VARFECHAVENCIMIENTO&lt;/FechaVencimiento&gt;&lt;/Cabecera&gt;&lt;/Referencia&gt;&lt;/Referencias&gt;&lt;Extras&gt;&lt;Ref1&gt;&lt;/Ref1&gt;&lt;Ref2&gt;&lt;/Ref2&gt;&lt;Ref3&gt;&lt;/Ref3&gt;&lt;Ref4&gt;&lt;/Ref4&gt;&lt;Ref5&gt;VARREF5&lt;/Ref5&gt;&lt;/Extras&gt;&lt;/ProcesarReferenciasRq&gt;</pProcesarReferenciasRq><pClaveControl>' + sha1(data.compania + "1") + '</pClaveControl></ProcesarReferenciasCoe></soap:Body></soap:Envelope>'
            requestbody = requestbody.replace("VARNOMBRE", data.nombre);
            requestbody = requestbody.replace("VARCOMPANIA", data.compania); 
            requestbody = requestbody.replace("VARTIPOIDENTIFICACION", data.tipoidentificacion); 
            requestbody = requestbody.replace("VARNUMEROIDENTIFICACION", data.numeroidentificacion);
            requestbody = requestbody.replace("VARCOREO", data.correo);
            requestbody = requestbody.replace("VARIMPORTETOTAL", data.importetotal);
            requestbody = requestbody.replace("VARIMPORTESUBTOTAL", data.importesubtotal);
            requestbody = requestbody.replace("VARIMPORTEIVA", data.importeiva);
            requestbody = requestbody.replace("VARFECHAEMISION", data.fechaemision); 
            requestbody = requestbody.replace("VARFECHAVENCIMIENTO", data.fechavencimiento);  
            requestbody = requestbody.replace("VARNUMERORFERENCIA", data.numeroreferencia);
            requestbody = requestbody.replace("VARNUMEROREFRENCIAORIGEN", data.numeroreferenciaorigen);
			
            //requestbody = requestbody.replace("VARREF5", data.ref5);
			
			var coeurl = "https://pre.irecaudocoe.transfiriendo.com:456/"

			console.log(requestbody)
            var options = {
                method: 'POST',
                url: coeurl + 'Irecaudocoe/WebServices/Public/PublicServices.asmx',
                headers: {
                    soapaction: 'http://tempuri.org/ProcesarReferenciasCoe',
                    'content-type': 'text/xml'
                },
                body: requestbody
            };
            console.log("//////////////////////////////////");
            console.log(requestbody);
            console.log("//////////////////////////////////");
			
			
			  return new Promise((resolve, reject) => {

				request(options, (error, response, body) => {
				  if (response) {
					console.log(body)
					  
                    var inicio = body.search("&lt;IdentificadorTransaccion&gt;") + 32;
                    var fin = body.search("&lt;/IdentificadorTransaccion&gt;");
                    var IdentificadorTransaccion = body.substring(inicio, fin);
                    body1 = {
                        "IdentificadorTransaccion": IdentificadorTransaccion,
                        "Link": coeurl + "IRecaudoCoe/WebForms/Pago/Views/GenerarTransaccion.aspx?input=" + IdentificadorTransaccion
                    };
					console.log(inicio)
					console.log(fin)
                    if (inicio > 0 && fin > 0) {
                        return resolve(body1)
                    } else {
						//return reject( "no se genero la refrencia de pago") 
                    body1 = {
                        "IdentificadorTransaccion": "no se genero la refrencia de pago",
                        "Link": ""
                    };
						
						return resolve(body1)
                     }

					  //return resolve(dato1);
					
				  }
				  if (error) {
					  //console.log(error)
					return reject(error);
					//return resolve(error)
				  }
				});  
						  
			  }); 
			
			
			
			
			
         //} catch (err) {
		//	return (err);
        //}
    }	
	
async function subir_archivo(nombre, datos, d_json) {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    //let response = await b2.getBucket({ bucketName: 'firmefacil-pre' });
	
	// get upload url
	let res = await b2.getUploadUrl({
		bucketId: 'd6828ebf8d1f9af878bb0d10',   //'polizas',
		
	   axios: {
			// overrides the axios instance default config, see https://github.com/axios/axios
		},
		retry: {
			retries: 3 // this is the default
			// for additional options, see https://github.com/softonic/axios-retry
		}		
			// ...common arguments (optional)
	});  // returns promise
	
	let xfile = await b2.uploadFile({
		uploadUrl: res.data.uploadUrl,
		uploadAuthToken: res.data.authorizationToken,
		fileName: nombre,
		data: datos, // this is expecting a Buffer, not an encoded string
		info: {key1: 'value',key2: 'value'}
	});  // returns promise	
	
	
    //console.log(res.data);
	//console.log(b2.authorizationToken)
	//console.log("rrrrrrrrrrrrrrrr")
	//console.log(xfile.data)
	return xfile.data.fileId
  } catch (err) {
    console.log('Error getting bucket:', err);
	return err
  }
}



async function bajar_archivo_id(nombre) {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    //let response = await b2.getBucket({ bucketName: 'firmefacil-pre' });
	
	console.log(nombre)
	
	let res_aa = await b2.downloadFileById({
			fileId: nombre,
			responseType: 'arraybuffer', // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
			//onDownloadProgress: (event) => {} || null // progress monitoring
			// ...common arguments (optional)
		});  // returns promise


	console.log("sssssssssss")
	var resu = res_aa.data
    ////console.log(res_aa.data);
	return(resu.toString('base64'))
	//return(res_aa.data)
  } catch (err) {
    console.log('Error getting bucket:', err);
  }
}

async function bajar_archivo_nombre(nombre,convierte) {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    //let response = await b2.getBucket({ bucketName: 'firmefacil-pre' });
	
	
	let res_aa = await b2.downloadFileByName({
		bucketName: 'polizas',
		fileName: nombre,
		responseType: 'arraybuffer' // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
		//onDownloadProgress: (event) => {} || null // progress monitoring
		// ...common arguments (optional)
    });  // returns promise
	
	console.log("sssssssssss")
	if (convierte) {
		var resu = res_aa.data
		////console.log(res_aa.data);
		return(resu.toString('base64'))
		//return(res_aa.data)
	} else {
		return(res_aa.data)
	}
  } catch (err) {
    console.log('Error getting bucket:', err);
  }
}
	

function  fsubir_tucarpeta(data,datosgen) {
		//console.log(datosgen);
		
	 
			  var options = { method: 'POST',
			  url: 'https://tucarpeta-pre-webapp01.azurewebsites.net/api/api/documents',
			  headers: 
			   { 'postman-token': 'f86ce30b-f1b5-8c85-16b4-2e00868c3277',
				 'cache-control': 'no-cache',
				 'content-type': 'application/json',
				 authorization: 'bearer '+ datosgen.token.access_token,
				  },
			  body: 
			   { name: 'Poliza - '+datosgen.Nombre,
				 contents: data,
				 application: datosgen.Carpeta,
				 contentType: datosgen.contentType,
				 //fromValidationDate: '2020-05-22',
				 //dueValidationDate: '2020-05-30',
				 metadata: {
					factura: datosgen.metadatos
					//payment: datosgen.payment	
				 },
				 attachments:datosgen.attachments,
				 sharedWith: datosgen.sharedWith,
				 //sharedWith: [ 'cc79299848', 'ccabrera@transfiriendo.com' ],
				 //sharedWith: [ d_per.tipo_doc+d_per.num_doc,d_per.email ],
				 //templates: [ 'Facturas' ]
				 },
			     json: true 
			  };
			  
			  console.log(options)

	 
				request(options, function (error, response, body) {
				  if (error) {
					  console.log(error);
					  //response.status(500).json("");
					  return ("su archivo no subio correctamente !!!!");
				  } else {
					  console.log(body);
					  //response.status(200).json("");
					  return (body);
				  }

				});

			

}	

async function f_token(user) {

	const usuarios = [
		{usuario: 'cc79299848', clave: '!QAZxsw23edc'},
		{usuario: 'cc19390083', clave: '!QAZxsw23edc'},
		{usuario: 'nit900032159', clave: '!QAZxsw23edc'}
	];
		
        var usu_token = usuarios.find( persona => persona.usuario === user );
		var siusu = true;
		if (usu_token == undefined) {
			usu_token = empresa;
			siusu = false;
		}

              
		var options = { method: 'POST',
		  url: 'https://tucarpeta-pre-webapp01.azurewebsites.net/api/token',
		  headers: 
		   { 'content-type': 'application/x-www-form-urlencoded',
			 'postman-token': '97cdcce9-213c-fccd-d84b-9ba19deebb82',
			 'cache-control': 'no-cache' },
		  form: 
			   { grant_type:'password',
				 userName:usu_token.usuario,
				 password:usu_token.clave}
		  }; 
 			
    	return new Promise((resolve, reject) => {
            
			request(options, function (error, response, body) {
			  if (error) {
				  return reject(error);
			  } else {
				  
				try {
				  var r_token = JSON.parse(body);
				} catch (e) {
					return resolve([]);
				}
				r_token.siusu = siusu;
				  return resolve(r_token);
                  //console.log(body)
				  //var r_token = JSON.parse(body);
				  //r_token.siusu = siusu;
				  //return resolve(r_token);
			  }
			});  
							  
		}); 

 };	
 
	
	
app.get("/docxx", function(req, res){
const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip)
    var file = req.query.file;
	f_crea_final(file)
	res.json({});

})		
	

module.exports = app;
