const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default class EventManager {
    constructor() {
        this.events = {};
        this.ids = {}
    }

    register(eventName, handler, once = false) {
        const id = uuidv4();
        const event = {id, handler, once};

        if (!this.events[eventName]) this.events[eventName] = {};
        this.events[eventName][id] = event;
        this.ids[id] = eventName;
        return id;
    }

    unregister(id) {
        let eventName = this.ids[id];
        if (!eventName) return;
        delete this.ids[id];
        
        let event = this.events[eventName][id];
        if (!event) return;
        delete this.events[eventName][id];
    }

    clearEvents(eventName) {
        let events = this.events[eventName];
        if (!events) return;

        for (let id in events) {
            delete this.ids[id];
        }
        delete this.events[eventName];
    }

    notify(eventName, ...args) {
        let events = this.events[eventName];
        if (!events) return;

        let ids = Object.keys(events);
        ids.forEach((id, index, ids) => {
            let event = events[id];
            let handler = event.handler;
            handler(...args);

            if (event.once) this.unregister(id);
        })
    }

    reset() {
        this.ids = {}
        this.events = {}
    }
};

