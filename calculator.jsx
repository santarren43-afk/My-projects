import { useState, useEffect, useCallback } from "react";

const OP_SYMBOLS = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [expression, setExpression] = useState("");
  const [flash, setFlash] = useState(null);

  const inputDigit = useCallback(
    (d) => {
      if (overwrite) {
        setDisplay(d === "." ? "0." : d);
        setOverwrite(false);
        return;
      }
      if (d === "." && display.includes(".")) return;
      if (display.replace("-", "").replace(".", "").length >= 12) return;
      setDisplay(display + d);
    },
    [display, overwrite]
  );

  const compute = (a, b, operator) => {
    switch (operator) {
      case "add":
        return a + b;
      case "subtract":
        return a - b;
      case "multiply":
        return a * b;
      case "divide":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const formatResult = (n) => {
    if (Number.isNaN(n)) return "Error";
    if (!Number.isFinite(n)) return "Error";
    let s = String(Math.round(n * 1e10) / 1e10);
    if (s.replace("-", "").replace(".", "").length > 12) {
      s = n.toExponential(6);
    }
    return s;
  };

  const chooseOp = (nextOp) => {
    const current = parseFloat(display);
    if (prev !== null && op && !overwrite) {
      const result = compute(prev, current, op);
      setDisplay(formatResult(result));
      setPrev(result);
      setExpression(`${formatResult(result)} ${OP_SYMBOLS[nextOp]}`);
    } else {
      setPrev(current);
      setExpression(`${formatResult(current)} ${OP_SYMBOLS[nextOp]}`);
    }
    setOp(nextOp);
    setOverwrite(true);
  };

  const equals = () => {
    if (op === null || prev === null) return;
    const current = parseFloat(display);
    const result = compute(prev, current, op);
    setExpression(`${formatResult(prev)} ${OP_SYMBOLS[op]} ${formatResult(current)} =`);
    setDisplay(formatResult(result));
    setPrev(null);
    setOp(null);
    setOverwrite(true);
  };

  const clearAll = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setOverwrite(true);
    setExpression("");
  };

  const clearEntry = () => {
    setDisplay("0");
    setOverwrite(true);
  };

  const backspace = () => {
    if (overwrite) return;
    if (display.length <= 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
      setOverwrite(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const toggleSign = () => {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const percent = () => {
    setDisplay(formatResult(parseFloat(display) / 100));
    setOverwrite(true);
  };

  const press = (id) => {
    setFlash(id);
    setTimeout(() => setFlash(null), 130);
  };

  useEffect(() => {
    const handler = (e) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        inputDigit(k);
        press(k);
      } else if (k === ".") {
        inputDigit(".");
        press("dot");
      } else if (k === "+") {
        chooseOp("add");
        press("add");
      } else if (k === "-") {
        chooseOp("subtract");
        press("subtract");
      } else if (k === "*") {
        chooseOp("multiply");
        press("multiply");
      } else if (k === "/") {
        e.preventDefault();
        chooseOp("divide");
        press("divide");
      } else if (k === "Enter" || k === "=") {
        equals();
        press("equals");
      } else if (k === "Backspace") {
        backspace();
        press("back");
      } else if (k === "Escape") {
        clearAll();
        press("ac");
      } else if (k === "%") {
        percent();
        press("percent");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const Btn = ({ id, onClick, className = "", children, wide = false }) => (
    <button
      onClick={() => {
        onClick();
        press(id);
      }}
      className={`
        select-none rounded-2xl font-medium text-[22px]
        transition-all duration-100 ease-out
        active:scale-[0.94]
        ${wide ? "col-span-2" : ""}
        ${flash === id ? "brightness-125 scale-[0.96]" : ""}
        ${className}
      `}
      style={{ height: 64 }}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1c1d1f] p-6">
      <div
        className="relative rounded-[36px] p-5 pt-6"
        style={{
          width: 340,
          background: "linear-gradient(160deg,#3a3c3f 0%,#242527 60%)",
          boxShadow:
            "0 30px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* brand strip */}
        <div className="flex items-center justify-between px-1 mb-3">
          <span
            className="text-[11px] tracking-[0.25em] text-[#8a8d91] font-semibold"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            MODEL&nbsp;·&nbsp;77
          </span>
          <span className="w-2 h-2 rounded-full bg-[#5fce7a]" style={{ boxShadow: "0 0 6px #5fce7a" }} />
        </div>

        {/* display */}
        <div
          className="rounded-2xl mb-5 px-5 pt-4 pb-3"
          style={{
            background: "linear-gradient(175deg,#c4d4c2 0%,#aebfab 100%)",
            boxShadow:
              "inset 0 3px 10px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="text-right text-[13px] h-5 truncate opacity-70"
            style={{ fontFamily: "'Courier New', monospace", color: "#2b3a2b" }}
          >
            {expression || "\u00A0"}
          </div>
          <div
            className="text-right leading-none overflow-hidden"
            style={{
              fontFamily: "'Courier New', monospace",
              color: "#1f2b1f",
              fontSize: display.length > 9 ? 32 : 44,
              fontWeight: 700,
              textShadow: "0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {display}
          </div>
        </div>

        {/* keypad */}
        <div className="grid grid-cols-4 gap-3">
          <Btn id="ac" onClick={clearAll} className="bg-[#4a4d51] text-[#f2b880] shadow-[0_3px_0_#2c2e30]">
            AC
          </Btn>
          <Btn id="ce" onClick={clearEntry} className="bg-[#4a4d51] text-[#e7e8ea] shadow-[0_3px_0_#2c2e30]">
            CE
          </Btn>
          <Btn id="back" onClick={backspace} className="bg-[#4a4d51] text-[#e7e8ea] shadow-[0_3px_0_#2c2e30]">
            ⌫
          </Btn>
          <Btn id="divide" onClick={() => chooseOp("divide")} className="bg-[#d97a3f] text-white shadow-[0_3px_0_#a05a2c]">
            ÷
          </Btn>

          <Btn id="7" onClick={() => inputDigit("7")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">7</Btn>
          <Btn id="8" onClick={() => inputDigit("8")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">8</Btn>
          <Btn id="9" onClick={() => inputDigit("9")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">9</Btn>
          <Btn id="multiply" onClick={() => chooseOp("multiply")} className="bg-[#d97a3f] text-white shadow-[0_3px_0_#a05a2c]">×</Btn>

          <Btn id="4" onClick={() => inputDigit("4")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">4</Btn>
          <Btn id="5" onClick={() => inputDigit("5")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">5</Btn>
          <Btn id="6" onClick={() => inputDigit("6")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">6</Btn>
          <Btn id="subtract" onClick={() => chooseOp("subtract")} className="bg-[#d97a3f] text-white shadow-[0_3px_0_#a05a2c]">−</Btn>

          <Btn id="1" onClick={() => inputDigit("1")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">1</Btn>
          <Btn id="2" onClick={() => inputDigit("2")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">2</Btn>
          <Btn id="3" onClick={() => inputDigit("3")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">3</Btn>
          <Btn id="add" onClick={() => chooseOp("add")} className="bg-[#d97a3f] text-white shadow-[0_3px_0_#a05a2c]">+</Btn>

          <Btn id="sign" onClick={toggleSign} className="bg-[#4a4d51] text-[#e7e8ea] shadow-[0_3px_0_#2c2e30]">±</Btn>
          <Btn id="0" onClick={() => inputDigit("0")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">0</Btn>
          <Btn id="percent" onClick={percent} className="bg-[#4a4d51] text-[#e7e8ea] shadow-[0_3px_0_#2c2e30]">%</Btn>
          <Btn id="dot" onClick={() => inputDigit(".")} className="bg-[#333538] text-[#f2f2f0] shadow-[0_3px_0_#1a1b1c]">.</Btn>

          <Btn id="equals" onClick={equals} wide className="bg-[#5fce7a] text-[#173a20] shadow-[0_3px_0_#3f9d56] font-bold">
            =
          </Btn>
          <div className="col-span-2" />
        </div>
      </div>
    </div>
  );
}
