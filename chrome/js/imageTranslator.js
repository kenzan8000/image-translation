(function(global) {


    /// ImageTranslator
    function ImageTranslator() {
    };

    /// Member

    /**
     * translate text in image
     * @param target language to output
     * @param image base64 image
     * @param completion completion handler
     **/
    ImageTranslator.prototype.translate = function(target, image, completion) {
        var method = 'POST';
        var url = 'https://image-translator.herokuapp.com/translate';
        var body = {"target":target, "image":image};
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var json = JSON.parse(xhr.responseText);
                completion(json);
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));
    };

    /// Exports
    if ("process" in global) {
        module["exports"] = ImageTranslator;
    }
    global["ImageTranslator"] = ImageTranslator;


})((this || 0).self || global);
