import PDFJSAnnotate from '../';
import initColorPicker from './shared/initColorPicker';
import print from 'print-js'
import Dropzone from './shared/dropzone'
//var phantomJsCloud = require("phantomjscloud");

function htmlEscape(text) {
  return text
    .replace('&', '&amp;')
    .replace('>', '&gt;')
    .replace('<', '&lt;')
    .replace('"', '&quot;')
    .replace("'", '&#39;');
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const { UI } = PDFJSAnnotate;

// leo detalle de rectangulos y firmantes y los creo en localstorage o hago que local sea a la base de datos

// query string: ?foo=lorem&bar=&baz
var filex = getParameterByName('file'); // "lorem"
var rectx = getParameterByName('datos')
console.log(filex)
console.log(getParameterByName('datos'));
//const documentId = "uploads/"+"usuario"+foo;
  // var documentId = 'uploads/'+'user1'+'_aa.pdf';
  


if (filex !== null) {
   var documentId = "uploads/"+filex;
    //var documentId = filex;
  if (rectx !== null){
	  var jrect = JSON.parse(rectx)
      localStorage.removeItem(`${documentId}/annotations`);
	  localStorage.setItem(`${documentId}/annotations`, rectx);	  
   }
} else {
   var documentId = "uploads/"+'user1'+'_aa.pdf';
}

let PAGE_HEIGHT;
let RENDER_OPTIONS = {
  documentId: documentId,
  pdfDocument: null,
  scale: parseFloat(localStorage.getItem(`${documentId}/scale`), 10) || 1.33,
  rotate: parseInt(localStorage.getItem(`${documentId}/rotate`), 10) || 0
};

PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());
pdfjsLib.workerSrc = './shared/pdf.worker.js';

// ojo inhabilita modificar el poder modificar servicio de modificar el rect
//if (filex !== null) {
    //UI.disableEdit();
	//UI.disableRect
//}

let commentModal1 = document.getElementById("myModal1");
let commentModal = document.getElementById("myModal");

      Dropzone.options.uploadWidget = {
        maxFilesize: 2, // MB
        maxFiles: 1,
        dictDefaultMessage: 'arrastre su archivo aca o click para selecionarlo',
        acceptedFiles: 'application/pdf',
        init: function() {
          this.on('success', function(file, resp){
            console.log(file);
            console.log(resp);
			//commentModal1.style.display = "block";
			
           });
			this.on("complete", function(file) {
			  this.removeFile(file);
			  
			commentModal1.style.display = "none";
			//RENDER_OPTIONS.documentId = "uploads/"+resp.originalname
			RENDER_OPTIONS.documentId = "uploads/"+"user1"+"_aa.pdf"			
			render();
			
			  for (let i = 0; i < NUM_PAGES; i++) {
				document.querySelector(`div#pageContainer${i + 1} svg.annotationLayer`).innerHTML = '';
			  }

			  localStorage.removeItem(`${RENDER_OPTIONS.documentId}/annotations`);
			  
			  
			});		   
         }
      };

// Render stuff
let NUM_PAGES = 0;
let renderedPages = [];
let okToRender = false;
document.getElementById('content-wrapper').addEventListener('scroll', (e) => {
  let visiblePageNum = Math.round(e.target.scrollTop / PAGE_HEIGHT) + 1;
  let visiblePage = document.querySelector(`.page[data-page-number="${visiblePageNum}"][data-loaded="false"]`);

  if (renderedPages.indexOf(visiblePageNum) === -1) {
    okToRender = true;
    renderedPages.push(visiblePageNum);
  }
  else {
    okToRender = false;
  }

  if (visiblePage && okToRender) {
    setTimeout(() => {
      UI.renderPage(visiblePageNum, RENDER_OPTIONS);
    });
  }
});


function render3() {
	

fetch('http://localhost:8090/getFileContents')
    .then(async res => ({
        filename: '',
        blob: await res.text()
    }))	
 
  .then(function(buffer) {
		 
		   let blob = new Blob([buffer.blob], {type: 'application/pdf'})
           let url = window.URL.createObjectURL(blob)

	     console.log(blob) 
		 console.log(url)
		 //var uint8array =  new Uint8Array(buffer);
		 //const newBlob = new Blob([buffer], { type: 'application/pdf' });
		 //var array = new Uint8Array(new ArrayBuffer(buffer));
		 console.log(buffer)
         const loadingTask = pdfjsLib.getDocument({data:buffer.blob,
		  
		  })
          //url: RENDER_OPTIONS.documentId,
          //cMapUrl: 'shared/cmaps/',
          //cMapPacked: true
		  
		  loadingTask.promise.then((pdf) => {
			RENDER_OPTIONS.pdfDocument = pdf;

			let viewer = document.getElementById('viewer');
			viewer.innerHTML = '';
			NUM_PAGES = pdf.numPages;
			for (let i = 0; i < NUM_PAGES; i++) {
			  let page = UI.createPage(i + 1);
			  viewer.appendChild(page);
			}

			UI.renderPage(1, RENDER_OPTIONS).then(([pdfPage, annotations]) => {
			  let viewport = pdfPage.getViewport({scale: RENDER_OPTIONS.scale, rotation: RENDER_OPTIONS.rotate});
			  PAGE_HEIGHT = viewport.height;
			});
			
			
			
		  });		  
		  });
 		

    //     const loadingTask = pdfjsLib.getDocument({
    //      url: RENDER_OPTIONS.documentId,
    //      cMapUrl: 'shared/cmaps/',
    //      cMapPacked: true
	
	
  


}
//render();

