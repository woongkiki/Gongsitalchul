import {BackHandler, ToastAndroid} from 'react-native';
import {BASE_URL} from './APIConstant';

const app_domain = BASE_URL;

//뒤로가기 핸들러
export const backAction = (
  isHome,
  webViewRef,
  navigation,
  urls = '',
  canGoBack = false,
  checkTime = null,
) => {
  let timeOut;
  if (isHome) {
    const app_split = urls.split('?')[0];
    //console.log("@@@@back urls : ", app_split);
    //console.log("@@@@back urls2 : ", urls);

    console.log('app_domain', app_domain);
    console.log('urls', urls);
    if (
      app_split == app_domain + 'webview/' ||
      app_split == app_domain ||
      urls == app_domain ||
      urls == app_domain + 'webview/' ||
      urls == app_domain + 'webview/index.php' ||
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
        checkTime(canGoBack);
      } else {
        checkTime(canGoBack);
        BackHandler.exitApp();
        canGoBack = false;
        //const sendData =JSON.stringify({ type:"종료" });
      }
    } else {
      webViewRef.current.goBack();
    }

    //return true;
  } else {
    // navigation.goBack();
  }
};
