'use client';

import { useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import axiosInstance from "@/utils/axiosInstance"
import Loading from '../components/loading';
import { getVideoCallToekn, sessionDataItem } from '@/utils/constants';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);

  useEffect(() => {
    const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
    if (!sessionData?.userId) throw new Error('User ID is missing');
    console.log("User ID: ", sessionData.userId);
    if (!API_KEY) throw new Error('Stream API key is missing');
    const tokenProvider = async () => {
      try {
        const response = await axiosInstance.get(getVideoCallToekn);
        // console.log("Current time:", new Date().getTime());
        // console.log("Token response: ", response.data.token);
        return response.data.token;
      }
      catch (err) {
        console.error(err);
      }
    }

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: String(sessionData.userId),
        name: sessionData.userId == 2 ? 'Adil' : 'General_Crix_Madine',
        image: 'https://getstream.io/random_svg/?name=Adil',
      },
      tokenProvider: tokenProvider,
    });
    // console.log("Client from getStreamio: ", client)
    setVideoClient(client);
  }, []);

  if (!videoClient) return <Loading />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;