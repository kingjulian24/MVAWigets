$(function(){
	(function(){

		var ciWidget = {
			init: function(config){
				this.$target = $(config.target); // set target
				this.apiUrl = config.apiUrl;
				this.apiKey = config.apiKey;
				this.electionId = config.electionId;

								this.getUrl = config.getUrl; // location to server
								this.buildLayout();

								var params = document.URL.split('?')[1];

								var candidatenparam = params.split('&')[0];
								var addressparam = params.split('&')[1];

								var candidatename = candidatenparam.split('=')[1].split('%20').join(' ');
								var address = addressparam.split('=')[1].split('%20').join(' ');

								//console.log("hello i am in init " + candidatename);
								//console.log("hello i am in init " + address);

								this.sendAjaxRequest(address,candidatename);

			},

			buildLayout: function(){


				var layout = "<div id='pl-targetInner'"
									+"<div class='row' id='top'>"
									+"<div id='top' class='col-md-15'>"
									+"</div>"
									+"<div class='row'>"
									+"<div class='col-md-0.5'></div>"
									+"<div id='leftPart' class='col-md-5'>"
									+"</div>"
									+"<div id='middle' class='col-md-5'>"
									+"</div>"
									+"<div id='rightPart' class='col-md-2'> </div>"
									+"</div>"
									+"</div>"
									+"</div>"

					this.$target.append(layout);
			},

			sendAjaxRequest: function (addressCon,candidatenameCon) {
				$('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
				$('.location-item').remove(); // remove location

				//var address = $('#pl-userInput').val(); //get address

				var name = candidatenameCon;
				//var getUrl = ciWidget.getUrl;
				//var GCurl = getUrl+address;
				//var Turl = 'https://www.googleapis.com/civicinfo/v2/voterinfo?address=5530%20fifth%20avenue%20pittsburgh&key=AIzaSyBGtYVq_OZ35H4BY-r4IAx5cYAVTuOG7rQ';
				//console.log("xxxxxxkkkkkk"+GCurl);
				var jsonUrl = this.apiUrl+'address='+encodeURIComponent(addressCon)+'&electionId='+this.electionId+'&key='+this.apiKey;


				$.ajax({ // send ajax request
					type:'GET',
					url: jsonUrl,
					dataType: 'json',
					//success: ciWidget.jsonParser(addressCon,jsonUrl,name)
					success: function(data){ ciWidget.jsonParser(addressCon,jsonUrl,name,data) }
				});


			},
			jsonParser: function (address,GCurl,name,data){

				var $top = $('#top');
				var $left = $('#leftPart');
				var $middle = $('#middle');
				var $right = $('#rightPart');
				var candidateName = name;
				console.log("data: ");
				console.log(data);
				$.get(GCurl,function(data){
					if(data.contests.length > 0){ // validate data

						var edata = data; //convert json to javascript object


						for (var i = edata.contests.length - 1; i >= 0; i--) {

							var candidates = edata.contests[i].candidates;
							console.log(candidates);

							for (var j = candidates.length - 1; j >= 0; j--) {
								if(candidates[j].name == candidateName){

								$top.append('<h2>'+candidates[j].name+'</h2>');
								$top.append('<div id="namePanel" class="panel panel-primary"></div><br>')


								if (candidates[j].party.length > 0)
									$left.append('<h4>Party : ' + candidates[j].party +'<br></h4>');
								else
									$left.append('<h4>'+'  '+'Party : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("candidateUrl"))
									$left.append('<h4>'+'  '+'Candidate URL : ' +'<a href="'+ candidates[j].candidateUrl +'">' +candidates[j].candidateUrl+'</a><br></h4>');
								else
									$left.append('<h4>'+'  '+'Candidate URL : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("phone"))
									$middle.append('<h4>'+'  '+'Phone : ' + candidates[j].phone +'<br></h4>');
								else
									$middle.append('<h4>'+'  '+'Phone : N/A <br></h4>');


								if (candidates[j].hasOwnProperty("photoUrl"))
									$right.append('<img src="'+candidates[j].photoUrl+'" alt="'+candidates[j].name+'"/>' +'<br></h4>');
								else
									$right.append('<img src="http://www.dspsjsu.org/wp-content/uploads/2012/07/no-profile-img.gif" alt="noPhoto"/>');

								if (candidates[j].hasOwnProperty("email"))
									$middle.append('<h4>'+'  '+'E-mail : ' +'<a href="'+ candidates[j].email +'">' +candidates[j].email+'</a><br></h4>');
								else
									$middle.append('<h4>'+'  '+'E-mail : N/A <br></h4>');

								if (candidates[j].hasOwnProperty("channels")){
									$left.append('<h4>Channels : <br></h4>');
									var channels = candidates[j].channels;

										for (var k = 0; k<channels.length; k++){
											$left.append('<h5>Type: '+channels[k].type+'<br></h5>');
											$left.append('<h5>ID: <a href="'+channels[k].id+'">'+channels[k].id+'"</a><br></h5>');
										};

								}
								else
									$left.append('<h4>'+'  '+'Channels : N/A <br><br><br></h4>');


								$targetInner.append('<br><br><br>');
							}



							else{
								$top.append('<br><br><br>');
							}
						};


						};



					} else { // if no data
						$top.append('<h2 class="location-item">invalid input</h1>');
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


		}; // end of ciWidget object


		ciWidget.init({ //initialize with target and location to GC server app
			target: '#target-practice',
			apiUrl:'http://www.googleapis.com/civicinfo/v2/voterinfo?',
			apiKey:'AIzaSyDZxb_ROtxLItUxvx8pltmml2T39l6FfsM',
			electionId:'2000'
			//getUrl: 'http://localhost:8888/AjaxTemplate/server/server.php?a='
		});

	})(); // end of self invoking function
});
