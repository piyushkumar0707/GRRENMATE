module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeDetection: false, // Disable automatic locale detection for better control
  },
  localePath: typeof require !== 'undefined' ? require('path').resolve('./public/locales') : './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // Namespace configuration
  ns: [
    'common', 
    'navigation', 
    'plants', 
    'care', 
    'community', 
    'ai', 
    'auth', 
    'errors', 
    'success'
  ],
  defaultNS: 'common',
  
  // Interpolation options
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  
  // Development options
  debug: process.env.NODE_ENV === 'development',
  
  // React options
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
  },
  
  // Fallback language configuration
  fallbackLng: {
    'es': ['en'],
    'default': ['en']
  },
  
  // Load options
  load: 'languageOnly',
  
  // Key separator
  keySeparator: '.',
  nsSeparator: ':',
  
  // Pluralization
  pluralSeparator: '_',
  contextSeparator: '_',
  
  // Backend options (if using backend loading)
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  }
}