function render() {
	

fetch(window.location.href+'getFileContents?file='+RENDER_OPTIONS.documentId)
    .then(async res => ({
        filename: '',
        blob: await res.text()
    }))	
 
  .then(function(buffer) {
		 
         const loadingTask = pdfjsLib.getDocument({		  
		  
          url: RENDER_OPTIONS.documentId,
          cMapUrl: 'shared/cmaps/',
          cMapPacked: true
		  })
		  loadingTask.promise.then((pdf) => {
			RENDER_OPTIONS.pdfDocument = pdf;

			let viewer = document.getElementById('viewer');
			viewer.innerHTML = '';
			NUM_PAGES = pdf.numPages;
			for (let i = 0; i < NUM_PAGES; i++) {
			  let page = UI.createPage(i + 1);
			  viewer.appendChild(page);
			}

			UI.renderPage(1, RENDER_OPTIONS).then(([pdfPage, annotations]) => {
			  let viewport = pdfPage.getViewport({scale: RENDER_OPTIONS.scale, rotation: RENDER_OPTIONS.rotate});
			  PAGE_HEIGHT = viewport.height;
			});
			
			
			
		  });		  
		  });
 		

    //     const loadingTask = pdfjsLib.getDocument({
    //      url: RENDER_OPTIONS.documentId,
    //      cMapUrl: 'shared/cmaps/',
    //      cMapPacked: true
	
	
  


}
render();

function render2() {
  const loadingTask = pdfjsLib.getDocument({
    url: RENDER_OPTIONS.documentId,
    cMapUrl: 'shared/cmaps/',
    cMapPacked: true
  });

  loadingTask.promise.then((pdf) => {
    RENDER_OPTIONS.pdfDocument = pdf;

    let viewer = document.getElementById('viewer');
    viewer.innerHTML = '';
    NUM_PAGES = pdf.numPages;
    for (let i = 0; i < NUM_PAGES; i++) {
      let page = UI.createPage(i + 1);
      viewer.appendChild(page);
    }

    UI.renderPage(1, RENDER_OPTIONS).then(([pdfPage, annotations]) => {
      let viewport = pdfPage.getViewport({scale: RENDER_OPTIONS.scale, rotation: RENDER_OPTIONS.rotate});
      PAGE_HEIGHT = viewport.height;
    });
	
	
	
  });
}
//render();


// Hotspot color stuff

// Text stuff

// Pen stuff

// Toolbar buttons
(function() {
  let tooltype = localStorage.getItem(`${RENDER_OPTIONS.documentId}/tooltype`) || 'cursor';
  if (tooltype) {
    setActiveToolbarItem(tooltype, document.querySelector(`.toolbar button[data-tooltype=${tooltype}]`));
  }

  function setActiveToolbarItem(type, button) {
    let active = document.querySelector('.toolbar button.active');
    if (active) {
      active.classList.remove('active');

      switch (tooltype) {
        case 'cursor':
          UI.disableEdit();
          break;
        case 'eraser':
          UI.disableEraser();
          break;
        case 'draw':
          UI.disablePen();
          break;
        case 'arrow':
          UI.disableArrow();
          break;
        case 'text':
          UI.disableText();
          break;
        case 'point':
          UI.disablePoint();
          break;
        case 'area':
        case 'highlight':
        case 'strikeout':
          UI.disableRect();
          break;
        case 'circle':
        case 'emptycircle':
        case 'fillcircle':
          UI.disableCircle();
          break;
      }
    }

    if (button) {
      button.classList.add('active');
    }
    if (tooltype !== type) {
      localStorage.setItem(`${RENDER_OPTIONS.documentId}/tooltype`, type);
    }
    tooltype = type;

    switch (type) {
      case 'cursor':
        UI.enableEdit();
        break;
      case 'eraser':
        UI.enableEraser();
        break;
      case 'draw':
        UI.enablePen();
        break;
      case 'arrow':
        UI.enableArrow();
        break;
      case 'text':
        UI.enableText();
        break;
      case 'point':
        UI.enablePoint();
        break;
      case 'area':
      case 'highlight':
      case 'strikeout':
        UI.enableRect(type);
        break;
      case 'circle':
      case 'emptycircle':
      case 'fillcircle':
        UI.enableCircle(type);
        break;
    }
  }

  function handleToolbarClick(e) {
    if (e.target.nodeName === 'BUTTON') {
      setActiveToolbarItem(e.target.getAttribute('data-tooltype'), e.target);
    }
  }

  document.querySelector('.toolbar').addEventListener('click', handleToolbarClick);
})();

