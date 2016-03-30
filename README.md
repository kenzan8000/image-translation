# image translator

chrome extension translating text in images

server: [API](http://kenzan8000.github.io/image-translation/document/server/)


## Installation

### 1. Enable google APIs

[cloud vision api](https://cloud.google.com/vision/)

[translate api](https://cloud.google.com/translate/)


### 2. set server keys

```
# on local
$ export GOOGLE_SERVER_KEY="hogehogehoge"

# on heroku
$ heroku config:set GOOGLE_SERVER_KEY="hogehogehoge"
```
