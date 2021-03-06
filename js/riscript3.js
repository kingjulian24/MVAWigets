'use strict';

//eof

$(function () {
  (function () {
    var ciWidget = {
      config: {
        // DEFAULTS
        nationalTitles  : ['United States', 'President'] ,
        stateTitles     : ['Governor','General','State Treasurer'] ,
        countyTitles    : ['Sheriff','County','District Attorney','Council Member','Tax Collector'] ,
        cityTitles      : ['Mayor'] ,
        localTitles     : ['Local']
      },

      init: function (config) {
        $.extend(this.config, config); //overide config property

        this.$target        = $(config.target); // set target
        this.apiUrl         = config.apiUrl;
        this.apiKey         = config.apiKey;
        this.electionId     = config.electionId;

        this.nationalTitles = this.config.nationalTitles;
        this.stateTitles    = this.config.stateTitles;
        this.countyTitles   = this.config.countyTitles;
        this.cityTitles     = this.config.cityTitles;
        this.localTitles    = this.config.localTitles;
        this.newSearch      = false;
        this.initAddress    = config.initAddress;

        this.getUrl         = config.getUrl; // location to google civic api v2
        this.buildLayout();

        // catche dom elments
        this.$basedAddress  = $('.pl-title');
        this.$menu          = $('.eof-menu');
        this.$body          = $('.reps');
        this.$inputfield    = $('.pl-user-input');
        this.$searchBtn     = $('#pl-search');
        this.$form          = $('.pl-form');
        this.$loading = $('<span>',{
          class:'glyphicon glyphicon-refresh glyphicon-refresh-animate'
        });

        this.addListener(); // listen for search
        this.sendAjaxRequest(); // initialize search
        //this.hideMenu();
        this.clearInitAddress();  // clear input value

      },

      buildLayout: function () {

        /*jshint multistr: true */
        var layout = '<div class="pl-body col-xs-12" style="max-width:730px; margin: 0 auto;"> \
        <h4 class="pl-title">Find Your Elected Officials</h4> \
        <div class="row"> \
        <div class="col-xs-12 col-md-6"> \
        <form class="pl-form"> \
        <div class="input-group"> \
        <input type="text" class="form-control pl-user-input" value="'+this.initAddress+'"  placeholder="Enter full registered voting address" required> \
        <span class="input-group-btn">\
        <button class="btn btn-danger" type="submit" id="pl-search-btn">Search</button> \
        </span> \
        </div> \
        </form> \
        </div> \
        <div class="small mute col-xs-12 scope-nav" style="margin-Top:15px"> \
        <div class="eof-menu btn-group btn-group-justified" role="group" aria-label="...">\
        <div class="btn-group" role="group">\
        <button data-level="0" type="button" class="btn btn-default national level-btn rep-btn0">National</button>\
        </div>\
        <div class="btn-group" role="group">\
        <button data-level="1" type="button" class="btn btn-default state level-btn rep-btn1">State</button>\
        </div>\
        <div class="btn-group" role="group">\
        <button data-level="2" type="button" class="btn btn-default county level-btn rep-btn2">County</button>\
        </div>\
        <div class="btn-group" role="group">\
        <button data-level="3" type="button" class="btn btn-default city level-btn rep-btn3">City</button>\
        </div>\
        <div class="btn-group" role="group">\
        <button data-level="4" type="button" class="btn btn-default local level-btn rep-btn4">Local</button>\
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
        if(!this.newSearch){this.display(this.reps[0]); this.newSearch = true;}

          $('.national').addClass('active');
          for(var i = 0; i < this.reps.length; i++) {
            if(this.reps[i].reps.length === 0){
              $('.rep-btn'+i).prop('disabled',true);
            }
          }

        },


        addListener: function() {
          var self = this;
          this.$form.on( 'submit', function(e){
            ciWidget.sendAjaxRequest();
            e.preventDefault();
          });

          $('button.level-btn').on('click',function(){
            self.clearReps();
            $(this).addClass('active');
            //remove non active class from non active btns
            for(var i = 0; i < $('button.level-btn').length; i++){
              if($($('button.level-btn')[i]).data('level') !== $(this).data('level')){
                $($('button.level-btn')[i]).removeClass('active');
              }
            }
            self.display(self.reps[$(this).data('level')]); //display moday with correct rep base on data attr
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
          $('.candidateInfo').append('<h4>'+name+'</h4>')
          .append('<p>'+party+'</p>')
          .append(phoneString)
          .append(urlString)
          .append(chanString);



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
            names: this.nationalTitles //national
          },
          {
            reps :[],
            names : this.stateTitles //state
          },
          {
            reps : [],
            names : this.countyTitles //county
          },
          {
            reps : [],
            names : this.cityTitles //city
          },
          {
            reps : [],
            names : this.localTitles //local
          },

          ];

          var   offices       = data.offices || '';
          var   officesLen      = offices.length;
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


          // filter and store reps by title

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

          this.reps = reps; // save reps to object
          this.showMenu(); // show level menu



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

          var    officials     = reps.reps;
          var    name          = '';
          var    position      = '';
          var    party         = '';
          var    channels      = '';
          var    photoUrl      = '';
          var    urls          = '';
          var    url           = '';
          var    phones        = '';
          var    phone         = '';
          var    type          = '';
          var    id            = '';

          var $reps = $('.reps');



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
            <div class="rep-info text-center"><p>'+party+'</p><p>'+name+'</p></div>\
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


      ciWidget.init({ // widget configurations
        target          : '#target-practice',
        apiUrl          : 'https://www.googleapis.com/civicinfo/v2/representatives',
        apiKey          : 'AIzaSyDqyAn7yBGwWyZsFs5zWSh6zArNcQJDaAw',
        nationalTitles  : ['United States', 'President'] ,
        stateTitles     : ['Governor','General','State Treasurer'] ,
        countyTitles    : ['Sheriff','County','District Attorney','Council Member','Tax Collector'] ,
        cityTitles      : ['Mayor'] ,
        localTitles     : ['Local'] ,
        initAddress     : '5000 forbes ave pittsburgh PA 15213'
      });

    })(); // end of self invoking function
  }); // end onload function