// Scale/rotate
(function() {
  function setScaleRotate(scale, rotate) {
    scale = parseFloat(scale, 10);
    rotate = parseInt(rotate, 10);

    if (RENDER_OPTIONS.scale !== scale || RENDER_OPTIONS.rotate !== rotate) {
      RENDER_OPTIONS.scale = scale;
      RENDER_OPTIONS.rotate = rotate;

      localStorage.setItem(`${RENDER_OPTIONS.documentId}/scale`, RENDER_OPTIONS.scale);
      localStorage.setItem(`${RENDER_OPTIONS.documentId}/rotate`, RENDER_OPTIONS.rotate % 360);

      render();
    }
  }

  function handleScaleChange(e) {
    setScaleRotate(e.target.value, RENDER_OPTIONS.rotate);
  }

  function handleRotateCWClick() {
    setScaleRotate(RENDER_OPTIONS.scale, RENDER_OPTIONS.rotate + 90);
  }

  function handleRotateCCWClick() {
    setScaleRotate(RENDER_OPTIONS.scale, RENDER_OPTIONS.rotate - 90);
  }

  document.querySelector('.toolbar select.scale').value = RENDER_OPTIONS.scale;
  document.querySelector('.toolbar select.scale').addEventListener('change', handleScaleChange);
})();

// Clear toolbar button
(function() {
  function handleClearClick(e) {
	//printJS('content-wrapper', 'html')  
    if (confirm('Are you sure you want to clear annotations?')) {
      for (let i = 0; i < NUM_PAGES; i++) {
        document.querySelector(`div#pageContainer${i + 1} svg.annotationLayer`).innerHTML = '';
      }

      localStorage.removeItem(`${RENDER_OPTIONS.documentId}/annotations`);
    }
  }
  document.querySelector('a.clear').addEventListener('click', handleClearClick);
})();

// subir toolbar button
(function() {
  function handleSubirClick(e) {
        commentModal1.style.display = "block";
	  //RENDER_OPTIONS.documentId = "usuario"+"_aa.pdf"
	  //render();
	
  }
  document.querySelector('a.subir').addEventListener('click', handleSubirClick);
})();

// crear toolbar button
(function() {
  function handleCrearClick(e) {
        commentModal.style.display = "block";
	  //RENDER_OPTIONS.documentId = "test.pdf"
	  //render();
	//printJS('viewer', 'html')  
   	  
	
  }
  document.querySelector('a.crear').addEventListener('click', handleCrearClick);
})();



	//let viewerx = document.getElementById('viewer');
	//viewerx.print();
	//printJS('viewer', 'html')

