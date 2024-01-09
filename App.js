import React from 'react';
import Main from './src/screen/Main';

const App = props => {
  const {navigation} = props;

  return <Main navigation={navigation} />;
};

export default App;
