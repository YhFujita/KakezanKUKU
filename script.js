// 九九データ
const kukuData = [];
const readings = [
    // 1の段
    ["イン イチ ガ イチ", "イン ニ ガ ニ", "イン サン ガ サン", "イン シ ガ シ", "イン ゴ ガ ゴ", "イン ロク ガ ロク", "イン シチ ガ シチ", "イン ハチ ガ ハチ", "イン ク ガ ク"],
    // 2の段
    ["ニ イチ ガ ニ", "ニ ニン ガ シ", "ニ サン ガ ロク", "ニ シ ガ ハチ", "ニ ゴ ジュウ", "ニ ロク ジュウニ", "ニ シチ ジュウシ", "ニ ハチ ジュウロク", "ニ ク ジュウハチ"],
    // 3の段
    ["サン イチ ガ サン", "サン ニ ガ ロク", "サザン ガ ク", "サン シ ジュウニ", "サン ゴ ジュウゴ", "サン ロク ジュウハチ", "サン シチ ニジュウイチ", "サン パ ニジュウシ", "サン ク ニジュウシチ"],
    // 4の段
    ["シ イチ ガ シ", "シ ニ ガ ハチ", "シ サン ジュウニ", "シ シ ジュウロク", "シ ゴ ニジュウ", "シ ロク ニジュウシ", "シ シチ ニジュウハチ", "シ ハ サンジュウニ", "シ ク サンジュウロク"],
    // 5の段
    ["ゴ イチ ガ ゴ", "ゴ ニ ジュウ", "ゴ サン ジュウゴ", "ゴ シ ニジュウ", "ゴ ゴ ニジュウゴ", "ゴ ロク サンジュウ", "ゴ シチ サンジュウゴ", "ゴ ハ シジュウ", "ゴ ク シジュウゴ"],
    // 6の段
    ["ロク イチ ガ ロク", "ロク ニ ジュウニ", "ロク サン ジュウハチ", "ロク シ ニジュウシ", "ロク ゴ サンジュウ", "ロク ロク サンジュウロク", "ロク シチ シジュウニ", "ロク ハ シジュウハチ", "ロク ク ゴジュウシ"],
    // 7の段
    ["シチ イチ ガ シチ", "シチ ニ ジュウシ", "シチ サン ニジュウイチ", "シチ シ ニジュウハチ", "シチ ゴ サンジュウゴ", "シチ ロク シジュウニ", "シチ シチ シジュウク", "シチ ハ ゴジュウロク", "シチ ク ロクジュウサン"],
    // 8の段
    ["ハチ イチ ガ ハチ", "ハチ ニ ジュウロク", "ハチ サン ニジュウシ", "ハチ シ サンジュウニ", "ハチ ゴ シジュウ", "ハチ ロク シジュウハチ", "ハチ シチ ゴジュウロク", "ハッ パ ロクジュウシ", "ハッ ク シチジュウニ"],
    // 9の段
    ["ク イチ ガ ク", "ク ニ ジュウハチ", "ク サン ニジュウシチ", "ク シ サンジュウロク", "ク ゴ シジュウゴ", "ク ロク ゴジュウシ", "ク シチ ロクジュウサン", "ク ハ シチジュウニ", "ク ク ハチジュウイチ"]
];

// データ生成
for (let d1 = 1; d1 <= 9; d1++) {
    for (let d2 = 1; d2 <= 9; d2++) {
        kukuData.push({
            d1: d1,
            d2: d2,
            ans: d1 * d2,
            read: readings[d1 - 1][d2 - 1]
        });
    }
}


// 状態管理
let currentQuestion = null;
let score = 0;
let isSoundOn = true;
let voices = [];
let selectedVoice = null;

// DOM要素
const screens = {
    title: document.getElementById('title-screen'),
    list: document.getElementById('list-screen'),
    quiz: document.getElementById('quiz-screen')
};

const els = {
    score: document.getElementById('score-count'),
    qD1: document.getElementById('q-d1'),
    qD2: document.getElementById('q-d2'),
    options: document.getElementById('answer-options'),
    hintArea: document.getElementById('hint-area'),
    hintText: document.getElementById('hint-text'),
    hintVisual: document.getElementById('hint-visual'),
    feedback: document.getElementById('feedback-overlay'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackRead: document.getElementById('feedback-read'),

    listContainer: document.getElementById('kuku-list-container'),
    danSelector: document.querySelector('.dan-selector'),
    btnSound: document.getElementById('btn-toggle-sound'),
    voiceSelect: document.getElementById('voice-select')
};

// 初期化
function init() {
    setupEventListeners();
    setupListScreen();
}

function setupEventListeners() {
    // 画面遷移
    document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
    document.getElementById('btn-show-list').addEventListener('click', () => showScreen('list'));

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.dataset.target;
            showScreen(target.replace('-screen', '')); // 'title' etc
        });
    });

    // ヒント
    document.getElementById('btn-hint').addEventListener('click', showHint);

    // 音声切り替え
    els.btnSound.addEventListener('click', toggleSound);

    // 音声選択変更
    els.voiceSelect.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        if (voices[index]) {
            selectedVoice = voices[index];
            // 確認のため少し喋らせる
            speak("これにするね", true);
        }
    });

    // 音声リスト読み込み（イベントリスナー）
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices(); // 初回呼び出し
}

