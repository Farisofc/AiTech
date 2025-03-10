async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    if (userInput.value.trim() === "") return;

    // Tambahkan pesan user
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = userInput.value;
    chatBox.appendChild(userMessage);

    // Tampilkan animasi loading
    const loading = document.createElement("div");
    loading.className = "message ai-message loading";
    loading.innerHTML = "<span>.</span><span>.</span><span>.</span>";
    chatBox.appendChild(loading);

    
    const apiUrl = `https://faris-apii.biz.id/islamai?text=${encodeURIComponent(userInput.value)}`;
    userInput.value = ""; // Kosongkan input

    try {
        const data = await fetch(apiUrl);
        const anjay = await data.json();

        // Hapus animasi loading
        chatBox.removeChild(loading);

        // Tambahkan pesan AI
        const aiMessage = document.createElement("div");
        aiMessage.className = "message ai-message";
        aiMessage.textContent = anjay.message.result|| "Gagal mendapatkan jawaban.";
        chatBox.appendChild(aiMessage);
    } catch (error) {
        console.error("Error:", error);
        // Hapus animasi loading dan tampilkan pesan error
        chatBox.removeChild(loading);
        const aiMessage = document.createElement("div");
        aiMessage.className = "message ai-message";
        aiMessage.textContent = "Terjadi kesalahan saat menghubungi API.";
        chatBox.appendChild(aiMessage);
    }
    
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll ke bawah otomatis
}

let mediaRecorder;
let audioChunks = [];
let stream; // Simpan stream secara global agar tidak meminta akses berulang kali
const recordBtn = document.getElementById("record-btn");

async function getMicrophoneAccess() {
    if (!stream) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error("Terjadi kesalahan dalam mengambil mikrofon:", err);
            alert("Gagal mengakses mikrofon. Pastikan kamu mengizinkan akses mikrofon.");
            return null;
        }
    }
    return stream;
}

recordBtn.addEventListener("click", async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        const stream = await getMicrophoneAccess();
        if (!stream) return;

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioMessage = document.createElement("audio");
            audioMessage.src = audioUrl;
            audioMessage.controls = true;
            audioMessage.className = "message user-message";

            document.getElementById("chat-box").appendChild(audioMessage);
            audioChunks = [];
        };

        mediaRecorder.start();
        recordBtn.textContent = "⏹️"; // Tombol stop
    } else {
        mediaRecorder.stop();
        recordBtn.textContent = "🎤"; // Tombol rekam
    }
});
