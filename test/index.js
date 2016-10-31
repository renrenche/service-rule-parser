const expect = require('chai').expect;
const parser = require('../lib');

describe('service-rule-parser', function () {
    it('should have parse method', function () {
        expect(parser.parse).to.be.a('function');
    });

    it('should return null when invalid param type', function () {
        expect(parser.parse()).to.be.null;
        expect(parser.parse({})).to.be.null;
        expect(parser.parse(null)).to.be.null;
        expect(parser.parse(undefined)).to.be.null;
    });

    it('should return null when invalid param content', function () {
        expect(parser.parse('')).to.be.null;
        expect(parser.parse('test')).to.be.null;
    });

    it('should return object when valid param', function () {
        expect(parser.parse('SET a=b WHERE test=1')).to.be.a('object');
        expect(parser.parse('set a=b where test=1')).to.be.a('object');
        expect(parser.parse('sEt a=b Where test=1')).to.be.a('object');
    });

    it('should return expected result when valid param', function () {
        const result = parser.parse('SET a=b WHERE test>1 and test<2 and test<>2.5');
        console.log(result);
        expect(result.operation).to.be.a('object');
        expect(result.operation.a).to.equal('b');
        expect(result.condition).to.be.a('object');
        expect(result.condition.test).to.be.a('object');
        expect(result.condition.test.gt).to.equal(1);
        expect(result.condition.test.lt).to.equal(2);
        expect(result.condition.test.neq).to.equal(2.5);
    });

    it('should return expected result when zh_CN comma', function () {
        const result = parser.parse('SET a=b，b="c" WHERE test>1 and test<2 and test<>2.5');
        console.log(result);
        expect(result.operation).to.be.a('object');
        expect(result.operation.a).to.equal('b');
        expect(result.operation.b).to.equal('c');
        expect(result.condition).to.be.a('object');
        expect(result.condition.test).to.be.a('object');
        expect(result.condition.test.gt).to.equal(1);
        expect(result.condition.test.lt).to.equal(2);
        expect(result.condition.test.neq).to.equal(2.5);
    });

    it('should return expected result when valid param', function () {
        const result = parser.parse('SET minFee =2000, maxFee= 8000,    feeRatio = 0.03,display=true,nullable=null WHERE   carPrice<   10 AND carPrice >5 AND emission <= 4');
        console.log(result);
        expect(result.operation).to.be.a('object');
        expect(result.operation.minFee).to.equal(2000);
        expect(result.operation.maxFee).to.equal(8000);
        expect(result.operation.feeRatio).to.equal(0.03);
        expect(result.operation.display).to.equal(true);
        expect(result.operation.nullable).to.equal(null);
        expect(result.condition).to.be.a('object');
        expect(result.condition.carPrice).to.be.a('object');
        expect(result.condition.carPrice.lt).to.equal(10);
        expect(result.condition.carPrice.gt).to.equal(5);
        expect(result.condition.emission.lte).to.equal(4);
    });

    it('should return expected result when valid param: multiline', function () {
        const result = parser.parse(`SET
                minFee =2000,
                maxFee= 8000,
                feeRatio = 0.03,
                display=true,
                nullable=null
            WHERE
                carPrice<   10
                AND carPrice >5
                AND emission <= 4`);
        console.log(result);
        expect(result.operation).to.be.a('object');
        expect(result.operation.minFee).to.equal(2000);
        expect(result.operation.maxFee).to.equal(8000);
        expect(result.operation.feeRatio).to.equal(0.03);
        expect(result.operation.display).to.equal(true);
        expect(result.operation.nullable).to.equal(null);
        expect(result.condition).to.be.a('object');
        expect(result.condition.carPrice).to.be.a('object');
        expect(result.condition.carPrice.lt).to.equal(10);
        expect(result.condition.carPrice.gt).to.equal(5);
        expect(result.condition.emission.lte).to.equal(4);
    });
});

