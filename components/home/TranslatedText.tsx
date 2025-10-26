import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  text: string;
};

export function TranslatedText({ text }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Translated
      </ThemedText>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
  },
});
