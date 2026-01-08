import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Basic logic: if fields aren't empty, go to the Map (tabs)
    if (username && password) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View>
      <Text>Username:</Text>
      <TextInput 
        style={{borderWidth: 1, marginBottom: 10}} 
        value={username} 
        onChangeText={setUsername} 
      />
      <Text>Password:</Text>
      <TextInput 
        style={{borderWidth: 1, marginBottom: 10}} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}