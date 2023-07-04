import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Path, Svg} from 'react-native-svg';

const OverlaySelfie = ({
  setAreaKTP,
  setAreaFace,
  colorAreaFace,
  colorAreaKTP,
}) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [overlaySize, setOverlaySize] = useState({
    width: 0,
    height: 0,
    top: 0,
    bottom: 0,
  });

  const [faceAreaDetection, setFaceAreaDetection] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [ktpAreaDetection, setKtpAreaDetection] = useState({
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const getAreaSelection = layout => {
    const heightPer16 = layout.height / 16;
    const widthPer12 = layout.width / 12;

    // FACE RATIO 210 / 242 BASED FROM DESIGN
    const getFaceTop = layout.y + heightPer16;
    const getFaceLeft = layout.x + widthPer12;
    const getFaceWidth = layout.width - widthPer12 * 2;
    const getFaceHeight = (242 / 210) * getFaceWidth;

    setFaceAreaDetection({
      top: getFaceTop,
      left: getFaceLeft,
      width: getFaceWidth,
      height: getFaceHeight,
    });
    setAreaFace({
      top: getFaceTop,
      left: getFaceLeft,
      width: getFaceWidth,
      height: getFaceHeight,
    });

    // KTP RATIO 167/91 BASED FROM DESIGN
    const getKTPBottom = layout.y + layout.height - heightPer16;
    const getKTPLeft = layout.x + widthPer12 * 2;
    const getKTPWidth = layout.width - widthPer12 * 4;
    const getKTPHeight = (91 / 167) * getKTPWidth;
    setKtpAreaDetection({
      bottom: getKTPBottom,
      left: getKTPLeft,
      width: getKTPWidth,
      height: getKTPHeight,
    });
    setAreaKTP({
      bottom: getKTPBottom,
      left: getKTPLeft,
      width: getKTPWidth,
      height: getKTPHeight,
    });
  };

  return (
    <View
      onLayout={event => {
        setWindowSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        });
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
      }}>
      {/* OVERLAY */}
      <>
        <View
          onLayout={event => {
            setOverlaySize({
              width: event.nativeEvent.layout.width,
              height: event.nativeEvent.layout.height,
              top: event.nativeEvent.layout.y,
              bottom:
                event.nativeEvent.layout.y + event.nativeEvent.layout.height,
            });

            getAreaSelection(event.nativeEvent.layout);
          }}
          style={{
            position: 'absolute',
            top: '5%',
            width: '70%',
            aspectRatio: 252 / 448,
            overflow: 'hidden',
          }}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 252 448"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Path
              d="M126 270C183.99 270 231 215.826 231 149C231 82.9433 185.067 29.2503 126 28.0218V3.33786e-06L252 1.09673e-05V448H120V420.092H201.833C206.252 420.092 209.833 416.51 209.833 412.092V336.657C209.833 332.239 206.252 328.657 201.833 328.657H51.1667C46.7484 328.657 43.1667 332.239 43.1667 336.657V412.092C43.1667 416.51 46.7484 420.092 51.1667 420.092H121V448H0V1.09673e-05L126 0V28.0218C66.9331 29.2503 21 82.9433 21 149C21 215.826 68.0101 270 126 270Z"
              fill="rgba(0,0,0,0.5)"
            />
          </Svg>
        </View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: (windowSize.width - overlaySize.width) / 2,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: (windowSize.width - overlaySize.width) / 2,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            height: overlaySize.top,
            width: overlaySize.width,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            height: windowSize.height - (overlaySize.height + overlaySize.top),
            width: overlaySize.width,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      </>
      {/* AREA FACE */}
      {faceAreaDetection.width ? (
        <View
          style={{
            borderWidth: 3,
            borderRadius: 1000,
            borderColor: colorAreaFace,
            position: 'absolute',
            top: faceAreaDetection.top,
            width: faceAreaDetection.width,
            aspectRatio: 210 / 242,
          }}
        />
      ) : null}

      {/* AREA KTP */}
      {ktpAreaDetection.width ? (
        <View
          style={{
            borderWidth: 3,
            borderRadius: 13,
            borderColor: colorAreaKTP,
            position: 'absolute',
            bottom: windowSize.height - ktpAreaDetection.bottom - 2,
            width: ktpAreaDetection.width + 5,
            aspectRatio: 167 / 91,
          }}
        />
      ) : null}
    </View>
  );
};

export default OverlaySelfie;
