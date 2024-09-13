## 前提
- Pythonがインストール済であること
- Poetryがインストール済であること

## 準備

アプリインストール

```bash
poetry install --no-root
```

.envを作成

```dotenv
OPENAI_API_KEY={YOUR_API_KEY}
CHATGPT_MODEL={MODEL_NAME}
```

画像保存用フォルダを作成

```bash
mkdir tmp
```

## 起動

```bash
poetry run python ./src/app.py
```

## 操作方法

### 手動プレイを選択した場合

G : グー
C : チョキ
P : パー

### 自動プレイを選択した場合

操作は不要です
