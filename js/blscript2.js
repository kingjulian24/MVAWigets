'use strict';
/*
============================================

-Required: Jquery & bootstrap css

============================================
*/

$(function(){
	(function(){
		var blWidget = {
			init: function(config){
				this.$target 			= $(config.target); // set target
				this.apiUrl 			= config.apiUrl;
				this.apiKey 			= config.apiKey;
				this.electionId 	= config.electionId;
				this.initAddress	= config.initAddress;

				this.candidates 	= {};

				this.buildLayout();
				this.$body 				= $('.pl-body');
				this.$inputfield 	= $('.pl-user-input');
				this.$searchBtn 	= $('#pl-search');
				this.$form 				= $('.pl-form');

				this.$loading = $('<span>',{
					class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
				});

				this.sendAjaxRequest(); // initailize

				this.addListener();
			},

			buildLayout: function(){
				/*jshint multistr: true */
				var layout = '<div class="pl-body col-xs-12"> \
				<h4 class="pl-title">Ballot Information Finder</h4> \
				<div class="row"> \
				<div class="col-xs-12 col-md-6"> \
				<div><label for="input.address" style="text-indent:-10000px; position:absolute;">Enter Your Full Registered Address</label></div> \
				<form class="pl-form">\
				<div class="input-group"> \
				<input type="text" id="input.address" class="form-control pl-user-input"  value="'+this.initAddress+'" placeholder="Enter full registered voting address" required tabindex = "1"> \
				<span class="input-group-btn"> \
				<button class="btn btn-danger" type="submit" id="pl-search-btn" tabindex = "2">Search</button> \
				</span> \
				</div> \
				</form>\
				</div> \
				</div> \
				<br> \
				<div id="accordion"> </div> \
				</div>';


				//modal
				layout	+= '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
				<div class="modal-dialog">\
				<div class="modal-content">\
				<div class="modal-header">\
				<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
				<h4 class="modal-title" id="myModalLabel">Modal title</h4>\
				</div>\
				<div class="modal-body">\
				<div class="row">\
				<div class="col-xs-4 photoUrl">\
				<img src="http://satyaflowyoga.com/satyaflow/wp-content/uploads/2014/06/placeholder1.jpg" style="max-width:100%">\
				</div>\
				<div class="col-xs-8 candidateInfo">\
				</div>\
				</div>\
				</div>\
				<div class="modal-footer">\
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
				</div>\
				</div>\
				</div>\
				</div>';
				this.$target.append(layout);
			},
			addListener: function() {
				this.firsttime = true;
				this.$form.on( 'submit', function(e){

					blWidget.sendAjaxRequest();
					e.preventDefault();
				});

				$('.myModal').on('click', this.showCandidate);
			},
			showCandidate: function(){
				$('.candidateInfo').html('');
				$('.photoUrl img').attr('scr','http://satyaflowyoga.com/satyaflow/wp-content/uploads/2014/06/placeholder1.jpg');
				$('.modal-header').html('');
				var name 		= $(this).data('candidatename');
				var party   = blWidget.candidates[name].party;
				var url 		= blWidget.candidates[name].candidateUrl;
				var photo 	= blWidget.candidates[name].photoUrl;
				var office 	= blWidget.candidates[name].office;
				var email 	= (url !== '') ? '<span><a href="'+url+'"><i class="fa fa-bookmark social-fa"></i></a></span>' : '';
				var info 		= '<h3>'+name+'</h3><h4>'+party+'</h4>'+email;
				var type 		= '';
				var id 			= '';

				$('.modal-header').append('<h4>'+office+'</h4>');
				// channels
				for(var c = 0; c < blWidget.candidates[name].channels.length; c++){
					type = blWidget.candidates[name].channels[c].type || '';
					id   = blWidget.candidates[name].channels[c].id || '';

					if(type === 'Facebook') {
						info += '<a href="' + id + '"><i class="fa fa-facebook-square social-fa"></i></a>';
					} else if( type === 'Twitter') {
						info += '<a href="' + id + '"><i class="fa fa-twitter social-fa"></i></a>';
					} else if( type === 'YouTube') {
						info += '<a href="' + id + '"><i class="fa fa-youtube-play social-fa"></i></a>';
					}
				}


				$('.candidateInfo').append(info);

				// add photo if exist
				if(photo !== ''){
					$('.photoUrl img').attr('src',photo);
				}

				//styles
				var $icons 		= $('.social-fa');
				var $youtube 	= $('.fa-youtube-play');
				var $twitter 	= $('.fa-twitter');




				$icons.css({
					fontSize: '30px',
					marginRight: '10px'
				});

				$youtube.css({
					color: 'red'
				});

				$twitter.css({
					color: 'rgb(0,153,153)'
				});


				$('#myModal').modal('show');

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
					success: function(data){ blWidget.saveData(data); },
					error: function() {
						blWidget.dataError();
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

			},
			saveData: function (data){

				var $targetInner = $('#accordion');
				var buildHTML = '';

				//console.log(data);
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
						for (var j = 0; j < candidates.length; j++) {
							var party = candidates[j].party;
							buildHTML += '<h4 data-candidatename="'+candidates[j].name+'" class="myModal accordian-content panel-body" style="cursor: pointer;">'+' ' + candidates[j].name +' ('+party+')</h4>';

							this.candidates[candidates[j].name] = {
								name:candidates[j].name,
								party: party || '',
								channels: candidates[j].channels || '',
								email: candidates[j].email || '',
								candidateUrl: candidates[j].candidateUrl || '',
								photoUrl: candidates[j].photoUrl || '',
								office: office || ''
							};


						}
						buildHTML += '<h4  class="accordian-content panel-body">'+ ' ' + '___________ ' +'(Write-in)'+'</h4>';
						buildHTML += '</div>';
					}


				} else { // if no data
					buildHTML += '<h2 class="location-item">invalid input</h1>';
				}
				$('.glyphicon-refresh').remove();// remove loading

				this.displayData($targetInner,buildHTML);
				if(this.firsttime){this.addListener();} else {$('.myModal').on('click', this.showCandidate);}

				if(this.firsttime){
					$( '#accordion' ).accordion({ heightStyle: 'content'  });
					this.firsttime = false;
				} else {
					$( '#accordion' ).accordion('destroy').accordion({ heightStyle: 'content'  });
				}

				this.$loading.remove();// remove loading

			},
			displayData: function($targetInner,data){
				$targetInner.html('');
				$targetInner.append(data);



			}


		}; // end of blWidget object

		/*
		============================================

		Ballot Information Widget Config
		Target = div to target on page(require id or class)
		apiUrl = url to google civic api
		apiKey = google civic api key (browser key)
		electionId = id of interested election(found on google civic website)

		============================================
		*/
		blWidget.init({
			target: '#target-practice',
			apiUrl: 'https://www.googleapis.com/civicinfo/v2/voterinfo?',
			apiKey: 'AIzaSyDqyAn7yBGwWyZsFs5zWSh6zArNcQJDaAw',
			electionId: '2000',
			initAddress: '5000 forbes ave pittsburgh PA 15213'
		});

	})(); // end of self invoking function
});
