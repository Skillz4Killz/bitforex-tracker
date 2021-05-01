export interface SocketConnectionOptions {
    restart?: boolean;
    restartMessage?: string;
}

export type SocketEventHandler = (event: MessageEvent) => void;

export let closes = 0;
export let errors = 0;

export class SocketConnection {
    private socket?: WebSocket;
    private readonly restartMessage: string = '';
    private lastMessage: string = '';
    private listeners: Array<SocketEventHandler> = [];
    private messageQueue: Array<string> = [];
    private readonly restart: boolean = false;
    constructor(private url: string, options?: SocketConnectionOptions) {
        if(options) {
            if(options.restartMessage) this.restartMessage = options.restartMessage;
            if(options.restart) this.restart = options.restart;
        }
        this.initSocket();
    }

    private addOpen() {
        this.socket?.addEventListener('open', () => {
            this.messageQueue.map(e => this.send(e));
        });
    }

    private initSocket() {
        this.socket = new WebSocket(this.url);
        let message = this.restartMessage ? this.restartMessage : this.lastMessage;
        this.messageQueue = [];
        this.messageQueue.push(message);
        this.addOpen();
        if(this.restart) {
            this.addClose();
            this.addError();
        }
        this.repopulateListeners();
    }

    private addClose() {
        this.socket?.addEventListener('close', (event: CloseEvent) => {
            console.log('CLOSE');
            closes++;
            this.initSocket();
        });
    }

    private addError() {
        this.socket?.addEventListener('error', (event: Event) => {
            console.log('ERROR');
            errors++;
            this.initSocket();
        });
    }

    public addMessageListener(listener: SocketEventHandler) {
        this.listeners.push(listener);
        this.socket?.addEventListener('message', listener);
    }

    private repopulateListeners() {
        console.log(this.listeners);
        this.listeners.forEach(e => this.socket?.addEventListener('message', e));
    }

    public send(msg: string) {
        if(this.socket?.readyState !== 1) {
            this.messageQueue.push(msg);
            return;
        };
        this.socket?.send(msg);
        this.lastMessage = msg;
    }
}
