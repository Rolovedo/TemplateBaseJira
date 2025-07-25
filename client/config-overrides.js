const path = require('path');

module.exports = function override(config, env) {
    config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@hook': path.resolve(__dirname, 'src/hook'),
        '@assets': path.resolve(__dirname, 'src/assets'), // ← Agregar esta línea
        '@styles': path.resolve(__dirname, 'src/styles')  // ← Agregar esta línea
    };
    
    return config;
};
