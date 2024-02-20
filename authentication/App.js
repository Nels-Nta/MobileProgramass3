import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Button, Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [auth, setAuth] = useState(null);
  const [requireRefresh, setRequireRefresh] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    expoClientId: "YOUR_EXPO_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === "success") {
      setAuth(response.authentication);

      AsyncStorage.setItem("auth", JSON.stringify(response.authentication));

      getUserData(response.authentication.accessToken);
    }
  }, [response]);

  useEffect(() => {
    const getPersistedAuth = async () => {
      const jsonValue = await AsyncStorage.getItem("auth");
      if (jsonValue) {
        const authFromJson = JSON.parse(jsonValue);
        setAuth(authFromJson);

        const isTokenFresh = AuthSession.TokenResponse.isTokenFresh({
          expiresIn: authFromJson.expiresIn,
          issuedAt: authFromJson.issuedAt,
        });

        setRequireRefresh(!isTokenFresh);

        if (isTokenFresh) {
          getUserData(authFromJson.accessToken);
        }
      }
    };

    getPersistedAuth();
  }, []);

  const getUserData = async (accessToken) => {
    try {
      const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (userInfoResponse.ok) {
        const data = await userInfoResponse.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const showUserData = () => {
    if (userInfo) {
      return (
        <View style={styles.userInfo}>
          <Image source={{ uri: userInfo.picture }} style={styles.profilePic} />
          <Text>Welcome {userInfo.name}</Text>
          <Text>{userInfo.email}</Text>
        </View>
      );
    }
  };

  const refreshToken = async () => {
    const tokenResult = await AuthSession.refreshAsync({
      clientId: Platform.select({
        ios: "YOUR_IOS_CLIENT_ID",
        android: "YOUR_ANDROID_CLIENT_ID",
      }),
      refreshToken: auth.refreshToken,
    });

    tokenResult.refreshToken = auth.refreshToken;

    setAuth(tokenResult);
    await AsyncStorage.setItem("auth", JSON.stringify(tokenResult));
    setRequireRefresh(false);
  };

  const logout = async () => {
    await AuthSession.revokeAsync(
      {
        token: auth.accessToken,
      },
      {
        revocationEndpoint: "https://oauth2.googleapis.com/revoke",
      }
    );

    setAuth(null);
    setUserInfo(null);
    await AsyncStorage.removeItem("auth");
  };

  if (requireRefresh) {
    return (
      <View style={styles.container}>
        <Text>Token requires refresh...</Text>
        <Button title="Refresh Token" onPress={refreshToken} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showUserData()}
      <Button
        title={auth ? "Get User Data" : "Login"}
        onPress={
          auth
            ? () => getUserData(auth.accessToken)
            : () => promptAsync({ useProxy: true, showInRecents: true })
        }
      />
      {auth && <Button title="Logout" onPress={logout} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 50,
    height: 50,
  },
  userInfo: {
    alignItems: "center",
    justifyContent: "center",
  },
});
