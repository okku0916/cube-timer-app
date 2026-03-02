// 画面が読み込まれた直後に1回だけ履歴を取得・表示する
window.addEventListener('DOMContentLoaded', (event) => {
    // あとで書き換えるhtml要素を取得
    timerDisplay = document.querySelector('#timer-display');
    scrambleDisplay = document.querySelector('#scramble');
    
    // 初期のスクランブルを生成して表示
    scramble = createScramble().join(' ');
    scrambleDisplay.textContent = scramble;
    
    // 履歴の読み込み
    getTimes();

    // ベストタイムの表示
    getBestTime();

    // クリックしたら削除されるようにする
    document.querySelectorAll('#solve-history').forEach((elem) => {
        elem.addEventListener('click', async (event) => {
            deleteTime(event);
        });
    });
});

let timerState = 'IDLE'; // 状態
let startTime; // スタートした時間
let timerInterval; // setIntervalを管理する変数
let timerDisplay;
let scrambleDisplay;
let scramble;

// キー設定
document.addEventListener('keydown', (event) => {
    if (event.code == 'Space') { // 画面がスクロールしないようにする
        event.preventDefault();
    }
    if (event.repeat) return; // 押しっぱが認識されないようにする

    if (event.code == 'Space' && timerState == 'IDLE') {
        startInspection();
    } else if (event.code == 'Space' && timerState == 'INSPECTION') {
        timerState = 'READY';
        timerDisplay.style.color = 'lime';
    } else if (timerState == 'RUNNING') {
        stopTimer();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code == 'Space' && timerState == 'READY') {
        startTimer();
    }
});

function startInspection() {
    timerState = 'INSPECTION';
    startTime = Date.now();

    // 0.1秒ごとに画面を更新
    timerInterval = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        const remainingSeconds = 15 - Math.floor(elapsedMs / 1000);

        if (remainingSeconds > 0) {
            timerDisplay.textContent = remainingSeconds;
            if (remainingSeconds <= 5) { // インスペクションタイムが残り5秒以内なら赤色に表示
                timerDisplay.style.color = 'red';
            }
        } else {
            // 15秒経過したら自動的にタイマーをスタートさせる 本当は+2秒のペナルティ
            startTimer();
        }
    }, 100);
}

function startTimer() {
    clearInterval(timerInterval);
    timerState = 'RUNNING';
    startTime = Date.now();
    timerDisplay.style.color = '#333';

    // 0.01秒ごとに画面を更新
    timerInterval = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        timerDisplay.textContent = (elapsedMs / 1000).toFixed(3);
    }, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerState = 'IDLE';
    const finalTime = timerDisplay.textContent;
    saveTime(finalTime, scramble); // タイムとスクランブルを保存
    scramble = createScramble().join(' '); // 新しいスクランブルを生成
    scrambleDisplay.textContent = scramble;
    getBestTime(); // ベストタイムを取得
}