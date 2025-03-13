const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const recordBtn = document.getElementById("record-btn");
const textModeBtn = document.getElementById("text-mode-btn");
const voiceModeBtn = document.getElementById("voice-mode-btn");
const sendBtn = document.getElementById("send-btn");

document.getElementById("send-btn").addEventListener("click", () => sendMessage());

// Inisialisasi SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "id-ID"; // Bahasa Indonesia

// Mode Teks
textModeBtn.addEventListener("click", () => {
    toggleInputMode("text");
});

// Mode Voice
voiceModeBtn.addEventListener("click", () => {
    toggleInputMode("voice");
});

// Fungsi untuk mengubah mode input
function toggleInputMode(mode) {
    if (mode === "text") {
        userInput.style.display = "block";
        sendBtn.style.display = "block";
        recordBtn.style.display = "none";
        userInput.disabled = false;
        userInput.placeholder = "Ketik pesan...";
    } else {
        userInput.style.display = "none";
        sendBtn.style.display = "none";
        recordBtn.style.display = "block";
        userInput.disabled = true;
    }
}

// Rekam suara
recordBtn.addEventListener("click", () => {
    recordBtn.textContent = "🎙️ Mendengarkan...";
    recognition.start();
});

// Jika suara dikenali
recognition.onresult = (event) => {
    const voiceText = event.results[0][0].transcript;
    sendMessage(voiceText);
    recordBtn.textContent = "🎤";
};

// Jika gagal mengenali suara
recognition.onerror = () => {
    recordBtn.textContent = "🎤";
    alert("Gagal mengenali suara, coba lagi.");
};

// Kirim pesan
async function sendMessage(message = null) {
    if (message instanceof Event) return; // Hindari bug PointerEvent

    const text = message || userInput.value.trim();
    if (!text) return;

    // Ganti tombol jadi loading
    sendBtn.textContent = "⌛";
    sendBtn.disabled = true;
    
    appendMessage("user", text);

    // Tampilkan loading "AI sedang mengetik..."
    const loading = appendMessage("ai", "AI sedang mengetik...", false, true);

    const apiUrl = `https://faris-apii.biz.id/islamai?text=${encodeURIComponent(text)}`;
    userInput.value = "";

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        removeMessage(loading); // Hapus loading
        appendMessage("ai", result.message.result || "Gagal mendapatkan jawaban.", true);
    } catch (error) {
        console.error("Error:", error);
        removeMessage(loading);
        appendMessage("ai", "Terjadi kesalahan saat menghubungi AI.");
    }

    // Kembalikan tombol ke normal
    sendBtn.textContent = "➡️";
    sendBtn.disabled = false;

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

// Tambahkan pesan ke chat
function appendMessage(sender, text, isAI = false, isLoading = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    if (isLoading) {
        messageDiv.textContent = text;
        let dots = 0;
        const interval = setInterval(() => {
            dots = (dots + 1) % 4;
            messageDiv.textContent = "AI sedang mengetik" + ".".repeat(dots);
        }, 500);
        messageDiv.dataset.loadingInterval = interval;
    } else if (isAI) {
        messageDiv.innerHTML = `<span class="message-text"></span> <button class="copy-btn">📋</button>`;
        typeText(messageDiv.querySelector(".message-text"), text);

        // Fitur salin teks
        messageDiv.querySelector(".copy-btn").addEventListener("click", () => {
            navigator.clipboard.writeText(text).then(() => alert("Teks disalin!"));
        });
    } else {
        messageDiv.textContent = text;
    }

    chatBox.appendChild(messageDiv);
    return messageDiv;
}

// Efek animasi teks muncul satu per satu
function typeText(element, text, speed = 50) {
    let index = 0;
    function type() {
        if (index < text.length) {
            element.textContent += text[index++];
            setTimeout(type, speed);
        }
    }
    type();
}

// Hapus pesan tertentu
function removeMessage(element) {
    if (element && element.parentNode) {
        if (element.dataset.loadingInterval) clearInterval(element.dataset.loadingInterval);
        element.remove();
    }
}

// Kirim pesan dengan tombol "Enter"
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});
