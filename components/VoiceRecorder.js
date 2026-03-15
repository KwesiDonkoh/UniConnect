import React, { useState, useRef, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Alert, Animated, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function VoiceRecorder({ visible, onClose, onSend, courseCode, isDark = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const startRecording = () => {
    setIsRecording(true);
    Vibration.vibrate(100);
    Alert.alert("Recording Started", "Voice recording in progress...");
  };

  const stopRecording = () => {
    setIsRecording(false);
    Vibration.vibrate(200);
    const audioData = { id: Date.now(), type: "voice", courseCode, timestamp: new Date().toISOString() };
    setRecordedAudio(audioData);
    Alert.alert("Recording Complete", "Voice note recorded successfully!");
  };

  const sendVoiceNote = () => {
    if (!recordedAudio) return;
    onSend(recordedAudio);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Voice Recorder</Text>
          <Text style={styles.subtitle}>Record voice messages for {courseCode || "your course"}</Text>

          {!recordedAudio ? (
            <TouchableOpacity style={styles.recordButton} onPress={isRecording ? stopRecording : startRecording}>
              <Ionicons name={isRecording ? "stop" : "mic"} size={32} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendButton} onPress={sendVoiceNote}>
              <Text style={styles.buttonText}>Send Voice Note</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#FFFFFF", padding: 30, borderRadius: 20, alignItems: "center", width: "80%" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#1E293B" },
  subtitle: { fontSize: 16, color: "#64748B", marginBottom: 20, textAlign: "center" },
  recordButton: { backgroundColor: "#EF4444", padding: 15, borderRadius: 10, marginBottom: 15, width: "100%" },
  sendButton: { backgroundColor: "#10B981", padding: 15, borderRadius: 10, marginBottom: 15, width: "100%" },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontSize: 16, fontWeight: "600" },
  closeButton: { padding: 15, width: "100%" },
  closeButtonText: { color: "#64748B", textAlign: "center", fontSize: 16 }
});
