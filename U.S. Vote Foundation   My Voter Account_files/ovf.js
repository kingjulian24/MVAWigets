/******************************************************************************
This is the custom Javascript code for handing the Overseas Vote Foundation ajaxy code.

@author Nicholas Husher (nhusher@bear-code.com)
@version .7

JSLint Passed!

******************************************************************************/

YAHOO.namespace("ovf");

YAHOO.util.Event.addListener(window, "scroll", function(){
	var fxShadow = document.getElementById("fx-shadow");
	var scrollTop = document.documentElement.scrollTop ;
	YAHOO.util.Dom.setStyle(fxShadow, "top", scrollTop+"px");
});

/**
The following code inititalizes any other things that need to be running by the time the page fully loads.
**/
YAHOO.util.Event.onDOMReady(function() {
	// custom function that empties form fields of their default values when they get focus and returns
	// that value when it loses focus if it has nothing in it.
	// operates only on <input> fields of the named class.
	YAHOO.bc.formSweeper('sweep');
});

YAHOO.util.Event.onContentReady("eod-corrections", function() {
	
	var f = function(el) {
		var v = new YAHOO.bc.ExpandingPanel(el);
		
		// disables form fields as they are hidden
		var onHideFunc = function() {
			var e = v.getElement();
			var d = e.getElementsByTagName("input");
			for(var i = 0; i < d.length; i=i+1) {
				d[i].disabled = true;
			}
			
			d = e.getElementsByTagName("textarea");
			for(i = 0; i < d.length; i=i+1) {
				d[i].disabled = true;
			}
		};
		// enables form fields as they are shown
		var onShowFunc = function() {
			var e = v.getElement();
			var d = e.getElementsByTagName("input");
			for(var i = 0; i < d.length; i=i+1) {
				d[i].disabled = false;
			}
			
			d = e.getElementsByTagName("textarea");
			for(i = 0; i < d.length; i=i+1) {
				d[i].disabled = false;
			}
		};
		onHideFunc();
				
		v.onHide.subscribe(onHideFunc);
		v.onShow.subscribe(onShowFunc);
		
		return v;
	};
	
	var editableFields = YAHOO.util.Dom.getElementsByClassName("corrected","*","eodForm", f);
	
});


YAHOO.util.Event.onContentReady("eod-correction-approve", function() {
	var els = YAHOO.util.Dom.getElementsByClassName('approve-deny', 'tr', 'eodForm');
	for(var i = 0; i < els.length; i = i+1) {
		YAHOO.bc.approveDenyHandler(els[i]);
	}
});

/* The following code implements various function for working with AJAX and so on... */

/* The following code implements various function for working with AJAX and so on... */

YAHOO.ovf.sendSnapshotUrl = null;
YAHOO.ovf.sendSnapshot = function( params, responseId ) {

    var callback = {
        success: function(response) {
            var div = document.getElementById(responseId);
            if(response.responseText !== undefined && div != null) {
                div.innerHTML = "<br/>" + response.responseText;
            }
        },
        failure: function(response) {
            YAHOO.log("AJAX Error, could not get regions! Returned: '"+response.statusText+"'", "error", "ovf.js");
        }
    };
    if ( YAHOO.ovf.sendSnapshotUrl == null ) {
        YAHOO.log("Configuration error: URL for AJAX call hasn't been defined", "error", "ovf.js");
        return;
   }
    YAHOO.util.Connect.setForm("emptyForm");
    YAHOO.util.Connect.asyncRequest('get', YAHOO.ovf.sendSnapshotUrl+'?'+params, callback);

};

YAHOO.util.Event.onDOMReady(function() {
	var rbs = YAHOO.util.Dom.getElementsByClassName('rava-bubble');
	var b, elementHeight;

	var getHeight = function(type, args, me) {
		var tooltipHeight;
		
		if(YAHOO.env.ua.ie > 0 &&  YAHOO.env.ua.ie < 7) {
			elementHeight = document.getElementById('container').scrollHeight;
		} else {
			elementHeight = YAHOO.util.Dom.getRegion('container').bottom;
		}
		
		if(YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 7) {
			tooltipHeight = elementHeight + YAHOO.util.Dom.getElementsByClassName('tooltip','*',this.getElement())[0].scrollHeight + 10;
		} else {
			tooltipHeight = YAHOO.util.Dom.getRegion(this.getElement()).bottom;
		}
	};

	for(var i = 0; i < rbs.length; i++) {
		b = new YAHOO.bc.TooltipBubble(rbs[i]);
		b.beforeShowEvent.subscribe(getHeight, b, true);
		b.hideEvent.subscribe(getHeight, b, true);
	}
});


YAHOO.util.Event.onDOMReady(function() {
	if(document.getElementById("fwab-start-box")) {
		var Dom = YAHOO.util.Dom,
			Event = YAHOO.util.Event,
			options = document.getElementById("who-can-use-fwab");
			goButton = document.getElementById("go-button");
		
		var value = 0;
		var hide = function() {
			Dom.setStyle(goButton,'visibility','hidden');
		};
		var show = function() {
			Dom.setStyle(goButton,'visibility','visible');
		};

		if(YAHOO.util.Anim) {
			Dom.setStyle(goButton, 'opacity', 0);
			
			var animIn = new YAHOO.util.Anim(goButton, { 'opacity': { to: 1 }}, 0.2);
			var animOut = new YAHOO.util.Anim(goButton, { 'opacity': { to: 0}}, 0.2);
			
			animIn.onStart.subscribe(function() {
				Dom.setStyle(goButton, 'visibility','visible');
			});
			animOut.onComplete.subscribe(function() {
				Dom.setStyle(goButton, 'visibility','hidden');
			});
			
			show = function() {
				if(animOut.isAnimated()) {
					animOut.stop();
				}
				animIn.animate();
			};
			hide = function() {
				if(animIn.isAnimated()) {
					animIn.stop();
				}
				animOut.animate();
			};
		}
		
		Event.on(options, "click", function(eventObj) {
			var target = Event.getTarget(eventObj);
			
			if(Dom.hasClass(target, 'step')) {
				value += (target.checked) ? 1 : -1;
			}
			
			if(value >= 1) {
				show();
			} else {
				hide();
			}
		});
	}
});

// EOD accordion
YAHOO.util.Event.onContentReady("eod-form", function() {
	var elementIds = [
    "addressinfo",
      "addressinfo_uocava",
  		"contactdetails",
      "contactdetails_uocava",
  		"stateinfo",
  		"transoptions",
  		"witnotreqs",
  		"electiondeadlines",
  		"federaldeadlines",
  		"statedeadlines",
  		"caucusdeadlines",
  		"idrequires",
  		"eligrequires",
  		"websitesinfo",
  		"additionalinfo",
      "additionalinfo_uocava",
      "transoptionsDomestic",
      "stateinfoDomestic"
	];
	
	for(var i=0; i < elementIds.length; i++){
		var id = elementIds[i];
		if(document.getElementById(id)){
			YAHOO.ovf.addressinfoPanel = new YAHOO.bc.ExpandingPanel(id);
			YAHOO.ovf.addressinfoPanel.hide();		
		}
	}
	
});
