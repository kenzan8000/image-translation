(function(global) {
    "use strict;"


    /// functions

    /**
     * set browser icon
     * @param storage local storage
     **/
    function setIcon(storage) {
        var imagePath = (storage.translatorIsOn == "true") ? "img/icon19.png" : "img/icon19_off.png";
        chrome.browserAction.setIcon({path:imagePath});
    }

    /**
     * send tab request
     * @param storage local storage
     * @param tab Tab
     **/
    function sendRequest(storage, tab) {
        var msg = (storage.translatorIsOn == "true") ? "image translator will turn on" : "image translator will turn off";
        chrome.tabs.sendRequest(tab.id, {message: msg}, function(response) {
        });
    }


    /// initialization

    chrome.storage.local.get("translatorIsOn", function(storage) {
        chrome.storage.local.set({"translatorIsOn":"false"}, function() {
            setIcon(storage);
        });
/*
        chrome.tabs.getSelected(null, function(tab){
            setIcon(storage);
            //sendRequest(storage, tab);
        });
*/
    });


    /// event listener

    /**
     * called when switching browser icon
     **/
    chrome.browserAction.onClicked.addListener(function() {
        chrome.storage.local.get("translatorIsOn", function(storage) {
            chrome.tabs.getSelected(null, function(tab){
                var translatorIsOn = (storage.translatorIsOn == "true") ? "false" : "true";
                chrome.storage.local.set({"translatorIsOn":translatorIsOn}, function() {
                    setIcon(storage);
                    sendRequest(storage, tab);
                });
            });
        });
    });


})((this || 0).self || global);
