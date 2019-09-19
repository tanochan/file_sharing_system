/**
 * ミドルウェア的なやつ
 */
import { fork, take, call, put, join, select } from 'redux-saga/effects';
import { NemProvider } from '../providers/nem';
const nem = new NemProvider();
import { Convert } from '../providers/convert';
const convert = new Convert();
import {
    fetchNemFile,
    successFetchNemFile,
    convertFile,
    successConvertFile,
    generateWallet,
    successGenerateWallet
} from './actions';

function* fetchFileFlow() {
    while(true) {
        const { payload } = yield take(fetchNemFile); // Actionを待つ、イベントの発生を待つ
        const { address, privateKey } = payload;
        // 全てのトランザクションを取得
        address = "TBKRMOC5R4N22CFQQG7MWQFZEREOKDINZM67XJT7";
        const transactions = yield call(nem.getAllTransactions, address); // Promiseの完了を待つ
        console.log('below is transaction');
        console.log(transactions);

        // MetaDataを取得
        //const metaData = yield call(nem.getMetaData(transactions, privateKey));
        //console.log(metaData);
        // metaDataを基準に目的のファイルデータを取得

        // ファイルデータを取得
        //const base64 = 
        privateKey = '50493eaaf777e0cdf4a7564dad4f615123538f1304c7a77205b3e4ddeb6e1620';
        const base64 = yield call(nem.getBase64, transactions, privateKey);
        console.log('below is base64');
        console.log(base64);

        // トランザクションからメダデータを取得
        // const metaData = yield call(nem.getMetaData, transactions, privateKey);
        // if(!metaData){
        //     throw new Error('metaDataがありません');
        // }
        // console.log('below is binaries');
        // console.log(metaData);
        // const base64 = yield call(nem.mergeBinaryToBase64, transactions, metaData, privateKey);
        // console.log('base64 is below!');
        // console.log(base64);
        // if(metaData && base64) {
        //     console.log('active!');
        //     yield put(successFetchNemFile({metaData, base64})); // Actionをdispatchする
        // } else {
        //     console.log('FAILED FETCH NEM FILE');
        //     //TODO: impl
        // }

        const metaData = null;
        if(base64) {
            console.log('active!');
            yield put(successFetchNemFile({metaData, base64})); // Actionをdispatchする
        } else {
            console.log('FAILED FETCH NEM FILE');
            //TODO: impl
        }
    }
}

function* convertFileFlow() {
    while(true) {
        const { payload } = yield take(convertFile);
        const { address, privateKey, file } = payload;

        convert.setAddress(address);
        convert.setPrivateKey(privateKey);
        convert.setFile(file);
        // ファイルをBase64に変換し、トランザクションを作成する
        convert.createBase64();
        //const array_transaction = convert.createTransaction();

        // if(array_transaction){
        //     console.log('active');
        //     yield put(successConvertFile({array_transaction}));
        // }else {
        //     console.log('FAILED CONVERT NEM FILE');
        // }
    }
}

function* generateWalletFlow() {
    while(true) {
        const { payload } = yield take(generateWallet);
        const { walletName } = payload;

        // ウォレットを作成する
        convert.generateWallet(walletName);
        const generate_address = convert.getAddress();
        const generate_privateKey = convert.getPrivateKey();

        if(generate_address && generate_privateKey) {
            yield put(successGenerateWallet({generate_address, generate_privateKey}));
        }else {
            console.log('FAILED GENERATE WALLET');
        }
    }
}

export default function* rootSaga() {
    yield fork(fetchFileFlow);
    yield fork(convertFileFlow);
    yield fork(generateWalletFlow);
}