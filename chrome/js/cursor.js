(function(global) {
    "use strict;"


    /// Cursor

    /**
     * detecting if cursor is on image, getting cursor position, etc
     *
     * @class Cursor
     * @constructor
     * @param {Function} onmousemove callback when called cursor movement
     **/
    function Cursor(oncursormove) {
        var _this = this;

        /**
         * cursor poisition x
         *
         * @property x
         * @type Integer
         * @default null
         **/
        this.x = null;

        /**
         * cursor poisition y
         *
         * @property y
         * @type Integer
         * @default null
         **/
        this.y = null;

        /**
         * cursored img tag
         *
         * @property cursoredImg
         * @type Element
         * @default []
         **/
        this.cursoredImgs = [];

        /**
         * event listener
         *
         * @property oncursormove
         * @type Function
         **/
        this.oncursormove = oncursormove;

        if (window.captureEvents) { document.captureEvents(Event.MOUSEMOVE); }
        document.onmousemove = function(event) { _this.onmousemove(event); };
    };


    /// apis

    /**
     * detect if text rectangle on image contains cursor
     *
     * @method contains
     * @param {Element} element
     * @param {Dictionary} textRect {x:number,y:number,w:number,h:number}
     * @return {Boolean} true or false
     **/
    Cursor.prototype.contains = function(element, textRect) {
        if (!element) { return false; }

        var el = element;
        var elementX = 0;
        var elementY = 0;
        while (el) {
            if (el.tagName == "BODY") {
                var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = el.scrollTop  || document.documentElement.scrollTop;
                elementX += (el.offsetLeft - xScroll + el.clientLeft);
                elementY += (el.offsetTop  - yScroll + el.clientTop);
            }
            else {
                elementX += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                elementY += (el.offsetTop  - el.scrollTop  + el.clientTop);
            }
            el = el.offsetParent;
        }
        var rect = {
            'x': elementX+textRect.x, 'y': elementY+textRect.y,
            'w': textRect.w, 'h': textRect.h
        };

        return (this.x >= rect.x && this.y >= rect.y && this.x <= rect.x+rect.w && this.y <= rect.y+rect.h)
    }

    /**
     * hide balloon
     *
     * @method hideBalloon
     **/
    Cursor.prototype.hideBalloon = function(text) {
        for (var i = 0; i < this.cursoredImgs.length; i++) {
            var cursoredImg = this.cursoredImgs[i];
            cursoredImg.hideBalloon();
        }
        this.cursoredImgs = [];
    }

    /**
     * show balloon
     *
     * @method showBalloon
     * @param {Element} img text to show
     * @param {String} text text to show
     **/
    Cursor.prototype.showBalloon = function(img, text) {
        var cursoredImg = $(img);
        this.cursoredImgs.push(cursoredImg);
        var contents = '<div>' + text + '</div>'
        cursoredImg.showBalloon({'contents':contents, 'position':null});
    }

    /**
     * event lister when mouse moves
     *
     * @method onmousemove
     * @param {Event} event Event
     **/
    Cursor.prototype.onmousemove = function(event) {
        this.x = (window.Event) ? event.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        this.y = (window.Event) ? event.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

        this.oncursormove();
    };

    /// exports
    if ("process" in global) { module.exports = Cursor; }
    global.Cursor = Cursor;


})((this || 0).self || global);
