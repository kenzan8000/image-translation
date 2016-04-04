(function(global) {
    "use strict;"


    /// event listener

    /**
     * calld when receiving "sendRequest"
     *
     **/
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

        // event handling
        if (request.message == "image translator will turn on") {

            var translator = new ImageTranslator("en");
            translator.detectImages().done(function(imgs) {
                translator.translateImages(imgs).done(function(imgs) {
                    for (var i = 0; i < imgs.length; i++) { translator.drawTranslation(imgs[i]); }
                });
            });

            sendResponse({message: "image translator turned on"});
        }
        else if (request.message == "image translator will turn off") {
            sendResponse({message: "image translator turn off"});
        }

    });


})((this || 0).self || global);
