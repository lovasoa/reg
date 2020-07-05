const API_KEY = 'U4V7A1XSVvHeqoNsMuSGNc4Z7HBbWRR0PlhwYWk3fCzwCVPneOX2zy3TebAt'

/**
 * Returns a random channel ID
 */
export function random_int(max) {
    return (Math.random() * max) | 0;
}

function random_peer_id() {
    return btoa(Array(9).fill(0).map((_, i) =>
        String.fromCharCode(random_int(0xFF))).join(''));
}

export class Socket {
    constructor(channel_id, { onmove }) {
        this.id = random_peer_id();
        this.opponent = null;
        this.websocket = new WebSocket(`wss://connect.websocket.in/v3/${channel_id}?apiKey=${API_KEY}`);
        this.websocket.onmessage = this.onmessage.bind(this);
        this.websocket.onopen = this.introduce.bind(this);
        this.onmove = onmove;
        this.last_grid = null;
    }
    onmessage(event) {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
            case "move":
                this.last_grid = msg.grid;
                this.onmove(msg.grid);
                break;
            case "introduction":
                this.onintroduction(msg.id);
                break;
            default:
                console.error("Unhandled message:", msg);
        }
    }
    introduce() {
        this.send({ type: 'introduction', id: this.id }, true);
    }
    move(grid) {
        this.last_grid = grid;
        this.send({ type: "move", grid });
        return this;
    }
    send(msg, force) {
        const rawMsg = JSON.stringify(msg);
        this.last_msg = rawMsg;
        if (this.opponent || force)
            this.websocket.send(rawMsg);
    }
    onintroduction(id) {
        if (this.opponent != id) {
            this.opponent = id;
            if (this.last_grid)
                this.move(this.last_grid);
            this.introduce();
        }
    }
    connected() {
        return this.opponent != null;
    }
}

export function connect_from_url(handlers) {
    const url = new URL(window.location.toString());
    const params = new URLSearchParams(url.search);

    let channel_id = params.get("id") || 0;
    if (!channel_id) {
        channel_id = random_int(10000);
        params.set("id", channel_id.toString());
        url.search = params.toString();
        window.history.replaceState(null, "rÊg", url.toString());
    }
    return new Socket(channel_id, handlers);
}