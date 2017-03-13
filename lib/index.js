/**
 * Generate SQl-UPDATE-Compatible string to conditions and operations
 *
 * @link https://github.com/codeschool/sqlite-parser
 */
const pkgInfo = require('../package.json');

const _ = require('lodash');
const util = require('util');
const debug = require('debug')(pkgInfo.name);
const parser = require('sqlite-parser');

const LOGIC_AND = 'and';
const LOGIC_OR = 'or';

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

/**
 * 从 ast 语法树节点中解析出正确的值
 * @param {object} ast
 */
const parseValue = (ast) => {
    let value = '';
    if (ast.variant === 'decimal') {
        value = Number(ast.value);
    } else if (ast.variant === 'column') {
        value = ast.name;
    } else {
        value = ast.value;
    }

    try {
        value = JSON.parse(value);
        return (typeof value === 'undefined') ? null : value;
    } catch (e) {
        return value;
    }
};

/**
 * 往 obj 中增加一个新的条件
 * @param {*} obj 存储条件的对象
 * @param {object} ast 解析条件的 ast
 */
const addCondition = (obj, ast) => {
    debug('CONDITION: \n' + util.inspect(ast, { depth: 20, colorize: true }));
    const { left, right, operation } = ast;
    const key = left.name;
    const value = parseValue(right);  // FIXME string literals needs quotes
    if (typeof obj[key] === 'undefined') {
        obj[key] = {};
    }
    obj[key][OPERATORS.get(operation)] = value;
    return obj;
};

/**
 * 把更新还原成代码，参数实例:
 *
 * [{
    type: 'assignment',
    target: { type: 'identifier', variant: 'column', name: 'name' },
    value: {
        type: 'expression',
        format: 'binary',
        variant: 'operation',
        operation: '+',
        left: { type: 'identifier', variant: 'column', name: 'counter' },
        right: { type: 'literal', variant: 'decimal', value: '1' }
    }
}],
 */
const parseOperation = (set) => {
    if (Array.isArray(set) === false) {
        return {};
    }

    const _parseAssignment = (ast) => {
        if (ast.left.type === 'expression') {    // TODO parse nested
            return `${_parseAssignment(ast.left)} ${ast.operation} ${_parseAssignment(ast.right)}`;
        }

        return `${parseValue(ast.left)} ${ast.operation} ${parseValue(ast.right)}`;
    };

    const operations = {};
    set.forEach((op) => {
        const key = op.target.name;
        let value = '';
        if (op.value.type === 'expression') {
            value = _parseAssignment(op.value);
            debug('OPERATION: \n' + util.inspect({ op, key, value }, { depth: 20, colorize: true }));
        } else {
            value = parseValue(op.value);
        }

        operations[key] = value;
    });

    return operations;
};

/**
 * 把条件数组解析成对象，参数实例:
 * {
    type: 'expression',
    format: 'binary',
    variant: 'operation',
    operation: 'and',
    left: {
        type: 'expression',
        format: 'binary',
        variant: 'operation',
        operation: '=',
        left: { type: 'identifier', variant: 'column', name: 'id' },
        right: { type: 'literal', variant: 'decimal', value: '123' }
    },
    right: {
        type: 'expression',
        format: 'binary',
        variant: 'operation',
        operation: '=',
        left: { type: 'identifier', variant: 'column', name: 'uid' },
        right: { type: 'literal', variant: 'decimal', value: '456' }
    }
}
 */
const parseCondition = (where) => {
    const conditions = [];

    const parseAndCondition = (ast) => {
        const condition = {};
        debugger;

        addCondition(condition, ast.right);

        while (OPERATORS.has(ast.left.operation) === false) {
            addCondition(condition, ast.left.right);
            ast = ast.left;
        }

        addCondition(condition, ast.left);

        conditions.push(condition);
    };


    // 如果是 AND 结果中只有1个，目前 AND 内部不支持 OR
    if (where.operation === LOGIC_AND) {
        parseAndCondition(where);

    // 如果是 OR，结果中是多组条件
    } else if (where.operation === LOGIC_OR) {
        const cRight = {};
        addCondition(cRight, where.right);
        conditions.push(cRight);

        while (OPERATORS.has(where.left.operation) === false) {
            if (where.left.operation === LOGIC_AND) {
                parseAndCondition(_.cloneDeep(where.left));
            } else if (where.left.right.operation === LOGIC_AND) {
                parseAndCondition(_.cloneDeep(where.left.right));
            } else {
                const cTmp = {};
                addCondition(cTmp, where.left.right);
                conditions.push(cTmp);
            }

            where = where.left;
        }

        if (where.operation === LOGIC_OR) {
            const cLeft = {};
            addCondition(cLeft, where.left);
            conditions.push(cLeft);
        }

    // 只有1个条件的情形
    } else {
        const tmp = {};
        addCondition(tmp, where);
        conditions.push(tmp);
    }

    return conditions.length > 1 ? conditions.reverse() : conditions.pop();
};

/**
 * Parse expression into condition and operation
 * @param {string} expression
 * @returns {object} null if failed { operation, condition }
 */
const parse = (expression) => {
    if (typeof expression !== 'string') {
        debug(`${pkgInfo.name}: expect 'expression' arg to be a string`);
        return null;
    }

    const sanitized = expression.replace(/\s+/g, ' ').replace(/，/g, ',').replace(/＞/g,'>').replace(/＜/g,'<');
    const matches = sanitized.match(PATTERN);
    if (matches === null) {
        debug(`${pkgInfo.name}: 'expression' must be in 'SET xxx=xxx WHERE yyy=yyy' format ${expression}`);
        return null;
    }

    try {
        const ast = parser(`UPDATE config ${sanitized}`);
        const { set, where } = ast.statement[0];
        debug('AST: \n' + util.inspect(ast, { depth: 20, colorize: true }));
        return {
            operation: parseOperation(set),
            condition: where.length ? parseCondition(where.pop()) : null,
        };
    } catch (e) {
        debug(`${pkgInfo.name}: rule parse failed: ${e.message}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(e);
        }
        return null;
    }
};

module.exports = {
    parse,
    parseOperation,
    parseCondition,
    parseValue,
};
