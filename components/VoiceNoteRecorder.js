import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AudioCompat from '../utils/audioCompat';
import * as FileSystem from 'expo-file-system/legacy';

export default function VoiceNoteRecorder({ onSend, courseCode, visible, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef(null);

  // Request permissions
  const requestPermissions = async () => {
    try {
      const { status } = await AudioCompat.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to record voice notes.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await AudioCompat.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new AudioCompat.Recording();
      await newRecording.prepareToRecordAsync(AudioCompat.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      recordingRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      clearInterval(recordingRef.current);
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      
      // Get recording info
      const info = await FileSystem.getInfoAsync(uri);
      console.log('Recording saved to:', uri);
      console.log('File size:', info.size);
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Play recording
  const playRecording = async () => {
    try {
      if (!recordingUri) return;
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await AudioCompat.Sound.createAsync({ uri: recordingUri });
      setSound(newSound);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      
      await newSound.playAsync();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording. Please try again.');
    }
  };

  // Stop playing
  const stopPlaying = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Failed to stop playing:', error);
    }
  };

  // Send voice note
  const sendVoiceNote = () => {
    if (recordingUri) {
      onSend({
        type: 'voice',
        uri: recordingUri,
        duration: recordingDuration,
        courseCode,
        timestamp: new Date().toISOString(),
      });
      onClose();
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingRef.current) {
        clearInterval(recordingRef.current);
      }
    };
  }, [sound]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Voice Note Recorder</Text>
          <Text style={styles.subtitle}>Record voice messages for {courseCode || "your course"}</Text>
          
          {/* Recording Status */}
          {isRecording && (
            <View style={styles.recordingStatus}>
              <View style={styles.recordingIndicator} />
              <Text style={styles.recordingText}>Recording... {formatDuration(recordingDuration)}</Text>
            </View>
          )}
          
          {/* Playback Controls */}
          {recordingUri && !isRecording && (
            <View style={styles.playbackControls}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={isPlaying ? stopPlaying : playRecording}
              >
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              <Text style={styles.durationText}>
                Duration: {formatDuration(recordingDuration)}
              </Text>
            </View>
          )}
          
          {/* Recording Controls */}
          <View style={styles.controls}>
            {!isRecording ? (
              <TouchableOpacity 
                style={styles.recordButton} 
                onPress={startRecording}
              >
                <Ionicons name="mic" size={32} color="#FFFFFF" />
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.stopButton} 
                onPress={stopRecording}
              >
                <Ionicons name="stop" size={32} color="#FFFFFF" />
                <Text style={styles.stopButtonText}>Stop Recording</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {recordingUri && (
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={sendVoiceNote}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>Send Voice Note</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.sendButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  playbackControls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#10B981',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 14,
    color: '#64748B',
  },
  controls: {
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  stopButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  sendButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
});
