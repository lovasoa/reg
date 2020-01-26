const TOKEN = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjA3NDk5YzJjYzVhZTg2NzQ3MmZmY2NmOTU0NmYwNDhkYzhhNTIwM2QzNmE3ZDNhYTg1ODBjNDIxOTlkODZiZmJiMWM2MGY0ZDJlN2Y4N2YwIn0.eyJhdWQiOiI4IiwianRpIjoiMDc0OTljMmNjNWFlODY3NDcyZmZjY2Y5NTQ2ZjA0OGRjOGE1MjAzZDM2YTdkM2FhODU4MGM0MjE5OWQ4NmJmYmIxYzYwZjRkMmU3Zjg3ZjAiLCJpYXQiOjE1Nzk4ODA3NjMsIm5iZiI6MTU3OTg4MDc2MywiZXhwIjoxNjExNTAzMTYzLCJzdWIiOiI0MDYiLCJzY29wZXMiOltdfQ.BhyfZqTDNLIZ0vKYVuox_H_UPIhnrOItSiUaYmE4x9CFar1g9F2yH8Pd421hVR0oQ8a9VARMionGg2R9kK8IAsbewLA_L2zS_96W_4MDU65_thTO3JcwNYd64TqW7WlrM7qQwK9YUVnBdniLhyQGelO2vlb3nOargaOsZ0mIxzB6C_wwUnzMTOcD_Pv16_mFfDm4g7I4uKlTCQqhNSgBIM_fa3lzuHlvP2_Np7aDWhM6c9ekk0PjiF991kghsfoF_HXFTkLsONsBZ7TIrHILfSq7hKolG-MO2eNezUOqkStIIGCF0vgu1flyUEJKSHJZ2cEyTb5VOdcN3riyK47Yj3ubZcC7khNZtLyNe0Cud9GLSo6WAXQiBYCkAqVSKO6ZGcAj8wNDp6efs30LKgiyc8jiMvyrgOLDDqcKdxcmyeqWDq9Ofut6yJEpKu2efl2UCxJUGsD-dXWNc06NSp3kuxzaB2ufppgrCZjCHet2e3eU_5qE5v2Nassx9NIGVpvlQO4EBstPt1QwI4vUIdeYGsjXTgMhRHYjPjHihKXRWaZznPl42Jfo8IO_YLU48cNGxu7fqwih8A-tXyXtsGT2w80I5BmLEs2IaosvqaofBsIYxj9t_R04BehMJKNMBMzuDdeDhN7fdkS0KEAezCQV4FPR7qPyZuwatsIf71wqYfs`

/**
 * Returns a random channel ID
 */
function random_int(max) {
    return (Math.random() * max) | 0;
}

function random_peer_id() {
    return btoa(Array(9).fill().map((_, i) => String.fromCharCode(random_int(0xFF))).join(''));
}

class Socket {
    constructor(channel_id, { onmove }) {
        this.id = random_peer_id();
        this.opponent = null;
        this.websocket = new WebSocket(`wss://connect.websocket.in/v2/${channel_id}?token=${TOKEN}`);
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
}

export function connect_from_url(handlers) {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    let channel_id = params.get("id") | 0;
    if (!channel_id) {
        channel_id = random_int(10000);
        params.set("id", channel_id);
        url.search = params;
        window.history.replaceState(null, "rÊg", url);
    }
    return new Socket(channel_id, handlers);
}