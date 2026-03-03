const { test } = require('node:test');
const assert = require('node:assert');
const { getSolves, getSolveById, insertSolves, deleteSolve, getBestSolve } = require('../models/solveModels');

test('getSolves - 成功時', async (t) => {
    const dummyData = [
        { time: 10.123, scramble: 'R U F' },
        { time: 3.54, scramble: 'D B L' },
        { time: 11.3, scramble: "F2 D' B2" }
    ];

    const mockSort = t.mock.fn(() => {
        return {
            toArray: async () => dummyData // 最終的にダミーデータを返す
        };
    });

    const mockFind = t.mock.fn(() => {
        return { sort: mockSort }; // findの次はsortが呼ばれるように繋ぐ
    });

    const mockCollection = t.mock.fn(() => {
        return { find: mockFind }; // collectionの次はfindが呼ばれるように繋ぐ
    });

    const db = {
        collection: mockCollection
    };

    const { status, body } = await getSolves(db);
    assert.strictEqual(status, 200, '正しくステータスコード200を返す');
    assert.deepStrictEqual(body, dummyData, 'DBから取得した配列データがそのまま返る');
    assert.deepStrictEqual(mockSort.mock.calls[0].arguments[0], { _id: -1 }, '最新順にソートするようDBに命令しているか')
});

test('getSolves - 失敗時', async (t) => {
    const dbError = {
        collection: () => {
            throw new Error('DB Connection Failed');
        }
    };

    const { status, body } = await getSolves(dbError);
    assert.strictEqual(status, 500, 'エラー時は500を返す');
    assert.strictEqual(body, 'Internal Server Error', '正しいエラーメッセージを返す');
});

test('getSolveById - 成功時', async (t) => {
    const targetId = '123456789012345678901234';
    const dummyData = { _id: targetId, time: 10.5, scramble: 'R U R' };

    const mockFindOne = t.mock.fn(() => dummyData);
    const mockCollection = t.mock.fn(() => ({ findOne: mockFindOne }));
    const db = { collection: mockCollection };

    const { status, body } = await getSolveById(db, targetId);
    assert.strictEqual(status, 200);
    assert.deepStrictEqual(body, dummyData);
    assert.strictEqual(mockCollection.mock.calls[0].arguments[0], 'solves');
});

test('getSolveById - 失敗時', async (t) => {
    const mockCollection = t.mock.fn(() => { throw new Error('DB Error'); });
    const db = { collection: mockCollection };

    const { status, body } = await getSolveById(db, 'dummyId');
    assert.strictEqual(status, 500);
    assert.strictEqual(body, 'Internal Server Error');
});

test('insertSolves - 成功時', async (t) => {
    const mockInsertOne = t.mock.fn(async () => ({ acknowledged: true }));
    const mockCollection = t.mock.fn(() => ({ insertOne: mockInsertOne }));
    const db = { collection: mockCollection };

    const { status, body } = await insertSolves(db, "12.34", "U R2 F");
    assert.strictEqual(status, 200);
    assert.strictEqual(body, 'Created');
    const insertedData = mockInsertOne.mock.calls[0].arguments[0];
    assert.strictEqual(insertedData.time, 12.34); 
    assert.strictEqual(insertedData.scramble, "U R2 F");
});

test('insertSolves - 失敗時: timeが無い場合', async (t) => {
    const db = { collection: t.mock.fn() };
    const { status, body } = await insertSolves(db, null, "U R2 F"); // timeがnull
    assert.strictEqual(status, 400);
    assert.strictEqual(body, 'Bad Request');
});

test('insertSolves - 失敗時: scrambleが無い場合', async (t) => {
    const db = { collection: t.mock.fn() };
    const { status, body } = await insertSolves(db, 10.5, ""); // scrambleが空

    assert.strictEqual(status, 400);
    assert.strictEqual(body, 'Bad Request');
});

test('insertSolves - 失敗時: DBエラー時', async (t) => {
    const mockCollection = t.mock.fn(() => { throw new Error('DB Error'); });
    const db = { collection: mockCollection };

    const { status, body } = await insertSolves(db, 10.5, "R U");
    assert.strictEqual(status, 500);
    assert.strictEqual(body, 'Internal Server Error');
});

test('deleteSolve - 成功時', async (t) => {
    const mockDeleteOne = t.mock.fn(async () => ({ deletedCount: 1 })); 
    const mockCollection = t.mock.fn(() => ({ deleteOne: mockDeleteOne }));
    const db = { collection: mockCollection };

    const { status, body } = await deleteSolve(db, '123456789012345678901234');
    assert.strictEqual(status, 200);
    assert.strictEqual(body, 'Deleted');
});

test('deleteSolve - 失敗時: IDが存在しない場合', async (t) => {
    const mockDeleteOne = t.mock.fn(async () => ({ deletedCount: 0 })); 
    const mockCollection = t.mock.fn(() => ({ deleteOne: mockDeleteOne }));
    const db = { collection: mockCollection };

    // 24文字のダミーIDを渡す
    const { status, body } = await deleteSolve(db, '123456789012345678901234');
    
    assert.strictEqual(status, 404);
    assert.strictEqual(body, 'Not Found');
});

test('deleteSolve - 失敗時: DBエラー時', async (t) => {
    const mockCollection = t.mock.fn(() => { throw new Error('DB Error'); });
    const db = { collection: mockCollection };

    const { status, body } = await deleteSolve(db, 'dummyId');
    assert.strictEqual(status, 500);
    assert.strictEqual(body, 'Internal Server Error');
});