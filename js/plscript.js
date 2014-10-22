$(function(){
	(function(){
		var plWidget = {
			init: function(config){
				this.$target = $(config.target); // set target
				this.apiUrl = config.apiUrl;
				this.apiKey = config.apiKey;
				this.electionId = config.electionId;
				this.mapWidth = config.mapWidth;
				this.mapHeight = config.mapHeight;
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
				plWidget.reset();
				
				var address = $('#pl-userInput').val(); //get address
				
				//built url to retreive data
				var jsonUrl = plWidget.apiUrl+encodeURIComponent(address)+'&electionId='+plWidget.electionId+'&key='+plWidget.apiKey;

				$.ajax({ // send ajax request
					type:'GET',
					url: jsonUrl,
					dataType: 'json',
					success: function(data){ plWidget.jsonParser(address,data) },
					error: function(jqXHR, textStatus, errorThrown,address) {
						plWidget.dataError();
					}	
				});
				
			},
			dataError: function(){
				$('#pl-targetInner').append('No information found');
				$('.glyphicon-refresh').remove();// remove loading
			},
			reset: function(){
				$('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
				$('.location-item').remove(); // remove location
				plWidget.$target.find('iframe').remove();// remove map

			},
			jsonParser: function (address,data){
				var $targetInner = $('#pl-targetInner');
					
						
						if(!!data.pollingLocations){ // check for polling locations							
							for (var i = data.pollingLocations.length - 1; i >= 0; i--) { // loop through data
								var locationName = data.pollingLocations[i].address.locationName;
								var street = data.pollingLocations[i].address.line1;
								var city = data.pollingLocations[i].address.city;
								var state = data.pollingLocations[i].address.state;
								var zip = data.pollingLocations[i].address.zip || '';
								var comma = plWidget.getComma(data.pollingLocations[i].address.zip);
								var pollingAddress = street +' '+city +' '+ state +comma+zip;
								var pollingAddressLink = street +' '+city +' '+ state + comma + ' '+zip;
								
								var $locationName = $('<h2>',{
									text: locationName,
									class: 'location-item'
								});

								var $locationAddress = $('<p>',{
									text: pollingAddress,
									class: 'location-item'
								});
								
						
								$targetInner.append($locationName);
								$targetInner.append($locationAddress);
								
								// build map
								plWidget.setUpMap($targetInner,encodeURIComponent(address),encodeURIComponent(pollingAddressLink));
							};
						} else { // if no location
							$targetInner.append('<h2 class="location-item">location info N/A</h1>');
						}
					
					$('.glyphicon-refresh').remove();// remove loading
				
			},
			getComma: function (zip){
				return (zip) ? ', ' : ' '; // return comma f zipcode is defined
			},
			setUpMap: function($targetInner,fromAddress,toAddress){
				var map = '<iframe width="'+this.mapWidth+'" height="'+this.mapHeight+'" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/directions?origin='+fromAddress+'&destination='+toAddress+'&key='+plWidget.apiKey+'"></iframe>';
				$targetInner.append(map);
			}
		

		}; // end of plWidget object


		plWidget.init({ //initialize with target and location to GC server app
			target: '#target-practice',
			mapWidth:'600',
			mapHeight: '450',
			apiUrl: 'https://www.googleapis.com/civicinfo/v2/voterinfo?address=',
			apiKey: 'AIzaSyBS8uptpmeZ4g3QTJ6WbVNKeXY4nnkxVjc',
			electionId: '2000'
		});

	})(); // end of self invoking function
});
