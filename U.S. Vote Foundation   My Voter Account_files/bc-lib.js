/******************************************************************************
 Some custom library tastyness for the Overseas Vote Foundation. This file rips
 out some of the reusable parts of the ovf library b.5 and makes future
 development easier.

 Requires the following YUI files:
 * yahoo.js
 * yahoo-dom-event.js
 * event.js

 JSLint Passed!

 ******************************************************************************/

// Create a bc namespace. Bc abbreviating, of course, bear-code.
YAHOO.namespace("bc");

/**
 YAHOO.bc.ExtendedEvent

 extendedEvent is a class that extends YAHOO's CustomEvent class and implements
 an additional method, subscribeOnce. subscribeOnce is described further below.
 **/
YAHOO.bc.CustomEvent = function(type, oScope, silent, signature) {
    YAHOO.bc.CustomEvent.superclass.constructor.call(this, type,
        oScope, silent, signature);
};
YAHOO.lang.extend(YAHOO.bc.CustomEvent, YAHOO.util.CustomEvent);


/**
 Registers a function to be called only on the first instance of the custom
 event firing. Subsequent firings of the customEvent will not trigger the
 function. Returns the value of the callback function given.

 Behaves in all ways like CustomEvent.subscribe() aside from above mentioned
 behavior.
 **/
YAHOO.bc.CustomEvent.prototype.subscribeOnce = function(fn, obj, override) {
    var that = this; //crockford-style programming convention. use it. love it
    var tempFunction = function() {
        var retVal; // return value of callback function, if any.

        if (override) {
            retVal = fn.call(obj);
        } else {
            retVal = fn(obj);
        }
that.unsubscribe(tempFunction);

        return retVal;
    };
    this.subscribe(tempFunction);
};


/**
 YAHOO.bc.getElementsByClassName

 Behaves like YAHOO.util.Dom.getElementsByClassName with one additional
 parameter, shallow, which runs a shallow search of just the referenced
 element's immediate children.

 **/
YAHOO.bc.getElementsByClassName = function(className, tag, root, apply, shallow) {
    var nodes;
    root = YAHOO.util.Dom.get(root);

    if (shallow) {
        var f = function(el) {
            var n = root || document;
            return (YAHOO.util.Dom.hasClass(el, className) && el.parentNode === n);
        };

        nodes = YAHOO.util.Dom.getElementsBy(f, tag, root, apply);
    } else {
        nodes = YAHOO.util.Dom.getElementsByClassName(className, tag, root, apply);
    }

    return nodes;
};


