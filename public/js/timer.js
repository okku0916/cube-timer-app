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

// 画面が読み込まれた直後に1回だけ履歴を取得・表示する
document.addEventListener('DOMContentLoaded', getTimes);

window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('#solve-history').forEach((elem) => {
        elem.addEventListener('click', async (event) => {
            try {
                if (confirm('この記録を削除しますか？')) {
                    const recordId = event.target.dataset.id;
                    const response = await fetch(`api/times/${recordId}`, { method: 'DELETE' }); 
                    if (response.ok) {
                        getTimes();
                    } else {
                        console.error('削除に失敗しました'); 
                    }
                }
            } catch (err) {
                console.error('エラーが発生しました: ', err); 
            }
        });
    });

    document.querySelector('.send-button').addEventListener('click', async (event) => {
        try {
            const inputValue = document.querySelector('.input-text').value;
            const inputScramble = document.querySelector('.input-scramble').value;
            const response = await fetch('/api/times', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ time: inputValue, scramble: inputScramble }) })
            if (response.ok) {
                getTimes();
            } else {
                console.error('保存に失敗しました');
            }
        } catch (err) {
            console.error('エラーが発生しました: ', err);
        }
    });
});