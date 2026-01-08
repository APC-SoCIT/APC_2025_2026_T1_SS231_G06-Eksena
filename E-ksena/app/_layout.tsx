import { Stack } from 'expo-router';
import { useState } from 'react';

export default function RootLayout() {
  // Simple variable for login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Stack>
      {/* If not logged in, we show the login screen (index.tsx) */}
      <Stack.Screen name="index" options={{ title: 'Login', headerShown: !isLoggedIn }} />
      {/* The main app content lives in the (tabs) folder */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Details' }} />
    </Stack>
  );
}