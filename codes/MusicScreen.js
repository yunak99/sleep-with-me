import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const MusicScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerLeft: null,
    });
  }, []);

  const handleThumbnailPress = async (youtubeLink) => {
    const supported = await Linking.canOpenURL(youtubeLink);

    if (supported) {
      await Linking.openURL(youtubeLink);
    } else {
      console.log('Unsupported URL:', youtubeLink);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={35} color="#000000" />
      </TouchableOpacity>
      <Text style={styles.screenText1}><FontAwesome name="headphones" size={30} color="#000000" /> 수면 유도 음악 <FontAwesome name="headphones" size={30} color="#000000" /></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.thumbnailRow}>
          <TouchableOpacity style={styles.thumbnailButton} onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=WIqe9vM4U34&t=401s')}>
            <Image
              source={require('../assets/thumbnail1.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.thumbnailButton} onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=JASL4W52Zpo')}>
            <Image
              source={require('../assets/thumbnail2.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=9zlBRNK3OEw')}>
            <Image
              source={require('../assets/thumbnail3.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Text style={styles.screenText}><FontAwesome name="headphones" size={30} color="#000000" /> 스트레스 해소 음악 <FontAwesome name="headphones" size={30} color="#000000" /></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.thumbnailRow}>
          <TouchableOpacity style={styles.thumbnailButton} onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=4A5S5k8Bfdo&t=5s')}>
            <Image
              source={require('../assets/thumbnail4.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.thumbnailButton} onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=ZQWrleq-NhQ&t=10s')}>
            <Image
              source={require('../assets/thumbnail5.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Text style={styles.screenText}><FontAwesome name="headphones" size={30} color="#000000" /> 힐링 음악 <FontAwesome name="headphones" size={30} color="#000000" /></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.thumbnailRow}>
          <TouchableOpacity style={styles.thumbnailButton} onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=m7GOmncIU5A&t=1s')}>
            <Image
              source={require('../assets/thumbnail6.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.thumbnailButton} onPress={() => handleThumbnailPress('https://www.youtube.com/watch?v=mWASFFB8YFY&t=1s')}>
            <Image
              source={require('../assets/thumbnail7.jpg')}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  screenText1: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: -20,
    marginTop: 70,
  },
  screenText: {
    marginTop: -140,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: -20,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  thumbnailRow: {
    flexDirection: 'row',
  },
  thumbnailButton: {
    marginRight: 10,
  },
  thumbnailImage: {
    width: 170,
    resizeMode: 'contain',
  },
});

export default MusicScreen;