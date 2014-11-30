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
          this.$basedAddress = $('.pl-title');
          this.$menu = $('.eof-menu');
          this.$body = $('.reps');
          this.$inputfield = $('.pl-user-input');
          this.$searchBtn = $('#pl-search');
          this.$form = $('.pl-form');
		      this.$loading = $('<span>',{
					       class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
           });

				  this.addListener(); // listen for search
          this.sendAjaxRequest(); // initialize search
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
                                <input type="text" class="form-control pl-user-input" value="Carnegie Mellon University"  placeholder="Enter full registered voting address" required> \
                                <span class="input-group-btn">\
                                  <button class="btn btn-danger" type="submit" id="pl-search-btn">Search</button> \
                                </span> \
                              </div> \
                              </form> \
                            </div> \
                            <div class="small mute col-xs-12 scope-nav" style="margin-Top:15px"> \
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
              self.preDisplay(self.reps[0]);
            });

            $('button.state').on('click',function(){
              self.preDisplay(self.reps[1]);
            });

            $('button.county').on('click',function(){
              self.preDisplay(self.reps[2]);
            });

            $('button.city').on('click',function(){
              self.preDisplay(self.reps[3]);
            });
            $('button.local').on('click',function(){
              self.preDisplay(self.reps[4]);
            });
    			},

          repListener:function(){
            var self = this;
              $('.rep-img').on('click', self.showRepInfo);
          },
          showRepInfo: function(){
            $('.candidateInfo').html('');
            $('#myModalLabel').html('');
            $('.photoUrl').html('');

            var photo = $(this).data('photourl');
            var position = $(this).data('position');
            var phones = $(this).data('phones');
            var name = $(this).data('name');
            var party = $(this).data('party');
            var phonesArray = phones.split(',');
            var phoneString = '';
            for(var j = 0; j < phonesArray.length-1; j++){
              phoneString += '<p><i class="fa fa-tty social-fa"></i>'+phonesArray[j]+'</p>';
            }
            var urls = $(this).data('urls');
            var urlsArray = urls.split(',');
            var urlString = '';
            for(var u = 0; u < urlsArray.length-1; u++){
              urlString += '<a href="'+urlsArray[u]+'"><i class="fa fa-bookmark social-fa"></i></a>';
            }
            var channels = $(this).data('channels');
            var chanArray = channels.split(',');
            var chanString = '';
            var type = '';
            var id = '';

            for(var k = 0; k < chanArray.length-1; k++){
              type = chanArray[k].split(' ')[0];
              id   = chanArray[k].split(' ')[1];

              if(type === 'Facebook') {
                chanString += '<a href="https://www.facebook.com/' + id + '"><i class="fa fa-facebook-square social-fa"></i></a>';
              } else if( type === 'Twitter') {
                chanString += '<a href="https://www.Twitter.com/' + id + '"><i class="fa fa-twitter social-fa"></i></a>';
              } else if( type === 'YouTube') {
                chanString += '<a href="https://www.YouTube.com/' + id + '"><i class="fa fa-youtube-play social-fa"></i></a>';
              }
            }



            $('#myModalLabel').html(position);
            $('.candidateInfo').append('<h4>'+name+'</h4>');
            $('.candidateInfo').append('<p>'+party+'</p>');
            $('.candidateInfo').append(phoneString);
            $('.candidateInfo').append(urlString);
            $('.candidateInfo').append(chanString);


            var photohtml = $('<img>',{
              src: photo,
            }).css('max-width','100%');

            $('.photoUrl').append(photohtml);
            var $icons = $('.social-fa');
            var $youtube = $('.fa-youtube-play');
            var $twitter = $('.fa-twitter');

            $icons.css({
              fontSize: '20px',
              paddingRight: '10px'
            });

            $youtube.css({
              color: 'red'
            });

            $twitter.css({
              color: 'rgb(0,153,153)'
            });

            $('#myModal').modal('show');
          },



          preDisplay: function(reps) {
            this.clearReps();
            this.display(reps);
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

              this.displayBaseAddress(normalizedAddress);

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
                        name      = data.officials[value].name || '';
                        position  = offices[i].name || '';
                        party     = data.officials[value].party || '';
                        channels  = data.officials[value].channels || '';
                        urls      = data.officials[value].urls || '';
                        photoUrl  = data.officials[value].photoUrl || '';
                        phones    = data.officials[value].phones || '';

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
            displayBaseAddress: function(normalizedAddress){
              this.address = normalizedAddress.userStreet +' '+normalizedAddress.userCity +' '+ normalizedAddress.usersState +' '+normalizedAddress.userZip;
              // reset based on address
              this.$basedAddress.next('.based-address').html('');
              // set based on address
              this.$basedAddress.after($('<p class="based-address">Based on: '+this.address+'</p>'));
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
                      channels += 'Facebook '+id+',';
                    } else if( type === 'Twitter') {
                      channels += 'Twitter '+id+',';
                    } else if( type === 'YouTube') {
                      channels += 'YouTube '+id+',';
                    }

                  }
                }

                //phones
                if(officials[i].phones) {
                  for ( var k = 0; k < officials[i].phones.length; k++ ) {
                    phone = officials[i].phones[k] || '';
                    phones += phone+', ';
                  }
                }


                //urls

                if(officials[i].urls){
                  for ( var l = 0; l < officials[i].urls.length; l++ ) {
                    url = officials[i].urls[l] || '';
                    urls += url+', ';
                  }
                }
                /*jshint multistr: true */
                 $reps.append('<div class="col-xs-12 col-sm-6 col-md-3 rep"> \
                              <div class="row"> \
                                <div class="col-md-12 col-sm-3 col-xs-2">\
                                  <span class="photo-container"><img data-party="'+party+'" data-name="'+name+'" data-photourl="'+photoUrl+'" data-position="'+position+'" data-channels="'+channels+'" data-phones="'+phones+'" data-urls="'+urls+'"class="rep-img" src="'+photoUrl+'"></span>\
                                </div>\
                                <div class="col-md-12 col-sm-9 col-xs-10">\
                                  <div class="row rep-info text-center"><p>'+party+'</p><p>'+name+'</p></div>\
                                </div>\
                              </div>\
                            </div>');


                channels  = '';
                phones    = '';
                urls      = '';


              }
              this.repListener();
              var $rep = $('.rep');
              var $repsInfo = $('.rep-info p');

              var $repImage = $('.photo-container img');
              var $pc = $('.photo-container');

              $pc.css({
                position: 'relative',
                display: 'block',
                width: '90px',
                height: '90px',
                border: '3px solid #32e0a6',
                background: '#32e0a6',
                borderRadius: '50px',
                overflow: 'hidden',
                marginBottom: '20px',
                color: '#fff',
                textDecoration: 'none',
                left: '20%'
              });




              $reps.css({
                paddingTop:'20px'

              });
              $repsInfo.css({
                fontSize:'15px',
                lineHeight:'15px',
              });


              $rep.css({
                marginBottom:'20px'

              });

              $repImage.css({
                width: '90px',
                cursor:'pointer'

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
