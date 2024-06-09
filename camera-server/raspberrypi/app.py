from twisted.internet.protocol import ReconnectingClientFactory
from autobahn.twisted.websocket import WebSocketClientProtocol, WebSocketClientFactory
import json
import subprocess

server = "127.0.0.1"  # Server IP Address or domain e.g., tabvn.com
port = 3001  # Server Port

streaming_process = None

class App:
    def __init__(self):
        print("App is initial.")

    def stop_camera(self):
        global streaming_process

        if streaming_process is not None:
            print("Begin stopping camera")
            streaming_process.kill()
            streaming_process = None
        else:
            print("No streaming process so we don't need to stop")

    def show_camera(self, is_bool):
        global streaming_process

        print(f"We need to show camera {is_bool}")

        if is_bool:
            if streaming_process is None:
                ffmpeg_command = (
                    'ffmpeg -re -i /home/fadymaher/git-fedora/AIoT-Platform-for-smart-cities/camera-server/storage/Grocery_Shopping.mp4 '
                    '-c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 '
                    '-f flv rtmp://localhost/live/fady'
                )
                streaming_process = subprocess.Popen(ffmpeg_command, shell=True, stdin=subprocess.PIPE)
            else:
                print("Streaming is in process; we are not accepting more streaming.")
        else:
            self.stop_camera()

    def decode_message(self, payload):
        print(f"Got message need to decode {payload}")
        json_message = json.loads(payload)
        action = json_message.get('action')
        payload_value = json_message.get('payload')

        if action == 'stream':
            self.show_camera(payload_value)

class AppProtocol(WebSocketClientProtocol):
    def onConnect(self, response):
        print("Connected to the server")
        self.factory.resetDelay()

    def onOpen(self):
        print("Connection is open.")
        self.send_initial_message()

    def send_initial_message(self):
        message = {"action": "pi_online", "payload": {"id": "fady", "secret": "key"}}
        print("Sending message to server:", message)
        self.sendMessage(json.dumps(message).encode('utf8'))

    def onMessage(self, payload, isBinary):
        if isBinary:
            print(f"Got Binary message {len(payload)} bytes")
        else:
            print(f"Got Text message from the server {payload.decode('utf8')}")
            app = App()
            app.decode_message(payload.decode('utf8'))

    def onClose(self, wasClean, code, reason):
        print(f"Connection closed: {reason}")

class AppFactory(WebSocketClientFactory, ReconnectingClientFactory):
    protocol = AppProtocol

    def clientConnectionFailed(self, connector, reason):
        print(f"Unable to connect to the server: {reason}")
        self.retry(connector)

    def clientConnectionLost(self, connector, reason):
        print(f"Lost connection and retrying... {reason}")
        self.retry(connector)

if __name__ == '__main__':
    import sys
    from twisted.python import log
    from twisted.internet import reactor

    log.startLogging(sys.stdout)
    factory = AppFactory(f"ws://{server}:{port}")
    reactor.connectTCP(server, port, factory)
    reactor.run()

