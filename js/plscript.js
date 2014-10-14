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
						
						if(!!edata.pollingLocations){ // check for polling locations

							
							for (var i = edata.pollingLocations.length - 1; i >= 0; i--) { // loop through data
								var locationName = edata.pollingLocations[i].address.locationName;
								var street = edata.pollingLocations[i].address.line1;
								var city = edata.pollingLocations[i].address.city;
								var state = edata.pollingLocations[i].address.state;
								var zip = edata.pollingLocations[i].address.zip || '';
								var comma = plWidget.getComma(edata.pollingLocations[i].address.zip);
								var pollingAddress = '<p class="location-item">Address: '+street +' '+city +' '+ state +comma+zip+'</p>';
								var pollingAddressLink = street +' '+city +' '+ state + comma + ' '+zip;
								
								var $locationName = $('<h2>',{
									text: locationName,
									class: 'location-item'
								});
								var url = 'https://www.google.com/maps/dir/'+encodeURIComponent(address)+'/'+encodeURIComponent(pollingAddressLink);
								$locationAddressLink = $('<a href="'+url+'">'+pollingAddressLink+'</a>');
								$directionBtn = $('<div><a href="'+url+'"><button class="btn btn-danger location-item">Get Directions</button></a></div>');

								$targetInner.append($locationName);
								$targetInner.append(pollingAddress);
								$targetInner.append($directionBtn);
							};
						} else { // if no location
							$targetInner.append('<h2 class="location-item">location info N/A</h1>');
						}
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

		
		// local testing: getUrl: 'http://sandbox.dev:8080/GC/GCServer.php?a='
		plWidget.init({ //initialize with target and location to GC server app
			target: '#target-practice',
			getUrl: 'http://julian-nworb.com/PollingLocationWidget/server/GCServer2.php?a='
		});

	})(); // end of self invoking function
});