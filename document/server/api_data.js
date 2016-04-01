define({ "api": [  {    "version": "0.1.0",    "group": "Home",    "type": "get",    "url": "/translate",    "title": "",    "name": "translate",    "description": "<p>get translation from texts in images</p> ",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "<p>String</p> ",            "optional": false,            "field": "target",            "description": "<p>Mandatory output language</p> "          },          {            "group": "Parameter",            "type": "<p>String</p> ",            "optional": false,            "field": "images",            "description": "<p>Mandatory source images (base64)</p> "          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n  \"target\": \"en\",\n  \"images\": [\"/9j/4AAQSkZJRgABAQ...\", ...]\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "<p>Array</p> ",            "optional": false,            "field": "textAnnotations",            "description": "<p>translation results</p> "          },          {            "group": "Success 200",            "type": "<p>String</p> ",            "optional": false,            "field": "locale",            "description": "<p>locale string</p> "          },          {            "group": "Success 200",            "type": "<p>String</p> ",            "optional": false,            "field": "description",            "description": "<p>detected text from source images</p> "          },          {            "group": "Success 200",            "type": "<p>Array</p> ",            "optional": false,            "field": "translatedTexts",            "description": "<p>translated texts</p> "          },          {            "group": "Success 200",            "type": "<p>Dictionary</p> ",            "optional": false,            "field": "boundingPoly",            "description": "<p>polygon area written in source text</p> "          },          {            "group": "Success 200",            "type": "<p>Number</p> ",            "optional": false,            "field": "application_code",            "description": "<p>200 when succeed, 400 when fail</p> "          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "{\n  \"images\": [\n    {\n      \"locale\": \"ja\",\n      \"description\": \"ビューティフル\\n\",\n      \"translatedText\": \"beautiful\",\n      \"boundingPoly\": {\n        \"vertices\": [\n          {\n            \"x\": 32,\n            \"y\": 3\n          },\n          {\n            \"x\": 47,\n            \"y\": 3\n          },\n          {\n            \"x\": 47,\n            \"y\": 130\n          },\n          {\n            \"x\": 32,\n            \"y\": 130\n          }\n        ]\n      }\n    },\n    ...\n  ],\n  \"application_code\": 200\n}",          "type": "json"        }      ]    },    "filename": "server/app/controllers/home_controller.rb",    "groupTitle": "Home"  }] });