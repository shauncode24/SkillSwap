import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MatchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Match Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0E17' },
  text: { color: '#FFFFFE', fontSize: 20 },
});
