import React, { useState } from 'react';
import { View, StyleSheet, Button, ScrollView, Image, Alert } from 'react-native';
import { Text, TextInput, RadioButton } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import APIs, { endpoints } from '../../configs/APIs';

export default function Register({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [date, setDate] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user');
  const [cmt, setCMT] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const setLogin = () => {
    navigation.navigate('Login');
  };

  const setChooseAvatar = () => {
    launchImageLibrary({}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else {
        setAvatar(response.assets[0]);
      }
    });
  };

  const setChooseImage = () => {
    launchImageLibrary({}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else {
        setImage(response.assets[0]);
      }
    });
  };

  const setRegister = async () => {

    const user = {
      username,
      password,
      email,
      firstname,
      lastname,
      date,
      phonenumber,
      role,
      cmt: role === 'owner' ? cmt : undefined,
    };

    const formData = new FormData();
    for (let key in user) {
      if (user[key] !== undefined) {
        formData.append(key, user[key]);
      }
    }

    if (avatar) {
      formData.append('avatar', {
        uri: avatar.uri,
        name: avatar.fileName,
        type: avatar.type,
      });
    }

    if (role === 'owner' && image) {
      formData.append('image', {
        uri: image.uri,
        name: image.fileName,
        type: image.type,
      });
    }

    await submitFormData(formData);
  };

  const submitFormData = async (formData) => {
    setLoading(true);
    try {
      if (role ==='user')
      {
      const res = await APIs.post(endpoints['user'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      }
        else if (role === 'owner')
          {
            const res = await APIs.post(endpoints['owner'], formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

          }

      if (res && res.status === 201) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Lỗi tài khoản:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      Alert.alert('Lỗi tài khoản');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Đăng ký người dùng</Text>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          label="Firstname"
          value={firstname}
          onChangeText={setFirstname}
          style={styles.input}
        />
        <TextInput
          label="Lastname"
          value={lastname}
          onChangeText={setLastname}
          style={styles.input}
        />
        <TextInput
          label="Date"
          value={date}
          onChangeText={setDate}
          style={styles.input}
        />
        <TextInput
          label="Phonenumber"
          value={phonenumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
        />

        <Button title="Choose Avatar" onPress={setChooseAvatar} />
        {avatar && (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        )}

        <RadioButton.Group onValueChange={setRole} value={role}>
          <View style={styles.radioContainer}>
            <RadioButton.Item label="User" value="user" />
            <RadioButton.Item label="Owner" value="owner" />
          </View>
        </RadioButton.Group>
        {role === 'owner' && (
          <>
            <TextInput
              label="CMT"
              value={cmt}
              onChangeText={setCMT}
              style={styles.input}
            />
            <Button title="Choose Image" onPress={setChooseImage} />
            {image && (
              <Image source={{ uri: image.uri }} style={styles.image} />
            )}
          </>
        )}
        <View style={styles.buttonContainer}>
          <Button
            title="Đăng ký"
            onPress={setRegister}
            style={[styles.button, { backgroundColor: '#43A047' }]}
            color="#43A047"
            disabled={loading}
          />
          <Button
            title="Đăng nhập"
            onPress={setLogin}
            style={[styles.button, { backgroundColor: '#00796B' }]}
            color="#00796B"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});

