import {
  View,
  Text,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useCameraDevices,
  Camera,
  useFrameProcessor,
} from 'react-native-vision-camera';
import OverlaySelfie from '../components/OverlaySelfie';
const { OpenCvModule } = NativeModules;

const CameraSelfieKTP = ({ onClose }) => {
  const [isCameraFront, setIsCameraFront] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loadingExtractPhoto, setLoadingExtractPhoto] = useState(false);
  const [viewShotUri, setViewShotUri] = useState('');

  const devices = useCameraDevices();
  const device = isCameraFront ? devices.front : devices.back;
  const camera = useRef(null);
  const viewShotRef = useRef();

  const [cameraLayoutSize, setCameraLayoutSize] = useState({
    height: 0,
    width: 0,
  });
  const [areaFaceDetection, setAreaFaceDetection] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [areaKtpDetection, setAreaKtpDetection] = useState({
    bottom: 0,
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

  const storePicture = async (path) => {

    const storagePermissionStatus = await PermissionsAndroid.request('android.permission.WRITE_EXTERNAL_STORAGE')
    console.log({ storagePermissionStatus })
    if (!storagePermissionStatus) {
      return
    }
    // Get the DCIM/Camera directory path
    const directoryPath = RNFS.PicturesDirectoryPath + '/RNVision';

    // Check if the directory exists, and create it if not
    const directoryExists = await RNFS.exists(directoryPath);
    if (!directoryExists) {
      await RNFS.mkdir(directoryPath);
    }
    // Generate a unique filename for the snapshot
    const fileName = `${Date.now()}.png`;

    // Construct the full path for saving the snapshot
    const filePath = `${directoryPath}/${fileName}`;

    // Write the snapshot data to the file
    await RNFS.moveFile(path, filePath);

    // Log the saved file path
    console.log('Snapshot saved to:', filePath);
  }

  const takePicture = async () => {
    console.log('captured');
    const snapshot = await camera.current.takeSnapshot({
      quality: 5,
      skipMetadata: true,
    });
    console.log({ snapshot });

    const detected = {
      face: false
    }
    // FACE DETECT
    try {

      const response = await OpenCvModule.callEventFaceDetect(
        snapshot.path,
        cameraLayoutSize,
      );

      console.log('Face');
      // console.log(response.facesArray);
      if (response.facesArray.length) {
        detected.face = true
        console.log('face detected:', response.facesArray)
        setFaceRect(response.facesArray);
      } else {
        setFaceRect([]);
      }
    } catch (error) {
      console.log(error);
    }

    // KTP DETECT
    // try {
    //   const response = await OpenCvModule.callEventKTPDetect(
    //     snapshot.path,
    //     cameraLayoutSize,
    //   );
    //   console.log('KTP ' + response.KTP);
    //   // console.log(response.globalRect);

    //   let dataRect = [response.globalRect];

    //   setDrawKTPRectArr(dataRect);
    //   setIsKTPDetect(response.KTP);
    // } catch (error) {
    //   console.log(error);
    // }

    if (detected.face) {
      getCropedFace()
    }

  };

  //CROP / GRABCUT FACE AREA
  const getCropedFace = async () => {
    // console.log('captured');
    setLoadingExtractPhoto(true);

    const snapshot = await camera.current.takeSnapshot({
      quality: 50,
      skipMetadata: true,
    });
    console.log(snapshot);

    //CROP / GRABCUT FACE AREA
    try {
      const response = await OpenCvModule.callEventCropImage(
        snapshot.path,
        cameraLayoutSize,
        areaFaceDetection,
      );

      console.log(response);
      setViewShotUri(response);
      setIsCameraActive(true)
      setLoadingExtractPhoto(false);
    } catch (error) {
      setLoadingExtractPhoto(false);
    }
  };

  const activeFaceAreaColor = useMemo(() => {
    if (faceRect.length) {
      let color = 'red';
      // console.log('Face Detect');
      faceRect.map(rect => {
        if (
          rect.size.width >= areaFaceDetection.width / 1.5 &&
          rect.position.top >= areaFaceDetection.top &&
          rect.position.top + rect.size.height <=
          areaFaceDetection.top + areaFaceDetection.height &&
          rect.position.left >=
          areaFaceDetection.left - areaFaceDetection.width * (10 / 100) &&
          rect.position.left + rect.size.width <=
          areaFaceDetection.left +
          areaFaceDetection.width +
          areaFaceDetection.width * (10 / 100)
        ) {
          color = 'green';
        }
      });
      return color;
    }
    return 'red';
  }, [faceRect]);

  const activeKTPAreaColor = useMemo(() => {
    let color = 'red';

    if (isKTPDetect) {
      drawKTPRectArr.forEach(rect => {
        // console.log('KTP Detect');
        if (
          rect.position.left >= areaKtpDetection.left &&
          rect.position.left + rect.size.width <=
          areaKtpDetection.left + areaKtpDetection.width &&
          rect.position.top >=
          areaKtpDetection.bottom - areaKtpDetection.height &&
          rect.position.top + rect.size.height <= areaKtpDetection.bottom &&
          rect.size.width >
          areaKtpDetection.width - areaKtpDetection.width / 1.5
        ) {
          color = 'green';
        }
      });
    }

    if (faceRect.length && drawKTPRectArr.length) {
      faceRect.map(faceDetect => {
        if (
          drawKTPRectArr[0].size.width >=
          areaKtpDetection.width - areaKtpDetection.width / 1.3 &&
          faceDetect.position.left >=
          areaKtpDetection.left +
          areaKtpDetection.width -
          areaKtpDetection.width / 2 &&
          // faceDetect.position.left >=
          //   areaKtpDetection.left +
          //     areaKtpDetection.width -
          //     faceDetect.size.width * 3 &&
          faceDetect.position.left + faceDetect.size.width <
          areaKtpDetection.left + areaKtpDetection.width &&
          faceDetect.position.top >=
          areaKtpDetection.bottom - areaKtpDetection.height / 1.3 &&
          faceDetect.position.top + faceDetect.size.height <=
          areaKtpDetection.bottom - areaKtpDetection.height / 3.5
        ) {
          // console.log('ktp detects');
          color = 'green';
        }
      });
    }

    return color;
  }, [isKTPDetect, drawKTPRectArr]);

  // LOOP RUNNING DETECTION
  useEffect(() => {
    // setTimeout(() => {
    //   takePicture();
    // }, 100);
    // takePicture();
  }, [drawKTPRectArr]);

  //RETURN
  if (device == null)
    return (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    );

  if (viewShotUri)
    return (
      <View style={{backgroundColor:'black', height: Dimensions.get('window').height}}>
        <Image
          style={{
            height: cameraLayoutSize.height,
            width: '100%',
            backgroundColor: 'black',
            resizeMode: 'contain',
          }}
          source={{ uri: 'file://' + viewShotUri }}
        />
        <TouchableOpacity
          onPress={() => {
            setViewShotUri('');
            setIsCameraActive(true)
          }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            {'< '}Back
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
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
        // frameProcessor={frameProcessor}
        />
        <OverlaySelfie
          setAreaKTP={setAreaKtpDetection}
          setAreaFace={setAreaFaceDetection}
          colorAreaFace={activeFaceAreaColor}
          colorAreaKTP={activeKTPAreaColor}
        />
      </View>
      <View
        style={{
          backgroundColor: 'black',
          padding: 24,
        }}>
        <Text
          style={{ color: 'white', textAlign: 'center', marginHorizontal: 20 }}>
          Posisikan wajah dan e-KTP kamu berada di bingkai yang tersedia
          kemudian ambil foto.
        </Text>
        <Text
          style={{ color: 'white', textAlign: 'center', marginHorizontal: 20 }}>
          {/* {
            !isKTPDetect && !faceRect.length ? 'Wajah & KTP tidak terdeteksi, ulangi lagi' : ''
          } */}
          {
            isKTPDetect && !faceRect.length ? 'Wajah tidak terdeteksi, ulangi lagi' : ''
          }
          {/* {
            !isKTPDetect && faceRect.length ? 'KTP tidak terdeteksi, ulangi lagi' : ''
          } */}
        </Text>

        <View style={{ alignItems: 'center', padding: 32 }}>
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
            <Text style={{ color: 'white', fontSize: 38 }}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            key={'ROTATE'}
            onPress={() => {
              setIsCameraFront(!isCameraFront);
            }}
            style={{
              zIndex: 10,
              padding: 5,
              overflow: 'hidden',
              position: 'absolute',
              bottom: 12,
              right: '0%',
            }}>
            <Text style={{ color: 'white', fontSize: 60, fontWeight: '500' }}>
              ⟳
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            key={'CAPTURE'}
            onPress={() => {
              !loadingExtractPhoto && takePicture();
            }}
            style={{
              backgroundColor: loadingExtractPhoto
                ? 'rgba(255,255,255,0.3)'
                : 'white',
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
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {loadingExtractPhoto ? (
                <ActivityIndicator size={'large'} color={'#000000'} />
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* KTP RECT (FOR DEBUG)*/}
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

      {/* FACE RECT (FOR DEBUG)*/}
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

export default CameraSelfieKTP;
