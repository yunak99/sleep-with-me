import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const StartScreen = ({ navigation }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    // 깜빡임 동작 설정
    const interval = setInterval(() => {
      setBlink((prevState) => !prevState);
    }, 400); // 깜빡임 간격 (ms)

    // 컴포넌트 언마운트 시 깜빡임 동작 정리
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleStart = () => {
    navigation.navigate('MainScreen');
    console.log("Main Screen으로 이동")
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleStart}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={[styles.instruction, blink && styles.blinkText]}>Tap anywhere to continue</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D5D5D5',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  instruction: {
    color: '#000030',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  blinkText: {
    opacity: 0.1,
  },
});

export default StartScreen;