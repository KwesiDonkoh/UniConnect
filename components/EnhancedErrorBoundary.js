import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../themes/modernTheme';

const { width, height } = Dimensions.get('window');

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      fadeAnim: new Animated.Value(0),
      scaleAnim: new Animated.Value(0.8),
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any crash reporting service
    console.error('🚨 Enhanced Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Start animations when error occurs
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(this.state.scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Report to crash analytics service (if implemented)
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    // like Crashlytics, Sentry, Bugsnag, etc.
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      appVersion: '1.0.0', // You would get this from your app config
    };

    console.log('📊 Error Report:', JSON.stringify(errorReport, null, 2));
  };

  handleRestart = () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      fadeAnim: new Animated.Value(0),
      scaleAnim: new Animated.Value(0.8),
    });
  };

  handleReload = () => {
    // In React Native, you might want to restart the app
    // This is a simplified version - in production you might use CodePush or similar
    if (Platform.OS === 'ios') {
      // iOS doesn't allow programmatic app restart
      this.handleRestart();
    } else {
      // Android - you could implement app restart logic here
      this.handleRestart();
    }
  };

  render() {
    if (this.state.hasError) {
      // Enhanced error UI with current colors
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Background Gradient */}
          <LinearGradient
            colors={[Colors.error[600], Colors.error[500], Colors.error[400]]}
            style={styles.backgroundGradient}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: this.state.fadeAnim,
                  transform: [{ scale: this.state.scaleAnim }],
                },
              ]}
            >
              {/* Error Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="alert-circle-outline" size={64} color="white" />
                </LinearGradient>
              </View>

              {/* Error Message */}
              <View style={styles.messageContainer}>
                <Text style={styles.title}>Oops! Something went wrong</Text>
                <Text style={styles.subtitle}>
                  We encountered an unexpected error, but don't worry - we're on it!
                </Text>
              </View>

              {/* Error Details (Collapsible) */}
              <View style={styles.detailsContainer}>
                <TouchableOpacity
                  style={styles.detailsToggle}
                  onPress={() => this.setState({ showDetails: !this.state.showDetails })}
                >
                  <Text style={styles.detailsToggleText}>
                    {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                  </Text>
                  <Ionicons 
                    name={this.state.showDetails ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="rgba(255,255,255,0.8)" 
                  />
                </TouchableOpacity>

                {this.state.showDetails && (
                  <ScrollView style={styles.errorDetails} showsVerticalScrollIndicator={false}>
                    <View style={styles.errorSection}>
                      <Text style={styles.errorSectionTitle}>Error Message:</Text>
                      <Text style={styles.errorText}>
                        {this.state.error?.message || 'Unknown error occurred'}
                      </Text>
                    </View>
                    
                    {this.state.error?.stack && (
                      <View style={styles.errorSection}>
                        <Text style={styles.errorSectionTitle}>Stack Trace:</Text>
                        <Text style={styles.errorText}>
                          {this.state.error.stack}
                        </Text>
                      </View>
                    )}

                    {this.state.errorInfo?.componentStack && (
                      <View style={styles.errorSection}>
                        <Text style={styles.errorSectionTitle}>Component Stack:</Text>
                        <Text style={styles.errorText}>
                          {this.state.errorInfo.componentStack}
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={this.handleRestart}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="refresh" size={20} color={Colors.error[600]} />
                    <Text style={styles.actionButtonText}>Try Again</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={this.handleReload}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="reload" size={20} color="white" />
                    <Text style={styles.secondaryButtonText}>Restart App</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Help Section */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <Text style={styles.helpText}>
                  If this problem persists, please contact our support team with the error details above.
                </Text>
                
                <View style={styles.helpActions}>
                  <TouchableOpacity style={styles.helpButton}>
                    <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.helpButtonText}>Contact Support</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.helpButton}>
                    <Ionicons name="bug-outline" size={18} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.helpButtonText}>Report Bug</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  UniConnect • Enhanced Error Boundary v1.0
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </SafeAreaView>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsToggleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 8,
    fontWeight: '500',
  },
  errorDetails: {
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  errorSection: {
    marginBottom: 16,
  },
  errorSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error[600],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  helpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpActions: {
    flexDirection: 'row',
    gap: 16,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

export default EnhancedErrorBoundary;