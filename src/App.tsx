import { useState } from "react";
import "./App.css";
import senbeiImage from "./assets/senbei.png"
import demoImage from "./assets/demo.png";


type AttributeRes = {
  attribute: string;
};

type ChoisedRes = {
  word: string;
};

type NextWord = {
  plus: ChoisedRes;
  minus: ChoisedRes;
};

function App() {
  const [word, setWord] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [attribute, setAttribute] = useState("");
  const [plusWord, setPlusWord] = useState("");
  const [minusWord, setMinusWord] = useState("");

  const onPlus = () => {
    console.log("plus");
    subimt(plusWord);
  };

  const onMinus = () => {
    console.log("minus");
    subimt(minusWord);
  };

  const onInit = () => {
    console.log("init");
    subimt(input);
  };

  const subimt = (word: string) => {
    setWord(word);
    setWords((prev: string[]) => {
      return [...prev, word];
    });
    const attrRes = getAttribute(word);
    setAttribute(attrRes.attribute);
    const nextRes = getNextWord(word, attrRes.attribute);
    setPlusWord(nextRes.plus.word);
    setMinusWord(nextRes.minus.word);
  };

  const getNextWord = (word: string, attribute: string): NextWord => {
    console.log("getNextWord");
    const res: NextWord = {
      plus: {
        word: `${word}+${attribute}`,
      },
      minus: {
        word: `${word}-${attribute}`,
      },
    };
    return res;
  };

  const getAttribute = (word: string): AttributeRes => {
    console.log(`getAttribute: ${word}`);
    const res: AttributeRes = {
      attribute: `attr${words.length}`,
    };
    return res;
  };
  return (
    <>
      <body id="body">
        <h1>しかしかパラダイス!!!</h1>
        <img src={senbeiImage} id="senbei" />
        <div id="container">
          <img src={demoImage} alt="" id="dear" />
          <div style={{ display: "flex" }}>
            <div style={{ display: "block" }}>
              <button style={{ borderColor: "white" }} onClick={onMinus} id="minusbutton">
                たべない！
              </button>
              <p>{minusWord}</p>
            </div>
            <p>{attribute}</p>
            <div style={{ display: "block" }}>
              <button style={{ borderColor: "white" }} onClick={onPlus} id="plusbutton">
                たべる！
              </button>
              <p>{plusWord}</p>
            </div>
          </div>
          <p>{word}</p>
          <input id="firstword"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={onInit} id="submitbutton">あげる</button>
        </div>
      </body>
    </>
  );
}

export default App;
