from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from game_controller import GameController
from PIL import Image

load_dotenv()

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/action", methods=["POST"])
def save():
    image_file = request.files["image"]

    # 画像を長辺512pxにリサイズして保存
    image = Image.open(image_file)
    max_size = 512
    image.thumbnail((max_size, max_size), Image.LANCZOS)
    image.save("tmp/image.png")

    # 画像認識でアクションを決定する
    controller = GameController()
    result = controller.recognize_image()

    return jsonify({"message": result})


if __name__ == "__main__":
    app.run(debug=True)
