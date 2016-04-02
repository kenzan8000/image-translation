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
  def detect_text(images)
    connection = Faraday.new(:url => "https://vision.googleapis.com/v1/images:annotate") do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger
      faraday.adapter  Faraday.default_adapter
    end

    body = ''
    images.each { |image| body = "#{body}{'image':{'content':'#{image}'},'features':[{'type':'TEXT_DETECTION','maxResults':10}]}," }
    body = "{'requests':[#{body}]}"

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

    img_annotations = []
    json['responses'].each do |res|
      text_annotations = res['textAnnotations']
      next unless text_annotations

      src_lang = nil
      descriptions = nil
      text_annotations.each do |annotation|
        src_lang = annotation['locale'] if annotation['locale']
        descriptions = annotation['description'].split(/\n/) if annotation['description']
        break
      end
      next unless src_lang && descriptions

      annotations = []
      start = 0
      descriptions.each_with_index do |description, i|
        merging_annotations = []

        for j in start..(text_annotations.count-1) do
          text_annotation = text_annotations[j]
          next if text_annotation['locale']
          merging_annotations.push text_annotation

          merged_annotation = merge_annotations(merging_annotations)
          next unless merged_annotation
          next unless merged_annotation[:description] == description

          merged_annotation[:locale] = src_lang
          annotations.push merged_annotation
          start = j + 1
          break
        end
      end

      img_annotations.push annotations if annotations.count > 0
    end

    return nil if img_annotations.count == 0
    img_annotations
  end

  # merge annotations
  def merge_annotations(merging_annotations)
    return nil unless merging_annotations
    return nil if merging_annotations.count == 0

    min_x = 999999; min_y = 999999; max_x = 0; max_y = 0
    merged_annotation = nil
    description = ''

    merging_annotations.each do |merging_annotation|
      boundingPoly = merging_annotation['boundingPoly']
      next unless boundingPoly

      vertices = boundingPoly['vertices']
      next unless vertices

      next unless merging_annotation['description']

      description = "#{description}#{merging_annotation['description']}"
      vertices.each do |vertex|
        min_x = vertex['x'] if vertex['x'] && vertex['x'] < min_x
        min_y = vertex['y'] if vertex['y'] && vertex['y'] < min_y
        max_x = vertex['x'] if vertex['x'] && vertex['x'] > max_x
        max_y = vertex['y'] if vertex['y'] && vertex['y'] > max_y
      end
    end

    merged_annotation = {
      'boundingPoly':{'vertices':[{'x':min_x, 'y':min_y}, {'x':max_x, 'y':max_y}]},
      'description':"#{description}"
    }
    merged_annotation
  end

  # translate
  def translate(img_texts, src_langs, dst_lang)
    client = HttpClient.new

    json = []
    img_texts.each_with_index do |texts, index|
      uri_string = 'https://www.googleapis.com/language/translate/v2?'
      texts.each { |text| uri_string = "#{uri_string}q=#{URI::encode(text)}&" }
      uri_string = "#{uri_string}key=#{@server_key}&source=#{src_langs[index]}&target=#{dst_lang}"

      json.push client.get_json(uri_string, {'Content-Type' => 'application/json'})
    end
    json

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
    return nil if json.count == 0

    img_translated_texts = []

    json.each do |data|
      next unless data['data']
      next unless data['data']['translations']

      translated_texts = []
      data['data']['translations'].each do |translation|
        next unless translation['translatedText']
        translated_texts.push translation['translatedText']
      end

      img_translated_texts.push translated_texts
    end

    img_translated_texts
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
