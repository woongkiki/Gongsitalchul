import {Box} from 'native-base';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import WebView from 'react-native-webview';
import {BASE_URL} from '../Utils/APIConstant';
import {CALL_PERMISSIONS, usePermissions} from '../hooks/usePermissions';

const Intro = props => {
  const {navigation} = props;

  usePermissions(CALL_PERMISSIONS);

  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home');
    }, 2500);
  }, []);

  return (
    <Box flex={1} backgroundColor={'#fff'}>
      <WebView
        originWhitelist={['https://*', 'http://*']}
        textZoom={100}
        source={{uri: BASE_URL + '/webview/intro.php'}}
      />
    </Box>
  );
};

export default Intro;
