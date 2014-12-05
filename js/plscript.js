'use strict';
/*
============================================

-Required: Jquery & bootstrap css
-Configuration line 222

-The widget save the user's address on line 78

============================================
*/

$(function(){
	(function(){
		var plWidget = {
			init: function(config){
				// Config Defaults
				config = $.extend({
					mapWidth:'100%',
					mapHeight: '300',
					apiUrl: 'https://www.googleapis.com/civicinfo/v2/voterinfo?',
					electionId: '2000'
				}, config);

				this.$target 			= $(config.target); // set target
				this.apiUrl 			= config.apiUrl;
				this.apiKey 			= config.apiKey;
				this.electionId 	= config.electionId;
				this.mapWidth 		= config.mapWidth;
				this.mapHeight 		= config.mapHeight;
				this.initAddress	= config.initAddress;

				this.buildLayout();

				this.$body = $('.pl-body');
				this.$inputfield = $('.pl-user-input');
				this.$searchBtn = $('#pl-search');
				this.$form = $('.pl-form');
				this.$loading = $('<span>',{
					class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
				});

				this.addListener();
				this.sendAjaxRequest();
				this.clearInitAddress();

			},
			buildLayout: function(){
				/*jshint multistr: true */
				var layout = '<div class="pl-body col-xs-12"> \
				<h4 class="pl-title">Find Your Polling Location</h4> \
				<div class="row"> \
				<div class="col-xs-12 col-md-6"> \
				<form class="pl-form">\
				<div class="input-group"> \
				<input type="text" class="form-control pl-user-input" value="'+this.initAddress+'"  placeholder="Enter full registered voting address" required> \
				<span class="input-group-btn"> \
				<button class="btn btn-danger" type="submit" id="pl-search-btn">Search</button> \
				</span> \
				</div> \
				</form>\
				</div> \
				</div> \
				</div>';
				this.$target.append(layout);
			},
			addListener: function() {

				this.$form.on( 'submit', function(e){
					plWidget.sendAjaxRequest();
					e.preventDefault();
				});
			},
			clearInitAddress: function(){
				this.$inputfield.val('');
			},
			sendAjaxRequest: function () {
				this.$body.append(this.$loading);
				this.reset();
				this.address = this.$inputfield.val(); //get address

				//built url to retreive data
				var jsonUrl = this.apiUrl+'address='+encodeURIComponent(this.address)+'&electionId='+this.electionId+'&key='+this.apiKey;

				$.ajax({ // send ajax request
					type:'GET',
					url: jsonUrl,
					dataType: 'json',
					success: function(data){ plWidget.saveData(data); },
					error: function() {
						plWidget.dataError();
					}
				});

			},
			dataError: function(){
				this.$body.append($('<p>',{
					text: 'Sorry, There\'s no polling location for "'+this.address+'" in our Database',
					class: 'location-item pl-no-data.'
				}));
				this.$loading.remove();// remove loading
			},
			reset: function(){
				this.$searchBtn.append(this.$loading); //add loading
				$('.location-item').remove(); // remove location
				plWidget.$target.find('iframe').remove();// remove map

			},
			saveData: function (data){

				if(!!data.pollingLocations){ // check for polling locations
					var i = 0;
					var pollingLocationData = { // save data to object
						locationName: data.pollingLocations[i].address.locationName,
						street: data.pollingLocations[i].address.line1,
						city: data.pollingLocations[i].address.city,
						state: data.pollingLocations[i].address.state,
						zip: data.pollingLocations[i].address.zip,
						comma: plWidget.getComma(data.pollingLocations[i].address.zip),
						verified: data.pollingLocations[i].sources[i].name,
						official: data.pollingLocations[i].sources[i].official,

						userStreet: data.normalizedInput.line1,
						userCity: data.normalizedInput.city,
						usersState: data.normalizedInput.state,
						userZip: data.normalizedInput.zip
					};


					this.displayData(pollingLocationData); // append data to html page
				} else { // if no location
					this.dataError();
				}

				this.$loading.remove();// remove loading

			},
			displayData: function(data){
				var pollingAddress= data.street +' '+data.city +' '+ data.state +plWidget.getComma(data.zip)+data.zip,
				userAddress= data.userStreet +' '+data.userCity +' '+ data.usersState +' '+data.userZip;

				// update input value
				this.$inputfield.val(userAddress);

				var $locationName = $('<h4>',{
					text: data.locationName.toLowerCase(),
					class: 'location-item pl-location-name'
				});

				var $locationAddress = $('<p>',{
					text: pollingAddress.toLowerCase(),
					class: 'location-item pl-address'
				});


				var $voteHead = $('<h2>',{
					text: 'Your Voting Location',
					class: 'pl-vote-head location-item'
				});

				var $verified = $('<p>',{
					text: 'Source: '+data.verified+'(Official)',
					class: 'location-item pl-source'
				});

				var $unverified = $('<p>',{
					text: 'Source: unoffial',
					class: 'location-item pl-source'
				});

				var $baseAddress = $('<p>',{
					text: 'Polling location based on: '+userAddress,
					class: 'location-item pl-base-address'
				});

				this.$body.append($voteHead);
				this.$body.append($baseAddress);
				this.$body.append($locationName);
				this.$body.append($locationAddress);

				// add source
				if ( data.official ) {
					this.$body.append($verified);
				} else {
					this.$body.append($unverified);
				}
				//add direction button
				this.displayDirectionsBtn(encodeURIComponent(this.address),encodeURIComponent(pollingAddress));

			},
			getComma: function (zip){
				return (zip) ? ', ' : ' '; // return comma f zipcode is defined
			},
			setUpMap: function(fromAddress,toAddress){
				/*jshint multistr: true */
				var map = '<div class="map">\
				<iframe width="'+this.mapWidth+'" height="'+this.mapHeight+'" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/directions?origin='+fromAddress+'&destination='+toAddress+'&key='+plWidget.apiKey+'"></iframe>\
				</div>';
				$(map).insertAfter($('.pl-vote-head')).slideDown(); //add map after header
			},
			displayDirectionsBtn: function(fromAddress,toAddress){
				var self = this;
				var btn = $('<button>',{
					class: 'btn btn-danger pl-directions-btn location-item',
					text: 'Get Directions'
				});

				self.$body.append(btn);

				$('.pl-directions-btn').on('click', function(){
					self.setUpMap(fromAddress,toAddress); // build map
					$(this).remove(); // remove get direction button
				});
			}


		}; // end of plWidget object

		/*
		============================================

		Polling Location Widget Config
		Target = div to target on page(require id or class)
		MapWidth = width of directions map
		MapHeight = similar to width
		apiUrl = url to google civic api
		apiKey = google civic api key (browser key)
		electionId = id of interested election(found on google civic website)

		============================================
		*/
		plWidget.init({
			target 			: '#target-practice',
			mapWidth		:'100%',
			mapHeight 	: '300',
			apiUrl 			: 'https://www.googleapis.com/civicinfo/v2/voterinfo?',
			apiKey  		: 'AIzaSyDqyAn7yBGwWyZsFs5zWSh6zArNcQJDaAw',
			electionId	: '2000',
			initAddress	: '5000 forbes ave pittsburgh PA 15213'
		});

	})(); // end of self invoking function
}); // end onload function
