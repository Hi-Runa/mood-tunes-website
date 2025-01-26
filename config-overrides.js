// module.exports = function override(config, env) {
//     const babelLoader = config.module.rules.find(
//       (rule) => rule.loader && rule.loader.includes('babel-loader')
//     );
//     if (babelLoader) {
//       const options = babelLoader.options;
//       options.plugins = [
//         ...(options.plugins || []),
//         '@babel/plugin-proposal-optional-chaining',
//         '@babel/plugin-proposal-nullish-coalescing-operator'
//       ];
//     }
//     return config;
//   };
  
const { override, addBabelPlugin } = require("customize-cra");

module.exports = override(
  addBabelPlugin('@babel/plugin-proposal-optional-chaining'),
  addBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator')
);
