import {Box} from 'native-base';
import React from 'react';
import {ActivityIndicator} from 'react-native';

const Loading = props => {
  const {navigation} = props;

  return (
    <Box flex={1} backgroundColor={'#fff'}>
      <ActivityIndicator size={'large'} color={'#333'} />
    </Box>
  );
};

export default Loading;
