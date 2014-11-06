$(function(){
	(function(){

		var plWidget = {
			init: function(config){
				this.$target = $(config.target); // set target
                this.getUrl = config.getUrl; // location to server
                this.buildLayout();
                //this.addListener();
 
                var params = document.URL.split('?')[1];
 
                var candidatenparam = params.split('&')[0];
                var addressparam = params.split('&')[1];
 
                var candidatename = candidatenparam.split('=')[1].split('%20').join(' ');
                var address = addressparam.split('=')[1].split('%20').join(' ');
 
                console.log("hello i am in init " + candidatename);
                console.log("hello i am in init " + address);
                                                               
                this.sendAjaxRequest(address,candidatename);
			},
			buildLayout: function(){

<<<<<<< Updated upstream
				var layout = '<div class = "candidate-details" id="pl-targetInner"> \
						      <h1 class = "title">Candidate Details</h1> \

						      <div class="column-right" id ="pl-right"> \
						        <div class = "candidate-photo">\
						        </div>\
						      </div>\

						      <div class = "column-left" id = "pl-left">\
						      </div>\

						      <div class="row">\

						        <div class="col-xs-12 col-md-6"> \
						          <div class="input-group"> \
						            <input type="text" class="form-control" id="pl-userInput" required> \
						            <span class="input-group-btn"> \
						              <button class="btn btn-danger" type="button" id="pl-search">Search</button> \
						            </span> \
						          </div> \
=======
				var layout = '<div id="pl-targetInner"> \
						      <h2>Candidate Information</h2> \
						      <br> \
						      <br> \
						      <div class="row"> \
						        <div id="left" class="col-md-8"> \
						          <h3>Name</h3> \
						          <div id="accordion" class="panel panel-primary"> </div> \
						          <h3>Phone</h3> \
						        </div> \
						        <div id="right" class="col-md-4"> \
						          <img src="http://thegraphicsfairy.com/wp-content/uploads/2014/01/Valentine-Fairy-Image-GraphicsFairy.jpg"></img> \
>>>>>>> Stashed changes
						        </div> \
						      </div> \
							  <br> \
							  <div id="accordion" class="panel panel-primary"> </div> \
						    </div>';


	  			this.$target.append(layout);
			},
			//addListener: function() {

			//	$("#pl-search").on( 'click', this.sendAjaxRequest);
			//},
			sendAjaxRequest: function (addressCon,candidatenameCon) {
				$('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
				$('.location-item').remove(); // remove location
				
				//var address = $('#pl-userInput').val(); //get address
				var address = addressCon;
				var name = candidatenameCon;
				var getUrl = plWidget.getUrl;
				var GCurl = getUrl+address;
				
				

				$.ajax({ // send ajax request
					type:'GET',
					url: GCurl,
					dataType: 'json',
					success: plWidget.jsonParser(address,GCurl,name)
				});
				
			},
			jsonParser: function (address,GCurl,name){
				var $targetInner = $('#left');
				var $photoPart = $('#right');
				

				$.get(GCurl,function(data){
					if(data.length > 3){ // validate data

						var edata = jQuery.parseJSON(data); //convert json to javascript object
						
						
						for (var i = edata.contests.length - 1; i >= 0; i--) {

							var candidates = edata.contests[i].candidates;
							
							for (var j = candidates.length - 1; j >= 0; j--) {
								if(candidates[j].name == name){

								$left.append('<h4>Name </h4><br>');
								$left.append('<div id="accordion" class="panel panel-primary"> </div><br> ')
								$left.append(candidates[j].name);

								if (candidates[j].party.length > 0)
									$left.append('<h4>Party : ' + candidates[j].party +'<br></h4>');
								else
									$left.append('<h4>'+'  '+'Party : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("candidateUrl"))
									$targetInner.append('<h4>'+'  '+'Candidate URL : ' +'<a href="'+ candidates[j].candidateUrl +'">' +candidates[j].candidateUrl+'</a><br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'Candidate URL : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("phone"))
									$targetInner.append('<h4>'+'  '+'Phone : ' + candidates[j].phone +'<br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'Phone : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("photoUrl"))
									$photoPart.append('<h4>'+'  '+'Photo : ' + '<img src="'+candidates[j].photoUrl+'" alt="'+candidates[j].name+'"/>' +'<br></h4>');
								else
									$photoPart.append('<h4>'+'  '+'Photo : N/A <br></h4>');

								if (candidates[j].hasOwnProperty("email"))
									$targetInner.append('<h4>'+'  '+'E-mail : ' +'<a href="'+ candidates[j].email +'">' +candidates[j].email+'</a><br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'E-mail : N/A <br></h4>');

								if (candidates[j].hasOwnProperty("channels")){
									$targetInner.append('<h4>Channels : <br></h4>');
									var channels = candidates[j].channels;
								    
								    for (var k = 0; k<channels.length; k++){
								    	$targetInner.append('<h5>Type: '+channels[k].type+'<br></h5>');
								    	$targetInner.append('<h5>ID: <a href="'+channels[k].id+'">'+channels[k].id+'"</a><br></h5>');
								    };

								}
								else	
									$targetInner.append('<h4>'+'  '+'Channels : N/A <br><br><br></h4>');


								$targetInner.append('<br><br><br>');
							}
		 

							
							else{
								$targetInner.append('<h4>Error</h4>');
								$targetInner.append('<br><br><br>');
							}
						};

							
							



						};
							
							
						
					} else { // if no data
						$targetInner.append('<h2 class="location-item">invalid input</h1>');
					}
					$('.glyphicon-refresh').remove();// remove loading
				});
			},
			getComma: function (zip){
				if(zip){
					return ', ';
				} else {
					return ' ';
				}

			}
		

		}; // end of plWidget object
		

		plWidget.init({ //initialize with target and location to GC server app
			target: '#target-practice',
			getUrl: 'http://julian-nworb.com/PollingLocationWidget/server/GCServer2.php?a='
		});

	})(); // end of self invoking function
});
