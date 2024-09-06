
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';

const Create = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [locate, setLocate] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const userRes = await authApi(token).get(endpoints['current_user']);
          const user = userRes.data;
          setRole(user.role);
        } else {
          Alert.alert('Bạn chưa đăng nhập');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        Alert.alert('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CreatePost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Bạn chưa đăng nhập');
        return;
      }

      const userIdRes = await authApi(token).get(endpoints['current_user']);
      const userId = userIdRes.data.id;

      const formData = new FormData();
      formData.append('area', area);
      formData.append('price', price);
      formData.append('content', content);
      formData.append('user', userId);




      const createPostRes = await authApi(token).post(endpoints['post'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Create Success:', createPostRes.data);
      Alert.alert('Create Success');

      setArea('');
      setPrice('');
      setContent('');
    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      Alert.alert('Error');
    }
  };

  const CreateLodging = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Bạn chưa đăng nhập');
        return;
      }

      const ownerRes = await authApi(token).get(endpoints['current_user']);
      const ownerId = ownerRes.data.id;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('locate', locate);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('image', image);
      formData.append('owner', ownerId);

      const createLodgingRes = await authApi(token).post(endpoints['lodging'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Create Success:', createLodgingRes.data);
      Alert.alert('Create Success');

      setTitle('');
      setLocate('');
      setPrice('');
      setDescription('');
      setImage('');
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      Alert.alert('Error');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === 'user' && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Khu vực"
            value={area}
            onChangeText={setArea}
          />
          <TextInput
            style={styles.input}
            placeholder="Giá"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="Nội dung"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.button} onPress={CreatePost}>
            <Text style={styles.buttonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {role === 'owner' && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tiêu đề"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Địa điểm"
            value={locate}
            onChangeText={setLocate}
          />
          <TextInput
            style={styles.input}
            placeholder="Giá"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="Mô tả"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder="URL ảnh"
            value={image}
            onChangeText={setImage}
          />
          <TouchableOpacity style={styles.button} onPress={CreateLodging}>
            <Text style={styles.buttonText}>Create Lodging</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Create;
