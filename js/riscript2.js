$(function () {
    (function () {

      var ciWidget = {
        init: function (config) {
          this.$target = $(config.target); // set target
          this.apiUrl = config.apiUrl;
          this.apiKey = config.apiKey;
          this.electionId = config.electionId;

          this.getUrl = config.getUrl; // location to google civic api v2
          this.buildLayout();

          // catche dom elments
          this.$body = $('.reps');
          this.$inputfield = $('.pl-user-input');
          this.$searchBtn = $('#pl-search');
          this.$form = $('.pl-form');
		      this.$loading = $('<span>',{
					       class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
           });

				  this.addListener(); // listen for search
          this.sendAjaxRequest(); // initialize search
		      this.clearInitAddress();  // clear input value

        },

        buildLayout: function () {


			   var layout = '<div class="pl-body"> \
                        <h4 class="pl-title">Your Elective Representive</h4> \
                         <div class="row reps"></div> \
                          <div class="row"> \
                            <div class="col-xs-12 col-md-6"> \
                            <form class="pl-form"> \
                              <div class="input-group"> \
                                <input type="text" class="form-control pl-user-input" value="Carnegie Mellon University"  placeholder="Find Reps. Using Another Address" required> \
                                <span class="input-group-btn">\
                                  <button class="btn btn-danger" type="submit" id="pl-search-btn">Search</button> \
                                </span> \
                              </div> \
                              </form> \
                            </div> \
                            <div class="small mute col-xs-12"> \
                              <p>Disclaimer</p>\
                            </div> \
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
                        ciWidget.jsonParser(data);
                    }
                });
            },
            jsonParser: function (data) {
              var officials = data.officials;
              var normalizedAddress = {
                userStreet: data.normalizedInput.line1,
                userCity: data.normalizedInput.city,
                usersState: data.normalizedInput.state,
                userZip: data.normalizedInput.zip
              }
              this.address = normalizedAddress.userStreet +' '+normalizedAddress.userCity +' '+ normalizedAddress.usersState +' '+normalizedAddress.userZip;
              $('.pl-title').after($('<p>Based on: '+this.address+'</p>'));

              if(officials.length > 0){
                var social = '';
                var type = '';
                var id = '';

                for(var i = 0; i < officials.length; i++){
                  social = '';
                  var name        = officials[i].name,
                      image       = officials[i].photoUrl || 'http://satyaflowyoga.com/satyaflow/wp-content/uploads/2014/06/placeholder1.jpg',
                      party       = officials[i].party;


                  var channels = officials[i].channels || 0;
                  var channelLength = channels.length || 0;


                  for ( var j = 0; j < channelLength; j++ ) {

                    type = officials[i].channels[j].type;
                    id = officials[i].channels[j].id;

                    if(type === 'Facebook') {
                      social += '<a href="https://www.facebook.com/' + id + '"><i class="fa fa-facebook-square social-fa"></i></a>';
                    } else if( type === 'Twitter') {
                      social += '<a href="https://www.Twitter.com/' + id + '"><i class="fa fa-twitter social-fa"></i></a>';
                    } else if( type === 'YouTube') {
                      social += '<a href="https://www.YouTube.com/' + id + '"><i class="fa fa-youtube-play social-fa"></i></a>';
                    }

                  }

                  var rep = '';
                  rep += '<div class="col-xs-12 col-sm-6 col-md-4 rep"> \
                                <div class="row"> \
                                  <div class="col-xs-5"> \
                                    <img src="'+image+'" width="100%">\
                                  </div>\
                                  <div class="col-xs-7">\
                                    <div class="row"><h2>'+party+'</h2></div>\
                                    <div class="row"><h3>'+name+'</h3</div>\
                                  </div>\
                                  <div class="row social">'+social+'</div>\
                                </div>\
                              </div>';

                  this.display(rep);

                }

              } else {
                // no officals
              }


            },
            display: function(rep){
              var $rep = $('.rep');
              var $reps = $('.reps');
              var $icons = $('.social-fa');
              var $facebook = $('.fa-facebook-square');
              var $youtube = $('.fa-youtube-play');
              var $twitter = $('.fa-twitter');

              $reps.css({
                paddingTop:'20px'
              });

              $rep.css({
                marginBottom:'20px'
              });

              $icons.css({
                fontSize: '30px',
                paddingRight: '10px'
              });

              $youtube.css({
                color: 'red'
              });

              $twitter.css({
                color: 'rgb(0,153,153)'
              });

                $reps.append(rep);

              //replace error image with placeholder
              $("img").error(function () {
                $(this).unbind("error").attr("src", "http://satyaflowyoga.com/satyaflow/wp-content/uploads/2014/06/placeholder1.jpg");
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
