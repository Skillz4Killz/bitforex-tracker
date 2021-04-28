export interface SocketConnectionOptions {
    restart?: boolean;
    restartMessage?: string;
}

export type SocketEventHandler = (event: MessageEvent) => void;

export class SocketConnection {
    private socket?: WebSocket;
    private ready: boolean = false;
    private readonly restartMessage: string = '';
    private lastMessage: string = '';
    private listeners: Array<SocketEventHandler> = [];
    private messageQueue: Array<string> = [];
    constructor(private url: string, options?: SocketConnectionOptions) {
        this.socket = new WebSocket(url);
        this.addOpen();
        if(options) {
            if(options.restartMessage) this.restartMessage = options.restartMessage;
            if(options.restart) this.addRestart();
        }
        this.socket.addEventListener('error', (event: Event) => {
            console.log('ERROR!!');
            console.log(event)
        });
    }

    private addOpen() {
        this.socket?.addEventListener('open', (event: Event) => {
            this.ready = true;
            this.messageQueue.map(e => this.send(e));
        });
    }

    private addRestart() {
        this.socket?.addEventListener('close', (event: CloseEvent) => {
            this.ready = false;
            this.socket = new WebSocket(this.url);
            this.addOpen();
            this.socket.addEventListener('error', (event: Event) => {
                console.log('ERROR!!');
                console.log(event)
            });
            let message = this.restartMessage ? this.restartMessage : this.lastMessage;
            this.socket?.addEventListener('open', (event: Event) => {
                this.send(message);
            });
            this.repopulateListeners();
            console.log('CLOSE!!!');
        });
    }

    public addMessageListener(listener: SocketEventHandler) {
        this.listeners.push(listener);
        this.socket?.addEventListener('message', listener);
    }

    private repopulateListeners() {
        this.listeners.forEach(e => this.socket?.addEventListener('message', e));
    }

    public send(msg: string) {
        if(!this.ready) {
            this.messageQueue.push(msg);
            return;
        };
        this.socket?.send(msg);
        this.lastMessage = msg;
    }
}
