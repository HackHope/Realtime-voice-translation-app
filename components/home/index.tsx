import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';

import { MicButton } from '@/components/home/MicButton';
import { TranslatedText } from '@/components/home/TranslatedText';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { transcribeAndTranslate } from '@/services/ast';

export function Home() {
    const [conversationMode, setConversationMode] = useState<boolean>(true);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [translatedText, setTranslatedText] = useState<string>('');
    const [statusText, setStatusText] = useState<string>('');
    const recordingRef = useRef<any>(null);
    const mediaRecorderRef = useRef<any>(null);
    const recordedChunksRef = useRef<any[]>([]);

    const startRecording = async () => {
        setStatusText('Requesting microphone...');
        try {
            if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).mediaDevices) {
                // Web: use MediaRecorder
                const stream = await (navigator as any).mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new (window as any).MediaRecorder(stream);
                recordedChunksRef.current = [];
                mediaRecorder.ondataavailable = (e: any) => {
                    if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
                };
                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setStatusText('Recording (web)...');
            } else {
                // Try expo-av for native
                const AudioModule = await import('expo-av');
                const { Audio } = AudioModule;
                const permission = await Audio.requestPermissionsAsync?.();
                if (permission && permission.granted === false) {
                    setStatusText('Microphone permission denied');
                    return;
                }
                await Audio.setAudioModeAsync?.({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
                const recording = new Audio.Recording();
                // Use default options to avoid depending on platform-specific constant names
                await recording.prepareToRecordAsync?.();
                await recording.startAsync?.();
                recordingRef.current = recording;
                setStatusText('Recording...');
            }
        } catch (e: any) {
            console.warn('startRecording error', e);
            setStatusText('Failed to start recording: ' + (e?.message || e));
        }
    };

    const stopRecording = async () => {
        setStatusText('Stopping and processing...');
        try {
            let audioInput: ArrayBuffer | Blob | string | null = null;

            if (Platform.OS === 'web' && mediaRecorderRef.current) {
                const mediaRecorder = mediaRecorderRef.current;
                mediaRecorder.stop();
                // Wait briefly for dataavailable to fire
                await new Promise((res) => setTimeout(res, 300));
                const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                audioInput = blob;
                mediaRecorderRef.current = null;
            } else if (recordingRef.current) {
                const recording = recordingRef.current;
                try {
                    await recording.stopAndUnloadAsync?.();
                } catch (err) {
                    // ignore
                }
                const uri = recording.getURI?.();
                if (uri) {
                    // fetch the file into an ArrayBuffer
                    const res = await fetch(uri);
                    audioInput = await res.arrayBuffer();
                }
                recordingRef.current = null;
            }

            if (!audioInput) {
                setStatusText('No audio captured');
                return;
            }

            setStatusText('Transcribing & translating...');
            const result = await transcribeAndTranslate(audioInput);
            const translated = result?.translated ?? '';
            const transcription = result?.transcription ?? '';
            setTranslatedText(`${translated}\n\n(${transcription})`);
            setStatusText('Done');
        } catch (e: any) {
            console.warn('stopRecording error', e);
            setStatusText('Error processing audio: ' + (e?.message || e));
        }
    };

    const toggleListening = async () => {
        if (!isListening) {
            setIsListening(true);
            setTranslatedText('');
            await startRecording();
        } else {
            setIsListening(false);
            await stopRecording();
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">AI Assistant</ThemedText>
                <View style={styles.switchRow}>
                    <ThemedText style={styles.switchLabel}>Conversation</ThemedText>
                    <Switch
                        value={conversationMode}
                        onValueChange={(v) => setConversationMode(v)}
                        accessibilityLabel="Enable conversation mode"
                    />
                </View>
            </View>

            <View style={styles.content}>
                <TranslatedText text={translatedText || 'Translated text will appear here.'} />
            </View>

            <MicButton
                isListening={isListening}
                onPress={toggleListening}
                showVoiceButton
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    switchRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchLabel: {
        marginRight: 12,
    },
});
