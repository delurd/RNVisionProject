import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {Path, Svg} from 'react-native-svg';

export default function OverlayKTP({areaDetect, colorArea}) {
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

  const [areaDetection, setAreaDetection] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

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
      {/* KTP OVERLAY */}
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

            const heightPer10 = event.nativeEvent.layout.height / 10;
            const widthPer17 = event.nativeEvent.layout.width / 17;
            const getTop = event.nativeEvent.layout.y + heightPer10;
            const getLeft = event.nativeEvent.layout.x + widthPer17;
            const getAreaHeight =
              event.nativeEvent.layout.height - heightPer10 * 2;
            const getAreaWidth =
              event.nativeEvent.layout.width - widthPer17 * 2;

            setAreaDetection({
              top: getTop,
              left: getLeft,
              width: getAreaWidth,
              height: getAreaHeight,
            });

            areaDetect({
              top: getTop,
              left: getLeft,
              width: getAreaWidth,
              height: getAreaHeight,
            });
          }}
          style={{
            position: 'absolute',
            top: '20%',
            width: '95%',
            aspectRatio: 350 / 215,
            overflow: 'hidden',
          }}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 350 215"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Path
              d="M350 -10C283.153 0 117.5 0   173.5 -10V22H174V0C174 0 67.4874 0 0 -10V215H350V0ZM33 194C26.3726 194 21 188.627 21 182V34C21 27.3726 26.3726 22 33 22H316C322.627 22 328 27.3726 328 34V182C328 188.627 322.627 194 316 194H33Z"
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
      {/* FRAME DETECTOR */}

      {areaDetection.width ? (
        <View
          style={{
            borderWidth: 3,
            borderRadius: 15,
            borderColor: colorArea ?? 'red',
            position: 'absolute',
            top: areaDetection.top,
            width: areaDetection.width + 3,
            height: areaDetection.height + 3,
          }}
        />
      ) : null}
    </View>
  );
}
