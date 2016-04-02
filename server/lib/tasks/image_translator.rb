#require 'rmagick'
#require 'base64'
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
#    annotations.each do |annotation|
#      bounding_poly = annotation[:boundingPoly]
#      next unless bounding_poly
#      vertices = bounding_poly[:vertices]
#      next unless vertices
#      x = 9999; y = 9999; w = 0; h = 0
#      vertices.each do |vertex|
#        x = vertex[:x] if vertex[:x] && vertex[:x] < x
#        y = vertex[:y] if vertex[:y] && vertex[:y] < y
#        w = vertex[:x] if vertex[:x] && vertex[:x] > w
#        h = vertex[:y] if vertex[:y] && vertex[:y] > h
#      end
#      x = x
#      y = y
#      w = w - x/2
#      h = h - y/2
#
#      translated_text = annotation[:translatedText]
#      next unless translated_text
#
#      draw.annotate(@img, x, y, w, h, translated_text) do
#        self.font         = 'Vera.ttf'
#        self.fill         = 'transparent'
#        self.stroke       = 'red'
#        self.stroke_width = 1
#        self.pointsize    = 15
#        self.gravity      = Magick::CenterGravity
#      end
#
#    end
#
#    @img.write('test.png')
#    Base64.encode64(@img.to_blob)
#  end
#
#end
