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
              var reps = [
                {
                  reps:  [],
                  names: ['United States', 'President'] //national


                },
                {
                  reps :[],
                  names : ['Governor','General','State Treasurer'] //state

                },
                {
                  reps : [],
                  names : ['Sheriff','County','District Attorney','Council Member'] //county

                },
                {
                  reps : [],
                  names : ['Mayor'] //city

                },
                {
                  reps : [],
                  names : ['Local'] //local

                },

              ];

              var offices = data.offices || '';
              var officesLen = offices.length;
              var level = '';
              var name = '';
              var key = '';
              var value = '';
              var officeName = '';
              var position = '';
              var party = '';


          // offices.levels

              if( officesLen > 0 ) {
                for(var o = 0; o < reps.length; o++){
                  for ( var i = 0; i < officesLen; i++ ) {
                    officeName = offices[i].name;

                    if( this.nameCheck(reps[o].names,officeName) ) {

                      for(var j = 0; j < offices[i].officialIndices.length; j++) {

                        key = Object.keys(offices[i].officialIndices)[j];
                        value = offices[i].officialIndices[j];
                        name = data.officials[value].name;
                        position = offices[i].name;
                        party = data.officials[value].party;

                        reps[o].reps.push({
                          name:       name,
                          position:   position,
                          party:     party,
                        });

                      }
                    }

                  }
                }
              }

              console.log(reps);

            },
            nameCheck: function(names,check){

                for (var i = 0; i < names.length; i++){
                  if(check.indexOf(names[i]) > -1){
                    return true;
                  }
                }
                return false;
            },

            display: function(rep){

              var $rep = $('.rep');
              var $reps = $('.reps');

              $reps.append(rep);
              var $icons = $('.social-fa');
              var $facebook = $('.fa-facebook-square');
              var $youtube = $('.fa-youtube-play');
              var $twitter = $('.fa-twitter');
              var $repImage = $('.rep-image img');

              $reps.css({
                paddingTop:'20px'
              });

              $rep.css({
                marginBottom:'20px'
              });

              $repImage.css({
                width: '100%',
                height: '200px'
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



              //replace error image with placeholder
              $("img").error(function () {
                $(this).unbind("error").attr("src", "http://satyaflowyoga.com/satyaflow/wp-content/uploads/2014/06/placeholder1.jpg");
              });
            }

        }; // end of ciWidget object


        ciWidget.init({ //initialize with target and location to GC server app
            target: '#target-practice',
            apiUrl: 'https://www.googleapis.com/civicinfo/v2/representatives',
            apiKey: 'AIzaSyDqyAn7yBGwWyZsFs5zWSh6zArNcQJDaAw',

        });

    })(); // end of self invoking function
});
