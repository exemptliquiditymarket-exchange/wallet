#!/bin/bash

# Check if the input file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <base-image.png>"
  exit 1
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
  echo "ImageMagick is not installed. Please install it first."
  exit 1
fi

# Base image
BASE_IMAGE="$1"

# Generate the icons
magick "$BASE_IMAGE" -resize 16x16 icons/icon-16.png
magick "$BASE_IMAGE" -resize 48x48 icons/icon-48.png
magick "$BASE_IMAGE" -resize 96x96 icons/icon-96.png
magick "$BASE_IMAGE" -resize 128x128 icons/icon-128.png
magick "$BASE_IMAGE" -resize 256x256 icons/logo.png


echo "Icons generated successfully in the icons/ directory."
