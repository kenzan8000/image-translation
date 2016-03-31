(function(global) {


    /// ImageTranslator

    /**
     * init
     * @param targetLanguage language to output
     **/
    function ImageTranslator(targetLanguage) {
        this.targetLanguage = targetLanguage;
        this.imgs = [];
    };


    /// apis

    /**
     * detect images on HTML
     * @return jQuery.Deferred(imgs)
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
     * @param index this.imgs' index
     * @return jQuery.Deferred()
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
     * @return jQuery.Deferred(imgs)
     **/
    ImageTranslator.prototype.translateImages = function() {
        var deferred = jQuery.Deferred();

        var deferredArray = [];

        for (var i = 0; i < this.imgs.length; i++) { deferredArray.push(this.translateImage(i)); }
        var _this = this;
        jQuery.when.apply(jQuery, deferredArray).done(function() { deferred.resolve(_this.imgs); });

        return deferred.promise();
    };

    /**
     * translate text in image
     * @param index this.imgs' index
     * @return jQuery.Deferred()
     **/
    ImageTranslator.prototype.translateImage = function(index) {
        var deferred = jQuery.Deferred();

        var method = 'POST';
        var url = 'https://image-translator.herokuapp.com/translate';
        var body = {"target":this.targetLanguage, "image":this.imgs[index].dataURI};
        var xhr = new XMLHttpRequest();
        var _this = this;
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var json = JSON.parse(xhr.responseText);
                _this.imgs[index].json = json;
                deferred.resolve();
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));

        return deferred.promise();
    };

    /**
     * draw translation on image
     * @param img img tag
     **/
    ImageTranslator.prototype.drawTranslation = function(img) {
        var json = img.json;
        if (json.application_code != 200) { return; }
        var textAnnotations = json.textAnnotations;
        if (!textAnnotations || textAnnotations.length == 0) { return; }

        var innerHTML = "";
        for (var i = 0; i < textAnnotations.length; i++) {
            var textAnnotation = textAnnotations[i];
            if (!textAnnotation.translatedText) { continue; }
            innerHTML = innerHTML + textAnnotation.translatedText+"\n";
        }
/*
        for (var i = 0; i < textAnnotations.length; i++) {
            var textAnnotation = textAnnotations[i];
            if (!textAnnotation.translatedText) { continue; }
            if (!textAnnotation.boundingPoly) { continue; }
            if (!textAnnotation.boundingPoly.vertices) { continue; }

            this.drawText(img, textAnnotation);
        }
*/
/*
        for (var i = 0; i < textAnnotations.length; i++) {
            var textAnnotation = textAnnotations[i];
            if (!textAnnotation.translatedText) { continue; }
            if (!textAnnotation.boundingPoly) { continue; }
            if (!textAnnotation.boundingPoly.vertices) { continue; }

            this.drawText(img, textAnnotation);
        }
*/
        var figcaption = document.createElement("figcaption");
        figcaption.innerHTML = innerHTML;
        img.parentNode.insertBefore(figcaption, img.nextSibling);
    }

    /**
     * draw translation on image
     * @param img img tag
     * @param textAnnotation json param to draw text on image
     **/
//    ImageTranslator.prototype.drawText = function(img, textAnnotation) {
/*
        var minX = 9999999999;
        var minY = 9999999999;
        var maxX = 0;
        var maxY = 0;
        for (var i = 0; i < textAnnotation.boundingPoly.vertices.length; i++) {
            var vertex = textAnnotation.boundingPoly.vertices[i];
            if (!vertex.x) { vertex.x = 0; }
            if (!vertex.y) { vertex.y = 0; }

            if (vertex.x < minX) { minX = vertex.x; }
            if (vertex.y < minY) { minY = vertex.y; }
            if (vertex.x > maxX) { maxX = vertex.x; }
            if (vertex.y > maxY) { maxY = vertex.y; }
        }
        //var top = minY;
        //var left = minX;
        var top = minY + parseInt(img.offsetTop);
        var left = minX + parseInt(img.offsetLeft);
        var width = maxX - minX;
        var height = maxY - minY;

        var div = document.createElement("div");
        div.style.cssText = "background: rgba(1.0,1.0,1.0,0.7); color: black; position: absolute; top: "+top+"px; left: "+left+"px; width: "+width+"px; height: "+height+"px;";
        div.innerHTML = textAnnotation.translatedText;
        document.body.appendChild(div);
*/
/*
        var bottom = parseInt(img.offsetTop) + parseInt(img.offsetHeight);
        var left = parseInt(img.offsetLeft);
        var width = parseInt(img.offsetWidth);

        var div = document.createElement("div");
        div.style.cssText = "background-color: white; color: black; position: absolute; bottom: "+bottom+"px; left: "+left+"px; width: "+width+"px;";
        div.innerHTML = textAnnotation.translatedText;
        document.body.appendChild(div);
*/
//    }


    /// exports
    if ("process" in global) { module.exports = ImageTranslator; }
    global.ImageTranslator = ImageTranslator;


})((this || 0).self || global);
