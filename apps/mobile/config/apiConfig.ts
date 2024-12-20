import * as Device from "expo-device";

// Ensure mobile app and expo go server are on the same network
const yourIpAddress = process.env.EXPO_PUBLIC_YOUR_IP_ADDRESS;

const getApiUrl = () => {
  if (__DEV__) {
    return Device.isDevice
      ? `http://${yourIpAddress}:3000`
      : `http://localhost:3000`;
  } else {
    // TODO: change to actual production API URL
    return "https://pandapay-api.com";
  }
};

export const API_URL = getApiUrl();
