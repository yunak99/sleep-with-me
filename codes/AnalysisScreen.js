import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnalysisScreen = ({ navigation }) => {
  const [alarmTime, setAlarmTime] = useState('');
  const [savedTime, setSavedTime] = useState('');
  const [totalSleepTime, setTotalSleepTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

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
    currentDate2.setDate(currentDate.getDate() - 6);
    const year2 = currentDate2.getFullYear();
    const month2 = ('0' + (currentDate2.getMonth() + 1)).slice(-2);
    const day2 = ('0' + currentDate2.getDate()).slice(-2);
    return `${year2}. ${month2}. ${day2}\n~ ${year}. ${month}. ${day}`;
  };

  useEffect(() => {
    getAlarmTime();
  }, []);

  useEffect(() => {
    calculateTotalSleepTime(savedTime, alarmTime);
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

      setTotalSleepTime(`${hours} 시간 ${minutes} 분`);
      setHours(hours);
      setMinutes(minutes)

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

  const renderBarGraph = () => {
    const currentDateObj = new Date();
    const sleepData = [
      { day: `${currentDateObj.getDate() - 6}일`, hours: getRandomNumber(5, 8), minutes: getRandomNumber(0, 59) },
      { day: `${currentDateObj.getDate() - 5}일`, hours: getRandomNumber(5, 12), minutes: getRandomNumber(0, 59) },
      { day: `${currentDateObj.getDate() - 4}일`, hours: getRandomNumber(5, 9), minutes: getRandomNumber(0, 59) },
      { day: `${currentDateObj.getDate() - 3}일`, hours: getRandomNumber(5, 9), minutes: getRandomNumber(0, 59) },
      { day: `${currentDateObj.getDate() - 2}일`, hours: getRandomNumber(5, 6), minutes: getRandomNumber(0, 59) },
      { day: `${currentDateObj.getDate() - 1}일`, hours: getRandomNumber(5, 12), minutes: getRandomNumber(0, 59) },
      { day: `${currentDateObj.getDate()}일`, hours: hours, minutes: minutes },
    ];
  
    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  
    const maxHours = Math.max(...sleepData.map((data) => data.hours));
    const maxHeight = 250;
  
    const startColor = '#030066';
    const endColor = '#FFFFFF';
  
    const interpolateColor = (color1, color2, ratio) => {
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
  
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);
  
      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);
  
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
  
    return sleepData.map((data, index) => {
      const formattedMinutes = data.minutes.toString().padStart(2, '0');
      const minutesText = data.minutes === 0 ? '00' : formattedMinutes;
  
      const normalizedHours = 1 - data.hours / maxHours;
      const barColor = interpolateColor(startColor, endColor, normalizedHours);
  
      return (
        <View key={index} style={styles.barContainer}>
          <Text style={styles.dayText}>{data.day}</Text>
          <View
            style={[
              styles.bar,
              { height: (data.hours / maxHours) * maxHeight, backgroundColor: barColor },
            ]}
          />
          <Text style={styles.hoursText}>{data.hours}시간</Text>
          <Text style={styles.hoursText1}>{minutesText}분</Text>
        </View>
      );
    });
  };

  const goToDailyScreen = () => {
    navigation.navigate('DailyScreen');
  };

  return (
    <View style={styles.container}>
  
        <Text style={styles.dateText}>{currentDate}</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
            <Ionicons name="bed" size={20} color="#000000" />
          <Text style={styles.screenText}>주간 수면량  </Text>
          <Ionicons name="bed" size={20} color="#000000" />
          </View>
          <View style={styles.graphContainer}>{renderBarGraph()}</View>
          <TouchableOpacity
            style={styles.screenText1}
            onPress={goToDailyScreen}
          >
            <View style={styles.iconContainer2}>
            <Text style={[styles.screenText1, { textDecorationLine: 'underline' }]}>
            오늘의 수면 정보 </Text><FontAwesome name="mouse-pointer" size={20} color="#000000" /></View>
            
          </TouchableOpacity>
      </ScrollView>
      <View style={styles.backButtonContainer}>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
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
    marginTop: 50,
  },
  dateText: {
    marginTop: 30,
    fontSize: 30,
    fontWeight: '800',
    alignSelf: 'center',
  },
  screenText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  screenText1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgb(231,231,231)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  barContainer: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bar: {
    width: 25,
    backgroundColor: '#008080',
    marginTop: 15,
    marginRight:8, 
    marginLeft: 8,
    borderRadius: 3, 
  },
  hoursText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  hoursText1: {
    fontSize: 16,
    fontWeight: 'bold',
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
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 8,
  },
  iconContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 30,
  },
});

export default AnalysisScreen;