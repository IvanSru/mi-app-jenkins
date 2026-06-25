import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change to your machine's LAN IP when testing on a physical device
const BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator → host loopback

const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('blade_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('blade_token');
    }
    return Promise.reject(err);
  }
);

export default client;
