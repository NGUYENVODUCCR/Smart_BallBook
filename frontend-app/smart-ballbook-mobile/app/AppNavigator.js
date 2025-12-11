import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import HomeScreen from "../app/admin";
import LoginScreen from "../app/login";

import ForgotPasswordScreen from "../app/ForgotPassword";
import ResetPasswordScreen from "../app/ResetPassword";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // ✅ Đã đăng nhập → vào Home
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Trang chủ" }}
          />
        ) : (
          // ❌ Chưa đăng nhập → login + quên mật khẩu
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Đăng nhập" }}
            />

            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: "Quên mật khẩu" }}
            />

            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ title: "Đặt lại mật khẩu" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
