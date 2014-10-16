$(function(){
	(function(){
		var plWidget = {
			init: function(config){
				this.$target = $(config.target); // set target
				this.getUrl = config.getUrl; // location to server
				this.buildLayout();
				this.addListener();
			},
			buildLayout: function(){
				var layout = '<div id="pl-targetInner"> \
						      <h2>Find Your Polling Location</h2> \
						      <div class="row"> \
						        <div class="col-xs-12 col-md-6"> \
						          <div class="input-group"> \
						            <input type="text" class="form-control" id="pl-userInput" required> \
						            <span class="input-group-btn"> \
						              <button class="btn btn-danger" type="button" id="pl-search">Search</button> \
						            </span> \
						          </div> \
						        </div> \
						      </div> \
						    </div>';
	  			this.$target.append(layout);
			},
			addListener: function() {

				$("#pl-search").on( 'click', this.sendAjaxRequest);
			},
			sendAjaxRequest: function () {
				$('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
				$('.location-item').remove(); // remove location
				
				var address = $('#pl-userInput').val(); //get address
				var getUrl = plWidget.getUrl;
				var GCurl = getUrl+address;
				

				$.ajax({ // send ajax request
					type:'GET',
					url: GCurl,
					dataType: 'json',
					success: plWidget.jsonParser(address,GCurl)
				});
				
			},
			jsonParser: function (address,GCurl){
				var $targetInner = $('#pl-targetInner');
				$.get(GCurl,function(data){
					
					if(data.length > 3){ // validate data

						var edata = jQuery.parseJSON(data); //convert json to javascript object
						
						
						for (var i = edata.contests.length - 1; i >= 0; i--) {

							//$targetInner.append('<h1>'+electionType+'</h1>');
							//var office = edata.contests[i].office;
							//$targetInner.append('<h2>'+office+'</h2>');
							//var district = edata.contests[i].district;


							//$targetInner.append('<h3>'+ district.name+':'+district.scope+':'+district.id+':'+'</h3>');

							var candidates = edata.contests[i].candidates;
							$targetInner.append(edata);
							for (var j = candidates.length - 1; j >= 0; j--) {
								$targetInner.append('<h4>Name : ' + candidates[j].name +'<br></h4>');

								if (candidates[j].party.length > 0)
									$targetInner.append('<h4>Party : ' + candidates[j].party +'<br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'Party : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("candidateUrl"))
									$targetInner.append('<h4>'+'  '+'Candidate URL : ' +'<a href="'+ candidates[j].candidateUrl +'">' +candidates[j].candidateUrl+'</a><br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'Candidate URL : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("phone"))
									$targetInner.append('<h4>'+'  '+'Phone : ' + candidates[j].phone +'<br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'Phone : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("photoUrl"))
									$targetInner.append('<h4>'+'  '+'Photo : 3333333333' + '<img src="'+candidates[j].photoUrl+'" alt="'+candidates[j].name+'"/>' +'<br></h4>');
								else
									$targetInner.append('<h4>'+'  '+'Photo : N/A <br></h4>');

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
			getUrl: 'http://julian-nworb.com/PollingLocationWidget/server/getcivic.php?a='
		});

	})(); // end of self invoking function
});