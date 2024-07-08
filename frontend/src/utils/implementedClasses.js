class Node {
    constructor(chat) {
        this.chat = chat;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    addLast(node) {
        if (this.tail === null) {
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
    }

    remove(node) {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        node.prev = null;
        node.next = null;
    }

    moveToHead(node) {
        if (this.head === node) {
            return;
        }
        this.remove(node);
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (this.tail === null) {
            this.tail = node;
        }
    }
}

export class ChatManager {
    constructor() {
        this.map = new Map();
        this.list = new DoublyLinkedList();
    }

    addChat(chat) {
        if (this.map.has(chat?.userId)) {
            const existingNode = this.map.get(chat?.userId);
            existingNode.chat = chat; // Update the chat details
        } else {
            const newNode = new Node(chat);
            this.list.addLast(newNode);
            this.map.set(chat?.userId, newNode);
        }
    }

    addChats(chats) {
        for (const chat of chats) {
            this.addChat(chat);
        }
    }

    removeChat(userId) {
        if (this.map.has(userId)) {
            const node = this.map.get(userId);
            this.list.remove(node);
            this.map.delete(userId);
        }
    }

    removeChats(userIds) {
        for (const userId of userIds) {
            this.removeChat(userId);
        }
    }

    moveToHead(userId) {
        if (this.map.has(userId)) {
            const node = this.map.get(userId);
            this.list.moveToHead(node);
        }
    }

    getChatsInOrder() {
        const chats = [];
        let current = this.list.head;
        while (current) {
            chats.push(current.chat);
            current = current.next;
        }
        return chats;
    }

    removeAllChats() {
        this.map.clear();
        this.list.head = null;
        this.list.tail = null;
    }

    exists(userId) {
        return this.map.has(userId);
    }

}