function loadVoices() {
    // 日本語の音声のみ取得
    const allVoices = speechSynthesis.getVoices();
    voices = allVoices.filter(voice => voice.lang.startsWith('ja'));

    // UI更新
    els.voiceSelect.innerHTML = '';

    if (voices.length === 0) {
        const option = document.createElement('option');
        option.textContent = "こえがみつかりません";
        els.voiceSelect.appendChild(option);
        return;
    }

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        // 子供向けに「こえ1」「こえ2」のように表示
        option.textContent = `こえ ${index + 1}`;

        // Google 日本語などを優先的にデフォルトにするなどのロジックも可能だが
        // ここでは単純に最初のものをデフォルト選択
        if (selectedVoice === null && index === 0) {
            selectedVoice = voice;
            option.selected = true;
        } else if (selectedVoice && selectedVoice.name === voice.name) {
            option.selected = true;
        }

        els.voiceSelect.appendChild(option);
    });
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    updateSoundButton();
}

function updateSoundButton() {
    if (isSoundOn) {
        els.btnSound.textContent = '🔊 ON';
        els.btnSound.classList.remove('muted');
    } else {
        els.btnSound.textContent = '🔇 OFF';
        els.btnSound.classList.add('muted');
    }
}

function speak(text, force = false) {
    if (!isSoundOn && !force) return;

    // ブラウザの音声合成機能を使用
    if ('speechSynthesis' in window) {
        // 既存の発話をキャンセル
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 1.0; // 速度
        utterance.pitch = 1.0; // 高さ

        window.speechSynthesis.speak(utterance);
    }
}


function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

// --- クイズ機能 ---

function startQuiz() {
    score = 0;
    updateScore();
    showScreen('quiz');
    nextQuestion();
}

function nextQuestion() {
    // ヒントを隠す
    els.hintArea.classList.add('hidden');

    // ランダムに問題を選択
    const randomIndex = Math.floor(Math.random() * kukuData.length);
    currentQuestion = kukuData[randomIndex];

    // 表示更新
    els.qD1.textContent = currentQuestion.d1;
    els.qD2.textContent = currentQuestion.d2;

    // 選択肢生成
    generateOptions();
}

function generateOptions() {
    const options = new Set();
    options.add(currentQuestion.ans);

    while (options.size < 4) {
        // 誤答の生成ロジック：近い数字や、九九にある答えから選ぶとより学習効果が高い
        // 今回はシンプルに九九の答えの中からランダムに選ぶ
        const randomAns = kukuData[Math.floor(Math.random() * kukuData.length)].ans;
        if (randomAns !== currentQuestion.ans) {
            options.add(randomAns);
        }
    }

    // シャッフル
    const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);

    // ボタン生成
    els.options.innerHTML = '';
    optionsArray.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => checkAnswer(opt));
        els.options.appendChild(btn);
    });
}

function checkAnswer(selectedAns) {
    const isCorrect = selectedAns === currentQuestion.ans;

    // フィードバック表示
    els.feedback.classList.remove('hidden');

    if (isCorrect) {
        els.feedbackIcon.textContent = '⭕';
        els.feedbackIcon.style.color = 'var(--correct-color)';

        els.feedbackRead.textContent = currentQuestion.read;

        // 読み上げ
        speak(currentQuestion.read);

        score++;
        updateScore();

        // 2秒後に次の問題へ
        setTimeout(() => {
            els.feedback.classList.add('hidden');
            nextQuestion();
        }, 2000);
    } else {
        els.feedbackIcon.textContent = '❌';
        els.feedbackIcon.style.color = 'var(--wrong-color)';
        els.feedbackRead.textContent = 'ざんねん...';

        // 1秒後にやり直し
        setTimeout(() => {
            els.feedback.classList.add('hidden');
        }, 1000);
    }
}

function updateScore() {
    els.score.textContent = score;
}

// --- ヒント機能 ---

function showHint() {
    if (!currentQuestion) return;

    const d1 = currentQuestion.d1;
    const d2 = currentQuestion.d2;

    // テキスト設定
    els.hintText.textContent = `${d1}が ${d2}こ ある という いみだよ`;

    // ビジュアル生成
    els.hintVisual.innerHTML = '';

    // d2個のグループを作る
    for (let i = 0; i < d2; i++) {
        const group = document.createElement('div');
        group.className = 'hint-group';

        // グループ内にd1個のドットを作る
        // グリッドレイアウトを調整（数が少ないときは1列、多いときは適宜）
        let columns = 1;
        if (d1 >= 2) columns = 2;
        if (d1 >= 5) columns = 3;

        group.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        for (let j = 0; j < d1; j++) {
            const dot = document.createElement('div');
            dot.className = 'hint-dot';
            group.appendChild(dot);
        }
        els.hintVisual.appendChild(group);
    }

    els.hintArea.classList.remove('hidden');
}

// --- 一覧表機能 ---

function setupListScreen() {
    // 段選択ボタン生成
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-dan';
        btn.textContent = i;
        btn.addEventListener('click', () => showDan(i));
        els.danSelector.appendChild(btn);
    }

    // 初期表示
    showDan(1);
}

function showDan(dan) {
    // ボタンのアクティブ切り替え
    document.querySelectorAll('.btn-dan').forEach(b => {
        b.classList.toggle('active', parseInt(b.textContent) === dan);
    });

    // リスト生成
    els.listContainer.innerHTML = '';
    const danData = kukuData.filter(d => d.d1 === dan);

    danData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'kuku-row';

        const expression = document.createElement('div');
        expression.textContent = `${item.d1} × ${item.d2} = ${item.ans}`;

        const read = document.createElement('div');
        read.className = 'kuku-read';
        read.textContent = item.read;

        row.appendChild(expression);
        row.appendChild(read);

        row.addEventListener('click', () => {
            // 視覚的なフィードバック
            row.style.backgroundColor = '#e0f7fa';
            setTimeout(() => row.style.backgroundColor = '', 200);

            // 読み上げ
            speak(item.read);
        });

        els.listContainer.appendChild(row);
    });
}

// アプリ開始
init();
