(function(global) {
    "use strict;"


    /// ImageTranslator

    /**
     * ImageTranslator
     *
     * @class ImageTranslator
     * @constructor
     * @param {String} targetLanguage language to output
     **/
    function ImageTranslator(targetLanguage) {
        var _this = this;
        var oncursormove = function() {
            _this.cursor.hideBalloon();

            var translatedText = '';
            var cursoredImg = null;
            for (var i = 0; i < _this.imgs.length; i++) {
                var img = _this.imgs[i];
                if (!img.rects) { continue; }

                for (var j = 0; j < img.rects.length; j++) {
                    var rect = img.rects[j];
                    if (_this.cursor.contains(img, rect)) {
                        translatedText = rect.description + '<br />' + rect.translatedText + '<br />'
                        cursoredImg = img;
                    }
                }
            }
            if (cursoredImg) {
                _this.cursor.showBalloon(cursoredImg, translatedText);
            }
        };

        /**
         * language to output
         *
         * @property targetLanguage
         * @type String
         * @default 'en'
         **/
        this.targetLanguage = (targetLanguage) ? targetLanguage : 'en';

        /**
         * img tags
         *
         * @property imgs
         * @type Array
         * @default []
         **/
        this.imgs = [];

        /**
         * cursor utility
         *
         * @property cursor
         * @type Cursor
         **/
        this.cursor = new Cursor(oncursormove);

    };


    /// apis

    /**
     * detect images on HTML
     *
     * @method detectImages
     * @return {jQuery.Deferred} jQuery.Deferred(imgs)
     **/
    ImageTranslator.prototype.detectImages = function() {
        var deferred = jQuery.Deferred();

        this.imgs = [];
        var uris = [];

        // find all image tags in HTML
        var tags = document.getElementsByTagName('img');
        for (var i = 0; i < tags.length; i++) {
            if (!tags[i].src) { continue; }
            this.imgs.push(tags[i]);
        }

        // image uri to data uri
        var deferredArray = [];
        for (var i = 0; i < this.imgs.length; i++) {
            if (this.imgs[i].src.indexOf('data:image') === 0) {
                this.imgs[i].dataURI = this.imgs[i].src.replace(/(data:image)(.*?)(;base64,)/g, "");
                continue;
            }
            deferredArray.push(this.toDataURI(i));
        }
        var _this = this;
        jQuery.when.apply(jQuery, deferredArray).done(function() { deferred.resolve(_this.imgs); });

        return deferred.promise();
    };

    /**
     * image uri to data uri
     *
     * @method toDataURI
     * @param {Integer} index this.imgs' index
     * @return {jQuery.Deferred} jQuery.Deferred()
     **/
    ImageTranslator.prototype.toDataURI = function(index) {
        var deferred = jQuery.Deferred();

        var _this = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var reader  = new FileReader();
            reader.onloadend = function () {
                _this.imgs[index].dataURI = reader.result.replace(/(data:image)(.*?)(;base64,)/g, "");
                deferred.resolve();
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', this.imgs[index].src);
        xhr.send();

        return deferred.promise();
    };

    /**
     * translate texts in images
     *
     * @method translateImages
     * @return {jQuery.Deferred} jQuery.Deferred(imgs)
     **/
    ImageTranslator.prototype.translateImages = function() {
        var deferred = jQuery.Deferred();

        var dataURIs = [];
        for (var i = 0; i < this.imgs.length; i++) {
            dataURIs.push(this.imgs[i].dataURI);
        }

        var method = 'POST';
        var url = 'https://image-translator.herokuapp.com/translate';
        var body = {"target":this.targetLanguage, "images":dataURIs};
        var xhr = new XMLHttpRequest();
        var _this = this;

        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var json = JSON.parse(xhr.responseText);
                if (!json) { return; }
                if (json.application_code != 200) { return; }
                if (!json.textAnnotations) { return; }

                for (var i = 0; i < json.textAnnotations.length; i++) { _this.imgs[i].textAnnotations = json.textAnnotations[i]; }

                deferred.resolve(_this.imgs);
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));

        return deferred.promise();
    };

    /**
     * set text rects to img tags
     *
     * @method setRects
     **/
    ImageTranslator.prototype.setRects = function() {
        for (var i = 0; i < this.imgs.length; i++) {
            var img = this.imgs[i];
            if (!img.textAnnotations) { continue; }

            var rects = [];
            var x = 9999, y = 9999, w = 0, h = 0;
            for (var j = 0; j < img.textAnnotations.length; j++) {
                var textAnnotation = img.textAnnotations[j];
                if (!textAnnotation) { continue; }
                var vertices = textAnnotation.boundingPoly.vertices;

                for (var k = 0; k < vertices.length; k++) {
                    var vertex = vertices[k];
                    if (x > vertex.x) { x = vertex.x; }
                    if (y > vertex.y) { y = vertex.y; }
                    if (w < vertex.x) { w = vertex.x; }
                    if (h < vertex.y) { h = vertex.y; }
                }
                w = w - x;
                h = h - y;
                rects.push({'x':x, 'y':y, 'w':w, 'h':h, 'translatedText':textAnnotation.translatedText, 'description':textAnnotation.description});
            }
            this.imgs[i].rects = rects;
        }
    }


    /**
     * draw translation on image
     *
     * @method drawTranslation
     * @param img img tag
     **/
/*
    ImageTranslator.prototype.drawTranslation = function(img) {
        var json = img.json;
        var textAnnotations = json.textAnnotations;
        if (!textAnnotations || textAnnotations.length == 0) { return; }

        var innerHTML = "";
        for (var i = 0; i < textAnnotations.length; i++) {
            var textAnnotation = textAnnotations[i];
            if (!textAnnotation.translatedText) { continue; }
            innerHTML = innerHTML + textAnnotation.translatedText+"\n";
        }

        var figcaption = document.createElement("figcaption");
        figcaption.innerHTML = innerHTML;
        img.parentNode.insertBefore(figcaption, img.nextSibling);
    }
*/

    /// exports
    if ("process" in global) { module.exports = ImageTranslator; }
    global.ImageTranslator = ImageTranslator;


})((this || 0).self || global);
