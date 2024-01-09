import {Box, HStack, Modal} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {BASE_URL} from '../Utils/APIConstant';
import {
  BackHandler,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const screenWidth = Dimensions.get('window').width;
const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.1);

let pwChgPop = false;

const Home = props => {
  const {navigation} = props;

  if (Platform.OS == 'ios') {
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
  }

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', enabled, authStatus);
    }
  }

  const getToken = async () => {
    const token = await messaging().getToken();
    setTokenValue(token);
  };

  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);

  const webViewRef = useRef();

  const app_domain = BASE_URL;
  const url = BASE_URL + '/webview/index.php?chk_app=Y&app_token=';
  //const url = BASE_URL + '/webview/register/login.php?chk_app=Y&app_token=';

  let canGoBack = false;
  let timeOut;

  const [urls, set_urls] = useState('ss');

  const [recordModal, setRecordModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioPath, setAudioPath] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordDuration, setRecordDuration] = useState({
    recordSecs: 0,
    recordTime: '00:00:00',
  });
  const [playerDuration, setPlayerDuration] = useState({
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: '00:00:00',
    duration: '00:00:00',
  });

  let playWidth =
    (playerDuration.currentPositionSec / playerDuration.currentDurationSec) *
    (screenWidth - 40);

  if (!playWidth) {
    playWidth = 0;
  }

  const [tokenValue, setTokenValue] = useState('');

  const onNavigationStateChange = webViewState => {
    set_urls(webViewState.url);

    console.log('webViewState.url:::', webViewState.url);
    pwChgPop = false;

    //웹에 chk_app 세션 유지 위해 포스트메시지 작성
    const chkAppData = JSON.stringify({
      type: 'chk_app_token',
      isapp: 'Y',
      istoken: tokenValue == '' ? '' : tokenValue,
    });
    webViewRef.current.postMessage(chkAppData);
  };

  //뒤로가기 버튼
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();

    //console.log(urls);
  }, [urls]);

  //뒤로가기 핸들러
  const backAction = () => {
    const app_split = urls.split('?')[0];
    //console.log("@@@@back urls : ", app_split);
    //console.log("@@@@back urls2 : ", urls);
    if (pwChgPop) {
      const popOffData = JSON.stringify({type: 'popOff', popId: 'pw_chg_pop'});
      webViewRef.current.postMessage(popOffData);
    } else {
      if (
        app_split == app_domain + '/webview/' ||
        app_split == app_domain ||
        urls == app_domain ||
        urls == app_domain + '/webview/' ||
        urls == app_domain + '/webview/index.php' ||
        urls.indexOf('feedback_list.php') != -1 ||
        urls.indexOf('homework_list.php') != -1 ||
        urls.indexOf('study_progress.php') != -1 ||
        urls.indexOf('study_test.php') != -1 ||
        urls.indexOf('video_room.php') != -1 ||
        urls.indexOf('my_info.php') != -1 ||
        urls.indexOf('login.php') != -1
      ) {
        if (!canGoBack) {
          ToastAndroid.show('한번 더 누르면 종료합니다.', ToastAndroid.SHORT);
          canGoBack = true;
          timeOut = setTimeout(function () {
            canGoBack = false;
          }, 2000);
        } else {
          clearTimeout(timeOut);
          BackHandler.exitApp();
          canGoBack = false;
          //const sendData =JSON.stringify({ type:"종료" });
        }
      } else {
        webViewRef.current.goBack();
      }
    }
    return true;
  };

  //녹음 모달 열기
  const recordModalOpenHandler = () => {
    setRecordModal(true);
  };

  //녹음 모달 닫기
  const recordModalCloseHandler = () => {
    setIsPlaying(false);
    setAudioPath('');
    setRecordDuration({
      recordSecs: 0,
      recordTime: '00:00:00',
    });
    setRecordModal(false);
  };

  // 녹음 시작
  const handleStartRecord = async () => {
    if (audioRecorderPlayer) {
      setRecording(true);
      playWidth = 0;
      setIsPlaying(false);
      setPlayerDuration({
        ...playerDuration,
        currentPositionSec: 0,
        currentDurationSec: 0,
        playTime: '00:00:00',
        duration: '00:00:00',
      });
      await audioRecorderPlayer.startRecorder();
    }
    audioRecorderPlayer.addRecordBackListener(e => {
      // console.log(
      //   'e',
      //   audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      // );
      setRecordDuration({
        ...recordDuration,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
    });
  };

  // 녹음 중지
  const handleStopRecord = async () => {
    if (audioRecorderPlayer) {
      setRecording(false);
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('result', result);
      setAudioPath(result);
    }
    audioRecorderPlayer.removeRecordBackListener();
    setRecordDuration({...recordDuration, recordSecs: 0});
  };

  // 음성 재생
  const soundStart = async () => {
    setIsPlaying(true);
    await audioRecorderPlayer.startPlayer();
    audioRecorderPlayer.addPlayBackListener(e => {
      setPlayerDuration({
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
      });
    });
  };

  // 음성 중지
  const onPausePlay = async () => {
    setIsPlaying(false);
    await audioRecorderPlayer.pausePlayer();
  };

  // useEffect(() => {
  //   console.log(playerDuration);
  // }, [playerDuration]);

  const onWebViewMessage = webViews => {
    let jsonData = JSON.parse(webViews.nativeEvent.data);
    console.log('jsonData.data : ', jsonData);

    if (jsonData.mode == 'voiceRecord') {
      recordModalOpenHandler();
    }
  };

  return (
    <Box flex={1} backgroundColor={'#fff'}>
      <WebView
        ref={webViewRef}
        originWhitelist={['https://*', 'http://*']}
        textZoom={100}
        source={{uri: url}}
        onMessage={webViews => onWebViewMessage(webViews)}
        onNavigationStateChange={webViews => onNavigationStateChange(webViews)}
        showsVerticalScrollIndicator={false}
      />
      {/* 음성녹음 */}
      <Modal isOpen={recordModal} onClose={recordModalCloseHandler}>
        <Modal.Content
          position={'absolute'}
          bottom={0}
          width={screenWidth}
          maxWidth={screenWidth}
          borderRadius={0}
          borderTopRadius={10}
          p={0}>
          <Modal.Body px="20px" py="20px" backgroundColor={'#fff'}>
            <Text style={[styles.modalTitle]}>음성메모</Text>
            <Box>
              <HStack
                style={[
                  styles.audioProgressBar,
                  {
                    width: screenWidth - 40,
                    backgroundColor: '#DDDDDD',
                    justifyContent: 'space-between',
                  },
                ]}>
                <Box
                  style={{
                    height: 52,
                    backgroundColor: '#2BAE66',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    borderRadius: 8,
                    width: playWidth,
                  }}
                />
                {audioPath != '' && (
                  <Box position={'absolute'} left={0} top={0}>
                    <TouchableOpacity
                      onPress={!isPlaying ? soundStart : onPausePlay}
                      style={[styles.audioPlayButtons]}>
                      <Image
                        source={{
                          uri: !isPlaying
                            ? BASE_URL + '/m_images/play_icons.png'
                            : BASE_URL + '/m_images/pause_icon.png',
                        }}
                        style={{width: 13, height: 16, resizeMode: 'contain'}}
                      />
                    </TouchableOpacity>
                  </Box>
                )}

                <Box style={[styles.audioPlayTime]}>
                  <Text style={[styles.audioPlayTimeText]}>
                    {recordDuration.recordTime}
                  </Text>
                </Box>
              </HStack>
            </Box>
            <HStack
              alignItems={'center'}
              justifyContent={'space-between'}
              mt="30px"
              mb="10px">
              <TouchableOpacity onPress={recordModalCloseHandler}>
                <Text style={[styles.audioModalBottomText]}>취소</Text>
              </TouchableOpacity>
              <Box
                position={'absolute'}
                left={'50%'}
                marginLeft={-17}
                marginTop={-17}>
                {!recording ? (
                  <TouchableOpacity onPress={handleStartRecord}>
                    <Box style={[styles.playButtonBox]}>
                      <Box style={[styles.playButton]} />
                    </Box>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleStopRecord}>
                    <Box style={[styles.playButtonBox]}>
                      <Box style={[styles.pauseButton]} />
                    </Box>
                  </TouchableOpacity>
                )}
              </Box>
              {audioPath != '' && (
                <TouchableOpacity onPress={recordModalCloseHandler}>
                  <Text style={[styles.audioModalBottomText, {color: '#333'}]}>
                    업로드
                  </Text>
                </TouchableOpacity>
              )}
            </HStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  audioProgress: {
    width: '20%',
    height: 52,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#17B75E',
    borderRadius: 8,
  },
  audioProgressBar: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#DDDDDD',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  audioPlayButtons: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayTime: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },
  audioPlayTimeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  audioModalBottomText: {
    fontSize: 15,
    fontWeight: '500',
  },
  playButtonBox: {
    width: 34,
    height: 34,
    borderRadius: 34,
    backgroundColor: '#EFEFEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#FF5C5C',
  },
  pauseButton: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: '#000',
  },
});

export default Home;
