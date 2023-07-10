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

const Vision = props => {
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef(null);
  const viewShotRef = useRef();

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
  }, []);

  const takePicture = async () => {
    console.log('captured');
    const snapshot = await camera.current.takeSnapshot({
      quality: 5,
      skipMetadata: true,
    });

    // FACE DETECT
    try {
      const response = await OpenCvModule.callEventFaceDetect(
        snapshot.path,
        cameraLayoutSize,
      );

      console.log('Face');
      console.log(response.facesArray);
      if (response.facesArray.length) {
        setFaceRect(response.facesArray);
      } else {
        setFaceRect([]);
      }
    } catch (error) {
      console.log(error);
    }

    // KTP DETECT
    try {
      const response = await OpenCvModule.callEventKTPDetect(
        snapshot.path,
        cameraLayoutSize,
      );
      console.log('KTP ' + response.KTP);
      console.log(response.globalRect);

      let dataRect = [response.globalRect];

      setDrawKTPRectArr(dataRect);
      setIsKTPDetect(response.KTP);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(areaDetection);
  }, [areaDetection]);

  const activeColorDetector = useMemo(() => {
    let faceDetect = {};
    if (faceRect.length) {
      faceDetect = faceRect[0];
      console.log(faceRect.length);
    }

    if (isKTPDetect || faceRect.length) {
      if (
        (drawKTPRectArr[0].position.left >= areaDetection.left &&
          drawKTPRectArr[0].position.top >= areaDetection.top &&
          drawKTPRectArr[0].position.left + drawKTPRectArr[0].size.width <=
            areaDetection.left + areaDetection.width &&
          drawKTPRectArr[0].position.top + drawKTPRectArr[0].size.height <=
            areaDetection.top + areaDetection.height &&
          drawKTPRectArr[0].size.width >=
            areaDetection.width - areaDetection.width / 2) ||
        (faceDetect?.position?.left + faceDetect?.size?.width <=
          areaDetection.left + areaDetection.width &&
          faceDetect?.position.left >=
            areaDetection.left +
              areaDetection.width -
              faceDetect?.size?.width * 2)
      ) {
        return 'green';
      }
      return 'red';
    }
    return 'red';
  }, [isKTPDetect]);

  if (device == null) return <Text>Loading...</Text>;
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
          isActive={true}
          photo={true}
          // frameProcessor={frameProcessor}
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
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
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

export default Vision;
