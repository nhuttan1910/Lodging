import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, Button, Touchable,TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints, authApi } from '../../configs/APIs';

const Profile = ({ route }) => {
  const { onLogout } = route.params;
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [posts, setPosts] = useState([]);
  const [lodgings, setLodgings] = useState([]);


  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    onLogout();
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const userRes = await authApi(token).get(endpoints['current_user']);
          const user = userRes.data;
          setUsername(user.username);
          setRole(user.role);
          setAvatar(user.avatar);
          setDob(user.dob);
          setEmail(user.email);
          setPhoneNumber(user.phone_number);
          setFirstName(user.first_name);
          setLastName(user.last_name);

          if (user.role === 'owner') {
            const ownerRes = await APIs.get(`${endpoints['owner']}/${user.id}`);
            setOwnerDetails(ownerRes.data);
            const lodgingRes = await APIs.get(`${endpoints['lodging']}?owner=${user.id}`);
            const ownerLodgings = lodgingRes.data.results;
            setLodgings(ownerLodgings);
          } else {
          const postRes = await APIs.get(`${endpoints['post']}?user=${user.id}`);
          const userPosts = postRes.data.results;
          setPosts(userPosts);
        }
      }
        else {
          Alert.alert('Bạn chưa đăng nhập');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Lỗi khi tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }

return (
  <ScrollView>
  <View style={styles.container}>
    {role === 'user' && (
      <View style={styles.userContainer}>
        <Image
          style={styles.avatarUser}
          source={{ uri: `https://res.cloudinary.com/diwrqtpmf/${avatar}` }}
        />
        <Text style={styles.nameUser}>{first_name} {last_name}</Text>
      </View>
    )}
    {role === 'owner' && (
      <View style={styles.profileHeader}>
        {ownerDetails?.image && (
          <Image
            style={styles.coverImage}
            source={{ uri: `https://res.cloudinary.com/diwrqtpmf/${ownerDetails.image}` }}
          />
        )}
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{ uri: `https://res.cloudinary.com/diwrqtpmf/${avatar}` }}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{first_name} {last_name}</Text>
          </View>
        </View>
        </View>
    )}
    </View>
    <View style={styles.profileInfo}>
      <Text style={styles.title}>Thông tin cá nhân</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Tên người dùng:</Text>
        <Text style={styles.detailText}>{username}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Ngày sinh:</Text>
        <Text style={styles.detailText}>{dob}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Email:</Text>
        <Text style={styles.detailText}>{email}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Số điện thoại:</Text>
        <Text style={styles.detailText}>{phone_number}</Text>
      </View>
      {role === 'owner' && ownerDetails && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID Số:</Text>
          <Text style={styles.detailText}>{ownerDetails.id_num}</Text>
        </View>
      )}
    </View>
    <View style={styles.postsContainer}>
        <Text style={styles.title}>Các bài viết của bạn</Text>
        <View style={styles.postsOrLodgingsContainer}>
        {role === 'user' && (
          <View>
            {posts.map((post) => (
              <View key={post.id} style={styles.postItem}>
                <Text style={styles.postTitle}>{post.content}</Text>
                <Text style={styles.postlocate}>Location: {post.area}</Text>
                <Text style={styles.postContent}>Giá: {post.price} vnđ</Text>
              </View>
            ))}
          </View>
        )}
        {role === 'owner' && (
          <View>
            {lodgings.map((lodging) => (
              <View key={lodging.id} style={styles.lodgingItem}>
                <Text style={styles.lodgingTitle}>{lodging.title}</Text>
                <Text style={styles.lodginglocate}>Location:{lodging.locate}</Text>
                <Text style={styles.lodgingDescription}>Giá: {lodging.price} vnđ</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    <TouchableOpacity style={styles.buttonlogout} onPress={handleLogout}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  </View>
  </ScrollView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
},
loader: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
profileHeader: {
  position: 'relative',
  width: '100%',
  height: 250,
  marginBottom: 20,
  overflow: 'hidden',
},
coverImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0,
},
avatarContainer: {
  position: 'absolute',
  top: 20,
  left: 20,
  flexDirection: 'row',
  alignItems: 'center',
  zIndex: 1,
},
avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: '#fff',
  zIndex: 1,
},
nameContainer: {
  marginLeft: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 5,
  borderRadius: 5,
},
name: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#fff',
},
profileInfo: {
  padding: 20,
},
title: {
  fontSize: 24,
  marginBottom: 20,
  fontWeight: 'bold',
  marginLeft: 10,
},
detailRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},
detailLabel: {
  fontSize: 18,
  marginRight: 10,
  fontWeight: 'bold',
  width: 120,
},
detailText: {
  fontSize: 18,
  color: '#333',
  flex: 1,
},
postItem: {
  marginBottom: 20,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  marginLeft: 20,
  marginRight: 20,
},
postTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 5,
  marginLeft: 20,
},
postContent: {
  fontSize: 16,
  color: '#666',
  marginLeft: 20,
  paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
},
postlocate: {
  ontSize: 16,
  color: '#666',
  marginLeft: 20,
},

lodgingTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 5,
  marginLeft: 20,
},
lodginglocate :{
  fontSize: 16,
  color: '#666',
  marginLeft: 20,
},
lodgingDescription:{
  fontSize: 16,
  color: '#666',
  marginLeft: 20,
  paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
},
buttonlogout: {
  backgroundColor: '#d9534f',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 20,
},
buttonText: {
  fontSize: 20,
  color: '#fff',
},
profileUser: {
  justifyContent: 'center',
  alignItems: 'center',
},
userContainer: {
  alignItems: 'center',
  marginBottom: 20,
},
avatarUser: {
  width: 150,
  height: 150,
  borderRadius: 75,
  marginBottom: 10,
},
nameUser: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
},
});

export default Profile;

