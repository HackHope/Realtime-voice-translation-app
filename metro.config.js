// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
    resolver: {
        assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'onnx', 'wav'],
    },
    transformer: {
        assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
