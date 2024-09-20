import React from 'react';
import {Platform, Linking, View, ActivityIndicator} from 'react-native';
import Axios from 'axios';
var RNFS = require('react-native-fs');

class Api {
  constructor() {
    //super(props);

    this.state = {
      isLoading: false,
      url: 'https://gongtal.com',
      path: '/adm/api/',
      option: {
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        body: null,
      },
      dataSource: {},
    };
  }

  //formdata 로 변경
  makeFormData(method = '', datas = {}) {
    let formdata = new FormData();
    formdata.append('method', method);
    // formdata.append('secretKey', '40ed77f38d24ac80b36764f4a423f314');
    for (let [key, value] of Object.entries(datas)) {
      formdata.append(key, value);
    }
    this.state.option.body = formdata;
  }

  // 기본
  send(method, datas, callback) {
    this.makeFormData(method, datas);
    // this.state.isLoading = true;

    return Axios.post(
      this.state.url + this.state.path,
      this.state.option.body,
      this.state.option.headers,
    )
      .then(response => {
        // console.log(response);

        let responseJson = response.data;
        let resultItem = responseJson.result;
        let message = responseJson.msg;
        let arrItems = responseJson.data;

        let returnJson = {
          resultItem: {
            result: resultItem === false ? 'N' : 'Y',
            message: message,
          },
          arrItems: arrItems,
        };
        // this.state.isLoading = false;
        // this.state.dataSource = arrItems;
        //  각 메소드별로 값을 저장해둠.

        if (resultItem === 'false' && message) console.log(method, message);
        if (typeof callback == 'function') {
          callback(returnJson);
        } else {
          return returnJson;
        }
      })
      .catch(function (error) {
        console.log('Axios catch!!! >>', method, error);
      });
  }
  //--------------------------------------------------------------------------------------------------
  loadingView() {
    return (
      <View style={{flex: 1, padding: 20}}>
        <ActivityIndicator />
      </View>
    );
  }

  //--------------------------------------------------------------------------------------------------
  formatDate(date) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDate = date.getDate();

    if (currentMonth < 10) currentMonth = '0' + currentMonth;
    if (currentDate < 10) currentDate = '0' + currentDate;

