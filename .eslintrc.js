module.exports = {
    parser: 'babel-eslint',
    extends: 'airbnb-base',
    plugins: ['import'],
    env: {
        es6: true,
        browser: true,
        node: true,
        mocha: true,
    },
    rules: {
        // 缩进调整为 4 空格，airbnb 为 2 空格
        indent: [2, 4, { SwitchCase: 1 }],
        // 不禁用 console
        'no-console': 'off',
        // 不强制函数表达式有名字
        'func-names': 'off',
        // 不禁用 amd 的 require
        'import/no-amd': 'off',
        'import/no-extraneous-dependencies': 'off',
        // 不禁用 ES6 import 无法解析的模块
        'import/no-unresolved': 'off',
        // 不强制全局 require
        'global-require': 'off',
        // 由于是 4 空格缩进，将每行最大长度放宽到 240，airbnb 为 100
        'max-len': [2, 240, 2, { ignoreUrls: true, ignoreComments: false }],
        // 不禁止 for in 循环
        'no-restricted-syntax': [2, 'DebuggerStatement', 'LabeledStatement', 'WithStatement'],
        // 不禁止使用下划线作为变量名前缀
        'no-underscore-dangle': ['off'],
        // 不强制 return
        'consistent-return': ['off'],
        // 不强制使用 => 代替函数
        'prefer-arrow-callback': ['off'],
        // 不强制使用 camel case 命名
        camelcase: ['error'],
        // 允许修改参数
        'no-param-reassign': ['off'],
        // 不强制链式操作另起一行
        'newline-per-chained-call': ['off'],
        'no-unused-expressions': ['off'],
    },
};
