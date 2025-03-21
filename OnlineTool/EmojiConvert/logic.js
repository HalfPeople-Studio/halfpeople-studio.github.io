const emojiRanges = [
    [0x1F600, 0x1F636], // 基本表情符號（如笑臉）
    [0x1F300, 0x1F320], // 核心雜項符號（如天氣）
    [0x1F680, 0x1F6A3], // 基本交通符號（如飛機）
    [0x2700, 0x2752],   // 常用裝飾符號（如手勢）
    [0x2600, 0x2613],   // 基礎雜項符號（如太陽）
    [0x1F400, 0x1F4FF], // 動物和自然
    [0x1F500, 0x1F5FF], // 符號和物品
    [0x1F700, 0x1F77F], // 煉金術符號
    [0x1F900, 0x1F9FF], // 補充符號和表情
    [0x1F000, 0x1F02F], // 麻將牌
    [0x1F0A0, 0x1F0FF]  // 撲克牌
];

const defaultRanges = [0, 1, 2, 3, 4]; // 默認啟用的範圍索引

function textToSeed(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function seededRandom(seed) {
    const a = 9301;
    const c = 49297;
    const m = 233280;
    let x = seed;
    return function() {
        x = (x * a + c) % m;
        return x / m;
    };
}

function isGraphicalCodepoint(code) {
    return !(code <= 0x001F || code === 0x007F ||
             (code >= 0xFE00 && code <= 0xFE0F) ||
             (code >= 0x200D && code <= 0x200F));
}

function generateEmojiRanges(seed) {
    const rand = seededRandom(seed);
    const selectedRanges = [];
    document.querySelectorAll("#range-options input:checked").forEach(input => {
        selectedRanges.push(emojiRanges[input.dataset.index]);
    });
    const validEmojis = [];
    selectedRanges.forEach(([start, end]) => {
        for (let code = start; code <= end; code++) {
            if (isGraphicalCodepoint(code)) {
                validEmojis.push(String.fromCodePoint(code));
            }
        }
    });
    const emojiBase = [];
    const separatorEmojis = [];
    const flagCandidates = ["⚪", "🔵", "🔴"];
    validEmojis.forEach(emoji => {
        const r = rand();
        if (r < 0.5) {
            emojiBase.push(emoji);
        } else {
            separatorEmojis.push(emoji);
            if (r < 0.6 && flagCandidates.length > 0) {
                separatorEmojis.push(flagCandidates.shift());
            }
        }
    });
    return { emojiBase, separatorEmojis };
}

function intToEmoji(code, emojiBase) {
    if (code === 0) return emojiBase[0];
    let result = "";
    while (code > 0) {
        const remainder = code % 64;
        result = emojiBase[remainder] + result;
        code = Math.floor(code / 64);
    }
    return result;
}

function emojiToInt(emojiSeq, emojiBase) {
    let result = 0;
    for (let char of emojiSeq) {
        const index = emojiBase.indexOf(char);
        if (index === -1) return -1;
        result = result * 64 + index;
    }
    return result;
}

function textToEmoji(text, seed, emojiBase, separatorEmojis) {
    const rand = seededRandom(seed);
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const code = text.codePointAt(i);
        const emojiSeq = intToEmoji(code, emojiBase);
        result += emojiSeq;
        if (i < text.length - 1 && separatorEmojis.length > 0) {
            const separator = separatorEmojis[Math.floor(rand() * separatorEmojis.length)];
            result += separator;
        }
        if (code > 0xffff) i++;
    }
    return result;
}

function emojiToText(emojiStr, seed, emojiBase, separatorEmojis) {
    const rand = seededRandom(seed);
    let result = "";
    let current = "";
    let separators = [];

    for (let i = 0; i < emojiStr.length; i++) {
        separators.push(separatorEmojis[Math.floor(rand() * separatorEmojis.length)]);
    }

    let i = 0;
    while (i < emojiStr.length) {
        const nextSep = separators[result.length] || "";
        const sepIndex = emojiStr.indexOf(nextSep, i);

        if (sepIndex === -1 || sepIndex > i) {
            current += emojiStr[i];
            i++;
        } else {
            const code = emojiToInt(current, emojiBase);
            if (code >= 0) result += String.fromCodePoint(code);
            current = "";
            i = sepIndex + nextSep.length;
        }
    }

    if (current) {
        const code = emojiToInt(current, emojiBase);
        if (code >= 0) result += String.fromCodePoint(code);
    }

    return result;
}