// Comment stuff
(function(window, document) {
  let commentList = document.querySelector('#comment-wrapper .comment-list-container');
  let commentForm = document.querySelector('#comment-wrapper .comment-list-form');
  let commentText = commentForm.querySelector('input[type="text"]');
  let commentmodalForm = document.querySelector("[id='Modal_form']");
  let Form_salvar = document.querySelector("[id='formsalvar']");
  let aaxx = false  
   //let viewerx = document.getElementById('viewer');

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close2")[0];
  var span1 = document.getElementsByClassName("close1")[0];
  var span2 = document.getElementsByClassName("close_f")[0];

  span.onclick = function() {
	  commentModal.style.display = "none";
  }
  span1.onclick = function() {
	  commentModal1.style.display = "none";
  }
  span2.onclick = function() {
	  commentmodalForm.style.display = "none";
  }
  
  function supportsComments(target) {
    let type = target.getAttribute('data-pdf-annotate-type');
    return ['point', 'highlight', 'area'].indexOf(type) > -1;
  }

  function insertComment(comment) {
    let child = document.createElement('div');
    child.className = 'comment-list-item';
    //child.innerHTML = htmlEscape(comment.content);

    commentList.appendChild(child);
  }
  
 function check_rect(reg) {
  return reg.class == "Annotation";
}
 function check_datos(reg) {
  return reg.class == "Comment";
} 
  
  Form_salvar.onsubmit = function(event) {
	console.log("salvar")  
	event.preventDefault();
    let documentId = `${RENDER_OPTIONS.documentId}/annotations`
	
	      //PDFJSAnnotate.getStoreAdapter().getAnnotations(documentId).then((annotations) => {
			  var datos = JSON.parse(localStorage.getItem('uploads/user1_aa.pdf/annotations'))
			  var datos_rect = datos.filter(check_rect)
			  
				// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
				var y;

		    	for (y of datos_rect) {
						  cambia_rect(y);
				}
				
		    	async function cambia_rect(reg) {						  
					 reg.status = 'pendiente' 
			    }
			  
			  var datos_datos = datos.filter(check_datos)
			  let doc_html = document.querySelector("[id='content-wrapper']");
               console.log(doc_html.innerHTML)
			  var registro = {nombre:Form_salvar.elements[0].value,descripcion:Form_salvar.elements[1].value,otro:Form_salvar.elements[2].value,url:RENDER_OPTIONS.documentId,feha_creacion:new Date(), rect:datos_rect ,firmantes:datos_datos, status: 'sin iniciar', num_firmantes:datos_datos.length , num_firmados:0 , html: doc_html.innerHTML}
			  //var registro = {nombre:Form_salvar.elements[0].value,descripcion:Form_salvar.elements[1].value,otro:Form_salvar.elements[2].value}
               var aa = {html:	doc_html.innerHTML}		  
				fetch(window.location.href+'firma_doc', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(registro)
					})
					.then(function(response) {
						console.log('response =', response);
						commentModal.style.display = "none";
						return response.json();
					})
					.then(function(data) {
						console.log('data = ', data);
					})
					.catch(function(err) {
						console.error(err);
						localStorage.setItem('aa', err);
						

					});		
					
				fetch(window.location.href+'firmantes', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(aa)
					})
					.then(function(response) {
						console.log('response =', response);
						//commentModal.style.display = "none";
						return "" //response.json();
					})
					.then(function(data) {
						console.log('data = ', data);
					})
					.catch(function(err) {
						console.error(err);
						localStorage.setItem('aa', err);
						

					});			  
			  
		 // })

  }

  function handleAnnotationClick(target) {
    if (supportsComments(target)) {
		console.log("qqqqqqqqqq")
      let documentId = target.parentNode.getAttribute('data-pdf-annotate-document');
      let annotationId = target.getAttribute('data-pdf-annotate-id');

      PDFJSAnnotate.getStoreAdapter().getComments(documentId, annotationId).then((comments) => {
        //commentList.innerHTML = '';
        //commentForm.style.display = '';
        //commentText.focus();
		//if (typeof comments[0].content !== null) {
 		commentmodalForm.style.display = "inline";
		//console.log(comment)
        if(typeof comments[0] !== 'undefined') {	
		     console.log(window.location.hostname)
			 console.log(window.location.port)
			 console.log(window.location.protocol)
			 console.log(window.location.href)
    		console.log(comments[0])
    		 var x = document.getElementById("myForm");
    		 x.elements[0].value = comments[0].content.cedula
			 x.elements[1].value = comments[0].content.nombres
			 x.elements[2].value = comments[0].content.apellidos
			 x.elements[3].value = comments[0].content.celular
			 x.elements[4].value = comments[0].content.email
		}
		
        commentmodalForm.onsubmit = function() {
			
			  var x = document.getElementById("myForm");
		      //x.elements[0].value 
			  var xvec = {cedula:x.elements[0].value,nombres:x.elements[1].value,apellidos:x.elements[2].value,celular:x.elements[3].value,email:x.elements[4].value,status:'pendiente'}
			
          PDFJSAnnotate.getStoreAdapter().addComment(documentId, annotationId, xvec)
            .then(insertComment)
            .then(() => {
              //commentText.value = '';
              //commentText.focus();
			  commentmodalForm.style.display = "none"
            });

          return false;
        };

        comments.forEach(insertComment);
      });
    }
  }

  function handleAnnotationBlur(target) {
    //if (false) {
		console.log("qqq")
		console.log(target)
    if (supportsComments(target)) {
      commentList.innerHTML = '';
      commentForm.style.display = 'none';
      commentForm.onsubmit = null;
  	  //commentModal.style.display = "none";
      //commentmodalForm.style.display = "none"
	  

      insertComment({content: 'No comments'});
    } else {
	  console.log("wwwww")	
	}
  }

  UI.addEventListener('annotation:click', handleAnnotationClick);
  UI.addEventListener('annotation:blur', handleAnnotationBlur);

  UI.setArrow(10, 'darkgoldenrod');
  UI.setCircle(10, 'darkgoldenrod');
})(window, document);
