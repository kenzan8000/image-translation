require './lib/tasks/google_client'
#require './lib/tasks/image_translator'


class HomeController < ApplicationController

  skip_before_filter :verify_authenticity_token

=begin
  @apiVersion 0.1.0

  @apiGroup Home
  @api {get} /translate
  @apiName translate
  @apiDescription get translation from texts in images

  @apiParam {String} target                     Mandatory output language
  @apiParam {String} images                     Mandatory source images (base64)

  @apiParamExample {json} Request-Example:
    {
      "target": "en",
      "images": ["/9j/4AAQSkZJRgABAQ...", ...]
    }

  @apiSuccess {Array} textAnnotations translation results
  @apiSuccess {String} locale locale string
  @apiSuccess {String} description detected text from source images
  @apiSuccess {Array} translatedTexts translated texts
  @apiSuccess {Dictionary} boundingPoly polygon area written in source text
  @apiSuccess {Number} application_code 200 when succeed, 400 when fail

  @apiSuccessExample {json} Success-Response:
    {
      "textAnnotations": [
        {
          "base64": "/9j/4AAQSkZJRgABAQ...",
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
    need_params = [:target, :images]
    need_params.each do |need_param|
      render json: { :application_code => 400, :description => "could not find parameter '#{need_param}'" } and return unless params[need_param]
    end

    images = params[:images]
    dst_lang = params[:target]
    client = GoogleClient.new(ENV['GOOGLE_SERVER_KEY'])

    # detect texts from the images
    json = client.detect_text(images)
    render json: { :application_code => 400, :description => 'could not detect text' } and return unless json
    response_json = { :application_code => 200, :textAnnotations => [] }
    img_annotations = client.parse_detect_text(json)
    render json: response_json and return unless img_annotations
    render json: response_json and return unless images.count == img_annotations.count

    # translate the text
    img_texts = []
    src_langs = []
    img_annotations.each do |annotations|
      texts = []
      annotations.each { |annotation| texts.push annotation[:description] }
      img_texts.push texts
      src_langs.push annotations.first[:locale]
    end
    render json: response_json and return if img_texts.count == 0
    json = client.translate(img_texts, src_langs, dst_lang)
    img_translated_texts = client.parse_translate(json)
    render json: response_json and return unless img_annotations.count == img_translated_texts.count

    # annotations
    img_annotations.each_with_index do |annotations, i|
      next unless annotations.count == img_translated_texts[i].count
      annotations.each_with_index { |annotation, j| annotation[:translatedText] = img_translated_texts[i][j] }
    end
    response_json[:textAnnotations] = img_annotations

    render json: response_json
  end

end
