const { ObjectId } = require('mongodb');

async function getSolves(db) {
    try {
        const times = await db.collection('solves').find().sort({ _id: -1 }).toArray(); // 最新順にソートする必要がある
        return { status: 200, body: times }
    } catch (err) {
        console.error(err);
        return { status: 500, body: 'Internal Server Error' }
    }
}

async function getSolveById(db, id) {
    try {
        const time = await db.collection('solves').findOne({ _id: new ObjectId(id) });
        return { status: 200, body: time }
    } catch (err) {
        console.error(err);
        return { status: 500, body: 'Internal Server Error' }
    }
}

async function insertSolves(db, time, scramble) {
    try {
        if (!time) {
            return { status: 400, body: 'Bad Request' }
        }
        if (!scramble) {
            return { status: 400, body: 'Bad Request' }
        }
        await db.collection('solves').insertOne({ time: parseFloat(time), scramble: scramble });
        return { status: 200, body: 'Created' }
    } catch (err) {
        console.error(err);
        return { status: 500, body: 'Internal Server Error' }
    }
}

async function deleteSolve(db, id) {
    try {
        const result = await db.collection('solves').deleteOne({ _id: new ObjectId(id) })
        if (result.deletedCount === 0) {
            return { status: 404, body: 'Not Found' }
        }
        return { status: 200, body: 'Deleted' }
    } catch (err) {
        console.error(err);
        return { status: 500, body: 'Internal Server Error' }
    }
}

async function getBestSolve(db) {
    try {
        const best = await db.collection('solves').find().sort({ time: 1 }).limit(1).toArray();
        if (best.length > 0) {
            return { status: 200, body: best[0] }
        } else {
            return { status: 200, body: null }
        }
    } catch (err) {
        console.error(err);
        return { status: 500, body: 'Internal Server Error' }
    }
}

exports.getSolves = getSolves;
exports.getSolveById = getSolveById;
exports.insertSolves = insertSolves;
exports.deleteSolve = deleteSolve;
exports.getBestSolve = getBestSolve;