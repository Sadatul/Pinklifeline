'use client';

import { useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import axios from 'axios';
import Loading from '../components/loading';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User ID is missing');
    console.log("User ID: ", userId);
    if (!API_KEY) throw new Error('Stream API key is missing');
    const tokenProvider = async () => {
      const response = await axios.get(`/api/getToken?userId=${userId}`);
      console.log("Getting token");
      console.log(response.data.token);
      return response.data.token;
    }

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: userId,
        name: userId == 2 ? 'Adil' : 'General_Crix_Madine',
        image: 'https://getstream.io/random_svg/?name=Adil',
      },
      tokenProvider,
    });

    setVideoClient(client);
  }, []);

  if (!videoClient) return <Loading />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;