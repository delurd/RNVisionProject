import {
  View,
  Text,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  useCameraDevices,
  Camera,
  useFrameProcessor,
} from 'react-native-vision-camera';
import OverlayKTP from '../components/OverlayKTP';
const {OpenCvModule} = NativeModules;

const CameraKTP = ({onClose, onNext}) => {
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef(null);
  const viewShotRef = useRef();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [uriSnapshot, setUriSnapshot] = useState();
  const [deviceSize, setDeviceSize] = useState({height: 0, width: 0});
  const [cameraLayoutSize, setCameraLayoutSize] = useState({
    height: 0,
    width: 0,
  });
  const [areaDetection, setAreaDetection] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const [faceRect, setFaceRect] = useState([]);

  const [drawKTPRectArr, setDrawKTPRectArr] = useState([]);
  const [isKTPDetect, setIsKTPDetect] = useState(false);

  const getPermission = useMemo(async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    console.log('camera ' + newCameraPermission);
    if (newCameraPermission == 'denied') await Linking.openSettings();

    setIsCameraActive(true);
  }, []);

  const takePicture = async () => {
    console.log('===== captured =============');
    // const init = device.name
    // console.log(init);
    // setTimeout(async () => {
      const snapshot = await camera.current.takeSnapshot({
        quality: 5,
        skipMetadata: true,
      });
      // console.log(snapshot);
      // console.log(cameraLayoutSize);
      setUriSnapshot(Math.random);

      // FACE DETECT
      try {
        const response = await OpenCvModule.callEventFaceDetect(
          snapshot.path,
          cameraLayoutSize,
        );

        // console.log('Face : ' + response.facesArray.length);
        // console.log(response.facesArray);
        if (response.facesArray.length) {
          setFaceRect(response.facesArray);
        } else {
          setFaceRect([]);
        }
      } catch (error) {
        console.log(error);
      }


      // // KTP DETECT
      try {
        const response = await OpenCvModule.callEventKTPDetect(
          snapshot.path,
          cameraLayoutSize,
        );
        console.log(response.KTP);

        // console.log('KTP ' + response.KTP);
        let dataRect = [response.globalRect];

        setDrawKTPRectArr(dataRect);
        setIsKTPDetect(response.KTP);
      } catch (error) {
        console.log(error);
      }
    // }, 50);
  };

  const activeColorDetector = useMemo(() => {
    let color = 'red';

    if (isKTPDetect && drawKTPRectArr.length) {
      if (
        drawKTPRectArr[0].position.left >= areaDetection.left &&
        drawKTPRectArr[0].position.top >= areaDetection.top &&
        drawKTPRectArr[0].position.left + drawKTPRectArr[0].size.width <=
          areaDetection.left + areaDetection.width &&
        drawKTPRectArr[0].position.top + drawKTPRectArr[0].size.height <=
          areaDetection.top + areaDetection.height &&
        drawKTPRectArr[0].size.width >= areaDetection.width / 1.3
      ) {
        color = 'green';
      }
      // return color;
    }
    if (faceRect.length && drawKTPRectArr.length) {
      faceRect.map(faceDetect => {
        if (
          drawKTPRectArr[0].size.width >= areaDetection.width / 1.3 &&
          faceDetect.position.left >=
            areaDetection.left +
              areaDetection.width -
              areaDetection.width / 2.5 &&
          // faceDetect.position.left >=
          //   areaDetection.left +
          //     areaDetection.width -
          //     faceDetect.size.width * 3 &&
          faceDetect.position.left + faceDetect.size.width <
            areaDetection.left + areaDetection.width - 20 &&
          faceDetect.position.top >=
            areaDetection.top + areaDetection.height / 3.5 &&
          faceDetect.position.top + faceDetect.size.height <=
            areaDetection.top +
              areaDetection.height -
              areaDetection.height / 3.5
        ) {
          // console.log('ktp detect');
          color = 'green';
        }
      });
    }
    return color;
  }, [isKTPDetect, drawKTPRectArr, faceRect]);

  // LOOP RUNNING DETECTION
  // useEffect(() => {
  //   const timeoutID =
  //     isCameraActive &&
  //     cameraLayoutSize.width &&
  //     setTimeout(() => {
  //       takePicture();
  //     },50);
  //   // isCameraActive && isCameraReady && cameraLayoutSize.width && takePicture();
  //   return () => {
  //     // 👇️ clear timeout when the component unmounts
  //     clearTimeout(timeoutID);
  //   };
  // }, [drawKTPRectArr, isCameraActive, cameraLayoutSize, isCameraReady, uriSnapshot]);

  if (device == null)
    return (
      <View style={{flex: 1, backgroundColor: 'black', alignItems: 'center'}}>
        <Text style={{color: 'white'}}>Loading...</Text>
      </View>
    );

  return (
    <View
      style={{backgroundColor: 'white', flex: 1}}
      onLayout={e => {
        setDeviceSize({
          height: e.nativeEvent.layout.height,
          width: e.nativeEvent.layout.width,
        });
      }}>
      <View
        onLayout={e => {
          setCameraLayoutSize({
            height: e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width,
          });
        }}
        style={{
          flex: 1,
          justifyContent: 'space-between',
          position: 'relative',
        }}>
        <Camera
          ref={camera}
          device={device}
          style={[StyleSheet.absoluteFill]}
          isActive={isCameraActive}
          photo={true}
          // quality={50}
          // frameProcessor={frameProcessor}
          onInitialized={() => {
            setTimeout(() => {
              setIsCameraReady(true);
            }, 100);
          }}
        />
        <OverlayKTP
          areaDetect={setAreaDetection}
          colorArea={activeColorDetector}
        />
      </View>
      <View
        style={{
          backgroundColor: 'black',
          padding: 24,
        }}>
        <Text
          style={{color: 'white', textAlign: 'center', marginHorizontal: 20}}>
          Posisikan e-KTP kamu di dalam bingkai dan ambil foto.
        </Text>

        <View style={{alignItems: 'center', padding: 32}}>
          <TouchableOpacity
            onPress={() => {
              setIsCameraActive(false);
              onClose();
            }}
            key={'CLOSE'}
            style={{
              zIndex: 10,
              padding: 5,
              overflow: 'hidden',
              position: 'absolute',
              bottom: 20,
              left: '4%',
            }}>
            <Text style={{color: 'white', fontSize: 38}}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsCameraActive(false);
              onNext();
            }}
            style={{
              zIndex: 10,
              padding: 5,
              overflow: 'hidden',
              position: 'absolute',
              bottom: 12,
              right: '0%',
            }}>
            <Text style={{color: 'white', fontSize: 60, fontWeight: '500'}}>
              ⟳
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            key={'CAPTURE'}
            onPress={takePicture}
            style={{
              backgroundColor: 'white',
              width: 80,
              height: 80,
              borderRadius: 50,
              // position: 'absolute',
              // bottom: 30,
              // left: '50%',
              // transform: [{translateX: -50}],
              zIndex: 10,
              padding: 5,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 4,
                borderRadius: 500,
                borderColor: 'black',
              }}></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* KTP RECT */}
      {isKTPDetect
        ? drawKTPRectArr.map((data, index) => (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: 'red',
                position: 'absolute',
                left: data.position.left,
                top: data.position.top,
                height: data.size.height,
                width: data.size.width,
              }}></View>
          ))
        : null}

      {/* FACE RECT */}
      {faceRect.length
        ? faceRect.map((face, index) => (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: 'red',
                position: 'absolute',
                left: face.position.left,
                top: face.position.top,
                height: face.size.height,
                width: face.size.width,
              }}
            />
          ))
        : null}
    </View>
  );
};

export default CameraKTP;
