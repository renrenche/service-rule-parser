# service-rule-parser

> 业务规则解析器，PM 可以用类似于 SQL 的语句编写业务规则，负责解析成 JSON 格式的规则声明。目前支持的逻辑运算符只有 AND。

**由于依赖包的限制，SQL 解析的时候不支持字段和条件名的大写，建议使用 `snake_case`，否则会导致解析出来的字段匹配不上。**

## Installation

```sh
$ npm install --save service-rule-parser
```

## Usage

```js
const parser = require('service-rule-parser');
const result = parser.parse('SET maxfee=8000 WHERE car_price=10');
// result: { operation: { maxfee: 8000 }, conditions: { car_price: { eq: 10 } } };

```
## License

MIT © [wangshijun]()

