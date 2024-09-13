import base64
import io
import os
import time
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from langchain_core.tools import tool
from typing import Literal
from PIL import Image


class GameController:
    def __init__(self):
        # LLMの初期化
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        CHATGPT_MODEL = os.getenv("CHATGPT_MODEL")
        self.model = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY, model=CHATGPT_MODEL, temperature=0
        )

    @tool
    def janken_tool(hand: Literal["グー", "チョキ", "パー"]) -> str:
        """じゃんけんの手を返却します"""
        return hand

    # 画像認識でじゃんけんに勝つ
    def recognize_image(self):
        # 画像を読み込む
        image = Image.open("tmp/image.png")

        # base64にエンコード
        bufferd = io.BytesIO()
        image.save(bufferd, format="PNG")
        image_bytes = bufferd.getvalue()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # 画像認識のプロンプト
        text = """
        画像はじゃんけんゲームです。
        左側に表示されるCPUの手を読み取り、勝てる手を出してください。
        """

        model_with_tools = self.model.bind_tools([self.janken_tool])
        human_message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": text,
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{image_base64}"},
                },
            ]
        )

        # LLMを呼び出す
        start_time = time.time()
        response = model_with_tools.invoke([human_message])
        end_time = time.time()

        # LLM呼び出しの実行時間をログ出力
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time * 1000} ms")
        tool_call = response.tool_calls

        if tool_call:
            # 判断できた場合は関数を呼び出す
            args = tool_call[0]["args"]
            return self.janken_tool(args["hand"])
        else:
            # 判断できない場合はunknownを返す
            return {"message": "unknown"}
