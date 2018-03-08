const uuid = require('node-uuid');
const sha256 = require('sha256');
const _ = require('lodash');
let recentBlock;
let myAddress = 'abc';
let blockDatabase = {};

function isValidTransactions(block) {
    let transactionWithoutInput = 0;
    let compareStatus = true;
    let allTransferTransactionsValid = true;

    block.transactions.forEach(item => {
        if (!item.input || 0 === item.input.length) {
            transactionWithoutInput++;
        } else {
            if (getTransactionInputSum(item) < getTransactionOutputSum(item))
                allTransferTransactionsValid = false;
        }
    });
    if (sumOfInputsAmount(block) < sumOfOutputsAmount(block)) {
        if (sumOfOutputsAmount(block) - sumOfInputsAmount(block) !== 50) {
            compareStatus = false;
        }
    }
    return transactionWithoutInput <= 1 && compareStatus && allTransferTransactionsValid;
}
function isValid(block) {
    if (!block) {
        return false;
    }

    if (!block.transactions) {
        return false;
    }
    if (block.parentBlock !== (recentBlock && getBlockHash(recentBlock))) {
        return false
    }
    if (!isValidTransactions(block)) {
        return false;
    }
    return true;

}

function addBlock(block) {
    let blockHash = getBlockHash(block);
    if (isValid(block) && !blockDatabase[blockHash]) {
        recentBlock = block;
        blockDatabase[blockHash] = block;
        return true;
    }
    return false;
}

function sumOfOutputsAmount(block) {
    let sumOfOutputs = 0;
    block.transactions.forEach(function countValueOfOutput(transaction) {
        transaction.output && transaction.output.forEach(item => {
            sumOfOutputs += item.amount;
        });
    });
    return sumOfOutputs
}

function sumOfInputsAmount(block) {
    let sumOfInputs = 0;
    block.transactions.forEach(function countValueOfOutput(transaction) {
        transaction.input && transaction.input.forEach(item => {
            sumOfInputs += item.amount;
        });
    });
    return sumOfInputs
}

function getBlocSums(block) {
    let sumOfInputs = 0;
    let sumOfOutputs = 0;
    block.transactions.forEach(function countValueOfOutput(transaction) {
        sumOfInputs += getTransactionInputSum(transaction);
        sumOfOutputs += getTransactionOutputSum(transaction);
    });
    return {
        sumOfInputs,
        sumOfOutputs,
    }
}

function getTransactionInputSum(transaction) {
    let sum = 0;
    transaction.input && transaction.input.forEach(item => sum += item.amount);
    return sum;
}

function getTransactionOutputSum(transaction) {
    let sum = 0;
    transaction.output && transaction.output.forEach(item => sum += item.amount);
    return sum;
}

function compareAmountInputsAndOutputs(sumOfInputs, sumOfOutputs) {
    if (sumOfOutputs > sumOfInputs) {
        sumOfOutputs = coinbase.output[0].amount + sumOfOutputs
    }
    return sumOfOutputs
}


function mineBlock() {
    let coinbase = {
        // input: [],
        output: [{address: myAddress, amount: 50}]
    };
    let newBlock = {
        transactions: [coinbase],
        parentBlock: recentBlock && recentBlock.hash
    };
    newBlock.hash = uuid.v4();
    addBlock(newBlock);
}

function printBlockchain() {
    console.log('===============');
    let currentBlock = recentBlock;
    while (currentBlock) {
        console.log(currentBlock.hash, currentBlock.parentBlock);
        currentBlock = blockDatabase[currentBlock.parentBlock]
    }
}

function getBlockHash(block) {
   return sha256(JSON.stringify(_.pick(block, 'parentBlock','transactions')))
}
module.exports = {
    getBlockHash,
    addBlock,
    mineBlock,
    isValid,
    isValidTransactions
};
//
// printBlockchain()
// mineBlock()
// printBlockchain()
// mineBlock()
// printBlockchain()
// mineBlock()
// mineBlock()
// mineBlock()
// printBlockchain()

// printBlockchain();
// mineBlock();
// mineBlock();
// // addBlock({hash:123});
// // addBlock({hash:321,parentBlock:123});
// printBlockchain();
// console.log(blockDatabase);