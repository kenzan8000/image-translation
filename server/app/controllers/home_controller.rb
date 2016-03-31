require './lib/tasks/google_client'


class HomeController < ApplicationController

  skip_before_filter :verify_authenticity_token

=begin
  @apiVersion 0.1.0

  @apiGroup Home
  @api {get} /translate
  @apiName translate
  @apiDescription get translation from text in an image

  @apiParam {String} target                     Mandatory output language
  @apiParam {String} image                      Mandatory source image (base64)

  @apiParamExample {json} Request-Example:
    {
      "target": "en",
      "image": "/9j/4AAQSkZJRgABAQ..."
    }

  @apiSuccess {Array} textAnnotations translation results
  @apiSuccess {String} locale locale string
  @apiSuccess {String} description detected text from source image
  @apiSuccess {Array} translatedTexts translated texts
  @apiSuccess {Dictionary} boundingPoly polygon area written in source text
  @apiSuccess {Number} application_code 200 when succeed, 400 when fail

  @apiSuccessExample {json} Success-Response:
    {
      "textAnnotations": [
        {
          "locale": "ja",
          "description": "ビューティフル\n",
          "translatedText": "beautiful",
          "boundingPoly": {
            "vertices": [
              {
                "x": 32,
                "y": 3
              },
              {
                "x": 47,
                "y": 3
              },
              {
                "x": 47,
                "y": 130
              },
              {
                "x": 32,
                "y": 130
              }
            ]
          }
        },
        ...
      ],
      "application_code": 200
    }
=end
  def translate
    # check params
    need_params = [:target, :image]
    need_params.each do |need_param|
      render json: { :application_code => 400, :description => "could not find parameter '#{need_param}'" } and return unless params[need_param]
    end

    image = params[:image]
    dst_lang = params[:target]
    client = GoogleClient.new(ENV['GOOGLE_SERVER_KEY'])

    # detect text from the image
    json = client.detect_text("#{image}")
    render json: { :application_code => 400, :description => 'could not detect text' } and return unless json
    response_json = { :application_code => 200, :textAnnotations => [] }
    annotations = client.parse_detect_text(json)
    render json: response_json and return unless annotations

    # translate the text
    texts = []
    annotations.each { |annotation| texts.push annotation['description'] }
    render json: response_json and return if texts.count == 0
    src_lang = annotations.first['locale']
    json = client.translate(texts, src_lang, dst_lang)
    translated_texts = client.parse_translate(json)
    render json: response_json and return unless annotations.count == translated_texts.count
    annotations.each_with_index { |annotation, index| annotation['translatedText'] = translated_texts[index] }
    response_json['textAnnotations'] = annotations

    render json: response_json
  end

end
