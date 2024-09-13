const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    scene: {
        create: create,
    }
};

const fontConfig = {
    fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Arial, sans-serif',
    fontSize: 24,
    fill: '#fff',
    padding: 4
};

// ボタン
let manualPlayButton;
let autoPlayButton;
let resetButton;

// 表示テキスト
let titleText;
let playerHand;
let playerHandText;
let playerHandEmoji;
let cpuHand;
let cpuHandText;
let cpuHandEmoji;
let roundText;
let resultText;
let resultMessage;

// ゲームの設定
const MAX_COUNT = 10;
const HANDS = [
    { name: 'グー', emoji: '✊' },
    { name: 'チョキ', emoji: '✌️' },
    { name: 'パー', emoji: '✋' }
];

// ゲームの状態
let canvas;
let roundCount = 0;
let playerWins = 0;
let playerLosses = 0;
let isAutoPlay = false;
let gameStarted = false;

const game = new Phaser.Game(config);

function create() {

    // キャンバスを取得
    canvas = this.sys.game.canvas;

    // 背景色
    this.cameras.main.setBackgroundColor('#000');

    // 左上にラウンド数を表示
    roundText = this.add.text(10, 10, `ラウンド：${roundCount}`, { ...fontConfig, fontSize: 20 }).setOrigin(0, 0);

    // 右上に操作方法を表示
    this.add.text(800, 0, 'G：グー　C：チョキ　P：パー', { ...fontConfig, fontSize: 20, padding: 12 }).setOrigin(1, 0);
    
    // タイトル
    titleText = this.add.text(400, 200, 'あとだしジャンケン', { ...fontConfig, fontSize: 32 }).setOrigin(0.5);

    // 手動プレイボタン
    manualPlayButton = this.add.text(400, 350, '手動プレイ', { ...fontConfig }).setInteractive().setOrigin(0.5);
    manualPlayButton.on('pointerdown', () => startGame());

    // 自動プレイボタン
    autoPlayButton = this.add.text(400, 400, '自動プレイ', { ...fontConfig }).setInteractive().setOrigin(0.5);
    autoPlayButton.on('pointerdown', () => autoPlay());

    // リセットボタン
    resetButton = this.add.text(400, 500, 'リセット', { ...fontConfig }).setInteractive().setOrigin(0.5).setVisible(false);
    resetButton.on('pointerdown', () => resetGame());

    // 手と勝敗メッセージを表示する
    cpuHandEmoji = this.add.text(200, 250, '', { ...fontConfig, fontSize: 120 }).setOrigin(0.5);
    cpuHandText = this.add.text(200, 350, 'CPU', { ...fontConfig, fontSize: 32 }).setOrigin(0.5).setVisible(false);
    playerHandEmoji = this.add.text(600, 250, '', { ...fontConfig, fontSize: 120 }).setOrigin(0.5);
    playerHandText = this.add.text(600, 350, 'YOU', { ...fontConfig, fontSize: 32 }).setOrigin(0.5).setVisible(false);
    resultText = this.add.text(400, 450, '', { ...fontConfig, fontSize: 32 }).setOrigin(0.5);

    // キーボード入力設定
    this.input.keyboard.on('keydown-G', () => handlePlayerInput('グー'));
    this.input.keyboard.on('keydown-C', () => handlePlayerInput('チョキ'));
    this.input.keyboard.on('keydown-P', () => handlePlayerInput('パー'));

}

function startGame() {
    gameStarted = true;
    titleText.setVisible(false);
    playerHandText.setVisible(true);
    cpuHandText.setVisible(true);
    manualPlayButton.setVisible(false);
    autoPlayButton.setVisible(false);
    startNewRound();
}

function startNewRound() {
    // ラウンド数を更新
    roundText.setText(`ラウンド：${++roundCount}`);

    // CPUの手をランダムに選択
    const randomHand = HANDS[Math.floor(Math.random() * HANDS.length)];
    cpuHand = randomHand.name;
    cpuHandEmoji.setText(randomHand.emoji);

    // プレイヤーの手は未選択
    playerHand = '';
    playerHandEmoji.setText('');

    // 勝敗メッセージリセット
    resultMessage = '';
    resultText.setText('');

    // 自動プレイの場合はキャンバスをAPIに送る
    if (isAutoPlay) {
        // 描画を待ってから起動する
        setTimeout(() => {
            handleAutoPlay();
        }, 100);
    }
}

function handlePlayerInput(hand) {
    if (!gameStarted)  return;

    // プレイヤーの手を反映
    playerHand = hand;
    playerHandEmoji.setText(HANDS.find(hand => hand.name == playerHand).emoji);

    // 結果判定
    checkRoundResult();
}

function checkRoundResult() {
    if (playerHand === cpuHand) {
        resultMessage = '引き分け！';
    } else if (
        (playerHand === 'グー' && cpuHand === 'チョキ') ||
        (playerHand === 'チョキ' && cpuHand === 'パー') ||
        (playerHand === 'パー' && cpuHand === 'グー')
    ) {
        resultMessage = 'あなたの勝ち！';
        playerWins++;
    } else {
        resultMessage = 'あなたの負け！';
        playerLosses++;
    }

    resultText.setText(resultMessage);

    // 2秒後に次のラウンドに進む
    setTimeout(() => {
        if (roundCount < MAX_COUNT) {
            startNewRound();
        } else {
            endGame();
        }
    }, 2000);
}

function autoPlay() {
    isAutoPlay = true;
    startGame();
}

function handleAutoPlay() {
    // キャンバスを画像に変換してAPIに渡す
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob);
        fetch('/api/action', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            handlePlayerInput(data.message);
        })
        .catch(error => {
            console.error(error);
        });
    });
}

function endGame() {
    // 全ラウンド終了後のスコア表示
    resultText.setText(`${MAX_COUNT}回中、${playerWins}勝${playerLosses}敗${roundCount - playerWins - playerLosses}引き分けでした！`);
    resetButton.setVisible(true);
}

function resetGame() {
    roundCount = 0;
    playerWins = 0;
    playerLosses = 0;
    isAutoPlay = false;
    gameStarted = false;

    playerHandText.setVisible(false);
    playerHandEmoji.setText('');
    cpuHandText.setVisible(false);
    cpuHandEmoji.setText('');
    resultText.setText('');

    resetButton.setVisible(false);
    titleText.setVisible(true);
    manualPlayButton.setVisible(true);
    autoPlayButton.setVisible(true);
}


