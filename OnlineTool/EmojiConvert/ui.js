const translations = {
    "zh-TW": {
        title: "文字-表情 轉換器",
        inputPlaceholder: "輸入文本或表情符號",
        seedPlaceholder: "輸入種子",
        rangesTitle: "表情範圍",
        langTitle: "語言",
        pasteTitle: "貼上剪貼板內容",
        copyTitle: "複製結果",
        speakTitle: "語音輸出",
        modeTitle: "切換模式",
        emptyError: "錯誤：輸入為空",
        copied: "已複製",
        pasted: "已貼上",
        playing: "播放中",
        textLabel: "文本",
        emojiLabel: "表情符號",
        rangeNames: [
            "😊 基本表情符號", "🌈 核心雜項符號", "🚗 基本交通符號", "✂️ 常用裝飾符號",
            "☀️ 基礎雜項符號", "🐱 動物和自然", "💡 符號和物品", "⚗️ 煉金術符號",
            "🧑‍🚀 補充符號和表情", "🀄 麻將牌", "🃏 撲克牌"
        ]
    },
    "en-US": {
        title: "Text & Emoji Converter",
        inputPlaceholder: "Enter text or Emoji",
        seedPlaceholder: "Enter seed",
        rangesTitle: "Emoji Ranges",
        langTitle: "Language",
        pasteTitle: "Paste from clipboard",
        copyTitle: "Copy result",
        speakTitle: "Speak output",
        modeTitle: "Switch mode",
        emptyError: "Error: Input is empty",
        copied: "Copied",
        pasted: "Pasted",
        playing: "Playing",
        textLabel: "Text",
        emojiLabel: "Emoji",
        rangeNames: [
            "😊 Basic Emoticons", "🌈 Core Miscellaneous Symbols", "🚗 Basic Transport Symbols", "✂️ Common Decorative Symbols",
            "☀️ Basic Miscellaneous Symbols", "🐱 Animals and Nature", "💡 Symbols and Objects", "⚗️ Alchemical Symbols",
            "🧑‍🚀 Supplemental Symbols and Emojis", "🀄 Mahjong Tiles", "🃏 Playing Cards"
        ]
    },
    "ja-JP": {
        title: "テキストと絵文字変換器",
        inputPlaceholder: "テキストまたは絵文字を入力",
        seedPlaceholder: "シードを入力",
        rangesTitle: "絵文字範囲",
        langTitle: "言語",
        pasteTitle: "クリップボードから貼り付け",
        copyTitle: "結果をコピー",
        speakTitle: "音声出力",
        modeTitle: "モード切り替え",
        emptyError: "エラー：入力が空です",
        copied: "コピーしました",
        pasted: "貼り付けました",
        playing: "再生中",
        textLabel: "テキスト",
        emojiLabel: "絵文字",
        rangeNames: [
            "😊 基本的な表情絵文字", "🌈 コア雑多シンボル", "🚗 基本交通シンボル", "✂️ 一般的な装飾シンボル",
            "☀️ 基本雑多シンボル", "🐱 動物と自然", "💡 シンボルとオブジェクト", "⚗️ 錬金術シンボル",
            "🧑‍🚀 補足シンボルと絵文字", "🀄 麻雀牌", "🃏 トランプ"
        ]
    }
};

let currentRangeNames = translations["en-US"].rangeNames; // 默認為英文

function initEmojiRanges() {
    const rangeOptions = document.getElementById("range-options");
    rangeOptions.innerHTML = "";
    emojiRanges.forEach((range, index) => {
        const label = document.createElement("label");
        const isDefault = defaultRanges.includes(index);
        label.innerHTML = `<input type="checkbox" ${isDefault ? "checked" : ""} data-index="${index}"><span>${currentRangeNames[index]}</span>`;
        label.title = `${translations[document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US"].rangesTitle}: ${currentRangeNames[index].split(" ")[1]}`;
        rangeOptions.appendChild(label);
    });
}

function updateLanguage() {
    const lang = document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US";
    const t = translations[lang];
    currentRangeNames = t.rangeNames;
    document.title = t.title;
    document.getElementById("input").placeholder = t.inputPlaceholder;
    document.getElementById("seed").placeholder = t.seedPlaceholder;
    document.querySelector(".emoji-ranges h3").textContent = t.rangesTitle;
    document.querySelector(".language-select h3").textContent = t.langTitle;
    document.getElementById("paste-btn").title = t.pasteTitle;
    document.getElementById("copy-btn").title = t.copyTitle;
    document.getElementById("speak-btn").title = t.speakTitle;
    document.getElementById("mode-btn").removeAttribute("title");
    document.getElementById("input-label").textContent = mode === "textToEmoji" ? t.textLabel : t.emojiLabel;
    document.getElementById("output-label").textContent = mode === "textToEmoji" ? t.emojiLabel : t.textLabel;
    initEmojiRanges();
}

let mode = "textToEmoji";
let isSwitching = false;

