# service-rule-parser

> 服务费规则解析器，PM 可以用类似于 SQL 的语句编写服务费规则，负责解析成 JSON 格式的规则声明。目前支持的规则运算符只有 AND

## Installation

```sh
$ npm install --save service-rule-parser
```

## Usage

```js
const parser = require('service-rule-parser');
const result = parser.parse('SET maxFee=8000 WHERE carPrice=10');
// result: { operation: { maxFee: 8000 }, conditions: { carPrice: { eq: 10 } } };

```
## License

MIT © [wangshijun]()

