/*
    ============================================

    -Required: Jquery & bootstrap css
    -Configuration line 191

    -The widget save the user's address on line 66

    ============================================
*/

$(function(){
	(function(){
		var blWidget = {
			init: function(config){
				this.$target = $(config.target); // set target
				this.apiUrl = config.apiUrl;
				this.apiKey = config.apiKey;
				this.electionId = config.electionId;
				this.mapWidth = config.mapWidth;
				this.mapHeight = config.mapHeight;

				this.buildLayout();

				this.$body = $('.pl-body');
				this.$inputfield = $('.pl-user-input');
				this.$searchBtn = $('#pl-search');
				this.$form = $('.pl-form');
				this.$loading = $('<span>',{
					class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
				});

				var params = document.URL.split('?')[1];
				console.log(params);

				this.addListener();

			},
			buildLayout: function(){
				var layout = '<div class="pl-body"> \
							      <h2 class="pl-title">Find Your Ballot Location</h2> \
							      <div class="row"> \
							        <div class="col-xs-12 col-md-6"> \
							        <form class="pl-form">\
							          <div class="input-group"> \
							            <input type="text" class="form-control pl-user-input"  placeholder="Enter full registered voting address" required> \
							            <span class="input-group-btn"> \
							              <button class="btn btn-danger" type="submit" id="pl-search-btn">Search</button> \
							            </span> \
							          </div> \
							          </form>\
							        </div> \
							      </div> \
										<br> \
										<div id="accordion"> </div> \
						      </div>';
	  			this.$target.append(layout);
			},
			addListener: function() {
				firsttime = true;
				this.$form.on( 'submit', function(e){
					blWidget.sendAjaxRequest();
					e.preventDefault();
				});
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
					success: function(data){ blWidget.saveData(data) },
					error: function(jqXHR, textStatus, errorThrown) {
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
				var buildHTML = "";

				console.log(data);
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
								//link from ballot information to candidate information
								buildHTML += '<a href="/MVAWigets/ciwidget.php?candidatename='+candidates[j].name+'&address='+this.address+'"><h4  class="accordian-content panel-body">'+' ' + candidates[j].name +' ('+party+')</h4></a>';
							};
							buildHTML += '<h4  class="accordian-content panel-body">'+ ' ' + '___________ ' +'(Write-in)'+'</h4>';
							buildHTML += '</div>';
						};


				} else { // if no data
					buildHTML += '<h2 class="location-item">invalid input</h1>';
				}
				$('.glyphicon-refresh').remove();// remove loading

				this.displayData($targetInner,buildHTML);


				if(firsttime){
					$( "#accordion" ).accordion({ heightStyle: "content"  });
					firsttime = false;
				} else {
					$( "#accordion" ).accordion('destroy').accordion({ heightStyle: "content"  });
				}

				this.$loading.remove();// remove loading

			},
			displayData: function($targetInner,data){
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
			apiKey: 'AIzaSyDZxb_ROtxLItUxvx8pltmml2T39l6FfsM',
			electionId: '2000'
		});

	})(); // end of self invoking function
});
