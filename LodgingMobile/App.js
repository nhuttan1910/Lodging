import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Home from './components/Home/Home';
import Profile from './components/User/Profile';
import Create from './components/Home/Create';
import Login from './components/User/Login';
import Register from './components/User/Register';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const setLogin = () => {
      setLoggedIn(true);
  };

  const setLogout = () => {
    setLoggedIn(false);
  };

  return (
    <NavigationContainer>
      {loggedIn ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Create') {
                iconName = focused ? 'plus-circle' : 'plus-circle-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'account-circle' : 'account-circle-outline';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'blue',
            inactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen name="Home" component={Home} initialParams={{ onLogin: setLogin }} />
          <Tab.Screen name="Create" component={Create} />
          <Tab.Screen name="Profile" component={Profile} initialParams={{ onLogout: setLogout }} />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ title: 'Login' }}
            initialParams={{ onLogin: setLogin }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ title: 'Register' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    fontSize: 50
  }
});

export default App
