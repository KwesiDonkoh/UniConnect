const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle potential file watching issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Exclude problematic directories from file watching
config.watchFolders = [];
config.resolver.blockList = [
  // Block macOS specific directories that might cause issues on Linux
  /.*\/node_modules\/.*\/macos\/.*/,
  /.*\/node_modules\/.*\/ios\/.*\.xcodeproj\/.*/,
  /.*\/node_modules\/.*\/android\/.*\.iml/,
];

// Transformer configuration for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
