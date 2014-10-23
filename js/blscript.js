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
							  <br> \
							  <div id="accordion" class="panel panel-primary"> </div> \
						    </div>';
	  			this.$target.append(layout);
			},
			addListener: function() {

				$("#pl-search").on( 'click', this.sendAjaxRequest);
			},
			sendAjaxRequest: function () {
				$('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
				$('#accordion').empty(); // remove location
				
				var address = $('#pl-userInput').val(); //get address
				//var getUrl = plWidget.getUrl;
				var GCurl = 'https://www.googleapis.com/civicinfo/v2/voterinfo?address=5530%20fifth%20avenue%20pittsburgh&key=AIzaSyBGtYVq_OZ35H4BY-r4IAx5cYAVTuOG7rQ';
				

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
									var party = candidates[j].party;
									party = party.replace("Democratic", "D");
									party = party.replace("Republican", "R");
									buildHTML += '<a href="http://localhost:8080/MVAWigets/blwidget.php"><h4  class="accordian-content panel-body">'+'&#x25A2;' +' ' + candidates[j].name +' ('+party+')</h4></a>';
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
			getUrl: 'http://localhost:8080/AjaxTemplate/server/server.php?a='
		});

	})(); // end of self invoking function
});