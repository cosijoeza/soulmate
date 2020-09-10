							
			function agente()
			{
				//Leo valores de las entradas
				var ciudades = parseInt( document.getElementById("ciudades").value );
				var elementos = parseInt(document.getElementById("elementos").value);
				var generaciones = parseInt(document.getElementById("generaciones").value);
				var elite = parseFloat(document.getElementById("elite").value);
				var mostrar = parseInt(document.getElementById("mostrar").value);
				var tipo = parseInt ( document.getElementById("tipo").value );
				var seleccion = parseInt( document.getElementById("seleccion").value ); //0: Tornedo 1:Ranking 2:Aleatorio*/

				let mejores = [];
				/*Creo la region de puntos y la poblacion inicial*/
				region = create_points(ciudades,tipo);	/*0: Disperso 1:Cuadrado 2:Circular*/
				let pueblo = create_town(elementos,ciudades);
				console.log(pueblo);

				canvas = document.getElementById("canvas").getContext("2d");
				region.ligas = pueblo[0].recorrido;
				dibuja();

				for(var i = 0; i < generaciones; i++)
				{
					var nueva_pobla = cruzamiento(pueblo,seleccion,ciudades,elite); /*0: Tornedo 1:Ranking 2:Aleatorio*/
					var pobla_mut = mutacion(nueva_pobla,ciudades);
					//Ordeno de menor a mayor por distancia
					pobla_mut.sort(function(a,b){return a.distancia - b.distancia;}); 
					//Asigno los vertices (mejor recorrido)
					region.ligas = pobla_mut[0].recorrido;
					mejores.push(pobla_mut[0].distancia);
					pueblo = pobla_mut;
					genera_tabla(pobla_mut,i,mostrar);
					canvas = document.getElementById("canvas"+i).getContext("2d");
					dibuja();
				}
			}
			
			//Creamos poblacion
			function create_town(tamaño,ciudades)
			{
				var poblacion = new Array();
				var camino,poblador;
				for(var i = 0; i < tamaño; i++)	//Agregamos pobladores a la poblacion
				{
					poblador = new Object();
					camino = path(ciudades);	//Generamos un camino PPERMUTADO
					poblador.recorrido = camino;
					poblador.distancia = aptitud(camino,region);
					poblacion.push(poblador);
				}
				return poblacion;
			}
			//Funcion que crea una nueva poblacion. Seleccion rango [0-2]
			function cruzamiento(poblacion,seleccion,ciudades,elite)
			{
				var numPobla = poblacion.length;
				var indice1,indice2;
				var k = 0;
				var new_poblation = new Array();
				/*Genero nueva poblacion*/
				while(k < parseInt(numPobla / 2))
				{
					//Escogo el metodo de seleccion para tener dos PADRES
					switch(seleccion)
					{
						//Torneo
						case 0:
							do{
								indice1 = torneo(poblacion,elite);
								indice2 = torneo(poblacion,elite);
							}while(indice1 == indice2);
							break;
						//Ranking
						case 1:
							break;
						//Aleatorio
						case 2:
							do{
								indice1 = parseInt( Math.random() * numPobla*elite);
								indice2 = parseInt( Math.random() * numPobla*elite);
							}while(indice1 == indice2);
							break;
					}
					//console.log(indice1);
					//console.log(indice2);
					/*Padres*/
					var dad = poblacion[indice1].recorrido; 
					var mom = poblacion[indice2].recorrido;
					/*Camino para Hijos*/
					var camino1 = new Array();
					var camino2 = new Array();
					/*Numero entre 0 y numero de ciudades menos 1*/
					bp = parseInt( Math.random() * ciudades ); /*Punto de roptura*/

				/*-----------Genero 2 nuevos caminos-----------*/
					//Respaldo caminos de papa y mama hasta bp
					for(var i = 0; i < bp; i++)
					{
						camino1.push(dad[i]);
						camino2.push(mom[i]);
					}
					for(var i = 0; i < ciudades; i++)
					{	
						//Tomo el elemento a buscar en el segundo vector
						var busca1 = mom[i];
						var busca2 = dad[i];
						for(var j = bp; j < ciudades; j++)
						{
							if(busca1 == dad[j])
								camino1.push(busca1);
							if(busca2 == mom[j])
								camino2.push(busca2); 
						}
					}
					/*Hijos generados*/
					var hijo1 = {recorrido: camino1, distancia: aptitud(camino1,region)}
					var hijo2 = {recorrido: camino2,distancia : aptitud(camino2,region)}

					new_poblation.push(hijo1);
					new_poblation.push(hijo2);
					k++;
				}
				return new_poblation;
			}
			function mutacion(pob,ciudades)
			{
				let poblation = new Array();
				let cam=[];
				let debug = false;	//Visualizar antes de la mutación
				/*Recorro la poblacion*/
				for(i=0; i < pob.length;i++)
				{
					let ruta_aux = pob[i].recorrido;
					cam = ruta_aux;
					if(debug){console.log(ruta_aux);}
					var pm = Math.random();
					if(pm > 0.5)
					{
						//Calculo indices aleatorios
						do{
							var indice1 = parseInt( Math.random() * ciudades );
							var indice2 = parseInt( Math.random() * ciudades );
						}while(indice1 == indice2);

						if(debug){console.log(i+" "+indice1+" "+indice2);}
						//Cambio de posicion
						var aux = ruta_aux[indice1];
						ruta_aux[indice1] = ruta_aux[indice2]; 
						ruta_aux[indice2] = aux;
					}
					//Actualizo poblador
					var pobladorcito = {recorrido:ruta_aux, distancia: aptitud(ruta_aux,region)}
					poblation.push(pobladorcito);
				}
				return poblation;
			}
			//Calcula la distancia total de un camino
			function aptitud(camino,region_)
			{
				var sum = 0; 
				n = camino.length;
				for(var i=1;i < n ;i++)
				{
					punto1 = camino[i-1];	//indice para acceder al punto de la region
					punto2 = camino[i];		//indice para acceder al punto de la region
					sum += euclidian(punto1,punto2);
				}
				//Cerramos el recorrido
				punto1 = camino[n-1];	//indice para acceder al punto de la region
				punto2 = camino[0];		//indice para acceder al punto de la region
				sum += euclidian(punto1,punto2);
				return sum;
			}
			//Funcion que calcula la distancia entre dos puntos
			function euclidian(punto1,punto2)
			{
				var p1 = region.nodos[punto1];
				var p2 = region.nodos[punto2];
				var add = Math.pow(p2.x - p1.x,2) + Math.pow(p2.y-p1.y,2);
				return Math.sqrt(add);
			}
			//Función que genera region de puntos
			function create_points(ciudades,tipo)
			{
				let radio = 10;
				//Ciudades representa el numero de puntos
				var grafo = {nodos:[],ligas:[]};
				//Limites del plano carteciano
				var lim_x = 50;
				var lim_y = 50;
				//Disperso
				if(tipo == 0)
				{
					for(var i =0; i < ciudades; i++)
					{
						var x_ = parseInt( Math.random() * lim_x );
						var y_ = parseInt( Math.random() * lim_y );
						grafo.nodos.push({x: x_, y: y_});
					}
				}
				//Cuadrado else if(tipo == 1){}
				//Circular
				else
				{	
					for(var i =0; i < ciudades; i++)
					{
						let tetha = Math.random() * radio;
						var x_ = radio * Math.cos(tetha);
						var y_ = radio * Math.sin(tetha);
						grafo.nodos.push({x: x_, y: y_});
					}
				}
				return grafo;
			}
			//Funcion torneo regresa el indice del valor mas pequeñp
			function torneo(poblacion,elitismo)
			{
				let tam = poblacion.length;
				let ganador = tam;
				let enfrentamientos = 5;
				for(var i=0; i < enfrentamientos;i++)
				{
					let peleador = Math.random() * tam * elitismo;
					if(peleador < ganador){ganador = peleador;}
				}
				//console.log(ganador);
				return parseInt(ganador);
			}
			function show_aptos(poblacion,numero)
			{
				/*for(var i = 0; i < numero;i++)
					console.log(poblacion[i]);*/
			}
			//Genero un camino
			function path(n) 
			{
				var path_ = new Array();
				for(var i=0;i<n;i++)
					path_.push(i);
				return permutar(path_);
			}
			//Revuelvo los datos del arreglo
			function permutar(path)
			{
				var x = new Array();
				 x = path.sort(function(){return Math.random() - 0.5});
				 return x;
			}
			function dibuja()
			{
				canvas.clearRect(0,0,canvas.width,canvas.height);
				//Dibujo vertices
				canvas.beginPath();	//Comienza a dibujar
				//Grafico las aristas
				drawLiga(region.ligas);
				canvas.strokeStyle = "#A4A4A4";
				canvas.stroke();

				//Dibujo ultima linea
				canvas.beginPath();	//Comienza a dibujar
				//Grafico las aristas
				drawLLiga(region.ligas);
				canvas.strokeStyle = "#F00";
				canvas.stroke();

				//Dibujo nodos
				canvas.beginPath();
				canvas.fillStyle = "rgb("+ Math.random()*255 + ","+ Math.random()*255+","+ Math.random()*255+")";
				region.nodos.forEach(drawNodo);
				canvas.fill();
			}
			padding = 40;	
			separacion = 3; //Que tan separados estan los nodos uno del otro
			function drawNodo(nodo)
			{
				radio = 5;
				canvas.moveTo(nodo.x,nodo.y);
				canvas.arc(padding+nodo.x*separacion,padding+nodo.y*separacion,radio,0,Math.PI*2);

			}
			//Dibuja las aristas que correspondan a los nodos
			function drawLiga(liga)
			{
				var n = liga.length;
				for(var i=1; i < n;i++)
				{
					var orig_x = region.nodos[i].x;
					var orig_y = region.nodos[i].y;
					var dest_x = region.nodos[i-1].x;
					var dest_y = region.nodos[i-1].y;

					canvas.moveTo(padding+orig_x*separacion,padding+orig_y*separacion);
					canvas.lineTo(padding+dest_x*separacion,padding+dest_y*separacion);
				}
			}
			//Dibuja la ultima arista entre el primer y ultimo vertice
			function drawLLiga(liga)
			{
				var n = liga.length;
				orig_x = region.nodos[n-1].x;
				orig_y = region.nodos[n-1].y;
				dest_x = region.nodos[0].x;
				dest_y = region.nodos[0].y;
				canvas.moveTo(padding+orig_x*separacion,padding+orig_y*separacion);
				canvas.lineTo(padding+dest_x*separacion,padding+dest_y*separacion);
			}

		function genera_tabla(p,i,cantidad) {
		  // Obtener la referencia del elemento body
		  var container = document.getElementById("cont2");
		 
		  var row = document.createElement("div");
		  var row2 = document.createElement("div");
		  var col1 = document.createElement("div");
		  var col2 = document.createElement("div");
		  var col3 = document.createElement("div");
		  var col4 = document.createElement("div");
		  row.className="row t";
		  col1.className ="col-1";
		  col2.className ="col-5";
		  col3.className ="col-5";
		  col4.className ="col-1";  
		  canvas = document.createElement("canvas");
		  canvas.id = "canvas"+i;
		  // Crea un elemento <table> y un elemento <tbody>
		  var tabla   = document.createElement("table");
		  tabla.className = "table-hover"
		  var tblBody = document.createElement("tbody");

		  var hilera0= document.createElement("tr");
		  var ti0 =  document.createElement("th");
		    	 ti0.scope = "col";
		    	 var t = "Agente"
			     var textoCelda = document.createTextNode(t);
		    	 ti0.appendChild(textoCelda);
			      hilera0.appendChild(ti0);

				var ti0 =  document.createElement("th");
		    	 ti0.scope = "col";
		    	 var t = "Recorrido"
			     var textoCelda = document.createTextNode(t);
		    	 ti0.appendChild(textoCelda);
			      hilera0.appendChild(ti0);

			var ti2 =  document.createElement("th");
		    	 ti2.scope = "col";
		    	 var t = "Distancia"
			     var textoCelda = document.createTextNode(t);
		    	 ti2.appendChild(textoCelda);
			      hilera0.appendChild(ti2);      
		tblBody.appendChild(hilera0);
		 
		  // Crea las celdas
		  for (var i = 0; i < cantidad; i++) {
		  	let arre = p[i].recorrido;
			let d = p[i].distancia;

		    // Crea las hileras de la tabla
		    var hilera = document.createElement("tr");

		    	 var ti =  document.createElement("th");
		    	 ti.scope = "row";
		    	 var t = i+1;
			     var textoCelda = document.createTextNode(t);
		    	 ti.appendChild(textoCelda);
			      hilera.appendChild(ti);
			      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
			      // texto sea el contenido de <td>, ubica el elemento <td> al final
			      // de la hilera de la tabla
			      var celda1 = document.createElement("td");
			      var t = arre.toString();
			      var textoCelda = document.createTextNode("["+t+"]");
			      celda1.appendChild(textoCelda);
			      hilera.appendChild(celda1);

			      var celda2 = document.createElement("td");
			      var t = d.toString();
			      var textoCelda = document.createTextNode(t);
			      celda2.appendChild(textoCelda);
			      hilera.appendChild(celda2);
		 
		    // agrega la hilera al final de la tabla (al final del elemento tblbody)
		    tblBody.appendChild(hilera);
		  }
		 
		  // posiciona el <tbody> debajo del elemento <table>
		  tabla.appendChild(tblBody);
		  // appends <table> into <body>
		  col2.appendChild(tabla);
		  col3.appendChild(canvas);

		  row.appendChild(col1);
		  row.appendChild(col2);
		  row.appendChild(col3);
		  row.appendChild(col4);

		  container.appendChild(row);
		  container.appendChild(row2);
		  // modifica el atributo "border" de la tabla y lo fija a "2";
		  //tabla.setAttribute("border", "2");
		}