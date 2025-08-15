// Error Reporting and Crash Prevention Utility
import { Alert } from 'react-native';

class ErrorReporter {
  constructor() {
    this.errorQueue = [];
    this.isReporting = false;
  }

  // Log error with context
  logError(error, context = {}) {
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString(),
      context: {
        screen: context.screen || 'Unknown',
        action: context.action || 'Unknown',
        userId: context.userId || 'Anonymous',
        userType: context.userType || 'Unknown',
        ...context
      }
    };

    console.error('Error logged:', errorDetails);
    this.errorQueue.push(errorDetails);

    // Show user-friendly error message
    this.showUserError(error, context);
  }

  // Show appropriate error message to user
  showUserError(error, context = {}) {
    let title = 'Something went wrong';
    let message = 'Please try again. If the problem persists, contact support.';

    // Customize messages based on error type
    if (error.message?.includes('upload')) {
      title = 'Upload Failed';
      message = 'Failed to upload your file. Please check your internet connection and try again.';
    } else if (error.message?.includes('auth')) {
      title = 'Authentication Error';
      message = 'Please log out and log back in to continue.';
    } else if (error.message?.includes('network')) {
      title = 'Connection Error';
      message = 'Please check your internet connection and try again.';
    } else if (error.message?.includes('permission')) {
      title = 'Permission Required';
      message = 'This feature requires additional permissions. Please check your app settings.';
    }

    // Don't show alert for silent errors
    if (!context.silent) {
      setTimeout(() => {
        Alert.alert(
          title,
          message,
          [
            { text: 'OK' },
            { 
              text: 'Report Issue', 
              onPress: () => this.reportIssue(error, context)
            }
          ]
        );
      }, 100);
    }
  }

  // Report issue to console (in production this could send to a service)
  reportIssue(error, context = {}) {
    console.log('Issue reported:', {
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    });
    
    Alert.alert(
      'Thank you!',
      'Your issue has been reported. We will investigate and fix it soon.',
      [{ text: 'OK' }]
    );
  }

  // Safe function wrapper to catch and handle errors
  wrapAsync(asyncFunction, context = {}) {
    return async (...args) => {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        this.logError(error, context);
        throw error; // Re-throw for specific handling if needed
      }
    };
  }

  // Safe function wrapper for sync functions
  wrapSync(syncFunction, context = {}) {
    return (...args) => {
      try {
        return syncFunction(...args);
      } catch (error) {
        this.logError(error, context);
        throw error;
      }
    };
  }

  // Validate array access
  safeArrayAccess(array, index, defaultValue = null) {
    try {
      if (!Array.isArray(array)) {
        console.warn('safeArrayAccess: not an array', array);
        return defaultValue;
      }
      if (index < 0 || index >= array.length) {
        console.warn('safeArrayAccess: index out of bounds', index, array.length);
        return defaultValue;
      }
      return array[index];
    } catch (error) {
      this.logError(error, { context: 'safeArrayAccess', array: array?.length, index });
      return defaultValue;
    }
  }

  // Validate object property access
  safeObjectAccess(obj, path, defaultValue = null) {
    try {
      if (!obj || typeof obj !== 'object') {
        return defaultValue;
      }
      
      const keys = path.split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
          return defaultValue;
        }
        current = current[key];
      }
      
      return current;
    } catch (error) {
      this.logError(error, { context: 'safeObjectAccess', path });
      return defaultValue;
    }
  }

  // Get error summary
  getErrorSummary() {
    return {
      totalErrors: this.errorQueue.length,
      recentErrors: this.errorQueue.slice(-10),
      errorTypes: this.errorQueue.reduce((acc, error) => {
        const type = error.message.split(':')[0] || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = [];
  }
}

// Global instance
const errorReporter = new ErrorReporter();

// Global error handler setup
if (__DEV__) {
  // In development, also log to console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    
    // Check if first argument is an Error object
    if (args[0] instanceof Error) {
      errorReporter.logError(args[0], { silent: true });
    }
  };
}

export default errorReporter;
