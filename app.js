window.addEventListener("DOMContentLoaded", () => {
  const wordDisplay = document.getElementById("word-display");
  const toggleWordBtn = document.getElementById("toggle-word");
  const shuffleWordBtn = document.getElementById("shuffle-word");
  const newRoundBtn = document.getElementById("new-round");
  const startTimerBtn = document.getElementById("start-timer");
  const pauseTimerBtn = document.getElementById("pause-timer");
  const resetTimerBtn = document.getElementById("reset-timer");
  const timerDisplay = document.getElementById("timer-display");
  const timerInput = document.getElementById("timer-input");
  const guessInput = document.getElementById("guess-input");
  const submitGuessBtn = document.getElementById("submit-guess");
  const guessFeedback = document.getElementById("guess-feedback");
  const brushSizeSlider = document.getElementById("brush-size");
  const brushSizeValue = document.getElementById("brush-size-value");
  const colorPalette = document.getElementById("color-palette");
  const eraserBtn = document.getElementById("eraser");
  const clearBtn = document.getElementById("clear");
  const downloadBtn = document.getElementById("download");

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");

  const WORD_BANK = [
    "猫咪",
    "外星人",
    "热气球",
    "鲸鱼",
    "魔术师",
    "照相机",
    "长城",
    "冰淇淋",
    "恐龙",
    "风筝",
    "机器人",
    "海盗船",
    "宇航员",
    "太阳花",
    "游乐园",
    "生日蛋糕",
    "彩虹",
    "火山",
    "潜水艇",
    "摇滚乐队",
    "滑板",
    "城堡",
    "披萨",
    "流星雨",
    "龙卷风",
    "马拉松",
    "向日葵",
    "灯塔",
    "游泳池",
    "钢琴",
    "北极熊",
    "魔法棒",
    "风车",
    "茶壶",
    "狐狸",
    "瑜伽",
    "足球",
    "睡衣派对",
    "海豚",
    "独角兽",
    "火箭",
    "沙滩",
    "闹钟",
    "博物馆",
    "忍者",
    "面包店",
    "时间旅行",
    "侦探"
  ];

  const defaultState = {
    drawing: false,
    currentWord: "",
    wordVisible: false,
    wordHistory: new Set(),
    timerId: null,
    remainingSeconds: Number(timerInput.value) || 90,
    brushColor: "#111827",
    brushSize: Number(brushSizeSlider.value) || 8,
    dpr: window.devicePixelRatio || 1,
    lastX: 0,
    lastY: 0
  };

  const state = { ...defaultState };

  const COLOR_SET = [
    "#111827",
    "#000000",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#22c55e",
    "#10b981",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#ffffff",
    "#9ca3af",
    "#6b7280"
  ];

  function normalizeText(text) {
    return text
      .toString()
      .trim()
      .toLowerCase();
  }

  function updateWordDisplay() {
    if (!state.currentWord) {
      wordDisplay.textContent = "点击“开始新回合”抽词";
      wordDisplay.classList.add("masked");
      return;
    }

    if (state.wordVisible) {
      wordDisplay.textContent = state.currentWord;
      wordDisplay.classList.remove("masked");
      toggleWordBtn.textContent = "隐藏词语";
    } else {
      wordDisplay.textContent = "点击“显示词语”查看";
      wordDisplay.classList.add("masked");
      toggleWordBtn.textContent = "显示词语";
    }
  }

  function pickNewWord() {
    if (state.wordHistory.size >= WORD_BANK.length) {
      state.wordHistory.clear();
    }

    let word = state.currentWord;
    while (!word || state.wordHistory.has(word)) {
      word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    }

    state.wordHistory.add(word);
    state.currentWord = word;
    state.wordVisible = false;
    updateWordDisplay();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(state.remainingSeconds);
  }

  function pauseTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer() {
    if (state.timerId) return;

    if (!Number.isFinite(state.remainingSeconds) || state.remainingSeconds <= 0) {
      state.remainingSeconds = Number(timerInput.value) || 90;
    }

    state.timerId = setInterval(() => {
      state.remainingSeconds -= 1;
      updateTimerDisplay();

      if (state.remainingSeconds <= 0) {
        pauseTimer();
        state.remainingSeconds = 0;
        updateTimerDisplay();
        setFeedback("时间到啦！换个人继续画吧～", "error");
      }
    }, 1000);
  }

  function resetTimer() {
    pauseTimer();
    state.remainingSeconds = Number(timerInput.value) || 90;
    updateTimerDisplay();
  }

  function setFeedback(message, type = "") {
    guessFeedback.textContent = message;
    guessFeedback.className = `feedback ${type}`.trim();
  }

  function updateBrushSizeDisplay() {
    brushSizeValue.textContent = `${state.brushSize} px`;
  }

  function setBrushColor(color) {
    state.brushColor = color;
    setActiveColorSwatch(color);
  }

  function setActiveColorSwatch(color) {
    const swatches = colorPalette.querySelectorAll(".color-swatch");
    swatches.forEach((swatch) => {
      swatch.dataset.active = swatch.dataset.color === color ? "true" : "false";
    });
  }

  function clearBoard() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function resizeCanvas(preserve = true) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    let snapshot = null;

    if (preserve && canvas.width && canvas.height) {
      snapshot = canvas.toDataURL("image/png");
    }

    state.dpr = dpr;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    if (snapshot) {
      const image = new Image();
      image.onload = () => {
        clearBoard();
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = snapshot;
    } else {
      clearBoard();
    }
  }

  function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX ?? (event.touches && event.touches[0]?.clientX) ?? 0;
    const clientY = event.clientY ?? (event.touches && event.touches[0]?.clientY) ?? 0;
    return {
      x: (clientX - rect.left) * state.dpr,
      y: (clientY - rect.top) * state.dpr
    };
  }

  function drawLine(fromX, fromY, toX, toY) {
    ctx.strokeStyle = state.brushColor;
    ctx.lineWidth = state.brushSize * state.dpr;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.closePath();
  }

  function handlePointerDown(event) {
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    state.drawing = true;
    const position = getCanvasPosition(event);
    state.lastX = position.x;
    state.lastY = position.y;
  }

  function handlePointerMove(event) {
    if (!state.drawing) return;
    event.preventDefault();
    const position = getCanvasPosition(event);
    drawLine(state.lastX, state.lastY, position.x, position.y);
    state.lastX = position.x;
    state.lastY = position.y;
  }

  function stopDrawing(event) {
    if (!state.drawing) return;
    event?.preventDefault();
    state.drawing = false;
  }

  function startNewRound() {
    pauseTimer();
    state.remainingSeconds = Number(timerInput.value) || 90;
    updateTimerDisplay();
    pickNewWord();
    state.wordVisible = false;
    updateWordDisplay();
    setFeedback("", "");
    guessInput.value = "";
    clearBoard();
  }

  function handleGuess() {
    if (!state.currentWord) {
      setFeedback("请先点击“开始新回合”抽词", "error");
      return;
    }

    const guess = normalizeText(guessInput.value);
    if (!guess) {
      setFeedback("请先输入你的猜测哦！", "error");
      return;
    }

    if (guess === normalizeText(state.currentWord)) {
      setFeedback("恭喜你猜对啦！", "success");
      pauseTimer();
    } else {
      setFeedback("猜错了，再仔细看看画吧～", "error");
    }
  }

  function populateColorPalette() {
    COLOR_SET.forEach((color) => {
      const swatch = document.createElement("button");
      swatch.className = "color-swatch";
      swatch.title = color === "#ffffff" ? "白色 / 橡皮" : color;
      swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.dataset.active = color === state.brushColor ? "true" : "false";
      swatch.addEventListener("click", () => setBrushColor(color));
      colorPalette.appendChild(swatch);
    });
  }

  function initializeCanvas() {
    resizeCanvas(false);
    window.addEventListener("resize", () => resizeCanvas());

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointerleave", stopDrawing);
    canvas.addEventListener("touchstart", (e) => e.preventDefault(), {
      passive: false
    });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false
    });
  }

  populateColorPalette();
  initializeCanvas();
  updateBrushSizeDisplay();
  updateTimerDisplay();

  toggleWordBtn.addEventListener("click", () => {
    if (!state.currentWord) {
      setFeedback("请先开始一个新回合", "error");
      return;
    }
    state.wordVisible = !state.wordVisible;
    updateWordDisplay();
  });

  shuffleWordBtn.addEventListener("click", () => {
    pickNewWord();
    setFeedback("", "");
  });

  newRoundBtn.addEventListener("click", () => {
    startNewRound();
  });

  startTimerBtn.addEventListener("click", () => {
    setFeedback("", "");
    startTimer();
  });

  pauseTimerBtn.addEventListener("click", () => {
    pauseTimer();
  });

  resetTimerBtn.addEventListener("click", () => {
    resetTimer();
  });

  timerInput.addEventListener("change", () => {
    const value = Math.min(Math.max(Number(timerInput.value) || 90, 10), 600);
    timerInput.value = value;
    if (!state.timerId) {
      state.remainingSeconds = value;
      updateTimerDisplay();
    }
  });

  brushSizeSlider.addEventListener("input", () => {
    state.brushSize = Number(brushSizeSlider.value);
    updateBrushSizeDisplay();
  });

  eraserBtn.addEventListener("click", () => {
    setBrushColor("#ffffff");
  });

  clearBtn.addEventListener("click", () => {
    clearBoard();
  });

  downloadBtn.addEventListener("click", () => {
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `draw-and-guess-${Date.now()}.png`;
    link.click();
  });

  submitGuessBtn.addEventListener("click", () => {
    handleGuess();
  });

  guessInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleGuess();
    }
  });

  window.addEventListener("pointerup", stopDrawing);

  startNewRound();
});
