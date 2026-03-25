import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const NebulaCloud = ({ color, startPos, delay }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 20000 + Math.random() * 10000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 100, 0],
  });

  const translateY = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -100, 0],
  });

  const scale = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          backgroundColor: color,
          top: startPos.y,
          left: startPos.x,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity: 0.2,
        },
      ]}
    />
  );
};

const AuthBackground = ({ isDark, children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#130F40', '#000000'] : ['#FDFCFB', '#E2D1C3']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={StyleSheet.absoluteFill}>
        <NebulaCloud color={isDark ? '#6366F1' : '#A1C4FD'} startPos={{ x: -50, y: -50 }} />
        <NebulaCloud color={isDark ? '#D946EF' : '#C2E9FB'} startPos={{ x: width - 150, y: 100 }} />
        <NebulaCloud color={isDark ? '#3B82F6' : '#FFD1FF'} startPos={{ x: 50, y: height - 200 }} />
      </View>

      <LinearGradient
        colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.4)']}
        style={StyleSheet.absoluteFill}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  cloud: { position: 'absolute', width: 300, height: 300, borderRadius: 150, filter: 'blur(60px)' },
});

export default AuthBackground;
