// Platform Health Check Utility
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import errorReporter from './errorReporting';

class PlatformHealth {
  constructor() {
    this.healthMetrics = {
      lastCheck: null,
      status: 'unknown',
      issues: [],
      warnings: []
    };
  }

  // Comprehensive platform health check
  async performHealthCheck() {
    console.log('🔍 Starting platform health check...');
    
    const startTime = Date.now();
    const issues = [];
    const warnings = [];

    try {
      // 1. Check AsyncStorage
      await this.checkAsyncStorage(issues, warnings);

      // 2. Check file system access
      await this.checkFileSystem(issues, warnings);

      // 3. Check app permissions
      await this.checkPermissions(issues, warnings);

      // 4. Check memory usage
      this.checkMemoryUsage(issues, warnings);

      // 5. Check network connectivity (basic)
      await this.checkNetworkConnectivity(issues, warnings);

      // 6. Validate app configuration
      this.validateAppConfiguration(issues, warnings);

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.healthMetrics = {
        lastCheck: new Date().toISOString(),
        status: issues.length === 0 ? 'healthy' : 'issues_detected',
        issues,
        warnings,
        checkDuration: duration
      };

      console.log(`✅ Health check completed in ${duration}ms`);
      console.log(`📊 Status: ${this.healthMetrics.status}`);
      console.log(`⚠️  Issues: ${issues.length}, Warnings: ${warnings.length}`);

      return this.healthMetrics;
    } catch (error) {
      errorReporter.logError(error, { context: 'platformHealthCheck' });
      
      this.healthMetrics = {
        lastCheck: new Date().toISOString(),
        status: 'check_failed',
        issues: [...issues, `Health check failed: ${error.message}`],
        warnings,
        error: error.message
      };

      return this.healthMetrics;
    }
  }

  // Check AsyncStorage functionality
  async checkAsyncStorage(issues, warnings) {
    try {
      const testKey = 'health_check_test';
      const testValue = 'test_' + Date.now();
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        issues.push('AsyncStorage read/write test failed');
      }
    } catch (error) {
      issues.push(`AsyncStorage error: ${error.message}`);
    }
  }

  // Check file system access
  async checkFileSystem(issues, warnings) {
    try {
      const testDir = FileSystem.documentDirectory + 'health_check/';
      const testFile = testDir + 'test.txt';
      
      // Create directory
      await FileSystem.makeDirectoryAsync(testDir, { intermediates: true });
      
      // Write file
      await FileSystem.writeAsStringAsync(testFile, 'test content');
      
      // Read file
      const content = await FileSystem.readAsStringAsync(testFile);
      
      // Clean up
      await FileSystem.deleteAsync(testDir, { idempotent: true });
      
      if (content !== 'test content') {
        issues.push('File system read/write test failed');
      }
    } catch (error) {
      issues.push(`File system error: ${error.message}`);
    }
  }

  // Check basic permissions
  async checkPermissions(issues, warnings) {
    try {
      // This is a basic check - in a real app you'd check specific permissions
      // For now, we'll just note what permissions the app expects
      const expectedPermissions = [
        'CAMERA',
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE'
      ];
      
      warnings.push(`Expected permissions: ${expectedPermissions.join(', ')}`);
    } catch (error) {
      warnings.push(`Permission check error: ${error.message}`);
    }
  }

  // Check memory usage (basic)
  checkMemoryUsage(issues, warnings) {
    try {
      // On React Native, we can't directly check memory usage
      // But we can check for common memory issues
      
      if (global.gc) {
        // Memory pressure test
        const before = process.memoryUsage?.() || {};
        global.gc();
        const after = process.memoryUsage?.() || {};
        
        const heapDiff = (before.heapUsed || 0) - (after.heapUsed || 0);
        if (heapDiff > 50 * 1024 * 1024) { // 50MB
          warnings.push(`High memory usage detected: ${Math.round(heapDiff / 1024 / 1024)}MB freed`);
        }
      } else {
        warnings.push('Memory monitoring not available');
      }
    } catch (error) {
      warnings.push(`Memory check error: ${error.message}`);
    }
  }

  // Basic network connectivity check
  async checkNetworkConnectivity(issues, warnings) {
    try {
      // Simple connectivity test
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.status !== 204) {
        warnings.push('Network connectivity may be limited');
      }
    } catch (error) {
      warnings.push(`Network check failed: ${error.message}`);
    }
  }

  // Validate app configuration
  validateAppConfiguration(issues, warnings) {
    try {
      // Check platform
      if (!Platform.OS) {
        issues.push('Platform OS not detected');
      }

      // Check environment
      if (typeof __DEV__ === 'undefined') {
        warnings.push('Development environment not properly configured');
      }

      // Check global objects
      if (typeof global === 'undefined') {
        issues.push('Global object not available');
      }

      // Check React Native modules
      const requiredModules = ['Alert', 'AsyncStorage'];
      // Basic existence check would go here

    } catch (error) {
      warnings.push(`Configuration validation error: ${error.message}`);
    }
  }

  // Get health status
  getHealthStatus() {
    return this.healthMetrics;
  }

  // Get recommendations based on issues
  getRecommendations() {
    const recommendations = [];
    
    this.healthMetrics.issues.forEach(issue => {
      if (issue.includes('AsyncStorage')) {
        recommendations.push('Restart the app to reset AsyncStorage');
      } else if (issue.includes('File system')) {
        recommendations.push('Check device storage space');
      } else if (issue.includes('Network')) {
        recommendations.push('Check internet connection');
      } else if (issue.includes('Permission')) {
        recommendations.push('Check app permissions in device settings');
      }
    });

    this.healthMetrics.warnings.forEach(warning => {
      if (warning.includes('Memory')) {
        recommendations.push('Close and restart the app to free memory');
      } else if (warning.includes('Network')) {
        recommendations.push('Some features may not work offline');
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Auto-fix common issues
  async autoFix() {
    const fixResults = [];
    
    try {
      // Clear any corrupted AsyncStorage data
      try {
        await AsyncStorage.clear();
        fixResults.push('AsyncStorage cleared');
      } catch (error) {
        fixResults.push(`Failed to clear AsyncStorage: ${error.message}`);
      }

      // Clean up temporary files
      try {
        const tempDir = FileSystem.documentDirectory + 'temp/';
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
        fixResults.push('Temporary files cleaned');
      } catch (error) {
        fixResults.push(`Failed to clean temp files: ${error.message}`);
      }

      return fixResults;
    } catch (error) {
      errorReporter.logError(error, { context: 'platformHealthAutoFix' });
      return [`Auto-fix failed: ${error.message}`];
    }
  }
}

// Global instance
const platformHealth = new PlatformHealth();

export default platformHealth;
