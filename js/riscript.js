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
						      <h2>Elected Representative Information by your address</h2> \
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
					var edata = jQuery.parseJSON(data)
					if(edata.offices.length> 0){ // validate data
			
			

				for (var i = 0; i < edata.offices.length; i++) {
					var officeName = edata.offices[i].name;
					$targetInner.append('<h2> Elected Officials for '+officeName+'</h2>');
					var officeLevel = edata.offices[i].levels;
					var officialIndices = edata.offices[i].officialIndices;
					for(var j = 0; j < edata.offices[i].officialIndices.length; j++){
					var  officialRow = edata.offices[i].officialIndices[j];
					var  offName = edata.officials[officialRow].name;
					$targetInner.append('<h3>'+offName+'</h3>');
					var  offParty = edata.officials[officialRow].party;
					$targetInner.append('<h3>'+offParty+'</h3>');
					var  offPhoto = edata.officials[officialRow].photoUrl;
					$targetInner.append('<img src="' + offPhoto + '" height="160" width="120">');
					var  chanels = edata.officials[officialRow].channels;
					for(var k = 0; k < chanels.length; k++){
						var type = chanels[k].type;
						var id = chanels[k].id;
						$targetInner.append('<i class="fa fa-twitter"></i>' + '<h3>'+type + ': ' + id +'</h3>');
					};
					};
					
					
					
				};
		} else { // if no data

			$targetInner.append('<h1>invalid input</h1>');
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
			getUrl: 'http://julian-nworb.com/PollingLocationWidget/server/GCServer3.php?a='
		});

	})(); // end of self invoking function
});