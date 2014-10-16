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
						      <h2>Find Your Ballot Information</h2> \
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
						      <div id="accordion" class="panel panel-default"> </div> \
						    </div>';
	  			this.$target.append(layout);
			},
			addListener: function() {

				$("#pl-search").on( 'click', this.sendAjaxRequest);
			},
			sendAjaxRequest: function () {
				$('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
				$('#accordion').empty();// remove location
				
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
				var $targetInner = $('#accordion');
				$.get(GCurl,function(data){
					
					if(data.length > 3){ // validate data

						var edata = jQuery.parseJSON(data); //convert json to javascript object
						
						

							
							for (var i = edata.contests.length - 1; i >= 0; i--) { // loop through data
								var electionType = edata.contests[i].type;
								
								var office = edata.contests[i].office;
								$targetInner.append('<h3  class="panel-heading">'+office+' ('+electionType +')'+'</h3>');
								var district = edata.contests[i].district;


								$targetInner.append('<h5 class="panel-heading">'+ district.name+' ('+district.scope+')'+'</h5>');

								var candidates = edata.contests[i].candidates;
								for (var j = 0; j <= candidates.length - 1; j++) {
									var party = candidates[j].party;
									party = party.replace("Democratic", "D");
									party = party.replace("Republican", "R");

									$targetInner.append('<h4  class="panel-body">'+'&#x25A2;' +' ' + candidates[j].name +' ('+party+')</h4>');

								};

								$targetInner.append('<h4  class="panel-body">'+ '&#x25A2;' +' ' + '___________ ' +'(Write-in)'+'</h4>');
							};
						
					} else { // if no data
						$targetInner.append('<h3 class="location-item">invalid input</h3>');
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
