const express = require('express');
const app = express();
const path = require('node:path');
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
const { getSolves, getSolveById, insertSolves, deleteSolve, getBestSolve } = require('./models/solveModels.js');

app.set('view engine', 'ejs');
// publicディレクトリ以下のファイルを静的ファイルとして配信
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).send('Internal Server Error');
});

async function main() {
        await client.connect();

        const db = client.db('cube-timer');

        // メインページ
        app.get('/', async (req, res) => {
                res.render(path.join(__dirname, 'views', 'index.ejs'));
        });

        // 履歴を最新順にとってくる
        app.get('/api/times', async (req, res) => {
                const { status, body } = await getSolves(db);
                res.status(status).send(body);
        });

        // 履歴をidからとってくる
        app.get('/api/times/:id', async (req, res) => {
                const id = req.params.id;
                const { status, body } = await getSolveById(db, id);
                res.status(status).send(body);
        });

        // DBを更新する
        app.post('/api/times', express.json(), async (req, res) => {
                const time = req.body.time;
                const scramble = req.body.scramble;
                const { status, body } = await insertSolves(db, time, scramble);
                res.status(status).send(body);
        });

        // idでDBから削除する
        app.delete('/api/times/:id', async (req, res) => {
                const id = req.params.id;
                const { status, body } = await deleteSolve(db, id);
                res.status(status).send(body);
        });

        // ベストタイムを取得する
        app.get('/api/best', async (req, res) => {
                const { status, body } = await getBestSolve(db);
                if (status == 200) {
                        res.status(status).json(body);
                } else {
                        res.status(status).send(body);
                }
        });

        app.listen(3000, () => {
                console.log('start listening');
        });
}
main();
