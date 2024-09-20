import {Box} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {BASE_URL} from '../Utils/APIConstant';
import {BackHandler, Linking} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Loading from '../components/Loading';

// /webview/plan/study_plan.php?prg_idx=80
const StudyPlan = props => {
  const {navigation, route} = props;
  const {params} = route;

  const isFocued = useIsFocused();

  const [loading, setLoading] = useState(true);

  const webViewRef = useRef();

  const app_domain = BASE_URL;
  const url = params?.data;

  const onWebViewMessage = webViews => {
    let jsonData = JSON.parse(webViews.nativeEvent.data);
    console.log('jsonData.data : ', jsonData);

    if (jsonData.mode == 'history_back') {
      backAction();
    }

    if (jsonData.mode == 'open_url') {
      //navigation.push('Subpage', {data: jsonData.data});
      Linking.openURL(jsonData.data);
    }
  };

  //뒤로가기 버튼
  useEffect(() => {
    // if (isFocued) {
    //   const backHandler = BackHandler.addEventListener(
    //     'hardwareBackPress',
    //     backAction,
    //   );
    //   return () => backHandler.remove();
    // }
  }, [isFocued]);

  const backAction = () => {
    navigation.goBack();
  };

  return (
    <Box flex={1} backgroundColor={'#fff'}>
      <WebView
        ref={webViewRef}
        originWhitelist={['https://*', 'http://*']}
        textZoom={100}
        source={{uri: url}}
        onMessage={webViews => onWebViewMessage(webViews)}
        showsVerticalScrollIndicator={false}
        startInLoadingState={true}
        renderLoading={() => <Loading />}
      />
    </Box>
  );
};

export default StudyPlan;
