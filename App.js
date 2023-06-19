import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartScreen from './codes/StartScreen';
import MainScreen from './codes/MainScreen';
import TodoScreen from './codes/TodoScreen';
import AnalysisScreen from './codes/AnalysisScreen';
import DailyScreen from './codes/DailyScreen';
import MusicScreen from './codes/MusicScreen';
import SettingsScreen from './codes/SettingScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="StartScreen"
          component={StartScreen}
          options={{
            headerTitle: '',
            headerStyle: { backgroundColor: '#000030', height: 100 },
          }}
        />
        <Stack.Screen
          name="MainScreen"
          component={MainScreen}
          options={{
            headerTitle: '',
            headerStyle: { backgroundColor: '#000030', height: 100 },
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="TodoScreen"
          component={TodoScreen}
          options={{
            headerTitle: 'TO DO LIST',
            headerTitleStyle: { color: '#E7E7E7', fontSize:20 },
            headerStyle: { backgroundColor: '#000030', height: 100 },
          }}
        />
        <Stack.Screen
          name="AnalysisScreen"
          component={AnalysisScreen}
          options={{
            headerTitle: 'ANAYSIS',
            headerTitleStyle: { color: '#E7E7E7', fontSize:20  },
            headerStyle: { backgroundColor: '#000030', height: 100 },
          }}
        />
        <Stack.Screen
          name="DailyScreen"
          component={DailyScreen}
          options={{
            headerTitle: 'TODAY',
            headerTitleStyle: { color: '#E7E7E7', fontSize:20  },
            headerStyle: { backgroundColor: '#000030', height: 100 },
          }}
        />
        <Stack.Screen
          name="MusicScreen"
          component={MusicScreen}
          options={{
            headerTitle: 'MUSIC LINK',
            headerTitleStyle: { color: '#E7E7E7', fontSize:20  },
            headerStyle: { backgroundColor: '#000030', height: 100 },
          }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{
            headerTitle: '',
            headerStyle: { backgroundColor: '#000030', height: 100 },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;