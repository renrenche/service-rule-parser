const querystring = require('querystring');

// operators supported
const OPERATORS = new Map();
OPERATORS.set('<>', 'neq');
OPERATORS.set('>=', 'gte');
OPERATORS.set('<=', 'lte');
OPERATORS.set('=', 'eq');
OPERATORS.set('>', 'gt');
OPERATORS.set('<', 'lt');

// string patterns supported
const PATTERN = /^\s?set\s+(.+)\s+where\s+(.+)$/i;

const parse = (expression) => {
    if (typeof expression !== 'string') {
        return null;
    }

    const matches = expression.match(PATTERN);
    if (matches === null) {
        return null;
    }

    return {
        operation: parseOperation(matches[1].trim()),
        condition: parseCondition(matches[2].trim()),
    };
};

const parseOperation = (expression) => {
    if (typeof expression !== 'string') {
        return null;
    }

    const operations = querystring.parse(expression.replace(/\s+/g, '').replace(/，/g, ','), ',', '=');
    for (const key in operations) {
        operations[key] = parseValue(operations[key]);
    }

    return operations;
};

/**
 * 把条件字符串解析成对象
 */
const parseCondition = (expression) => {
    if (typeof expression !== 'string') {
        return null;
    }

    const conditions = {};
    const tokens = expression
        .replace(/\s*=\s*/g, '=')
        .split(/\s*and\s*/i);   // only AND is supported now

    tokens.forEach((token) => {
        token = token.replace(/\s+/g, '');
        for (const [op, opInWords] of OPERATORS) {
            if (token.indexOf(op) === -1) {
                continue;
            }
            const [key, value] = token.split(op);
            if (typeof conditions[key] === 'undefined') {
                conditions[key] = {};
            }
            conditions[key][opInWords] = parseValue(value);

            return;
        }
    });

    return conditions;
};

const parseValue = (expression) => {
    expression = expression.replace(/^(\'|\")/, '').replace(/(\'|\")$/, '');
    if (Number.isNaN(Number(expression)) === false) {
        return Number(expression);
    }

    return expression;
};

module.exports = {
    parse,
    parseOperation,
    parseCondition,
    parseValue,
};

