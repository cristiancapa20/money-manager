const { getDefaultConfig } = require('expo/metro-config');

// En web, Metro resuelve database/database.web.ts en lugar de database.ts,
// así no se carga expo-sqlite ni wa-sqlite.wasm.
module.exports = getDefaultConfig(__dirname);
