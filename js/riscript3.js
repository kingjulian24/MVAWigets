'use strict';

//eof

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
          this.$menu = $('.eof-menu');
          this.$body = $('.reps');
          this.$inputfield = $('.pl-user-input');
          this.$searchBtn = $('#pl-search');
          this.$form = $('.pl-form');
		      this.$loading = $('<span>',{
					       class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
           });

				  this.addListener(); // listen for search
          //this.sendAjaxRequest(); // initialize search
          this.hideMenu();
		      this.clearInitAddress();  // clear input value

        },

        buildLayout: function () {

        /*jshint multistr: true */
			   var layout = '<div class="pl-body col-xs-12"> \
                        <h4 class="pl-title">Find Your Electived Officials</h4> \
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
                              <div class="eof-menu btn-group btn-group-justified" role="group" aria-label="...">\
                                <div class="btn-group" role="group">\
                                  <button type="button" class="btn btn-default national">National</button>\
                                </div>\
                                <div class="btn-group" role="group">\
                                  <button type="button" class="btn btn-default state">State</button>\
                                </div>\
                                <div class="btn-group" role="group">\
                                  <button type="button" class="btn btn-default county">County</button>\
                                </div>\
                                <div class="btn-group" role="group">\
                                  <button type="button" class="btn btn-default city">City</button>\
                                </div>\
                                <div class="btn-group" role="group">\
                                  <button type="button" class="btn btn-default local">Local</button>\
                                </div>\
                              </div>\
                              <div class="row reps"></div> \
                            </div> \
                          </div> \
                     </div>';
                this.$target.append(layout);
          },
          hideMenu: function(){
            this.$menu.hide();
          },
          showMenu: function(){
            this.$menu.show();
          },


          addListener: function() {
            var self = this;
    				this.$form.on( 'submit', function(e){
    					ciWidget.sendAjaxRequest();
    					e.preventDefault();
    				});

            $('button.national').on('click',function(){
              self.clearReps();
              self.display(self.reps[0]);
            });

            $('button.state').on('click',function(){
              self.clearReps();
              self.display(self.reps[1]);
            });

            $('button.county').on('click',function(){
              self.clearReps();
              self.display(self.reps[2]);
            });

            $('button.city').on('click',function(){
              self.clearReps();
              self.display(self.reps[3]);
            });
            $('button.local').on('click',function(){
              self.clearReps();
              self.display(self.reps[4]);
            });
    			},
    			clearInitAddress: function(){
    				this.$inputfield.val('');
    			},
          clearReps: function(){
              $('.reps').html('');
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
              //var officials = data.officials;
              var normalizedAddress = {
                userStreet: data.normalizedInput.line1,
                userCity: data.normalizedInput.city,
                usersState: data.normalizedInput.state,
                userZip: data.normalizedInput.zip
              };
              this.address = normalizedAddress.userStreet +' '+normalizedAddress.userCity +' '+ normalizedAddress.usersState +' '+normalizedAddress.userZip;
              $('.pl-title').after($('<p>Based on: '+this.address+'</p>'));

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

              var   offices       = data.offices || '';
              var   officesLen      = offices.length;
              //var    level         = '';
              var    name          = '';
              var    key           = '';
              var    value         = '';
              var    officeName    = '';
              var    position      = '';
              var    party         = '';
              var    channels      = '';
              var    photoUrl      = '';
              var    urls          = '';
              var    phones        = '';


          // offices.levels

              if( officesLen > 0 ) {
                for(var o = 0; o < reps.length; o++){ // check each level
                  for ( var i = 0; i < officesLen; i++ ) { // each office per level
                    officeName = offices[i].name;

                    if( this.nameCheck(reps[o].names,officeName) ) {

                      for(var j = 0; j < offices[i].officialIndices.length; j++) {

                        key       = Object.keys(offices[i].officialIndices)[j];
                        value     = offices[i].officialIndices[j];
                        name      = data.officials[value].name;
                        position  = offices[i].name;
                        party     = data.officials[value].party;
                        channels  = data.officials[value].channels;
                        urls      = data.officials[value].urls;
                        photoUrl  = data.officials[value].photoUrl;
                        phones    = data.officials[value].phones;

                        reps[o].reps.push({
                          name      : name,
                          position  : position,
                          party     : party,
                          channels  : channels,
                          urls      : urls,
                          photoUrl  : photoUrl,
                          phones    : phones
                        });

                      }
                    }

                  }
                }
              }
              this.reps = reps;
              this.showMenu();


            },
            nameCheck: function(names,check){

                for (var i = 0; i < names.length; i++){
                  if(check.indexOf(names[i]) > -1){
                    return true;
                  }
                }
                return false;
            },

            display: function(reps){

              var officials     = reps.reps;
              var    name          = '';
              var    position      = '';
              var    party         = '';
              var    channels      = '';
              var    photoUrl      = '';
              var    urls          = '';
              var    url           = '';
              var    phones        = '';
              var    phone         = '';
              var    type         = '';
              var    id         = '';

                  var $reps = $('.reps');

              //console.log(officials[0].channels.length);

              for  ( var i = 0; i < officials.length; i++ ){
                name        = officials[i].name;
                position    = officials[i].position;
                party       = officials[i].party;
                photoUrl    = officials[i].photoUrl;


                //channel
                if(officials[i].channels) {
                  for ( var j = 0; j < officials[i].channels.length; j++ ) {

                    type = officials[i].channels[j].type || '';
                    id   = officials[i].channels[j].id || '';

                    if(type === 'Facebook') {
                      channels += '<a href="https://www.facebook.com/' + id + '"><i class="fa fa-facebook-square social-fa"></i></a>';
                    } else if( type === 'Twitter') {
                      channels += '<a href="https://www.Twitter.com/' + id + '"><i class="fa fa-twitter social-fa"></i></a>';
                    } else if( type === 'YouTube') {
                      channels += '<a href="https://www.YouTube.com/' + id + '"><i class="fa fa-youtube-play social-fa"></i></a>';
                    }

                  }
                }

                //phones
                if(officials[i].phones) {
                  for ( var k = 0; k < officials[i].phones.length; k++ ) {
                    phone = officials[i].phones[k] || '';
                    phones += '<a href="tel:'+phone+'"><i class="fa fa-tty social-fa"></i></a>';
                  }
                }


                //urls

                if(officials[i].urls){
                  for ( var l = 0; l < officials[i].urls.length; l++ ) {
                    url = officials[i].urls[l] || '';
                    urls += '<a href="'+url+'"><i class="fa fa-bookmark social-fa"></i></a>';
                  }
                }
                /*jshint multistr: true */
                 $reps.append('<div class="col-xs-12 col-sm-6 col-md-4 rep"> \
                              <div class="row"> \
                                <div class="col-xs-5 rep-image"> \
                                  <img src="'+photoUrl+'">\
                                </div>\
                                <div class="col-xs-7">\
                                  <div class="row rep-info"><p>'+position+'</p><p>'+party+'</p><p>'+name+'</p><p>'+phones+urls+'</p><p>'+channels+'</p></div>\
                                </div>\
                              </div>\
                            </div>');


                channels  = '';
                phones    = '';
                urls      = '';


              }

              var $rep = $('.rep');
              var $repsInfo = $('.rep-info p');
              var $icons = $('.social-fa');
              //var $facebook = $('.fa-facebook-square');
              var $youtube = $('.fa-youtube-play');
              var $twitter = $('.fa-twitter');
              var $repImage = $('.rep-image img');

              $reps.css({
                paddingTop:'20px'
              });
              $repsInfo.css({
                fontSize:'15px',
                lineHeight:'15px'
              });

              $rep.css({
                marginBottom:'20px'
              });

              $repImage.css({
                maxWidth: '100%',
                //height: '200px'
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
              $('img').error(function () {
                $(this).unbind('error').attr('src', 'http://satyaflowyoga.com/satyaflow/wp-content/uploads/2014/06/placeholder1.jpg');
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
