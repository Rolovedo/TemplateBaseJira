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
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@styles': path.resolve(__dirname, 'src/styles')
    };
    
    // Configurar SASS para silenciar advertencias deprecadas
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    if (oneOfRule) {
        const sassRule = oneOfRule.oneOf.find(rule => 
            rule.test && rule.test.toString().includes('scss|sass')
        );
        
        if (sassRule && sassRule.use) {
            const sassLoaderIndex = sassRule.use.findIndex(loader => 
                loader.loader && loader.loader.includes('sass-loader')
            );
            
            if (sassLoaderIndex !== -1) {
                const originalSassLoader = sassRule.use[sassLoaderIndex];
                sassRule.use[sassLoaderIndex] = {
                    ...originalSassLoader,
                    options: {
                        ...originalSassLoader.options,
                        sassOptions: {
                            ...originalSassLoader.options?.sassOptions,
                            silenceDeprecations: ['legacy-js-api', 'import']
                        }
                    }
                };
            }
        }
    }
    
    return config;
};
