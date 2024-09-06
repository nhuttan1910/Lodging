import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Searchbar } from 'react-native-paper';
import APIs, { endpoints } from '../../configs/APIs';
import { authApi } from '../../configs/APIs';
import { Alert } from 'react-native';

const Home = () => {
  const [lodging, setLodging] = useState(null);
  const [owners, setOwners] = useState({});
  const [users, setUsers] = useState({});
  const [role, setRole] = useState('');
  const [post, setPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const userRes = await authApi(token).get(endpoints['current_user']);
          const user = userRes.data;
          setRole(user.role);
        }
        const lodgingRes = await APIs.get(endpoints['lodging']);
        const lodgings = lodgingRes.data.results;
        setLodging(lodgings);
        const ownerRequests = lodgings.map(async (l) => {
          const ownerRes = await APIs.get(`${endpoints['owner']}/${l.owner}`);
          return { [l.owner]: ownerRes.data };
        });
        const ownersData = await Promise.all(ownerRequests);
        const ownersMap = ownersData.reduce((acc, owner) => {
          const ownerId = Object.keys(owner)[0];
          acc[ownerId] = owner[ownerId];
          return acc;
        }, {});
        setOwners(ownersMap);

        if (role === 'owner') {
          const postRes = await APIs.get(endpoints['post']);
          const posts = postRes.data.results;
          setPost(posts);

          const userRequests = posts.map(async (p) => {
            const userRes = await APIs.get(`${endpoints['user']}/${p.user}`);
            return { [p.user]: userRes.data };
          });
          const usersData = await Promise.all(userRequests);
          const usersMap = usersData.reduce((acc, user) => {
            const userId = Object.keys(user)[0];
            acc[userId] = user[userId];
            return acc;
          }, {});
          setUsers(usersMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : role === 'owner' && post !== null ? (
          post.map((p, index) => {
            const user =  u= users[p.user];
            return (
              <View key={index} style={styles.loadPost}>
              <View style={styles.header}>
                {user && (
                  <>
                    <Image
                      style={styles.avatar}
                      source={{ uri: `https://res.cloudinary.com/diwrqtpmf/${user.avatar}` }}
                    />
                    <Text style={styles.username}>{user.username}</Text>
                  </>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{p.content}</Text>
                <Text style={styles.text}>Location: {p.area}</Text>
                <Text style={styles.text}>Giá :{p.price}</Text>
              </View>
            </View>
            );
          })
        ) : role === 'user' && lodging !== null ? (
          lodging.map((l, index) => {
            const owner = owners[l.owner];
            return (
              <View key={index} style={styles.card}>
                <View style={styles.header}>
                  {owner && (
                    <>
                      <Image
                        style={styles.avatar}
                        source={{ uri: `https://res.cloudinary.com/diwrqtpmf/${owner.avatar}` }}
                      />
                      <Text style={styles.username}>{owner.username}</Text>
                    </>
                  )}
                </View>
                <Image
                  style={styles.image}
                  source={{ uri: `https://res.cloudinary.com/diwrqtpmf/${l.image}` }}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.title}>{l.title}</Text>
                  <Text style={styles.text}>Location: {l.locate}</Text>
                  <Text style={styles.text}>Giá: {l.price}</Text>
                </View>

              </View>
            );
          })
        ) : (
          <Text>No data available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  loadPost: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Home;