(function() {
    var TEST_CSS_REF = null;
    var OVERLAYS_MANAGER = new YAHOO.widget.OverlayManager();
    var DOM = YAHOO.util.Dom;
    // helper functions
    // A function that reads the size of the given box without needing to display it.
    var getPanelDimensions = function(panelElement) {

        DOM.addClass(panelElement, 'YAHOO-bc-ExpandingPanel-test');
        var dimensions = {};

        if (YAHOO.env.ua.ie > 0) {
            // if we're using IE, we need an alternative method of inferring styles. >:(
            dimensions = {"height": panelElement.offsetHeight,
                "width": panelElement.offsetWidth};

        } else {
            dimensions = {"height": parseInt(YAHOO.util.Dom.getStyle(panelElement, 'height'), 10),
                "width": parseInt(YAHOO.util.Dom.getStyle(panelElement, 'width'), 10)};
        }

        DOM.removeClass(panelElement, 'YAHOO-bc-ExpandingPanel-test');

        return dimensions;
    };
    // returns an attribute set that matches the keys of the given attribute set
    // but with the values of the element in question.
    var generateAttributeSet = function(element, atb) {
        var out = {};
        for (var key in atb) {
            out[key] = {};

            out[key].to = parseInt(DOM.getStyle(element, key), 10);
        }
        return out;
    };

    /******************************************************************************
     YAHOO.bc.ExpandingPanel

     An auto-configuring slide-out panel with built-in controls.

     ******************************************************************************/

    YAHOO.bc.ExpandingPanel = function(el, map) {
        YAHOO.bc.ExpandingPanel.superclass.constructor.apply(this, arguments);

        this.initEvents();
    };

    var EP = YAHOO.bc.ExpandingPanel;

    EP.CONTROL_CLASS = 'ctrl';
    EP.PANEL_CLASS = 'pnl';
    EP.IFRAME_SRC = 'javascript:false';
    EP.IFRAME_OFFSET = 3;
    EP.SHOWN_CLASS = 'YAHOO-bc-ExpandingPanel-visible';
    EP.HIDDEN_CLASS = 'YAHOO-bc-ExpandingPanel-hidden';
    EP.ANIMATING_CLASS = 'YAHOO-bc-ExpandingPanel-animating';

    EP.EVENTS = {
        'showstart': 'beforeShowStart',
        'showcomplete': 'onShow',
        'hidestart': 'beforeHide',
        'hidecomplete': 'onHide'
    };

    EP.getHeight = function(el) {
        var height, styleProp, currentStyle = {}, testStyle = {
            'visibility': 'hidden',
            'position': 'absolute',
            'display': 'block'
        };

        for (styleProp in testStyle) {
            if (el.style[styleProp]) {
                currentStyle[styleProp] = el.style[styleProp];
            }
            el.style[styleProp] = testStyle[styleProp];
        }
        height = el.offsetHeight;
        height -= parseInt(DOM.getStyle(el, 'padding-top'), 10);
        height -= parseInt(DOM.getStyle(el, 'padding-bottom'), 10);

        for (styleProp in testStyle) {
            if (currentStyle[styleProp]) {
                el.style[styleProp] = currentStyle[styleProp];
            } else {
                el.style[styleProp] = '';
            }
        }

        return height;
    };

    YAHOO.lang.extend(EP, YAHOO.util.Element, {
        panel: null,
        iframe: null,
        animation: null,

        init: function(e, a) {
            EP.superclass.init.apply(this, arguments);

            this.on('hidecomplete', function() {
                DOM.setStyle(this.panel, 'display', 'none');
                DOM.setStyle(this.panel, 'height', '');
                DOM.setStyle(this.panel, 'overflow', '');
                this.removeClass(EP.SHOWN_CLASS);
                this.removeClass(EP.ANIMATING_CLASS);
                this.addClass(EP.HIDDEN_CLASS);

                this.set('shown', false);
                this.set('animating', false);
                this.syncIframe();
            }, this, true);
            this.on('showcomplete', function() {
                DOM.setStyle(this.panel, 'overflow', '');
                DOM.setStyle(this.panel, 'height', '');
                this.removeClass(EP.HIDDEN_CLASS);
                this.removeClass(EP.ANIMATING_CLASS);
                this.addClass(EP.SHOWN_CLASS);

                this.set('shown', true);
                this.set('animating', false);
                this.syncIframe();
            }, this, true);

            this.on('hidestart', function() {
                DOM.setStyle(this.panel, 'overflow', 'hidden');
                this.addClass(EP.ANIMATING_CLASS);
                this.set('animating', true);
                this.syncIframe();
            }, this, true);
            this.on('showstart', function() {
                DOM.setStyle(this.panel, 'overflow', 'hidden');
                DOM.setStyle(this.panel, 'display', 'block');
                this.addClass(EP.ANIMATING_CLASS);
                this.set('animating', true);
                this.syncIframe();
            }, this, true);

            this.on('click', function(el) {
                var target = YAHOO.util.Event.getTarget(el);

                while (target !== this.get('element')) {
                    if (DOM.hasClass(target, EP.CONTROL_CLASS)) {
                        YAHOO.util.Event.preventDefault(el);

                        this.toggle();
                        return;
                    } else {
                        target = target.parentNode;
                    }
                }
            }, this, true);

            this.set('iframe', (YAHOO.env.ua.ie <= 6 && YAHOO.env.ua.ie > 0));

            this.addClass((this.get('shown')) ? EP.SHOWN_CLASS : EP.HIDDEN_CLASS);
        },
        initAttributes: function(attrs) {
            EP.superclass.initAttributes.apply(this, arguments);

            this.setAttributeConfig('shown', {
                value: !(DOM.getStyle(this.panel, 'display') == 'none'),
                validator: YAHOO.lang.isBoolean
            });
            this.setAttributeConfig('animating', {
                value: false,
                validator: YAHOO.lang.isBoolean
            });
            this.setAttributeConfig('visiblestyles', {
                value: {},
                validator: YAHOO.lang.isObject
            });
            this.setAttributeConfig('iframe', {
                value: false,
                validator: YAHOO.lang.isBoolean,
                method: this.configIframe
            });
            this.setAttributeConfig('speed', {
                value: [0.5,0.25],
                validator: function(val) {
                    var n = YAHOO.lang.isNumber, a = YAHOO.lang.isArray;
                    return (a(val) && a.length == 2 && n(val[0]) && n(val[1]));
                }
            });
        },
        _initHTMLElement: function(attr) {
            EP.superclass._initHTMLElement.apply(this, arguments);

            var els, i;
            els = this.getElementsByClassName(EP.PANEL_CLASS, '*');
            for (i = 0; i < els.length; i++) {
                if (els[i].parentNode == this.get('element')) {
                    this.panel = els[i];
                    break;
                }
            }
        },
        initEvents: function() {
            for (var e in EP.EVENTS) {
                this[EP.EVENTS[e]] = this.createEvent(e, { scope: this });
            }
        },
        show: function() {
            if (this.isAnimating()) {
                return;
            }
            var endHeight = EP.getHeight(this.panel);
            var curHeight = this.panel.offsetHeight;

            if (curHeight == 0) {
                DOM.setStyle(this.panel, 'height', 0);
            }

            this.animation = new YAHOO.util.Anim(this.panel, {
                height: { from: curHeight, to: endHeight }
            }, this.get('speed')[0], YAHOO.util.Easing.easeOut);

            this.animation.onComplete.subscribe(function() {
                this.animation = null;
                this.fireEvent('showcomplete');
            }, this, true);
            this.animation.onStart.subscribe(function() {
                this.fireEvent('showstart');
            }, this, true);

            this.animation.onTween.subscribe(this.syncIframe, this, true);

            this.animation.animate();
        },
        hide: function() {
            if (this.isAnimating()) {
                return;
            }
            this.animation = new YAHOO.util.Anim(this.panel, {
                height: { to: 0 }
            }, this.get('speed')[1], YAHOO.util.Easing.easeIn);

            this.animation.onComplete.subscribe(function() {
                this.animation = null;
                this.fireEvent('hidecomplete');
            }, this, true);

            this.animation.onStart.subscribe(function() {
                this.fireEvent('hidestart');
            }, this, true);

            this.animation.onTween.subscribe(this.syncIframe, this, true);

            this.animation.animate();
        },
        toggle: function() {
            if (this.isShown()) {
                this.hide();
            } else {
                this.show();
            }
        },
        isShown: function() {
            return this.get('shown');
        },
        isAnimating: function() {
            return this.get('animating');
        },
        getElement: function() {
            return this.get('element');
        },
        configIframe: function(hasIframe) {
            if (hasIframe && !this.iframe) {
                this.iframe = document.createElement('iframe');
                this.iframe.src = EP.IFRAME_SRC;
                this.iframe.style.position = 'absolute';
                this.iframe.style.opacity = '0';
                this.iframe.style.filter = 'alpha(opacity=0)';
                this.iframe.style.border = 'none';
                this.iframe.style.margin = '0';
                this.iframe.style.padding = '0';
                this.iframe.style.zIndex = 1;
                this.iframe.style.display = (this.isShown()) ? 'block' : 'none';
                this.iframe.tabIndex = -1;
                this.iframe.frameBorder = 0;

                this.panel.zIndex = 2;

                var parent = this.panel.parentNode;
                parent.appendChild(this.iframe);

                this.syncIframe();
            }
            if (!hasIframe && this.iframe) {
                this.iframe.parentNode.removeChild(this.iframe);
                this.iframe = null;
            }
        },
        syncIframe: function() {
            if (!this.iframe) {
                return;
            }
            var panel = this.panel, iframe = this.iframe;

            if (!this.get('shown') && !this.get('animating')) {
                iframe.style.display = 'none';
                return;
            } else {
                iframe.style.display = 'block';
            }

            iframe.style.top = (panel.offsetTop - EP.IFRAME_OFFSET) + 'px';
            iframe.style.left = (panel.offsetLeft - EP.IFRAME_OFFSET) + 'px';
            iframe.style.height = (panel.offsetHeight + EP.IFRAME_OFFSET * 2) + 'px';
            iframe.style.width = (panel.offsetWidth + EP.IFRAME_OFFSET * 2) + 'px';
        }
    });


    var DOM = YAHOO.util.Dom;
    var EVENT = YAHOO.util.Event;

    var defaultAttributes = {
        xOffset: -277,
        yOffset: -6,
        closeButtonSrc: "/vote/img/buttons/close-tooltip.gif",
        
        tooltipIconSrc: "/vote/img/buttons/rava-bubble.gif",
        fallbackNode: function(element) {
            var e = element.parentNode.parentNode;
            var n = DOM.getElementsByClassName('break', '*', e)[0];

            if (YAHOO.lang.isUndefined(n)) {
                n = document.createElement("div");
                e.insertBefore(n, element.parentNode.nextSibling);
            }

            DOM.addClass(n, 'ie6-tooltip');
            DOM.removeClass(n, 'break');
            return n;
        }
    };

    YAHOO.bc.TooltipBubble = function(element, attributes) {
        var element = DOM.get(element);
        var tooltipElement = null;
        if (attributes === undefined) {
            attributes = {};
        }

        var wrapper = document.createElement("div");
        DOM.addClass(wrapper, 'tooltip');

        var closeButton = document.createElement("img");
        closeButton.src = attributes.closeButtonSrc || defaultAttributes.closeButtonSrc;
        closeButton.title = "Close Button";
        DOM.addClass(closeButton, 'close-tooltip');

        var titleLine = document.createElement("div");
        DOM.addClass(titleLine, 'tooltip-title');

        var text = document.createElement("div");
        DOM.addClass(text, 'tooltip-text');
        while (element.firstChild) {
            text.appendChild(element.firstChild);
        }

        var tooltipIcon = document.createElement("img");
        tooltipIcon.src = attributes.tooltipIconSrc || defaultAttributes.tooltipIconSrc;
        tooltipIcon.title = "Click here for more detailed information.";
        DOM.addClass(tooltipIcon, 'tooltip-icon');

        DOM.setStyle(element, 'overflow', 'visible');

        element.appendChild(tooltipIcon);
        wrapper.appendChild(titleLine);
        titleLine.appendChild(closeButton);
        wrapper.appendChild(text);

        var _show = function() {
        }, _hide = function() {
        }, _isShown = function() {
        }, _beforeShowEvent, _beforeHideEvent, _showEvent, _hideEvent;

        if (YAHOO.env.ua.ie == 0 || YAHOO.env.ua.ie >= 7) {
            //if(false) {		// good for testing

            if (document.getElementById("wrapper")) {
                document.getElementById("wrapper").appendChild(wrapper);
            }
            if (document.getElementById("container")) {
                document.getElementById("container").appendChild(wrapper);
            }
            if (YAHOO.env.ua.ie >= 7 && YAHOO.env.ua.ie < 8) {
                wrapper = new YAHOO.widget.Overlay(wrapper, {
                    visible: false,
                    monitorresize: false
                });
            } else {
                wrapper = new YAHOO.widget.Overlay(wrapper, {
                    visible: false,
                    monitorresize: false,
                    effect: {
                        effect: YAHOO.widget.ContainerEffect.FADE,
                        duration: 0.2
                    }
                });
            }

            wrapper.render();

            var xOffset = attributes.xOffset || defaultAttributes.xOffset;
            var yOffset = attributes.yOffset || defaultAttributes.yOffset;

            var r = DOM.getRegion(element);

            wrapper.cfg.setProperty("xy", [-1000, -1000]);

            EVENT.addListener(closeButton, 'click', wrapper.hide, wrapper, true);
            EVENT.addListener(tooltipIcon, 'click', function() {
                if (wrapper.cfg.getProperty("visible")) {
                    wrapper.hide();
                } else {
                    wrapper.show();
                }
            });
            wrapper.beforeShowEvent.subscribe(function() {
                var r = DOM.getRegion(element);

                var xPosition = ((r.right + r.left) / 2 ) + xOffset;
                var yPosition = r.bottom + yOffset;

                wrapper.cfg.setProperty("xy", [xPosition, yPosition]);
            });
            wrapper.hideEvent.subscribe(function() {
                wrapper.cfg.setProperty("xy", [-1000, -1000]);
            });
            wrapper.showEvent.subscribe(function() {
                var r = DOM.getRegion(element);

                var xPosition = ((r.right + r.left) / 2 ) + xOffset;
                var yPosition = r.bottom + yOffset;

                wrapper.cfg.setProperty("xy", [xPosition, yPosition]);
            });

            tooltipElement = wrapper.element;
            _show = function() {
                wrapper.show();
            };
            _hide = function() {
                wrapper.hide();
            };
            _isShown = function() {
                return wrapper.cfg.getProperty("visible");
            };
            _beforeShowEvent = wrapper.beforeShowEvent;
            _beforeHideEvent = wrapper.beforeHideEvent;
            _showEvent = wrapper.showEvent;
            _hideEvent = wrapper.hideEvent;

        } else {
            var getNode = attributes.fallbackNode || defaultAttributes.fallbackNode;
            var node = getNode(element);
            node.appendChild(wrapper);

            var dimensions = getPanelDimensions(node);

            var showAnim = new YAHOO.util.Anim(node, { height: { to: dimensions.height } }, 0.2, YAHOO.util.Easing.easeOut);
            var hideAnim = new YAHOO.util.Anim(node, { height: { to: 0 } }, 0.2, YAHOO.util.Easing.easeIn);

            var shown = false;
            showAnim.onStart.subscribe(function() {
                shown = true;
            });
            hideAnim.onComplete.subscribe(function() {
                shown = false;
            });

            tooltipElement = node;
            _show = function() {
                showAnim.animate();
            };
            _hide = function() {
                hideAnim.animate();
            };
            _isShown = function() {
                return shown;
            };
            _beforeShowEvent = showAnim.onStart;
            _beforeHideEvent = hideAnim.onStart;
            _showEvent = showAnim.onComplete;
            _hideEvent = hideAnim.onComplete;

            EVENT.addListener(closeButton, 'click', hideAnim.animate, hideAnim, true);
            EVENT.addListener(tooltipIcon, 'click', function() {
                if (shown) {
                    hideAnim.animate();
                } else {
                    showAnim.animate();
                }
            });
        }
        return {
            show: function() {
                _show();
            },
            hide: function() {
                _hide();
            },
            getElement: function() {
                return tooltipElement;
            },
            isShown: function() {
                return _isShown();
            },
            beforeShowEvent: _beforeShowEvent,
            beforeHideEvent: _beforeHideEvent,
            showEvent: _showEvent,
            hideEvent: _hideEvent
        };
    };

    // create a set of styles dynamically to help construct the panel
    if (TEST_CSS_REF === null) {
        var anchor = {
            selector: ".YAHOO-bc-ExpandingPanel-anchor",
            text: "display: block !important; " +
                "position: static !important; " +
                "height: 0px !important; " +
                "margin: 0px; padding: 0px; " +
                "overflow: hidden !important"
        };
        var test = {
            selector: ".YAHOO-bc-ExpandingPanel-test",
            text: "display: block !important; " +
                "position: absolute !important; " +
                "top: -9999px !important; left: -9999px !important; " +
                "visibility: visible !important; " +
                "overflow: visible !important; " +
                "height: auto !important;"
        };

        if (YAHOO.env.ua.ie > 0) {
            // internet explorer has a proprietary method for dynamically
            // adding styles. See:
            // http://www.quirksmode.org/bugreports/archives/2006/01/IE_wont_allow_documentcreateElementstyle.html
            TEST_CSS_REF = document.createStyleSheet();
            TEST_CSS_REF.addRule(anchor.selector, anchor.text);
            TEST_CSS_REF.addRule(test.selector, test.text);
        } else {
            TEST_CSS_REF = document.createElement("style");
            TEST_CSS_REF.setAttribute("type", "text/css");

            TEST_CSS_REF.appendChild(document.createTextNode(
                anchor.selector + "{" + anchor.text + "}"));
            TEST_CSS_REF.appendChild(document.createTextNode(
                test.selector + "{" + test.text + "}"));

            if (YAHOO.env.ua.webkit > 0) {
                // Safari workaround. See: http://www.quirksmode.org/bugreports/archives/safari/#entry999
                TEST_CSS_REF.appendChild(document.createTextNode(
                    ".YAHOO-bc-ExpandingPanel-test * {\n" +
                        "position: relative;\n" +
                        "}\n"));
            }

            // To fix irresponsible Firefox behavior
            if (YAHOO.env.ua.gecko > 0) {
                TEST_CSS_REF.appendChild(document.createTextNode(
                    ".YAHOO-bc-ExpandingPanel {\n" +
                        "overflow: hidden;\n" +
                        "}\n"));
            }
            document.getElementsByTagName("head")[0].appendChild(TEST_CSS_REF);
        }
    }
}());