    return currentYear + '-' + currentMonth + '-' + currentDate;
  }
  formatDateTime(date, format) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDate = date.getDate();

    var currentHours = date.getHours();
    var currentMinutes = date.getMinutes();
    var currentSeconds = date.getSeconds();

    var hours = currentHours;
    var minutes = currentMinutes;

    if (currentMonth < 10) currentMonth = '0' + currentMonth;
    if (currentDate < 10) currentDate = '0' + currentDate;
    if (currentHours < 10) currentHours = '0' + currentHours;
    if (currentMinutes < 10) currentMinutes = '0' + currentMinutes;
    if (currentSeconds < 10) currentSeconds = '0' + currentSeconds;

    if (format === 'YmdHis') {
      return (
        currentYear +
        '' +
        currentMonth +
        '' +
        currentDate +
        '' +
        currentHours +
        '' +
        currentMinutes +
        '' +
        currentSeconds
      );
    } else if (format === 'Ymd') {
      return currentYear + '' + currentMonth + '' + currentDate;
    } else if (format === 'H:i') {
      return currentHours + ':' + currentMinutes;
    } else if (format === 'AMPM') {
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      //hours + ':' + minutes + ' ' + ampm;

      return currentHours + ':' + currentMinutes + ' ' + ampm;
    } else {
      return (
        currentYear +
        '-' +
        currentMonth +
        '-' +
        currentDate +
        ' ' +
        currentHours +
        ':' +
        currentMinutes
      );
    }
  }
  //--------------------------------------------------------------------------------------------------
  diffTime(start, end, format) {
    start = start.split(':');
    end = end.split(':');
    var startDate = new Date(0, 0, 0, start[0], start[1], 0);
    var endDate = new Date(0, 0, 0, end[0], end[1], 0);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);

    // If using time pickers with 24 hours format, add the below line get exact hours
    if (hours < 0) hours = hours + 24;
    // hours = ((hours <= 9 ? "0" : "") + hours);
    if (hours === '00') {
      hours = '0';
    }

    minutes = (minutes <= 9 ? '0' : '') + minutes;
    if (minutes === '00') {
      minutes = '';
    }

    if (format === 'H') {
      return hours ? hours : '';
    } else if (format === 'i') {
      return minutes ? minutes : '';
    } else {
      return (hours ? hours + '시간 ' : '') + (minutes ? minutes + '분' : '');
    }
  }
  //--------------------------------------------------------------------------------------------------
  //콤마찍기
  comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
  }
  //콤마풀기
  uncomma(str) {
    str = String(str);
    return str.replace(/[^\d]+/g, '');
  }
  //--------------------------------------------------------------------------------------------------
  imgResize(imgWidth, imgHeight, maxWidth) {
    let width = 0,
      height = 0;
    if (imgWidth > maxWidth) {
      width = maxWidth;
      height = imgHeight * (maxWidth / imgWidth);
    } else {
      width = imgWidth;
      height = imgHeight;
    }
    width = parseInt(width);
    height = parseInt(height);

    return width + ',' + height;
  }
  //--------------------------------------------------------------------------------------------------
  // imgCrop(items){
  //   let newArray = items;
  //   let newArrayCrop = [];
  //   var maxWidth = 1200;

  //   items.map((item, i) => {
  //     Image.getSize(item, (width, height) => {

  //       let cropData = {
  //         offset: {x: 0, y: 0},
  //         size: {width: width, height: height},
  //         // displaySize: {width: maxWidth, height: maxWidth},
  //         resizeMode: 'cover'
  //       };

  //       if (width > maxWidth) {
  //         cropData.size.width = maxWidth;
  //         cropData.size.height = parseInt((maxWidth*height)/width);

  //         ImageEditor.cropImage(item, cropData).then(url => {
  //           console.log("Cropped image uri", url);
  //           newArray[i] = url;
  //           newArrayCrop.push(url);
  //         });

  //       } else {
  //         cropData.size.width = width;
  //         cropData.size.height = height;
  //       }
  //       console.log(cropData);
  //     });
  //   });

  //   return [newArray, newArrayCrop];
  // }
  //--------------------------------------------------------------------------------------------------
  imgRemove(item) {
    if (item.indexOf('/cache/') !== -1) {
      console.log('imgRemove');
      RNFS.exists(item)
        .then(result => {
          console.log('file exists: ', result);
          if (result) {
            return (
              RNFS.unlink(item)
                .then(() => {
                  console.log('FILE DELETED');
                })
                // `unlink` will throw an error, if the item to unlink does not exist
                .catch(err => {
                  console.log('RNFS', err.message);
                })
            );
          }
        })
        .catch(err => {
          console.log('RNFS', err.message);
        });
    }
  }
  //--------------------------------------------------------------------------------------------------
  dialCall = number => {
    let phoneNumber = '';
    if (Platform.OS === 'ios') phoneNumber = `telprompt:${number}`;
    else phoneNumber = `tel:${number}`;
    Linking.openURL(phoneNumber);
  };
  //—————————————————————————————————————————————————
  arrSearch = (nameKey, myArray) => {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
        return myArray[i];
      }
    }
  };

  multipartRequest = async (body = '', stringify = true, method = 'POST') => {
    try {
      /*
          for (let [key, value] of Object.entries(body)) {
              console.log('key::',key, 'value::',value);
          }
          */
      const response = await fetch(this.state.url + this.state.path, {
        method,
        headers: {
          Accept: '*/*',
          'content-type': 'multipart/form-data',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate',
          'cache-control': 'no-cache',
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          //'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        },
        credentials: 'include',
        body: body,
      });

      //console.log("response::", response);
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log('api body::', body['_parts']);
      console.log('Axios catch!!! >>', method, error);
      /*
        return {
          code: 500,
          message: error,
        };
        */
    }
  };
  //—————————————————————————————————————————————————
}

export default Api = new Api();
