import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DailyScreen = ({ navigation }) => {
  const [alarmTime, setAlarmTime] = useState('');
  const [savedTime, setSavedTime] = useState('');
  const [totalSleepTime, setTotalSleepTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [totalPushCount, setTotalPushCount] = useState(0);
  const [pushTimes, setPushTimes] = useState([]);
  const [fiveMinutesLaterCount, setFiveMinutesLaterCount] = useState(0);
  const [confirmTimes, setConfirmTimes] = useState('');
  const [diffHours, setDiffHours] = useState(0);
  const [diffMinutes, setDiffMinutes] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: null,
    });
  }, []);

  useEffect(() => {
    setCurrentDate(getFormattedDate());
  }, []);

  const getFormattedDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const day = ('0' + currentDate.getDate()).slice(-2);
    const currentDate2 = new Date();
    currentDate2.setDate(currentDate.getDate() - 1);
    const year2 = currentDate2.getFullYear();
    const month2 = ('0' + (currentDate2.getMonth() + 1)).slice(-2);
    const day2 = ('0' + currentDate2.getDate()).slice(-2);
    return `${year2}. ${month2}. ${day2} ~ ${day}`;
  };

  useEffect(() => {
    getAlarmTime();
  }, []);

  useEffect(() => {
    calculateTotalSleepTime(savedTime, alarmTime);
    displayTotalPushCount();
  }, [savedTime, alarmTime]);

  const getAlarmTime = async () => {
    try {
      const value = await AsyncStorage.getItem('alarmTime');
      if (value !== null) {
        setAlarmTime(value);
      }
    } catch (error) {
      console.error('Failed to get alarm time:', error);
    }
  };

  useEffect(() => {
    getSavedTime();
  }, []);

  const getSavedTime = async () => {
    try {
      const value = await AsyncStorage.getItem('savedTime');
      if (value !== null) {
        setSavedTime(value);
      }
    } catch (error) {
      console.error('Failed to get sleep time:', error);
    }
  };

  const calculateTotalSleepTime = (alarmTime, sleepTime) => {
    if (alarmTime && sleepTime) {
      const alarmTimeParts = alarmTime.split(':');
      const sleepTimeParts = sleepTime.split(':');
      const alarmHours = parseInt(alarmTimeParts[0]);
      const alarmMinutes = parseInt(alarmTimeParts[1]);
      const sleepHours = parseInt(sleepTimeParts[0]);
      const sleepMinutes = parseInt(sleepTimeParts[1]);

      const start = new Date();
      start.setHours(alarmHours);
      start.setMinutes(alarmMinutes);

      const end = new Date();
      end.setHours(sleepHours);
      end.setMinutes(sleepMinutes);

      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      const diffInMinutes = Math.floor((end - start) / (1000 * 60));
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = ('0' + (diffInMinutes % 60)).slice(-2);

      setTotalSleepTime(`${hours} H ${minutes} M`);

      const formattedTime = `${hours}:${minutes}`;
      try {
        AsyncStorage.setItem('totalSleepTime', formattedTime);
        console.log(alarmTime);
        console.log(sleepTime);
        console.log('Total sleep time:', formattedTime);
      } catch (error) {
        console.error('Failed to save total sleep time:', error);
      }
    }
  };

  const displayTotalPushCount = async () => {
    try {
      const value = await AsyncStorage.getItem('totalPushCount');
      if (value !== null) {
        setTotalPushCount(parseInt(value));
      }
    } catch (error) {
      console.error('Failed to get total push count:', error);
    }
  };

  useEffect(() => {
    getPushTimes();
  }, []);

  const getPushTimes = async () => {
    try {
      const value = await AsyncStorage.getItem('pushTimes');
      if (value !== null) {
        const times = JSON.parse(value);
        setPushTimes(times);
      }
    } catch (error) {
      console.error('Failed to get push times:', error);
    }
  };

  const groupPushTimes = (array, groupSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += groupSize) {
      result.push(array.slice(i, i + groupSize));
    }
    return result;
  };

  const groupedPushTimes = groupPushTimes(pushTimes, 5);

  const getConfirmTimes = async () => {
    try {
      const value = await AsyncStorage.getItem('confirmTimes');
      if (value !== null) {
        const times = JSON.parse(value)[0];
        console.log(times); // 확인용
        setConfirmTimes(times);
  
        console.log(alarmTime); // 확인용
        console.log(times); // 확인용
  
        if (alarmTime && times) {
          const alarmTimeParts = alarmTime.split(':');
          const confirmTimeParts = times.split(':');
          const alarmHours = parseInt(alarmTimeParts[0]);
          const alarmMinutes = parseInt(alarmTimeParts[1]);
          const confirmHours = parseInt(confirmTimeParts[0]);
          const confirmMinutes = parseInt(confirmTimeParts[1]);
  
          let hoursDiff = confirmHours - alarmHours;
          let minutesDiff = confirmMinutes - alarmMinutes;
  
          if (hoursDiff < 0) {
            hoursDiff += 24;
          }
  
          if (minutesDiff < 0) {
            minutesDiff += 60;
            hoursDiff--;
          }
  
          setDiffHours(hoursDiff);
          setDiffMinutes(minutesDiff);
        }
      }
    } catch (error) {
      console.error('Failed to get confirm time:', error);
    }
  };
  
  useEffect(() => {
    getConfirmTimes();
    getFiveMinutesLaterCount();
  }, [getConfirmTimes]);
  
  
  
  

  const getFiveMinutesLaterCount = async () => {
    try {
      const value = await AsyncStorage.getItem('fiveMinutesLaterCount');
      if (value !== null) {
        setFiveMinutesLaterCount(parseInt(value));
      }
    } catch (error) {
      console.error('Failed to get five minutes later count:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{currentDate}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View styles= {styles.scrollContainer}>       
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Text style={[styles.goalText]}>예상 수면 시간  <Text style={[styles.goalText1 , { textDecorationLine: 'underline' }]}>{totalSleepTime}</Text></Text>  
          </View>
          
          <Text style={[styles.sleepTimeText, styles.leftAlign]}><FontAwesome name="bed" size={20} color="rgba(3, 0, 102, 0.8)" /> {savedTime}</Text>
          <Text style={[styles.savedTimeText, styles.leftAlign]}>   <FontAwesome name="bell" size={20} color="rgba(3, 0, 102, 0.8)" />  {alarmTime}</Text>
          
          <Text style></Text>
          <Text style={styles.sleepTimeText}>실제 기상 시간: {confirmTimes}</Text> 
          <Text style></Text>
          <Text style={styles.sleepTimeText1}>목표한 기상 시간보다</Text>
          <Text style={styles.sleepTimeText2}>{diffHours}<Text style={styles.sleepTimeText1}>시간 </Text>{diffMinutes}<Text style={styles.sleepTimeText1}>분 </Text><Text style={styles.sleepTimeText1}>늦게 일어났어요<Ionicons name="sad-outline" size={23} color="#000000" /></Text></Text>
          
               
          </View>
          <View style={styles.iconContainer2}>
            <Ionicons name="square" size={10} color="rgba(3, 0, 102, 0.8)" />
            <Text style={styles.screenText}>수면 시간 내 핸드폰 사용 {totalPushCount} 번</Text>
          </View>
          <View style={styles.pushTimesContainer}>
            <Text style={styles.sleepTimeText}><FontAwesome name="clock-o" size={17} color="rgba(3, 0, 102, 0.5)" /> 사용 시간 목록</Text>
            
            
              {groupedPushTimes.map((group, index) => (
              <View key={index} style={styles.pushTimesRow}>
                {group.map((time, idx) => (
                  <Text key={idx} style={styles.pushTimeItem}>{time}</Text>
                ))}
              </View>
            ))}
          </View>
          <View style={styles.iconContainer2}>
            <Ionicons name="square" size={10} color="rgba(3, 0, 102, 0.8)"  />
            <Text style={styles.screenText}>알람 재설정 {fiveMinutesLaterCount} 회</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.backButtonContainer}>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={35} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D5D5D5',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'rgb(231,231,231)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  dateContainer: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 30,
    fontWeight: '800',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  iconContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 5,
    marginLeft: 10
  },
  goalText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: -10,
  },
  goalText1: {
    fontSize: 40,
    fontWeight: 'bold',
    marginLeft: 10,
    color: "rgba(3, 0, 102, 0.8)",
    marginTop: -5,
  },
  screenText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: "rgba(3, 0, 102, 0.8)",
  },
  savedTimeText: {
    fontSize: 18,
    marginTop: 5,
    fontWeight: '500',
  },
  sleepTimeText: {
    fontSize: 18,
    marginTop: 5,
    fontWeight: '500',
    color: 'black',
    marginLeft: 10
  },
  sleepTimeText1: {
    fontSize: 23,
    marginTop: 30,
    fontWeight: '900',
    color: 'black',
    backgroundColor: "#FFFFFF"
  },
  sleepTimeText2: {
    fontSize: 35,
    marginTop: 5,
    fontWeight: '900',
    color: '#CC3D3D',
    backgroundColor: "#FFFFFF"
  },
  backButtonContainer: {
    marginTop: 70,
    marginBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  pushTimesContainer: {
    marginBottom: -30,
    alignItems: 'center'
  },
  pushTimesRow: {
    flexDirection: 'row',
  },
  pushTimeItem: {
    fontSize: 16,
    marginRight: 5,
    marginLeft: 5,
    fontWeight: '500',
    marginBottom: 2,
    marginTop: 3,
  },
});

export default DailyScreen;
