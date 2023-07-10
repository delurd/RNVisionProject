// still error

import { readFile } from "react-native-fs";
import { Image } from 'react-native';
import { Svg, Rect } from 'react-native-svg';
import { encode } from 'base-64'
import mergeImages from 'react-native-images-combine'

export const drawShapeOnImage = async (imageURI) => {
  try {
    const imageData = await readFile(imageURI, 'base64');
    const svgWidth = 200; // Example width of the shape
    const svgHeight = 200; // Example height of the shape

    const svgXmlData = `
      <svg width="${svgWidth}" height="${svgHeight}">
        <rect
          x="50"
          y="50"
          width="${svgWidth - 100}"
          height="${svgHeight - 100}"
          fill="red"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    `;

    // Create a base64 encoded SVG image
    const svgImage = `data:image/svg+xml;base64,${encode(svgXmlData)}`;

    // Combine the captured image and the SVG image
    const combinedImage = `data:image/jpeg;base64,${imageData}`;
    const mergedImage = await mergeImages([combinedImage, svgImage], {
      format: 'jpeg',
      quality: 1,
    });

    // Do something with the merged image (e.g., display it, save it, etc.)
    console.log('Merged image:');
    console.log({ mergedImage })
  } catch (error) {
    console.error('Failed to draw shape on image:', error);
  }
};
