// データベースからタイム履歴を取得して画面に表示する
async function getTimes() {
    try {
        const response = await fetch('api/times', { method: 'GET' });
        const times = await response.json();

        // HTMLからリスト(ul)を取得して書き換える
        const historyList = document.getElementById('solve-history');

        historyList.innerHTML = '';
        times.forEach(record => {
            const li = document.createElement('li');
            li.dataset.id = record._id;
            // DBに{time:'12.34', scramble:'R U ...'}のように保存されているのを取り出す
            li.textContent = `${record.time}秒 (スクランブル: ${record.scramble})`;
            historyList.appendChild(li);
        });
    } catch (err) {
        console.error('タイムの取得に失敗しました: ', err);
    }
}

// データベースに保存する
async function saveTime(time, scramble) {
    try {
        const response = await fetch('/api/times', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ time: time, scramble: scramble }) })
        if (response.ok) {
            getTimes();
        } else {
            console.error('保存に失敗しました');
        }
    } catch (err) {
        console.error('エラーが発生しました: ', err);
    }
}

// データベースから削除する
async function deleteTime(event) {
    try {
        const id = event.target.dataset.id;
        const response = await fetch(`/api/times/${id}`, { method: 'GET' });
        const record = await response.json();
        if (confirm(`${record.time}秒 (スクランブル: ${record.scramble})\nこの記録を削除しますか？`)) {
            const response = await fetch(`/api/times/${id}`, { method: 'DELETE' });
            if (response.ok) {
                getTimes();
                getBestTime();
            } else {
                console.error('削除に失敗しました');
            }
        }
    } catch (err) {
        console.error('エラーが発生しました: ', err);
    }
}

// データベースからベストタイムを取得する
async function getBestTime() {
    try {
        const response = await fetch('/api/best', { method: 'GET' });
        const time = await response.json();

        if (!response.ok) {
            console.error('サーバーエラー');
            return;
        }

        // const bestDisplay = document.querySelector('#best-time');
        const bestDisplay = document.getElementById('best-time');
        if (time) {
            bestDisplay.textContent = `ベストタイム: ${time.time}`;
        } else {
            bestDisplay.textContent = `ベスト: ---`;
        }
    } catch (err) {
        console.error('エラーが発生しました: ', err);
    }
}