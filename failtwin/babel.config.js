module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 50+) handles expo-router automatically; the old
    // 'expo-router/babel' plugin is deprecated and throws on SDK 51.
    presets: ['babel-preset-expo'],
  };
};
