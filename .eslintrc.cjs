module.exports = {
  root: true,
  // 它是专门针对 Vue 单文件组件编写的解析器
  parser: 'vue-eslint-parser',
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    // 此规则是自动按需加载时防止 Eslint 校验不通过
    './eslintrc-auto-import.json',
    // airbnb 代码风格
    'airbnb-base',
    // 使用 eslint-plugin-vue 中 vue3-essential 配置项的规则集合
    'plugin:vue/vue3-essential',
    // 使用 eslint-plugin-prettier 中 recommended 配置项的规则集合
    'plugin:prettier/recommended',
  ],
  overrides: [],
  parserOptions: {
    // 指定要解析的 ECMAScript 版本
    ecmaVersion: 'latest',
    // 指定 ECMAScript 模块的类型
    sourceType: 'module',
    // 指定解析器
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
  },
  // 导入 eslint-plugin-vue 和 @typescript-eslint/eslint-plugin
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // 规则配置
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 0,
    'vue/multi-word-component-names': [
      'error',
      // 需要忽略的组件名
      {
        ignores: ['index', '403', '404', '500'], // 需要忽略的组件名
      },
    ],
    // 处理 prettier 和 eslint 冲突的规则
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        singleQuote: true,
        semi: true,
      },
    ],
  },
};
