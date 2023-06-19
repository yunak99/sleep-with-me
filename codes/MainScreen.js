import React, { useEffect, useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Vibration, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [fiveMinutesLaterCount, setFiveMinutesLaterCount] = useState(0); // '5분 뒤' 버튼을 누른 횟수
  const [fiveMinutesLaterTimes, setFiveMinutesLaterTimes] = useState([]); // '5분 뒤' 버튼을 누른 시간들
  const [confirmTimes, setConfirmTimes] = useState([]);

  let vibrationInterval;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image source={require('../assets/logo2.png')} style={styles.logo} />
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.settingsButton} onPress={goToSettingsScreen}>
          <Ionicons name="md-menu-outline" size={40} color="#E7E7E7" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const goToTodoScreen = () => {
    navigation.navigate('TodoScreen');
  };

  const goToAnalysisScreen = () => {
    navigation.navigate('AnalysisScreen');
  };

  const goToMusicScreen = () => {
    navigation.navigate('MusicScreen');
  };

  const goToSettingsScreen = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleHourSelection = (hour) => {
    setSelectedHour(hour);
  };

  const handleMinuteSelection = (minute) => {
    setSelectedMinute(minute);
  };

  const saveAlarmTime = async (hour, minute) => {
    try {
      const alarmTime = `${hour}:${minute}`;
      await AsyncStorage.setItem('alarmTime', alarmTime);
      setAlarmTime(alarmTime);
      setIsAlarmTriggered(false); // 알람 시간이 변경되었으므로 초기화
      setIsVibrating(false); // 알람 시간이 변경되었으므로 초기화

      // 새로운 알람 시간으로 초기화
      setFiveMinutesLaterCount(0);
      setFiveMinutesLaterTimes([]);
      setConfirmTimes([]);
      console.log('기상 시간:', alarmTime);
    } catch (error) {
      console.error('Failed to save alarm time:', error);
    }
  };

  const handleConfirm = () => {
    const hour = selectedHour || '00';
    const minute = selectedMinute || '00';

    setIsModalVisible(false);
    setSelectedHour(hour);
    setSelectedMinute(minute);

    saveAlarmTime(hour, minute);
  };

  const renderHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hours.push(<Picker.Item key={hour} label={hour} value={hour} />);
    }
    return hours;
  };

  const renderMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      const minute = i.toString().padStart(2, '0');
      minutes.push(<Picker.Item key={minute} label={minute} value={minute} />);
    }
    return minutes;
  };

  const triggerAlarm = () => {
    setIsAlarmTriggered(true);
    setIsVibrating(true);

    vibrationInterval = setInterval(() => {
      Vibration.vibrate();
    }, 10);

    const dismissCallback = () => {
      clearInterval(vibrationInterval);
      Vibration.cancel();
      setIsVibrating(false);
    };

    const handleFiveMinutesLater = () => {
      clearInterval(vibrationInterval);
      Vibration.cancel();
      setIsVibrating(false);

      const fiveMinutesLater = new Date();
      fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
      const fiveMinutesLaterHour = fiveMinutesLater.getHours().toString().padStart(2, '0');
      const fiveMinutesLaterMinute = fiveMinutesLater.getMinutes().toString().padStart(2, '0');
      const fiveMinutesLaterTime = `${fiveMinutesLaterHour}:${fiveMinutesLaterMinute}`;

      if (!isAlarmTriggered && !isVibrating && fiveMinutesLaterTime === alarmTime) {
        triggerAlarm();
      } else {
        setTimeout(() => {
          if (!isAlarmTriggered && !isVibrating) {
            triggerAlarm();
          }
        }, fiveMinutesLater.getTime() - Date.now());
      }
    };

    Alert.alert(
      '기상하세요',
      '',
      [
        { 
          text: '확인', 
          onPress: () => {
            const currentTime = new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: 'numeric',
              minute: 'numeric',
            });
            setConfirmTimes(prevTimes => [...prevTimes, currentTime.toString()]);
            dismissCallback(); 
          },
          },
        {
          text: '5분 뒤',
          onPress: () => {
            setFiveMinutesLaterCount((prevCount) => prevCount + 1); // '5분 뒤' 버튼을 누른 횟수 증가
            const currentTime = new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: 'numeric',
              minute: 'numeric',
            });
            setFiveMinutesLaterTimes((prevTimes) => [...prevTimes, currentTime]); // '5분 뒤' 버튼을 누른 시간 추가
            handleFiveMinutesLater();
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const checkAlarm = () => {
      const currentHour = new Date().getHours().toString().padStart(2, '0');
      const currentMinute = new Date().getMinutes().toString().padStart(2, '0');

      const currentTime = `${currentHour}:${currentMinute}`;

      if (!isAlarmTriggered && !isVibrating && currentTime === alarmTime) {
        triggerAlarm();
      }
    };

    const interval = setInterval(checkAlarm, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [alarmTime, isAlarmTriggered, isVibrating]);

  useEffect(() => {
    const saveConfirmTimes = async () => {
      try {
        await AsyncStorage.setItem('confirmTimes', JSON.stringify(confirmTimes));
        console.log('확인 버튼 누른 시간:', confirmTimes);
      } catch (error) {
        console.error('Failed to save confirm times:', error);
      }
    };

    const saveFiveMinutesLaterCount = async () => {
      try {
        await AsyncStorage.setItem('fiveMinutesLaterCount', fiveMinutesLaterCount.toString());
        console.log('5분 뒤 버튼 횟수:', fiveMinutesLaterCount);
      } catch (error) {
        console.error('Failed to save five minutes later count:', error);
      }
    };

    const saveFiveMinutesLaterTimes = async () => {
      try {
        await AsyncStorage.setItem('fiveMinutesLaterTimes', JSON.stringify(fiveMinutesLaterTimes));
        console.log('5분 뒤 버튼 시간들:', fiveMinutesLaterTimes);
      } catch (error) {
        console.error('Failed to save five minutes later times:', error);
      }
    };
    
    saveConfirmTimes();
    saveFiveMinutesLaterCount();
    saveFiveMinutesLaterTimes();
  }, [confirmTimes, fiveMinutesLaterCount, fiveMinutesLaterTimes]);
  
  useEffect(() => {
  const initializeAsyncStorage = async () => {
    try {
         await AsyncStorage.removeItem('confirmTimes');
         await AsyncStorage.removeItem('fiveMinutesLaterCount');
         await AsyncStorage.removeItem('fiveMinutesLaterTimes');
         console.log('AsyncStorage initialized');
       } catch (error) {
         console.error('Failed to initialize AsyncStorage:', error);
       }
     };

     initializeAsyncStorage();
   }, []);
  
  useEffect(() => {
    const loadAlarmTime = async () => {
      try {
        const storedAlarmTime = await AsyncStorage.getItem('alarmTime');
        if (storedAlarmTime) {
          setAlarmTime(storedAlarmTime);
        }
      } catch (error) {
        console.error('Failed to load alarm time:', error);
      }
    };

    const loadFiveMinutesLaterCount = async () => {
      try {
        const storedFiveMinutesLaterCount = await AsyncStorage.getItem('fiveMinutesLaterCount');
        if (storedFiveMinutesLaterCount) {
          setFiveMinutesLaterCount(parseInt(storedFiveMinutesLaterCount, 10));
        }
      } catch (error) {
        console.error('Failed to load five minutes later count:', error);
      }
    };

    const loadFiveMinutesLaterTimes = async () => {
      try {
        const storedFiveMinutesLaterTimes = await AsyncStorage.getItem('fiveMinutesLaterTimes');
        if (storedFiveMinutesLaterTimes) {
          setFiveMinutesLaterTimes(JSON.parse(storedFiveMinutesLaterTimes));
        }
      } catch (error) {
        console.error('Failed to load five minutes later times:', error);
      }
    };

    loadAlarmTime();
    loadFiveMinutesLaterCount();
    loadFiveMinutesLaterTimes();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonContainer1} onPress={goToTodoScreen}>
        <View style={styles.buttonContent}>
          <Ionicons name="list-outline" size={70} color="#030066" />
          <Text style={styles.buttonText}>TO DO LIST</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.buttonContainer} onPress={goToAnalysisScreen}>
        <View style={styles.buttonContent}>
          <Ionicons name="bar-chart-outline" size={70} color="#030066" />
          <Text style={styles.buttonText}>ANALYSIS</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.buttonContainer} onPress={goToMusicScreen}>
        <View style={styles.buttonContent}>
          <Ionicons name="musical-notes-outline" size={70} color="#030066" />
          <Text style={styles.buttonText}>MUSIC LINK</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.clockContainer} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.setAlarmText}>Set Alarm Time</Text>
        <Ionicons name="alarm" size={180} color="rgba(3, 0, 102, 0.5)" />
        <Text style={styles.alarmTime}>{`${selectedHour} : ${selectedMinute}`}</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedHour}
                onValueChange={handleHourSelection}
                style={styles.picker}
              >
                {renderHours()}
              </Picker>
              <Picker
                selectedValue={selectedMinute}
                onValueChange={handleMinuteSelection}
                style={styles.picker}
              >
                {renderMinutes()}
              </Picker>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#D5D5D5',
    padding: 30,
  },
  buttonContainer1: {
    marginBottom: 0,
    marginTop: -15,
    marginLeft: 5,
  },
  buttonContainer: {
    marginBottom: 0,
    marginTop: 15,
    marginLeft: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000030',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 40,
  },
  logo: {
    width: 25,
    height: 25,
    position: 'absolute',
    top: 15,
    left: 28,
    padding: 10,
  },
  settingsButton: {
    position: 'absolute',
    top: -5,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000042',
    marginTop: 10,
    marginLeft: -30,
    width: '130%',
  },
  clockContainer: {
    position: 'absolute',
    top: height / 2 - 40,
    left: width / 2 - 90,
    alignItems: 'center',
  },
  alarmTime: {
    marginTop: 10,
    fontSize: 50,
    fontWeight: 'bold',
    color: '#030066',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    height: 200,
    width: 100,
  },
  confirmButton: {
    backgroundColor: '#030066',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setAlarmText: {
    fontSize: 25,
    color: '#000030',
    fontWeight: 'bold',
  },
});

export default MainScreen;