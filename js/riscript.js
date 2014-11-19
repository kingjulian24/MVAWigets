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

                var params = document.URL.split('?')[1];

                var candidatenparam = params.split('&&')[0];
                var addressparam = params.split('&&')[1];
                var officeparam = params.split('&&')[2];

                var candidatename = candidatenparam.split('=')[1].split('%20').join(' ');
                var address = addressparam.split('=')[1].split('%20').join(' ');
                var office = officeparam.split('=')[1].split('%20').join(' ');
                //console.log("hello i am in init " + candidatename);
                //console.log("hello i am in init " + address);

                this.sendAjaxRequest(address, candidatename, office);

            },

            buildLayout: function () {


                var layout = "<div id='pl-targetInner'" + "<div class='row' id='top'>" + "<div id='top' class='col-xs-12'>" + "</div>" + "<div class='row'>" + "<div id='leftPart' class='col-xs-12 col-sm-3' style='margin-left:45px' >" + "</div>" + "<div id='rightPart' class='col-xs-12 col-sm-8'> </div>" + "</div>" + "</div>" + "</div>" + "</div>"

                this.$target.append(layout);
            },

            sendAjaxRequest: function (addressCon, candidatenameCon, office) {
                $('#pl-search').append(' <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'); //add loading
                $('.location-item').remove(); // remove location



                var address = addressCon;
                var name = candidatenameCon;

                var jsonUrl = this.apiUrl + 'address=' + encodeURIComponent(address) + '&key=' + this.apiKey;


                var name = candidatenameCon;

                var office = office;


                $.ajax({ // send ajax request
                    type: 'GET',
                    url: jsonUrl,
                    dataType: 'json',
                    //success: ciWidget.jsonParser(addressCon,jsonUrl,name)
                    success: function (data) {
                        ciWidget.jsonParser(addressCon, jsonUrl, name, data, office)
                    }
                });


            },
            jsonParser: function (address, GCurl, name, data, office) {

                var $top = $('#top');
                var $left = $('#leftPart');
                var $right = $('#rightPart');
                var candidateName = name;

                $.get(GCurl, function (data) {
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