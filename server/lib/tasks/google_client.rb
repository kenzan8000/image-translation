require 'faraday'
require 'json'
require 'net/http'
require 'uri'


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

      src_lang = nil
      res['textAnnotations'].each { |annotation| src_lang = annotation['locale'] if annotation['locale'] }
      next unless src_lang

      res['textAnnotations'].each do |annotation|
        next if annotation['locale']
        text = annotation['description']
        bounding_poly = annotation['boundingPoly']
        next unless (text && bounding_poly)
        annotation['locale'] = src_lang

        annotations.push annotation
      end
    end

    return nil if annotations.count == 0
    annotations
  end

  # translate
  def translate(texts, src_lang, dst_lang)
    uri_string = 'https://www.googleapis.com/language/translate/v2?'
    texts.each { |text| uri_string = "#{uri_string}q=#{URI::encode(text)}&" }
    uri_string = "#{uri_string}key=#{@server_key}&source=#{src_lang}&target=#{dst_lang}"

    client = HttpClient.new
    client.get_json(uri_string, {'Content-Type' => 'application/json'})

#    uri_string = 'https://www.googleapis.com/language/translate/v2'
#    connection = Faraday.new(:url => uri_string) do |faraday|
#      faraday.request  :url_encoded
#      faraday.response :logger
#      faraday.adapter  Faraday.default_adapter
#    end
#
#    response = connection.get do |request|
#      request.params['key'] = @server_key
#      #q = []
#      #texts.each { |text| q.push(text) }
#      #request.params['q'] = q
#      request.params['source'] = src_lang
#      request.params['target'] = dst_lang
#      request.headers['Content-Type'] = 'application/json'
#      puts request
#    end
#    JSON.parse(response.body)
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


class HttpClient

  # get json
  def get_json(location, request_header, limit = 10)
    raise ArgumentError, 'too many HTTP redirects' if limit == 0
    uri = URI.parse(location)
    begin
      request = Net::HTTP::Get.new(uri)
      request_header.each{|key, value|
        request.add_field(key, value)
      }

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
        http.open_timeout = 5
        http.read_timeout = 10
        http.request(request)
      end

      case response
      when Net::HTTPSuccess
        json = response.body
        JSON.parse(json)
      when Net::HTTPRedirection
        location = response['location']
        warn "redirected to #{location}"
        get_json(location, limit - 1)
      else
        puts [uri.to_s, response.value].join(" : ")
        # handle error
      end
    rescue => e
      puts [uri.to_s, e.class, e].join(" : ")
      # handle error
    end
  end

end
