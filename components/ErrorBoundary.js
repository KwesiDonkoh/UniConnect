import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              The app encountered an unexpected error. Please try restarting the app.
            </Text>
            
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            {__DEV__ && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details (Development Mode):</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.error && this.state.error.toString()}
                </Text>
                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                  <Text style={styles.errorDetailsText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
  },
  errorDetailsTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDetailsText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ErrorBoundary;