(function() {
    var DOM = YAHOO.util.Dom;
    YAHOO.bc.approveDenyHandler = function(el) {
        el = DOM.get(el);

        var control = DOM.getElementsByClassName('ctrl', 'input', el);
        if (control.length == 1) {
            control = control[0];
        } else {
            return;
        }
        YAHOO.bc.approveDenyDelegate(control);
        var callBack = function(evt, obj) {
            YAHOO.bc.approveDenyDelegate(obj);
        };
        YAHOO.util.Event.addListener(control, 'change', callBack, control);
    };

    YAHOO.bc.approveDenyDelegate = function(ctl) {
        var enabled = ctl.checked;
        var formElements = DOM.getElementsByClassName('corrected', 'input', DOM.getAncestorByClassName(ctl, 'approve-deny'));
        for (var i = 0; i < formElements.length; i = i + 1) {
            formElements[i].disabled = !enabled;
        }
        var parent = ctl.parentNode;
        var text = parent.getElementsByTagName('span')[0];
        if (enabled) {
            text.innerHTML = "Approved";
            DOM.removeClass(parent, 'denied');
            DOM.addClass(parent, 'approved');
        } else {
            text.innerHTML = "Denied";
            DOM.removeClass(parent, 'approved');
            DOM.addClass(parent, 'denied');
        }
    };
}());

