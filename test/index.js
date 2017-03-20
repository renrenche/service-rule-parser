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
        expect(parser.parse('SET a=b WHERE test=1 AND test2=2 AND test3=3')).to.be.a('object');
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

    it('should return expected result when OR operation', function () {
        const result = parser.parse('SET a=b，b="c" WHERE test>1 OR test<2 OR test<>2.5');
        console.log(result);
        expect(result.operation).to.be.a('object');
        expect(result.operation.a).to.equal('b');
        expect(result.operation.b).to.equal('c');
        expect(result.condition).to.be.a('array');
        expect(result.condition.length).to.equal(3);
        expect(result.condition[0].test).to.be.a('object');
        expect(result.condition[1].test).to.be.a('object');
        expect(result.condition[2].test).to.be.a('object');
        expect(result.condition[0].test.gt).to.equal(1);
        expect(result.condition[1].test.lt).to.equal(2);
        expect(result.condition[2].test.neq).to.equal(2.5);
    });

    it('should return expected result when valid param', function () {
        const result = parser.parse('SET minFee =2000, maxFee= 8000,    feeRatio = 0.03,display=true,nullable=null WHERE   carPrice<   10 AND carPrice >5 AND emission <= 4');
        console.log(result);
        expect(result.operation).to.be.a('object');
        expect(result.operation.minfee).to.equal(2000);
        expect(result.operation.maxfee).to.equal(8000);
        expect(result.operation.feeratio).to.equal(0.03);
        expect(result.operation.display).to.equal(true);
        expect(result.operation.nullable).to.equal(null);
        expect(result.condition).to.be.a('object');
        expect(result.condition.carprice).to.be.a('object');
        expect(result.condition.carprice.lt).to.equal(10);
        expect(result.condition.carprice.gt).to.equal(5);
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
        expect(result.operation.minfee).to.equal(2000);
        expect(result.operation.maxfee).to.equal(8000);
        expect(result.operation.feeratio).to.equal(0.03);
        expect(result.operation.display).to.equal(true);
        expect(result.operation.nullable).to.equal(null);
        expect(result.condition).to.be.a('object');
        expect(result.condition.carprice).to.be.a('object');
        expect(result.condition.carprice.lt).to.equal(10);
        expect(result.condition.carprice.gt).to.equal(5);
        expect(result.condition.emission.lte).to.equal(4);
    });

    it('should return expected result when valid param: OR + AND', function () {
        const result = parser.parse(`SET
                display=true
            WHERE
                price>80
                OR fuel_type='汽油'
                OR fuel_type='柴油'`);
        console.log(result);
        expect(result.operation).to.be.an('object');
        expect(result.operation.display).to.equal(true);
        expect(result.condition).to.be.an('array');

        expect(result.condition[0].price.gt).to.equal(80);
        expect(result.condition[1].fuel_type.eq).to.equal('汽油');
        expect(result.condition[2].fuel_type.eq).to.equal('柴油');
    });

    it('should return expected result when operation is statement', function () {
        const result = parser.parse('SET count= count+ 1 WHERE 1 <= 4');
        expect(result.operation).to.be.a('object');
        expect(result.operation.count).to.equal('count + 1');
    });

    it('should return expected result when operation is statement', function () {
        const result = parser.parse('SET count= count*1 WHERE 1 <= 4');
        expect(result.operation).to.be.a('object');
        expect(result.operation.count).to.equal('count * 1');
    });

    it('should return expected result when operation is statement', function () {
        const result = parser.parse('SET sum= total*price WHERE 1 <= 4');
        expect(result.operation).to.be.a('object');
        expect(result.operation.sum).to.equal('total * price');
    });

    it('should return expected result when operation is complex statement', function () {
        const result = parser.parse('SET sum= total*price - price * 2 WHERE 1 <= 4');
        expect(result.operation).to.be.a('object');
        expect(result.operation.sum).to.equal('total * price - price * 2');
    });
});

