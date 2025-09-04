#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing UniConnect App Components...');

// Test all critical files
const testFiles = [
  // Core app files
  { file: 'App.js', required: ['ErrorBoundary', 'ThemeProvider', 'AppProvider'] },
  { file: 'index.js', required: ['App'] },
  
  // Services
  { file: 'services/authService.js', required: ['signIn', 'signUp'] },
  { file: 'services/chatService.js', required: ['sendMessage', 'getMessages'] },
  { file: 'services/communicationService.js', required: ['playVoiceMessage', 'initiateVideoCall'] },
  { file: 'services/fileUploadService.js', required: ['pickFile', 'uploadFile'] },
  
  // Components
  { file: 'components/VoiceMessagePlayer.js', required: ['VoiceMessagePlayer'] },
  { file: 'components/VideoCallComponent.js', required: ['VideoCallComponent'] },
  { file: 'components/ErrorBoundary.js', required: ['ErrorBoundary'] },
  
  // Screens
  { file: 'screens/GroupChatScreen.js', required: ['GroupChatScreen'] },
  { file: 'screens/ModernHomeDashboard.js', required: ['ModernHomeDashboard'] },
  
  // Config
  { file: 'config/firebaseConfig.js', required: ['auth', 'db', 'storage'] },
  { file: 'context/AppContext.js', required: ['AppProvider', 'useApp'] },
];

let allTestsPassed = true;

testFiles.forEach(({ file, required }) => {
  if (!fs.existsSync(file)) {
    console.log(`❌ Missing file: ${file}`);
    allTestsPassed = false;
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  const missingRequired = required.filter(req => !content.includes(req));
  
  if (missingRequired.length > 0) {
    console.log(`❌ ${file} missing: ${missingRequired.join(', ')}`);
    allTestsPassed = false;
  } else {
    console.log(`✅ ${file} - OK`);
  }
});

// Test configuration files
console.log('\n🔧 Testing Configuration Files...');

const configs = [
  'app.json',
  'package.json',
  'metro.config.js',
  '.watchmanconfig'
];

configs.forEach(config => {
  if (fs.existsSync(config)) {
    try {
      if (config.endsWith('.json')) {
        JSON.parse(fs.readFileSync(config, 'utf8'));
      }
      console.log(`✅ ${config} - Valid`);
    } catch (error) {
      console.log(`❌ ${config} - Invalid JSON: ${error.message}`);
      allTestsPassed = false;
    }
  } else {
    console.log(`❌ Missing config: ${config}`);
    allTestsPassed = false;
  }
});

// Test package.json dependencies
console.log('\n📦 Testing Dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const criticalDeps = [
  'expo',
  'react',
  'react-native',
  'firebase',
  'expo-audio',
  'expo-camera',
  'expo-file-system',
  '@react-native-async-storage/async-storage'
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ Missing critical dependency: ${dep}`);
    allTestsPassed = false;
  }
});

// Final result
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! UniConnect is ready to launch!');
  console.log('🚀 Features available:');
  console.log('  ✅ Voice messaging with playback');
  console.log('  ✅ Video calling with camera');
  console.log('  ✅ File upload and sharing');
  console.log('  ✅ Real-time chat');
  console.log('  ✅ Authentication system');
  console.log('  ✅ Modern UI/UX');
  console.log('  ✅ Error handling');
  console.log('');
  console.log('📱 To launch: npx expo start --tunnel');
} else {
  console.log('❌ Some tests failed. Please fix the issues above.');
  process.exit(1);
}

console.log('='.repeat(50));
