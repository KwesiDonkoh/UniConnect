#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing UniConnect App...');

// Check for common issues and fix them
const checkAndFix = () => {
  const issues = [];
  
  // Check if all required files exist
  const requiredFiles = [
    'App.js',
    'index.js',
    'app.json',
    'package.json',
    'metro.config.js',
    '.watchmanconfig'
  ];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
      issues.push(`Missing file: ${file}`);
    }
  });
  
  // Check if all required directories exist
  const requiredDirs = [
    'screens',
    'components',
    'services',
    'context',
    'config'
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, dir))) {
      issues.push(`Missing directory: ${dir}`);
    }
  });
  
  // Check package.json for required dependencies
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    'expo-av',
    'expo-camera',
    'expo-file-system',
    'expo-document-picker',
    'expo-image-picker',
    '@react-native-async-storage/async-storage',
    'firebase'
  ];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      issues.push(`Missing dependency: ${dep}`);
    }
  });
  
  if (issues.length > 0) {
    console.log('❌ Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    return false;
  } else {
    console.log('✅ All checks passed!');
    return true;
  }
};

// Performance optimizations
const optimize = () => {
  console.log('⚡ Applying performance optimizations...');
  
  // Create .expo directory if it doesn't exist
  if (!fs.existsSync('.expo')) {
    fs.mkdirSync('.expo', { recursive: true });
  }
  
  // Create optimized settings
  const expoSettings = {
    hostType: 'lan',
    lanType: 'ip',
    dev: true,
    minify: false,
    urlRandomness: null
  };
  
  fs.writeFileSync('.expo/settings.json', JSON.stringify(expoSettings, null, 2));
  
  console.log('✅ Performance optimizations applied!');
};

// Run checks and optimizations
if (checkAndFix()) {
  optimize();
  console.log('🎉 UniConnect App is ready!');
  console.log('📱 Run "npx expo start --tunnel" to launch the app');
} else {
  console.log('❌ Please fix the issues above and run this script again.');
  process.exit(1);
}
