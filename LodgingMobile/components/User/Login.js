import React, {useContext, useState} from 'react';
import { View, StyleSheet, Button,  Alert, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import APIs, { endpoints } from '../../configs/APIs';
import { authApi } from '../../configs/APIs';
import { useNavigation } from '@react-navigation/native';

const Login = ({ navigation, route }) => {
    const { onLogin } = route.params;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const setRegister = () => {
      navigation.navigate('Register');
    };

    const setLogin = async () => {
        setLoading(true);
        try {
          let res = await APIs.post(endpoints['login'], {
            username: username,
            password: password,
            client_id: 'z1LnZ3Y8ZFZpNn17prZ2ZOu3JvRQkwG4oGJoIpsf',
            client_secret: 'FcVgDD2EQi5kgo4QzLPraCbh8wStAZVaVeWyhRshSNUHHlteZDK6jV5V1UcNzHcSHuPSy7sGaBS2U76mW597tlfXYOrZnXxdbXElBo46cpxh0MDCTtEGyqoRLqx1VOkV',
            grant_type : 'password'
        }, {
          headers: {
            "content-type" : "application/x-www-form-urlencoded"
          }
        }
      );

            console.info(res.data);

            await AsyncStorage.setItem("token", res.data.access_token);
            let userRes = await authApi(res.data.access_token).get(endpoints['current_user']);
            console.info(userRes.data);
            onLogin();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error logging in:', error.message);
            console.error('Error response:', error.response.data);
            Alert.alert('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin đăng nhập.');
        }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đăng nhập người dùng</Text>
        <TextInput
          label="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : ( <>
        <Button
          title="Đăng nhập"
          onPress={setLogin}
          style={[styles.button, { backgroundColor: '#00796B'}]}
          color="#00796B"
        />
        <Button
          title="Đăng ký"
          onPress={setRegister}
          style={[styles.button, { backgroundColor: '#43A047' }]}
          color="#43A047"
        />
        </>
    )}
      </View>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
    },
    input: {
      width: '100%',
      marginBottom: 10,
    },
    button: {
      width:'40%',
      margin: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
  });


export default Login;