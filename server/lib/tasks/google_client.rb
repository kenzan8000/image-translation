require 'faraday'
require 'json'


class GoogleClient

  # initialize
  def initialize(server_key)
    @server_key = server_key
  end

  # text detection
  def detect_text(image)
    connection = Faraday.new(:url => "https://vision.googleapis.com/v1/images:annotate") do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger
      faraday.adapter  Faraday.default_adapter
    end

    body = "{'requests':[{'image':{'content':'#{image}'},'features':[{'type':'TEXT_DETECTION','maxResults':10}]}]}"
    response = connection.post do |request|
      request.params['key'] = @server_key
      request.headers['Content-Type'] = 'application/json'
      request.body = body
    end
    JSON.parse(response.body)
  end

  # parse detect text's response
  def parse_detect_text(json)
    return nil unless json['responses']

    annotations = []
    json['responses'].each do |res|
      next unless res['textAnnotations']
      res['textAnnotations'].each do |annotation|
        text = annotation['description']
        src_lang = annotation['locale']
        bounding_poly = annotation['boundingPoly']
        next unless (text && src_lang && bounding_poly)

        annotations.push annotation
      end
    end

    return nil if annotations.count == 0
    annotations
  end

  # translate
  def translte(text, src_lang, dst_lang)
    connection = Faraday.new(:url => 'https://www.googleapis.com/language/translate/v2') do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger
      faraday.adapter  Faraday.default_adapter
    end

    response = connection.get do |request|
      request.params['key'] = @server_key
      request.params['q'] = text
      request.params['source'] = src_lang
      request.params['target'] = dst_lang
      request.headers['Content-Type'] = 'application/json'
    end
    JSON.parse(response.body)
  end

  # parse translate's response
  def parse_translate(json)
    return nil unless json['data']
    return nil unless json['data']['translations']

    translated_texts = []
    json['data']['translations'].each do |translation|
      next unless translation['translatedText']
      translated_texts.push translation['translatedText']
    end

    return nil if translated_texts.count == 0
    translated_texts
  end

end

