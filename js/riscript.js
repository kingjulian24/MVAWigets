$(function () {
    (function () {

        var ciWidget = {
            init: function (config) {
                this.$target = $(config.target); // set target
                this.apiUrl = config.apiUrl;
                this.apiKey = config.apiKey;
                this.electionId = config.electionId;

                this.getUrl = config.getUrl; // location to server
                this.buildLayout();

                
				this.$body = $('.pl-body');
				this.$inputfield = $('.pl-user-input');
				this.$searchBtn = $('#pl-search');
				this.$form = $('.pl-form');
				this.$loading = $('<span>',{
					class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
				});

				this.addListener();
				this.clearInitAddress();

            },

            buildLayout: function () {


			var layout = '<div class="pl-body"> \
							      <h4 class="pl-title">Find Another Polling Location</h4> \
							      <div class="row"> \
							        <div class="col-xs-12 col-md-6"> \
							        <form class="pl-form">\
							          <div class="input-group"> \
							            <input type="text" class="form-control pl-user-input" value="Carnegie Mellon University"  placeholder="Enter full registered voting address" required> \
							            <span class="input-group-btn"> \
							              <button class="btn btn-danger" type="submit" id="pl-search-btn">Search</button> \
							            </span> \
							          </div> \
							          </form>\
							        </div> \
											<div class="small mute col-xs-12"><p>Disclaimer</p></div>\
							      </div> \
						      </div>';
                this.$target.append(layout);
            },
            addListener: function() {

				this.$form.on( 'submit', function(e){
					ciWidget.sendAjaxRequest();
					e.preventDefault();
				});
			},
			clearInitAddress: function(){
				this.$inputfield.val("");
			},

            sendAjaxRequest: function () {
                $('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
                $('.location-item').remove(); // remove location



              this.address = this.$inputfield.val(); //get address
               

                var jsonUrl = this.apiUrl  + '?address=' + encodeURIComponent( this.address ) + '&key=' + this.apiKey;




                $.ajax({ // send ajax request
                    type: 'GET',
                    url: jsonUrl,
                    dataType: 'json',
                    //success: ciWidget.jsonParser(addressCon,jsonUrl,name)
                    success: function (data) {
                        ciWidget.jsonParser(jsonUrl)
                    }
                });


            },
            jsonParser: function (GCurl) {

                var $top = $('#top');
                var $left = $('#leftPart');
                var $right = $('#rightPart');
                var candidateName = name;

                $.get(GCurl, function (data) {
                var edata = data;
                    if (edata.offices.length > 0) { // validate data



                        for (var i = 0; i < edata.offices.length; i++) {
                            var officeName = edata.offices[i].name;
                            $top.append('<h2>Official Information for' + officeName + '</h2>');
                            $top.append('<div id="namePanel" class="panel panel-primary"></div>')


                            var officeLevel = edata.offices[i].levels;
                            var officialIndices = edata.offices[i].officialIndices;
                            for (var j = 0; j < edata.offices[i].officialIndices.length; j++) {
                                var officialRow = edata.offices[i].officialIndices[j];
                                var offName = edata.officials[officialRow].name;
                                $right.append('<h3 style="color:#064479">' + offName + '</h2>');

                                var offParty = edata.officials[officialRow].party;
                                $right.append('<h3>' + offParty + '</h3>');
                                var offPhoto = edata.officials[officialRow].photoUrl;

                                if (offPhoto != null) $left.append('<img src="' + offPhoto + '" alt="' + offName + '"/>' + '</h4>');
                                else $left.append('<img src="https://raw.githubusercontent.com/kingjulian24/MVAWigets/master/U.S.%20Vote%20Foundation%20%20%20My%20Voter%20Account_files/candicon.png" alt="noPhoto"/>');

                                var chanels = edata.officials[officialRow].channels;
                                $right.append('<h2>');
                                for (var k = 0; k < chanels.length; k++) {
                                    var type = chanels[k].type;
                                    var id = chanels[k].id;

                                    if (type == 'Facebook') {
                                        $right.append('<a href="https://www.facebook.com/' + id + '"><i class="fa fa-facebook-square"></i></a>');
                                    }
                                    if (type == 'Twitter') {
                                        $right.append('<a href="https://www.Twitter.com/' + id + '"><i class="fa fa-twitter"></i></a>');
                                    }
                                    if (type == 'YouTube') {
                                        $right.append('<a href="https://www.YouTube.com/' + id + '"><i class="fa fa-youtube-play"></i></a>');
                                    }

                                };
                                $right.append('</h2>');
                            };



                        };
                        $('.fa-twitter, .fa-facebook-square, .fa-youtube-play').css({
                            fontSize: '35px'
                        });
                        $('.fa-youtube-play').css({
                            color: 'red'
                        });
                        $('.glyphicon-refresh').remove(); // remove loading
                    } else { // if no data

                        $right.append('<h1>invalid input</h1>');
                    }
                    $('.glyphicon-refresh').remove(); // remove loading
                });
            }

        }; // end of ciWidget object


        ciWidget.init({ //initialize with target and location to GC server app
            target: '#target-practice',
            apiUrl: 'https://www.googleapis.com/civicinfo/v2/representatives',
            apiKey: 'AIzaSyDZxb_ROtxLItUxvx8pltmml2T39l6FfsM',

        });

    })(); // end of self invoking function
});