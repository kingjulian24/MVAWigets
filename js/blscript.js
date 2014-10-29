$(function(){
	(function(){
		var plWidget = {
			init: function(config){
				this.$target = $(config.target); // set target
				this.apiUrl = config.apiUrl;
				this.apiKey = config.apiKey;
				this.electionId = config.electionId;
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
							  <br> \
							  <div id="accordion" class="panel panel-primary"> </div> \
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
			jsonParser: function (address,GCurl){
				var $targetInner = $('#accordion');
				$.get(GCurl,function(data){
					
					var buildHTML = "";
					if(data.contests.length > 0){ // validate data

						var edata = data; //convert json to javascript object
						
							for (var i = edata.contests.length - 1; i >= 0; i--) { // loop through data
								var electionType = edata.contests[i].type;								
								var office = edata.contests[i].office;
								buildHTML += '<h2  class="ctrl">'+office+' ('+electionType +')'+'</h2>';
								var district = edata.contests[i].district;
								var candidates = edata.contests[i].candidates;
								buildHTML += '<div class="pnl">';
								buildHTML += '<h5 >'+ district.name+' ('+district.scope+')'+'</h5>';
								for (var j = 0; j <= candidates.length - 1; j++) {
 
									buildHTML += '<a href="http://localhost:8080/MVAWigets/blwidget.php"><h4  class="accordian-content panel-body">'+'&#x25A2;' +' ' + candidates[j].name +' ('+candidates[j].party+')</h4></a>';
								};
								buildHTML += '<h4  class="accordian-content panel-body">'+ '&#x25A2;' +' ' + '___________ ' +'(Write-in)'+'</h4>';
								buildHTML += '</div>';
							};
					
						
					} else { // if no data
						buildHTML += '<h2 class="location-item">invalid input</h1>';
					}
					$('.glyphicon-refresh').remove();// remove loading
					
					
				$targetInner.append(buildHTML);
					
					$( "#accordion" ).accordion();
					
				});

				
				
				
			},
		

		}; // end of plWidget object

		plWidget.init({ //initialize with target and location to GC server app
			target: '#target-practice',
			apiUrl: 'https://www.googleapis.com/civicinfo/v2/voterinfo?address=',
			apiKey: 'AIzaSyDqyAn7yBGwWyZsFs5zWSh6zArNcQJDaAw',
			electionId: '4100'
		});

	})(); // end of self invoking function
});