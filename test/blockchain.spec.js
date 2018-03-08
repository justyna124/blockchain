const expect = require('chai').expect;

const blockchain = require('../blockchain');

describe('blockchain', () => {
    describe('isValid', () => {
        describe('when block is undefined', () => {
            it('should return false', function () {
                expect(blockchain.isValid()).to.equal(false);
            });
        });
        describe('when block does not have transactions attribute', () => {
            it('should return false', function () {
                expect(blockchain.isValid({hash: 'a'})).to.equal(false);
            });
        });
        describe('when block does not have any transactions', () => {
            it('should return true', function () {
                expect(blockchain.isValid({hash: 'a', transactions: []})).to.equal(true);
            });
        });
        describe('when block has more than one transaction without input (coinbase)', () => {
            it('should return false', function () {
                let block = {
                    transactions: [
                        {},
                        {}
                    ]
                };
                expect(blockchain.isValid(block)).to.equal(false);
            });
        });
        describe('when block has more than one transaction without input (coinbase)', () => {
            it('should return false', function () {
                let block = {
                    transactions: [
                        {input: []},
                        {}
                    ]
                };
                expect(blockchain.isValid(block)).to.equal(false);
            });
        });
        describe('when block has just one transaction without input (coinbase)', () => {
            it('should return true', function () {
                let block = {
                    transactions: [
                        {input: [{address: 'abc', amount: 123.23}]},
                        {}
                    ]
                };
                expect(blockchain.isValid(block)).to.equal(true);
            });
        });

        describe('when sum of transaction inputs is smaller then sum of outputs', () => {
            it('should return false', function () {
                let block = {
                    transactions: [{
                        input: [{address: 'abc', amount: 10}],
                        output: [{address: 'abc', amount: 50}]
                    }]
                };
                expect(blockchain.isValid(block)).to.equal(false);
            });
        });

        describe('when sum of transaction inputs is equal to sum of outputs', () => {
            it('should return true', function () {
                let block = {
                    transactions: [{
                        input: [{address: 'abc', amount: 20}],
                        output: [{address: 'abc', amount: 20}]
                    }]
                };
                expect(blockchain.isValid(block)).to.equal(true);
            });
        });

        describe('when sum of transaction inputs is greater than to sum of outputs', () => {
            it('should return true', function () {
                let block = {
                    transactions: [{
                        input: [{address: 'abc', amount: 50}],
                        output: [{address: 'abc', amount: 20}]
                    }]
                };
                expect(blockchain.isValid(block)).to.equal(true);
            });
        });

        describe('when block contains only coinbase transaction with output equal to 50', () => {
            it('should return true', function () {
                let block = {
                    transactions: [{
                        output: [{address: 'abc', amount: 50}]
                    }]
                };
                expect(blockchain.isValid(block)).to.equal(true);
            });
        });
        describe('when block contains non-coinbase transactions that include miner fees', () => {
            describe('and coinbase transacion output does not equal 50+fees', () => {
                it('should return false', function () {
                    let block = {
                        transactions: [
                            {
                                output: [{address: '123', amount: 59}]
                            },
                            {
                                input: [{address: 'abc', amount: 20}],
                                output: [{address: 'abc', amount: 10}]
                            }]
                    };
                    expect(blockchain.isValid(block)).to.equal(false);
                });
            });
            describe('and coinbase transaction output equals to 50+fees', () => {
                it('should return true', function () {
                    let block = {
                        // hash: 'a',
                        transactions: [{
                            output: [{address: 'abc', amount: 50}]
                        },
                            {
                                input: [{address: 'abc', amount: 1}],
                                output: [{address: 'abc', amount: 1}]
                            }]
                    };
                    expect(blockchain.isValid(block)).to.equal(true);
                });
            });
            describe('and coinbase transaction output equals to 50+fees', () => {
                it('should return true', function () {
                    let block = {
                        // hash: 'a',
                        transactions: [{
                            output: [{address: 'abc', amount: 51}]
                        },
                            {
                                input: [{address: 'abc', amount: 2}],
                                output: [{address: 'abc', amount: 1}]
                            }]
                    };
                    expect(blockchain.isValid(block)).to.equal(true);
                });
            });
            describe('and there is no coinbase transaction but output equals to 50+inputs', () => {
                it('should return false', function () {
                    let block = {
                        // hash: 'a',
                        transactions: [{
                            input: [{address: 'abc', amount: 10}],
                            output: [
                                {address: 'abc', amount: 5},
                                {address: 'abc', amount: 55}
                            ]
                        }]
                    };
                    expect(blockchain.isValid(block)).to.equal(false);
                });
            });
        });
    });
    describe('addBlock', () => {
        describe('when blockchain is empty', () => {
            describe('and block is not valid', () => {
                it('should NOT be able to add block', function () {
                    expect(blockchain.addBlock()).to.equal(false)
                });
            });
            describe('and block is valid', () => {
                describe('and block has parentBlock property', () => {
                    it('should NOT be able to add block', function () {
                        let block = {
                            parentBlock: 'h',
                            transactions: []
                        };
                        expect(blockchain.addBlock(block)).to.equal(false)
                    });
                });
                describe('and block does not have parentBlock', () => {
                    let recentBlockHash;
                    it('should be able to add block', function () {
                        let block = {
                            transactions: []
                        };
                        recentBlockHash = blockchain.getBlockHash(block);
                        expect(blockchain.addBlock(block)).to.equal(true)
                    });
                    describe('and subsequent block is being added', () => {
                        describe('and subsequent block is being added', () => {
                            describe('and its parentBlock matches hash of recent block', () => {
                                it('should be able to add block', function () {
                                    let block = {
                                        parentBlock: recentBlockHash,
                                        transactions: []
                                    };
                                    expect(blockchain.addBlock(block)).to.equal(true)
                                });
                            });
                            describe('and its parentBlock does not match hash of recent block', () => {
                                it('should NOT be able to add block', function () {
                                    let block = {
                                        parentBlock: 'aaa',
                                        transactions: []
                                    };
                                    expect(blockchain.addBlock(block)).to.equal(false)
                                });
                            });
                        });
                    })
                });
            });
        });
    });
});