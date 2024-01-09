import React, {useEffect, useState} from 'react';
import {extendTheme, NativeBaseProvider, Box, Text, Image} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {
  SafeAreaView,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';

import Intro from './Intro';
import Home from './Home';

const Stack = createStackNavigator();

const Main = props => {
  const toastConfig = {
    custom_type: internalState => (
      <View
        style={{
          backgroundColor: '#000000e0',
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 20,
          opacity: 0.8,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 15,
            lineHeight: 22,
            letterSpacing: -0.38,
          }}>
          {internalState.text1}
        </Text>
      </View>
    ),
  };

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <SafeAreaView style={{flex: 1}}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="Intro" component={Intro} />
            <Stack.Screen name="Home" component={Home} />
          </Stack.Navigator>
        </SafeAreaView>
        <Toast config={toastConfig} ref={ref => Toast.setRef(ref)} />
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default Main;
