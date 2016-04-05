#require 'rmagick'
#require 'base64'
#require 'json'
#
#
#class ImageTranslator
#
#  # initialize
#  def initialize(base64_img)
#    @img = Magick::ImageList.new
#    @img.from_blob(Base64.decode64(base64_img))
#  end
#
#  # translate
#  def translate(annotations)
#    draw = Magick::Draw.new
#
#    # add text to image
#    annotations.each do |annotation|
#      draw_text(draw, annotation)
#    end
#
#    @img.write('test.png')
#    "#{Base64.encode64(@img.first.to_blob)}"
#  end
#
#  # get_text_rect
#  def get_text_rect(vertices)
#    x = 9999; y = 9999; w = 0; h = 0
#    vertices.each do |vertex|
#      x = vertex['x'] if vertex['x'] && vertex['x'] < x
#      y = vertex['y'] if vertex['y'] && vertex['y'] < y
#      w = vertex['x'] if vertex['x'] && vertex['x'] > w
#      h = vertex['y'] if vertex['y'] && vertex['y'] > h
#    end
#    rect = {:x => x, :y => y, :w => w - x/2, :h => h - y/2}
#  end
#
#  # draw_text
#  def draw_text(draw, annotation)
#    # get text rects
#    bounding_poly = annotation['boundingPoly']
#    return unless bounding_poly
#    vertices = bounding_poly['vertices']
#    return unless vertices
#    rect = get_text_rect vertices
#
#    # draw text on image
#    translated_text = annotation['translatedText']
#    return unless translated_text
#    draw.annotate(@img, rect[:x], rect[:y], rect[:w], rect[:h], translated_text) do
#      self.font         = 'Helvetica'
#      self.fill         = 'white'
#      self.stroke       = 'white'
#      self.undercolor   = '#000a'
#      self.gravity      = Magick::CenterGravity
#    end
#  end
#
#end
#
##base64_img = File.read('test.data')
##annotations = JSON.parse(File.read('test.json'))
##translator = ImageTranslator.new(base64_img)
##translator.translate(annotations)
