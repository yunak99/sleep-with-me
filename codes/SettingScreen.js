import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const SettingsScreen = ({ navigation }) => {
  const [selectedHour, setSelectedHour] = useState('00');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [expanded, setExpanded] = useState(true);
  const [savedTime, setSavedTime] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false); // 알림 메시지 On/Off 상태
  const [notificationTime, setNotificationTime] = useState(null); // 알림 시간 설정
  const [notificationEnabled2, setNotificationEnabled2] = useState(false); // 알림 메시지 On/Off 상태
  const [alarmTime, setAlarmTime] = useState(null);
  const [sleepTime, setSleepTime] = useState(null);
  const [pushTimes, setPushTimes] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: null,
    });
  }, []);

  useEffect(() => {
    // 저장된 시간 불러오기
    loadSavedTime();
  }, []);

  useEffect(() => {
    getAlarmTime();
  }, []);

  const getAlarmTime = async () => {
    try {
      const value = await AsyncStorage.getItem('alarmTime');
      if (value !== null) {
        setAlarmTime(value);
        console.log(value);
      }
    } catch (error) {
      console.error('Failed to get alarm time:', error);
    }
  };
  
  useEffect(() => {
    AsyncStorage.getItem('notificationEnabled2').then((value) => {
      if (value === 'true') {
        setNotificationEnabled2(true);
      } else {
        setNotificationEnabled2(false);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('notificationEnabled').then((value) => {
      if (value === 'true') {
        setNotificationEnabled(true);
      } else {
        setNotificationEnabled(false);
      }
    });
    
    AsyncStorage.getItem('savedTime').then((value) => {
      if (value) {
        setSavedTime(value);
      }
    });
  
    AsyncStorage.getItem('notificationTime').then((value) => {
      if (value) {
        setNotificationTime(value);
      }
    });
  }, []);

  useEffect(() => {
    if (savedTime && notificationTime) {
      const hour = parseInt(savedTime.split(':')[0]);
      const minute = parseInt(savedTime.split(':')[1]);
      let scheduledHour = hour;
      let scheduledMinute = minute;
  
      if (notificationTime === '10') {
        scheduledMinute -= 10;
        if (scheduledMinute < 0) {
          scheduledHour -= 1;
          scheduledMinute += 60;
        }
      } else if (notificationTime === '30') {
        scheduledMinute -= 30;
        if (scheduledMinute < 0) {
          scheduledHour -= 1;
          scheduledMinute += 60;
        }
      } else if (notificationTime === '60') {
        scheduledHour -= 1;
      }
  
      if (scheduledHour < 0) {
        scheduledHour += 24;
      }
  
      const scheduledTime = `${scheduledHour.toString().padStart(2, '0')}:${scheduledMinute.toString().padStart(2, '0')}`;
      AsyncStorage.setItem('scheduledTime', scheduledTime);
      console.log('알림 예정 시간:', scheduledTime);

      schedulePushNotification(scheduledTime);
    }
  }, [savedTime, notificationTime]);

  useEffect(() => {
    const now = new Date();
    let nextDay = false;
    if (alarmTime && savedTime){
      const savedTimeSplit = savedTime.split(':');
      const alarmTimeSplit = alarmTime.split(':');
    
      const savedHour = parseInt(savedTimeSplit[0], 10);
      const savedMinute = parseInt(savedTimeSplit[1], 10);
      const alarmHour = parseInt(alarmTimeSplit[0], 10);
      const alarmMinute = parseInt(alarmTimeSplit[1], 10);
    
      // savedTime이 alarmTime보다 크거나 같은 경우 다음날로 넘어갑니다.
      if (savedHour > alarmHour || (savedHour === alarmHour && savedMinute >= alarmMinute)) {
        nextDay = true;
      }
    
      const sleepTime = `${savedTime}~${nextDay ? "내일" : "오늘"} ${alarmTime}`;
      setSleepTime(sleepTime);
      AsyncStorage.setItem('sleepTime', sleepTime);
      console.log('수면 시간:', sleepTime);
  }
  }, [savedTime, alarmTime]);

  
  const handleonehButtonPress = () => {
    Alert.alert("취침 시간 1시간 전 알림이 설정되었습니다.");
  };
  
  const handleTimePress = () => {
    const selectedTime = `${selectedHour}:${selectedMinute}`;
    setSavedTime(selectedTime);
    AsyncStorage.setItem('savedTime', selectedTime);
    setExpanded(false);
    console.log('취침 시간 :', selectedTime);
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const schedulePushNotification = async (scheduledTime) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  
    const now = new Date();
    const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(scheduledTime.split(':')[0]), parseInt(scheduledTime.split(':')[1]), 0);
  
    if (scheduledDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '취침 시간 알림',
          body: '잘 시간이 다가왔어요!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250], // 진동 설정
        },
        trigger: {
          date: scheduledDate, // 예약된 시간 설정
          repeats: true, // 매일 반복되는 알림 설정
        },
      });
  
      console.log('푸시 알림이 예약되었습니다.');
    } else {
      console.log('내일 알림이 울립니다. ');
    }
  };
  
  const handleToggleNotification = () => {
    setNotificationEnabled(!notificationEnabled);
    AsyncStorage.setItem('notificationEnabled', !notificationEnabled ? 'true' : 'false');
    console.log("취침 시간 알림 ", !notificationEnabled);
    
    if (notificationEnabled && notificationTime) {
      // 취침 시간 설정 후 푸시 알림 예약
      schedulePushNotification(savedTime);
    }
  };  

  const checkSleepTime = async () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
    const sleepStartTime = sleepTime.split('~')[0];
    const sleepEndTime = sleepTime.split('~')[1].trim().split(' ')[1];

    if (isWithinRange(currentTime, sleepStartTime, sleepEndTime)&& notificationEnabled2) {
      sendSleepNotification();
      // 푸시 알림이 오는 총 횟수와 알림이 온 시간을 콘솔 로그에 출력
      const totalPushCount = parseInt(await AsyncStorage.getItem('totalPushCount')) + 1 || 1;
      const PushTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      console.log(`푸시 알림 횟수: ${totalPushCount}`);
      //console.log(`알림이 온 시간: ${PushTime}`);
      await AsyncStorage.setItem('totalPushCount', totalPushCount.toString());
      setPushTimes((prevPushTimes) => [...prevPushTimes, PushTime]);    
    }
  };
  
  const isWithinRange = (time, startTime, endTime) => {
    // startTime과 endTime이 같은 경우 (수면 시간이 하루를 넘어갈 때)
    if (startTime === endTime) {
      return true;
    }
  
    // startTime이 endTime보다 큰 경우 (예: startTime: 23:00, endTime: 07:00)
    if (startTime > endTime) {
      return time >= startTime || time <= endTime;
    }
  
    // startTime이 endTime보다 작은 경우
    return time >= startTime && time <= endTime;
  };
  
  const sendSleepNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '핸드폰 사용 방해 알림',
        body: '자고 있어야 할 시간이에요',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  };
  
  useEffect(() => {
    // 앱 실행 시 푸시 알림 횟수 초기화
     const initializePushCount = async () => {
       const totalPushCount = parseInt(await AsyncStorage.getItem('totalPushCount'));
       if (totalPushCount) {
         await AsyncStorage.removeItem('totalPushCount');
         console.log('푸시 알림 횟수가 초기화되었습니다.');
       }
     };
  
     initializePushCount();

     setPushTimes([]);
  
    const interval = setInterval(() => {
      checkSleepTime();
    }, 60000);
  
    return () => clearInterval(interval);
  }, [sleepTime, notificationEnabled2]);

  const savePushTimes = async (pushTimes) => {
    try {
      await AsyncStorage.setItem('pushTimes', JSON.stringify(pushTimes));
    } catch (error) {
      console.log('Error saving push times:', error);
    }
  };

  useEffect(() => {
    savePushTimes(pushTimes); // pushTimes가 업데이트될 때마다 AsyncStorage에 저장
    console.log('시간들', pushTimes)
  }, [pushTimes]);
  

  const handleToggleNotification2 = () => {
    setNotificationEnabled2(!notificationEnabled2);
    AsyncStorage.setItem('notificationEnabled2', !notificationEnabled2 ? 'true' : 'false');
    console.log("수면 시간 핸드폰 사용 알림 ", !notificationEnabled2);
    if (sleepTime && notificationEnabled2) {
      checkSleepTime();
    }
  };

  const handleNotificationTime = (time) => {
    setNotificationTime(time);
    AsyncStorage.setItem('notificationTime', time);
    console.log(time, '분 전 알림');
  };

  const saveTime = async (time) => {
    try {
      await AsyncStorage.setItem('savedTime', time);
      setSavedTime(time);
    } catch (error) {
      console.log('Error saving time:', error);
    }
  };

  const loadSavedTime = async () => {
    try {
      const time = await AsyncStorage.getItem('savedTime');
      if (time) {
        setSavedTime(time);
      }
    } catch (error) {
      console.log('Error loading saved time:', error);
    }
  };

  const saveNotificationStatus = async (status) => {
    try {
      await AsyncStorage.setItem('notificationEnabled', JSON.stringify(status));
    } catch (error) {
      console.log('Error saving notification status:', error);
    }
  };

  const saveNotificationTime = async (time) => {
    try {
      await AsyncStorage.setItem('notificationTime', time);
    } catch (error) {
      console.log('Error saving notification time:', error);
    }
  };

  const handletenmButtonPress = () => {
    Alert.alert("취침 시간 10분 전 알림이 설정되었습니다.");
  };

  const handlethirtymButtonPress = () => {
    Alert.alert("취침 시간 30분 전 알림이 설정되었습니다.");
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.settingContainer}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>
      <TouchableOpacity style={styles.timePickerHeader} onPress={handleToggleExpand}>
        <View style={styles.timePickerLabelContainer}>
          <Text style={styles.timePickerLabel}>
            취침 시간
            <Text style={styles.savedTime}> {savedTime || '설정되지 않음'}</Text>
          </Text>
        </View>
        <View style={styles.savedTimeContainer}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={30} color="#000000" />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.timePickerContainer}>
          <View style={styles.timePicker}>
            <Picker
              style={styles.picker}
              selectedValue={selectedHour}
              onValueChange={(itemValue) => setSelectedHour(itemValue)}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <Picker.Item key={hour} label={hour.toString().padStart(2, '0')} value={hour.toString().padStart(2, '0')} />
              ))}
            </Picker>
            <Text style={styles.timeSeparator}>:</Text>
            <Picker
              style={styles.picker}
              selectedValue={selectedMinute}
              onValueChange={(itemValue) => setSelectedMinute(itemValue)}
            >
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <Picker.Item key={minute} label={minute.toString().padStart(2, '0')} value={minute.toString().padStart(2, '0')} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleTimePress}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.notificationToggle} onPress={handleToggleNotification}>
        <View style={styles.notificationToggleTextContainer}>
          <Text style={styles.notificationToggleText}>
            취침 시간 다가왔을 시 알림 {notificationEnabled ? 'On' : 'Off'}
          </Text>
        </View>
        <View style={styles.notificationToggleIcon}>
        {notificationEnabled ? (
              <FontAwesome name="toggle-on" size={30} color="#008080" />
            ) : (
              <FontAwesome name="toggle-off" size={30} color="gray" />
            )}
        </View>
      </TouchableOpacity>

      {notificationEnabled && (
        <View style={[styles.notificationTimeContainer, { flexDirection: 'row' }]}>
        <TouchableOpacity
          style={[styles.notificationTimeButton, notificationTime === '10' && styles.selectedNotificationTimeButton]}
          onPress={() => { handleNotificationTime('10'); handletenmButtonPress();}}
        >
          <Text
            style={[
              styles.notificationTimeButtonText,
              notificationTime === '10' && styles.selectedNotificationTimeButtonText,
            ]}
          >
            10분 전
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationTimeButton, notificationTime === '30' && styles.selectedNotificationTimeButton]}
          onPress={() => { handleNotificationTime('30'); handlethirtymButtonPress();}}
        >
          <Text
            style={[
              styles.notificationTimeButtonText,
              notificationTime === '30' && styles.selectedNotificationTimeButtonText,
            ]}
          >
            30분 전
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.notificationTimeButton, notificationTime === '60' && styles.selectedNotificationTimeButton]}
          onPress={() => { handleNotificationTime('60'); handleonehButtonPress();}}
        >
          <Text
            style={[
              styles.notificationTimeButtonText,
              notificationTime === '60' && styles.selectedNotificationTimeButtonText,
            ]}
          >
            1시간 전
          </Text>
        </TouchableOpacity>
      </View>
      )}

      <TouchableOpacity style={styles.notificationToggle} onPress={handleToggleNotification2}>
        <View style={styles.notificationToggleTextContainer}>
          <Text style={styles.notificationToggleText}>
            수면 시간 내 핸드폰 사용 시 기록 {notificationEnabled2 ? 'On' : 'Off'}
          </Text>
        </View>
        <View style={styles.notificationToggleIcon}>
        {notificationEnabled2 ? (
              <FontAwesome name="toggle-on" size={30} color="#008080" />
            ) : (
              <FontAwesome name="toggle-off" size={30} color="gray" />
            )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={35} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#E7E7E7',
  },
  settingContainer: {
    backgroundColor: '#F2F2F2',
    width: '100%',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timePickerLabelContainer: {
    marginLeft: 20,
    flex: 1,
  },
  savedTimeContainer: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timePickerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    flex: 1,
    height: 200,
  },
  timeSeparator: {
    fontSize: 30,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  saveButton: {
    backgroundColor: 'rgba(3, 0, 102, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  savedTimeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  savedTime: {
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  notificationToggleTextContainer: {
    flex: 1,
  },
  notificationToggleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationToggleIcon: {
    marginLeft: 10,
  },
  notificationTimeContainer: {
    marginTop: 15,
    marginBottom: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  notificationTimeButton: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 10,
  },
  selectedNotificationTimeButton: {
    backgroundColor: 'rgba(3, 0, 102, 0.5)',
  },
  notificationTimeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  selectedNotificationTimeButtonText: {
    color: '#FFFFFF',
  },
});

export default SettingsScreen;