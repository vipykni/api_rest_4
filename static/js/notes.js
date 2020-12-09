class Model {
    async read(personId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        };
        let response = await fetch(`/api/people/${personId}`, options);
        let data = await response.json();
        return data;
    }

    async readOne(personId, noteId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch(`/api/people/${personId}/notes/${noteId}`, options);
        let data = await response.json();
        return data;
    }

    async create(personId, note) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(note)
        };
        let response = await fetch(`/api/people/${personId}/notes`, options);
        let data = await response.json();
        return data;
    }

    async update(personId, note) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(note)
        };
        let response = await fetch(`/api/people/${personId}/notes/${note.noteId}`, options);
        let data = await response.json();
        return data;
    }

    async delete(personId, noteId) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch(`/api/people/${personId}/notes/${noteId}`, options);
        return response;
    }
}



class View {
    constructor() {
        this.NEW_NOTE = 0;
        this.EXISTING_NOTE = 1;
        this.table = document.querySelector(".notes table");
        this.error = document.querySelector(".error");
        this.personId = document.getElementById("person_id");
        this.fname = document.getElementById("fname");
        this.lname = document.getElementById("lname");
        this.timestamp = document.getElementById("timestamp");
        this.noteId = document.getElementById("note_id");
        this.note = document.getElementById("note");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.noteId.textContent = "";
        this.note.value = "";
        this.note.focus();
    }

    updateEditor(note) {
        this.noteId.textContent = note.noteId;
        this.note.value = note.content;
        this.note.focus();
    }

    setButtonState(state) {
        if (state === this.NEW_NOTE) {
            this.createButton.disabled = false;
            this.updateButton.disabled = true;
            this.deleteButton.disabled = true;
        } else if (state === this.EXISTING_NOTE) {
            this.createButton.disabled = true;
            this.updateButton.disabled = false;
            this.deleteButton.disabled = false;
        }
    }

    buildTable(person) {
        let tbody,
            html = "";

        this.personId.textContent = person.person_id;
        this.fname.textContent = person.fname;
        this.lname.textContent = person.lname;
        this.timestamp.textContent = person.timestamp;

        person.notes.forEach((note) => {
            html += `
            <tr data-note_id="${note.note_id}" data-content="${note.content}">
                <td class="timestamp">${note.timestamp}</td>
                <td class="content">${note.content}</td>
            </tr>`;
        });
        if (this.table.tBodies.length !== 0) {
            this.table.removeChild(this.table.getElementsByTagName("tbody")[0]);
        }
        tbody = this.table.createTBody();
        tbody.innerHTML = html;
    }

    errorMessage(error_msg) {
        let error = document.querySelector(".error");

        error.innerHTML = error_msg;
        error.classList.add("visible");
        error.classList.remove("hidden");
        setTimeout(() => {
            error.classList.add("hidden");
            error.classList.remove("visible");
        }, 2000);
    }
}



class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.initialize();
    }

    async initialize() {
        await this.initializeTable();
        this.initializeTableEvents();
        this.initializeCreateEvent();
        this.initializeUpdateEvent();
        this.initializeDeleteEvent();
        this.initializeResetEvent();
    }

    async initializeTable() {
        try {
            let urlPersonId = +document.getElementById("url_person_id").value,
                urlNoteId = +document.getElementById("url_note_id").value,
                person = await this.model.read(urlPersonId);

            this.view.buildTable(person);

            if (urlNoteId) {
                let note = await this.model.readOne(urlPersonId, urlNoteId);
                this.view.updateEditor(note);
                this.view.setButtonState(this.view.EXISTING_NOTE);

            } else {
                this.view.reset();
                this.view.setButtonState(this.view.NEW_NOTE);
            }
            this.initializeTableEvents();
        } catch (err) {
            this.view.errorMessage(err);
        }
    }

    initializeTableEvents() {
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                noteId = target.getAttribute("data-note_id"),
                content = target.getAttribute("data-content");

            this.view.updateEditor({
                noteId: noteId,
                content: content
            });
            this.view.setButtonState(this.view.EXISTING_NOTE);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let urlPersonId = +document.getElementById("person_id").textContent,
                note = document.getElementById("note").value;

            evt.preventDefault();
            try {
                await this.model.create(urlPersonId, {
                    content: note
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeUpdateEvent() {
        document.getElementById("update").addEventListener("click", async (evt) => {
            let personId = +document.getElementById("person_id").textContent,
                noteId = +document.getElementById("note_id").textContent,
                note = document.getElementById("note").value;

            evt.preventDefault();
            try {
                await this.model.update(personId, {
                    personId: personId,
                    noteId: noteId,
                    content: note
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let personId = +document.getElementById("person_id").textContent,
                noteId = +document.getElementById("note_id").textContent;

            evt.preventDefault();
            try {
                await this.model.delete(personId, noteId);
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeResetEvent() {
        document.getElementById("reset").addEventListener("click", async (evt) => {
            evt.preventDefault();
            this.view.reset();
            this.view.setButtonState(this.view.NEW_NOTE);
        });
    }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

export default {
    model,
    view,
    controller
};