function processInput() {
    const seedText = document.getElementById("seed").value || "";
    const seed = textToSeed(seedText || "default");
    const input = document.getElementById("input").value;
    const outputEl = document.getElementById("output");
    const speakBtn = document.getElementById("speak-btn");
    const lang = document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US";
    const t = translations[lang];

    const { emojiBase, separatorEmojis } = generateEmojiRanges(seed);

    if (!input) {
        typeText(outputEl, t.emptyError);
        return;
    }

    let output = "";
    if (mode === "textToEmoji") {
        output = textToEmoji(input, seed, emojiBase, separatorEmojis);
        speakBtn.classList.add("hidden");
    } else {
        output = emojiToText(input, seed, emojiBase, separatorEmojis);
        speakBtn.classList.remove("hidden");
    }
    typeText(outputEl, output);
    window.lastResult = output;
}

function typeText(element, text, callback) {
    element.textContent = "";
    element.value = "";
    let i = 0;
    const speed = 10;
    function type() {
        if (i < text.length) {
            if (element.tagName === "TEXTAREA") {
                element.value += text[i];
            } else {
                element.textContent += text[i];
            }
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

function switchMode() {
    if (isSwitching) return;
    isSwitching = true;

    const modeBtn = document.getElementById("mode-btn");
    modeBtn.classList.add("clicked");
    setTimeout(() => modeBtn.classList.remove("clicked"), 300);

    const inputEl = document.getElementById("input");
    const outputEl = document.getElementById("output");
    const inputLabel = document.getElementById("input-label");
    const outputLabel = document.getElementById("output-label");
    const lang = document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US";
    const t = translations[lang];

    inputLabel.style.opacity = "0";
    outputLabel.style.opacity = "0";

    setTimeout(() => {
        // 更新標籤
        const newInputLabel = mode === "textToEmoji" ? t.emojiLabel : t.textLabel;
        const newOutputLabel = mode === "textToEmoji" ? t.textLabel : t.emojiLabel;
        inputLabel.textContent = newInputLabel;
        outputLabel.textContent = newOutputLabel;

        inputLabel.style.opacity = "1";
        outputLabel.style.opacity = "1";

        // 交換內容：將當前輸出放入輸入框
        const currentOutput = window.lastResult || outputEl.textContent || "";
        typeText(inputEl, currentOutput, () => {
            // 切換模式
            mode = mode === "textToEmoji" ? "emojiToText" : "textToEmoji";
            // 根據新模式重新處理輸入
            processInput();
            isSwitching = false;
        });
    }, 300);
}

function copyToClipboard() {
    if (window.lastResult) {
        navigator.clipboard.writeText(window.lastResult).then(() => {
            const lang = document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US";
            showFeedback(translations[lang].copied);
        });
    }
}

function pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
        const inputEl = document.getElementById("input");
        inputEl.value = "";
        typeText(inputEl, text, processInput);
        const lang = document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US";
        showFeedback(translations[lang].pasted);
    }).catch(err => {
        console.error("貼上失敗:", err);
        showFeedback("貼上失敗");
    });
}

function speakOutput() {
    if (mode === "emojiToText" && window.lastResult) {
        const utterance = new SpeechSynthesisUtterance(window.lastResult);
        speechSynthesis.speak(utterance);
        const lang = document.getElementById("language-trigger").textContent === "中文" ? "zh-TW" : document.getElementById("language-trigger").textContent === "日本語" ? "ja-JP" : "en-US";
        showFeedback(translations[lang].playing);
    }
}

function showFeedback(message) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = message;
    feedback.classList.add("show");
    setTimeout(() => {
        feedback.classList.remove("show");
    }, 2000);
}

function initCustomSelect() {
    const trigger = document.getElementById("language-trigger");
    const options = document.getElementById("language-options");
    const optionItems = options.querySelectorAll(".option");

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (options.classList.contains("show")) {
            options.classList.remove("show");
        } else {
            options.classList.add("show");
        }
    });

    optionItems.forEach(option => {
        option.addEventListener("click", (e) => {
            e.stopPropagation();
            trigger.textContent = option.textContent;
            options.classList.remove("show");
            updateLanguage();
            processInput();
        });
    });

    document.addEventListener("click", (e) => {
        if (!trigger.contains(e.target) && !options.contains(e.target)) {
            options.classList.remove("show");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            options.classList.remove("show");
        }
    });
}

function initBackgroundSound() {
    const audio = document.getElementById('bg-sound');
    const muteBtn = document.getElementById('mute-btn');
    let isMuted = false;

    showFeedback("請點擊頁面以啟動背景音效");
    document.addEventListener('click', () => {
        audio.play().then(() => {
            console.log("背景音效開始播放");
        }).catch(err => {
            console.error("播放失敗:", err);
            showFeedback("無法播放音效，請重試");
        });
    }, { once: true });

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        audio.muted = isMuted;
        muteBtn.innerHTML = `<span class="material-icons">${isMuted ? 'volume_off' : 'volume_up'}</span>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initEmojiRanges();
    updateLanguage();
    initCustomSelect();
    initBackgroundSound();
    document.getElementById("input").addEventListener("input", processInput);
    document.getElementById("seed").addEventListener("input", processInput);
    document.getElementById("mode-btn").addEventListener("click", switchMode);
    document.getElementById("copy-btn").addEventListener("click", copyToClipboard);
    document.getElementById("paste-btn").addEventListener("click", pasteFromClipboard);
    document.getElementById("speak-btn").addEventListener("click", speakOutput);
    document.getElementById("range-options").addEventListener("change", processInput);
    processInput();
});