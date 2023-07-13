import {View, Text, TouchableOpacity} from 'react-native';
import React, {useMemo, useState} from 'react';
import CameraKTP from './CameraKTP';
import CameraSelfieKTP from './CameraSelfieKTP';

const Verification = () => {
  const [page, setPage] = useState(1);

  const activePage = useMemo(() => {
    switch (page) {
      case 1:
        return (
          <>
            <TouchableOpacity
              onPress={() => {
                setPage(2);
              }}
              style={{
                padding: 15,
                margin: 10,
                backgroundColor: 'coral',
                borderRadius: 50,
                alignItems: 'center',
              }}>
              <Text style={{fontWeight: 'bold', color: 'white'}}>
                START VERIFICATION
              </Text>
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <CameraKTP
            onClose={() => {
              setPage(page - 1);
            }}
            onNext={() => {
              setPage(page + 1);
            }}
          />
        );

      case 3:
        return (
          <CameraSelfieKTP
            onClose={() => {
              setPage(1);
            }}
          />
        );
      default:
        return <></>;
    }
  }, [page]);

  return <View style={{flex: 1, backgroundColor: 'white'}}>{activePage}</View>;
};

export default Verification;
