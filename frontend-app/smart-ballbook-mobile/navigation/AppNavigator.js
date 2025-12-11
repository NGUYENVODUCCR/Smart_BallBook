import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../app/login";
import HomeScreen from "../app/admin";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Đăng nhập" }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
