module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: '> 1%'
        },
        useBuiltIns: 'usage',
        corejs: '2',
        forceAllTransforms: true,
        modules: false
      }
    ],
    '@babel/react'
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/env',
          {
            targets: {
              browsers: '> 1%'
            },
            useBuiltIns: 'usage',
            corejs: '2',
            forceAllTransforms: true
          }
        ],
        '@babel/react'
      ]
    }
  },
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true
      }
    ],
    '@babel/plugin-transform-async-to-generator',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties'
  ]
}
