const express = require('express');
const app = express();
const path = require('node:path');
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');

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
                try {
                        res.render(path.join(__dirname, 'views', 'index.ejs'));
                } catch (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                }
        });

        // 履歴を最新順にとってくる
        app.get('/api/times', async (req, res) => {
                try {
                        const times = await db.collection('solves').find().sort({ _id: -1 }).toArray(); // 最新順にソートする必要がある
                        res.status(200).json(times);
                } catch (err) {
                        console.error(err);
                        res.status(500).send('Get Error');
                }
        });

        // 履歴をidからとってくる
        app.get('/api/times/:id', async (req, res) => {
                try {
                        const id = req.params.id;
                        const times = await db.collection('solves').findOne({ _id: new ObjectId(id)});
                        res.status(200).json(times);
                } catch (err) {
                        console.error(err);
                        res.status(500).send('Get Error');
                }
        });

        // DBを更新する
        app.post('/api/times', express.json(), async (req, res) => {
                try {
                        const time = req.body.time;
                        const scramble = req.body.scramble;
                        if (!time) {
                                res.status(400).send('Bad Request');
                                return;
                        }
                        if (!scramble) {
                                res.status(400).send('Bad Request');
                                return ;
                        }
                        await db.collection('solves').insertOne({ time: time, scramble: scramble});
                        res.status(200).send('Appended');
                } catch (err) {
                        console.error(err);
                        res.status(500).send('Post Error');
                }
        });

        // idでDBから削除する
        app.delete('/api/times/:id', async (req, res) => {
                try {
                        const id = req.params.id;
                        const result = await db.collection('solves').deleteOne({ _id: new ObjectId(id)})
                        if (!result) {
                                return res.status(404).send('Not Found');
                        }
                        res.status(200).send('Deleted');
                } catch (err) {
                        console.error(err);
                        res.status(500).send('Delete Error');
                }
        });

        // ベストタイムを取得する
        app.get('/api/best', async (req, res) => {
                try {
                        const best = await db.collection('solves').find().sort({ time : 1 }).limit(1).toArray();
                        if (best.length > 0) {
                                res.status(200).json(best[0]);
                        } else {
                                res.status(200).json(null);
                        }
                } catch (err) {
                        console.error(err);
                        res.status(500).send('Get Error');
                }
        });

        app.listen(3000, () => {
                console.log('start listening');
        });
}
main();