(function() {
    var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;
    var defaultAttributes = {
        visible: false,
        context: [document.body, "rava-bubble", "rava-bubble"],
        zIndex: 10,
        modal: true,
        shown: {
            duration: 0.5,
            method: YAHOO.util.Easing.EaseNone
        },
        hidden: {
            duration: 0.2,
            method: YAHOO.util.Easing.EaseNone
        }
    };
    var OVERLAY_PANEL_CSS = null;

    /******************************************************************************
     YAHOO.bc.OverlayPanel

     OverlayPanel is a UI widget that can be hidden or shown in a robust fashion.

     ******************************************************************************/
    YAHOO.bc.OverlayPanel = function(element, attributes) {
        element = Dom.get(element);

        // attributes is optional, so we have some default parameters
        if (YAHOO.lang.isUndefined(attributes) || YAHOO.lang.isNull(attributes)) {
            attributes = defaultAttributes;
        } else {
            for (var atb in defaultAttributes) {
                if (YAHOO.lang.isUndefined(attributes[atb])) {
                    attributes[atb] = defaultAttributes[atb];
                }
            }
        }

        Dom.setStyle(element, 'z-index', attributes.zIndex);
        if (Dom.getStyle(element, 'display') === 'none') {
            Dom.setStyle(element, 'display', 'block');
            Dom.setStyle(element, 'opacity', 0);
            Dom.setStyle(element, 'visibility', 'hidden');
        }
        if (Dom.getStyle(element, 'visibility', 'hidden')) {
            attributes.visible = false;
        }

        var animating = false;

        var overlayPanelEffect = function(overlay, finalOpacity) {
            var a = new YAHOO.widget.ContainerEffect(overlay,
                {
                    attributes: { opacity: { to: finalOpacity } },
                    duration: attributes.shown.duration,
                    method: attributes.shown.method
                },
                {
                    attributes: { opacity: { to: 0 } },
                    duration: attributes.hidden.duration,
                    method: attributes.hidden.method
                });
            a.handleStartAnimateIn = function(type, args, obj) {
                animating = true;
                YAHOO.util.Dom.setStyle(a.overlay.element, "visibility", "visible");
            };
            a.handleCompleteAnimateIn = function(type, args, obj) {
                animating = false;
                obj.animateInCompleteEvent.fire();
            };
            a.handleStartAnimateOut = function(type, args, obj) {
                animating = true;
            };
            a.handleCompleteAnimateOut = function(type, args, obj) {
                animating = false;
                YAHOO.util.Dom.setStyle(a.overlay.element, "visibility", "hidden");
                obj.animateOutCompleteEvent.fire();
            };
            a.init();
            return a;
        };

        var panelAttbs = {
            visible: attributes.visible,
            effect: {
                effect: overlayPanelEffect,
                duration: 1
            },
            context: attributes.context,
            monitorresize: false,
            iframe: false
        };
        var panel = new YAHOO.widget.Overlay(element, panelAttbs);
        panel.render();

        var modalUnderlay = document.createElement("div");
        document.body.appendChild(modalUnderlay);

        Dom.setStyle(modalUnderlay, 'position', 'absolute');
        Dom.setStyle(modalUnderlay, 'top', 0 + "px");
        Dom.setStyle(modalUnderlay, 'left', 0 + "px");
        Dom.setStyle(modalUnderlay, 'background-color', 'black');
        Dom.setStyle(modalUnderlay, 'opacity', 0);
        Dom.setStyle(modalUnderlay, 'z-index', attributes.zIndex - 1);

        if (attributes.visible === false) {
            Dom.setStyle(modalUnderlay, 'visibility', 'hidden');
        } else {
            Dom.setStyle(modalUnderlay, 'visibility', 'visible');
        }

        Dom.setStyle(modalUnderlay, "height", Dom.getDocumentHeight() + "px");
        if (Dom.getViewportHeight() > Dom.getDocumentHeight()) {
            Dom.setStyle(modalUnderlay, "height", Dom.getViewportHeight() + "px");
        }

        Dom.setStyle(modalUnderlay, 'width', Dom.getDocumentWidth() + "px");
        if (Dom.getViewportWidth() > Dom.getDocumentWidth()) {
            Dom.setStyle(modalUnderlay, "width", Dom.getViewportWidth() + "px");
        }

        panelAttbs = {
            visible: attributes.visible,
            effect: {
                effect: overlayPanelEffect,
                duration: 0.5
            },
            monitorresize: false
        };
        YAHOO.widget.Overlay.IFRAME_OFFSET = 0;
        modalUnderlay = new YAHOO.widget.Overlay(modalUnderlay, panelAttbs);
        modalUnderlay.render();

        modalUnderlay.hideEvent.subscribe(modalUnderlay.hideIframe, modalUnderlay, true);

        // when the window is resized, we need to realign the panel
        // and update the modal underlay height/width
        YAHOO.widget.Overlay.windowResizeEvent.subscribe(function() {
            panel.align(attributes.context[1], attributes.context[2]);

            var m = modalUnderlay.element;

            var h = parseInt(Dom.getStyle(m, 'height'), 10);
            var w = parseInt(Dom.getStyle(m, 'width'), 10);


            if (h <= Dom.getDocumentHeight()) {
                Dom.setStyle(m, 'height', Dom.getDocumentHeight() + "px");
            } else {
                Dom.setStyle(m, 'height', '0px');
                Dom.setStyle(m, 'height', Dom.getDocumentHeight() + "px");
            }
            if (Dom.getViewportHeight() > Dom.getDocumentHeight()) {
                Dom.setStyle(m, "height", Dom.getViewportHeight() + "px");
            }

            if (w <= Dom.getDocumentWidth()) {
                Dom.setStyle(m, 'width', Dom.getDocumentWidth() + 'px');
            } else {
                Dom.setStyle(m, 'width', '0px');
                Dom.setStyle(m, "width", Dom.getDocumentWidth() + "px");
            }
        });

        // if there's an iframe, it means we're using IE
        if (panel.cfg.getProperty("iframe") || modalUnderlay.cfg.getProperty("iframe")) {
            YAHOO.widget.Overlay.windowScrollEvent.subscribe(function() {
                if (panel.cfg.getProperty("visible")) {
                    if (attributes.modal) {
                        modalUnderlay.hideIframe();
                        modalUnderlay.showIframe();
                    } else {
                        panel.hideIframe();
                        panel.showIframe();
                    }
                }
            });
        }

        return {
            show: function() {
                if (attributes.modal) {
                    modalUnderlay.show();
                }
                panel.show();
            },
            hide: function() {
                if (attributes.modal) {
                    modalUnderlay.hide();
                }
                panel.hide();
            },
            toggle: function() {
                if (panel.cfg.getProperty("visible")) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            isShown: function() {
                return panel.cfg.getProperty("visible");
            },
            getPanel: function() {
                return panel;
            },
            getModalLayer: function() {
                return modalUnderlay;
            }
        };
    };
})();

(function() {
    var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;

    YAHOO.bc.ProgressBar = function(element, pageCount) {
        element = Dom.get(element);
        pageCount = pageCount || 9;

        var wrapper = document.createElement("div");
        Dom.addClass(wrapper, 'bc-progress-bar-wrapper');
        var label = document.createElement("div");
        Dom.addClass(label, 'bc-progress-bar-label');

        var dots = [], leftArrow, rightArrow;
        leftArrow = document.createElement('div');
        rightArrow = document.createElement('div');
        Dom.addClass(leftArrow, 'bc-progress-bar-left');
        Dom.addClass(rightArrow, 'bc-progress-bar-right');

        wrapper.appendChild(leftArrow);

        for (var i = 0; i < pageCount; i++) {
            dots[i] = document.createElement('div');
            wrapper.appendChild(dots[i]);
        }
        Dom.addClass(dots, 'bc-progress-bar-dot');

        wrapper.appendChild(rightArrow);
        wrapper.appendChild(label);

        element.appendChild(wrapper);

        return {
            setPage: function(page) {
                page = page - 1;
                for (var i = 0; i < pageCount; i++) {
                    if (i < page) {
                        Dom.removeClass(dots[i], 'bc-progress-bar-currentpage');
                        Dom.addClass(dots[i], 'bc-progress-bar-passed');
                    } else if (i == page) {
                        Dom.addClass(dots[i], 'bc-progress-bar-currentpage');
                    } else {
                        Dom.removeClass(dots[i], 'bc-progress-bar-passed');
                        Dom.removeClass(dots[i], 'bc-progress-bar-currentpage');
                    }
                }
            },
            getPageCount: function() {
                return pageCount;
            },
            backButtonEnabled: function(enabled) {
                if (enabled) {
                    Dom.addClass(leftArrow, 'bc-progress-left-enabled');
                }
            },
            forwardButtonEnabled: function(enabled) {
                if (enabled) {
                    Dom.addClass(rightArrow, 'bc-progress-right-enabled');
                }
            }
        };
    };
})();

/*
 This function attaches listeners to all input HTML elements with the named
 class. Affected input fields are automatically cleared when they gain focus
 and are returned to their default value if they lose focus but have not had
 data inputted to them.
 */
YAHOO.bc.formSweeper = function(className) {
    var els = YAHOO.util.Dom.getElementsByClassName(className, "input");
    var j;

    for (var i = 0; i < els.length; i++) {
        // we're making, in essence, an anonymous closure to handle
        // form fields
        j = function() {
            var el = els[i];
            var defaultValue = el.value;

            YAHOO.util.Event.addListener(el, "focus",
                function() {
                    if (el.value == defaultValue) {
                        el.value = '';
                    }
                }
            );
            YAHOO.util.Event.addListener(el, "blur",
                function() {
                    var reg = /^\s*$/;
                    if (reg.test(el.value)) {
                        el.value = defaultValue;
                    }
                }
            );
        }();
    }
};


/* Addon that massages the VHD home page form into operating properly */

YAHOO.util.Event.onDOMReady(function() {
    if (document.getElementById('vhd-continue')) {

        YAHOO.util.Event.addListener('vhd-continue', 'click', function(ev) {

//			var form = this.form;
//			var reg = /\/(\w+)\//;
//			var face = reg.exec(form.action)[1];
            var face = document.getElementById('vhd-group-name').value;

            if (document.getElementById('question-select').value == -1) {
                YAHOO.util.Event.preventDefault(ev);

                document.location = 'https://vhd.overseasvotefoundation.org/unified/index.php?group=' + face;
            }

        });
    }
});

YAHOO.util.Event.onDOMReady(function() {

    var refreshCaptcha = function () {
        var image = document.getElementById('eodCaptchaImgTag');
        image.src = "/vote/captcha/captcha.jpg?" + Math.random();
    };

    if (document.getElementById('eodCaptchaImgRefresh')) {
        YAHOO.util.Event.addListener('eodCaptchaImgRefresh', 'click', refreshCaptcha);
    }
    if (document.getElementById('eodCaptchaImgRefresh2')) {
        YAHOO.util.Event.addListener('eodCaptchaImgRefresh2', 'click', refreshCaptcha);
    }
});


YAHOO.util.Event.onDOMReady(function() {
	
	if(document.getElementById('votingAddressDescription')){
		document.getElementById('votingAddressDescription').style.display = 'none';

	}

	if(document.getElementById('votingAddressDescription')){
	var votingAddress1 = document.getElementById('votingAddress1').innerHTML;
	}
	
	var showAddressDescription = function(ev) {

		if(document.getElementById(ev).checked){
			document.getElementById('regularAddress').disabled = true;
            if(ev == 'ruralRoute'){
                document.getElementById('votingAddress1').innerHTML = 'Rural Route Address *';
                document.getElementById('votingAddressStreet1').style.display = 'block';
            }else{
                document.getElementById('votingAddressStreet1').style.display = 'none';
                document.getElementById('votingAddress.street1').value = '';
            }
            document.getElementById('votingAddressDescription').style.display = 'block';
			document.getElementById('votingAddress2').style.display = 'none';
			document.getElementById('votingAddress.street2').value = '';
		}else {
			document.getElementById('regularAddress').disabled = false;

			if(ev == 'ruralRoute'){
				document.getElementById('votingAddress1').innerHTML = votingAddress1;
			}else{
				document.getElementById('votingAddressStreet1').style.display = 'block';
			}
			document.getElementById('votingAddress1').innerHTML = votingAddress1;
			document.getElementById('votingAddressDescription').style.display = 'none';
			document.getElementById('votingAddressDescriptionArea').value = '';
			document.getElementById('votingAddress2').style.display = 'block';
			document.getElementById('regularAddress').value = 'STREET';

		}
		
	};

    if (document.getElementById('addressDescribed')) {
        YAHOO.util.Event.addListener('addressDescribed', 'click', function(ev) {
            document.getElementById('ruralRoute').checked = false;
            document.getElementById('regularAddress').value = 'DESCRIBED';
            showAddressDescription('addressDescribed');
        });
    }

    if (document.getElementById('ruralRoute')) {
        YAHOO.util.Event.addListener('ruralRoute', 'click', function(ev) {
            document.getElementById('addressDescribed').checked = false;
            document.getElementById('regularAddress').value = 'RURAL_ROUTE';
            showAddressDescription('ruralRoute');
        });
    }
    if (document.getElementById('currentAddress')) {
        var currentAddress1 = document.getElementById('currentAddress1').innerHTML;
        var currentAddress2 = document.getElementById('currentAddress2').innerHTML;
        var currentCity = document.getElementById('currentCity').innerHTML;
        var currentState = document.getElementById('currentState').innerHTML;
    }
    var showMilitaryAddress = function() {

        if (document.getElementById('militaryAddress').checked) {
            document.getElementById('currentAddress1').innerHTML = 'PSC/CMR/Unit & Box Number';
            document.getElementById('currentAddress2').innerHTML = 'Organization Name';
		    document.getElementById('currentAddress.city').style.display = 'none';
            document.getElementById('currentAddress.city').disabled = true;
            document.getElementById('currentAddress.state').style.display = 'none';
            document.getElementById('currentAddress.state').disabled = true;
			document.getElementById('militaryCurrentCity').style.display = 'block';
            document.getElementById('militaryCurrentState').style.display = 'block';
            document.getElementById('militaryCurrentCity').disabled = false;
            document.getElementById('militaryCurrentState').disabled = false;
            document.getElementById('currentCity').innerHTML = 'APO/FPO/DPO';
            document.getElementById('currentState').innerHTML = 'AE/AA/AP';
            document.getElementById('currentAddressType').value = "MILITARY";
        } else {
            document.getElementById('currentAddress.city').disabled = false;
            document.getElementById('currentAddress.state').disabled = false;
            document.getElementById('currentAddress.city').style.display = 'block';
            document.getElementById('currentAddress.state').style.display = 'block';
            document.getElementById('militaryCurrentCity').style.display = 'none';
            document.getElementById('militaryCurrentState').style.display = 'none';
            document.getElementById('militaryCurrentCity').disabled = true;
            document.getElementById('militaryCurrentState').disabled = true;
            document.getElementById('currentAddress1').innerHTML = currentAddress1;
            document.getElementById('currentAddress2').innerHTML = currentAddress2;
            document.getElementById('currentCity').innerHTML = currentCity;
            document.getElementById('currentState').innerHTML = currentState;
            document.getElementById('currentAddressType').value = "OVERSEAS";
        }
    };

    if (document.getElementById('militaryAddress')) {
        showMilitaryAddress();
        YAHOO.util.Event.addListener('militaryAddress', 'click', function(ev) {
            showMilitaryAddress();
        });
    }

    var showDomesticMilitaryAddress = function() {

        if (document.getElementById('domesticMilitaryAddress').checked) {
            document.getElementById('currentAddress1').innerHTML = 'PSC/CMR/Unit & Box Number';
            document.getElementById('currentAddress2').innerHTML = 'Organization Name';
		    document.getElementById('currentAddress.city').style.display = 'none';
            document.getElementById('currentAddress.city').disabled = true;
            document.getElementById('currentAddress.state').style.display = 'none';
            document.getElementById('currentAddress.state').disabled = true;
			document.getElementById('militaryCurrentCity').style.display = 'block';
            document.getElementById('militaryCurrentState').style.display = 'block';
            document.getElementById('militaryCurrentCity').disabled = false;
            document.getElementById('militaryCurrentState').disabled = false;
            document.getElementById('currentCity').innerHTML = 'APO/FPO/DPO';
            document.getElementById('currentState').innerHTML = 'AE/AA/AP';
            document.getElementById('currentAddressType').value = "MILITARY";
        } else {
            document.getElementById('currentAddress.city').disabled = false;
            document.getElementById('currentAddress.state').disabled = false;
            document.getElementById('currentAddress.city').style.display = 'block';
            document.getElementById('currentAddress.state').style.display = 'block';
            document.getElementById('militaryCurrentCity').style.display = 'none';
            document.getElementById('militaryCurrentState').style.display = 'none';
            document.getElementById('militaryCurrentCity').disabled = true;
            document.getElementById('militaryCurrentState').disabled = true;
            document.getElementById('currentAddress1').innerHTML = currentAddress1;
            document.getElementById('currentAddress2').innerHTML = currentAddress2;
            document.getElementById('currentCity').innerHTML = currentCity;
            document.getElementById('currentState').innerHTML = currentState;
            document.getElementById('currentAddressType').value = "STREET";
        }
    };

    if (document.getElementById('domesticMilitaryAddress')) {
        showDomesticMilitaryAddress();
        YAHOO.util.Event.addListener('domesticMilitaryAddress', 'click', function(ev) {
            showDomesticMilitaryAddress();
        });
    }

    // Pass values on page reload for error checking
    if (document.getElementById('militaryAddress')||document.getElementById('domesticMilitaryAddress')) {
        if (document.getElementById('ruralRoute').checked) {
            showAddressDescription('ruralRoute');
        } else if (document.getElementById('addressDescribed').checked) {
            showAddressDescription('addressDescribed');
        }
    }

    if (document.getElementById('use-forwarding-address')) {

        YAHOO.util.Event.addListener('use-forwarding-address', 'click', function(ev) {
            if (this.checked) {
                document.getElementById('forwardingAddress').style.display = 'block';
            } else if (this.checked == false) {
                document.getElementById('forwardingAddress').style.display = 'none';
                document.getElementById('forwardingAddress.street1').value = '';
                document.getElementById('forwardingAddress.street2').value = '';
                document.getElementById('forwardingAddress.city').value = '';
                document.getElementById('forwardingAddress.state').value = '';
                document.getElementById('forwardingAddress.zip').value = '';
                document.getElementById('forwardingAddress.country').value = '';
            }

        });
    }

    if (document.getElementById('voterType')) {
        YAHOO.util.Event.addListener('voterType', 'change', function(ev) {
            var voterType = document.getElementById('voterType').selectedIndex;
            document.cookie = "voterType=" + voterType;
        });
    }

    if (document.getElementById('voterHistory')) {
        YAHOO.util.Event.addListener('voterHistory', 'change', function(ev) {
            var voterHistory = document.getElementById('voterHistory').selectedIndex;
            document.cookie = "voterHistory=" + voterHistory;
        });
    }

});