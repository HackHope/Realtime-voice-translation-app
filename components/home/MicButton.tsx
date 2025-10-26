import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  isListening: boolean;
  onPress: () => void;
  showVoiceButton?: boolean;
};

export function MicButton({ isListening, onPress, showVoiceButton = false }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.buttonRow}>
        {showVoiceButton && (
          <Pressable style={[styles.smallButton]} onPress={() => { /* TODO: play voice */ }}>
            <Text style={styles.smallButtonText}>🔊</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityLabel={isListening ? 'Stop microphone' : 'Start microphone'}
          style={[styles.micButton, isListening ? styles.micActive : undefined]}
          onPress={onPress}
        >
          <Text style={styles.micText}>{isListening ? '●' : '🎤'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0a84ff33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: {
    backgroundColor: '#ff3b30',
  },
  micText: {
    fontSize: 28,
  },
  smallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  smallButtonText: {
    fontSize: 20,
  },
});
