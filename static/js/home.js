class Model {
    async read() {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
                "accepts": "application/json"
            }
        };
        // Вызовите конечную точку REST и дождитесь данных
        let response = await fetch(`/api/people`, options);
        let data = await response.json();
        return data;
    }
}
class View {
    constructor() {
        this.table = document.querySelector(".people table");
        this.person_id = document.getElementById("person_id");
        this.fname = document.getElementById("fname");
        this.lname = document.getElementById("lname");
    }
    reset() {
        this.person_id.textContent = "";
        this.lname.value = "";
        this.fname.value = "";
        this.fname.focus();
    }
    buildTable(people) {
        let tbody,
            html = "";
        // Перебирай людей и создавай таблицу
        people.forEach((person) => {
            html += `

                ${person.timestamp}
                ${person.fname} ${person.lname}
            `;
        });
        // В настоящее время в таблице есть кто-то еще?
        if (this.table.tBodies.length !== 0) {
            this.table.removeChild(this.table.getElementsByTagName("tbody")[0]);
        }
        // Обновите tbody нашим новым контентом
        tbody = this.table.createTBody();
        tbody.innerHTML = html;
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
    }
    async initializeTable() {
        try {
            let urlPersonId = parseInt(document.getElementById("url_person_id").value),
                people = await this.model.read();
            this.view.buildTable(people);
            // Мы сориентировались здесь с выбранным человеком?
            if (urlPersonId) {
                let person = await this.model.readOne(urlPersonId);
                this.view.updateEditor(person);
                this.view.setButtonState(this.view.EXISTING_NOTE);
            // В противном случае, нет, так что оставьте редактор пустым
            } else {
                this.view.reset();
                this.view.setButtonState(this.view.NEW_NOTE);
            }
            this.initializeTableEvents();
        } catch (err) {
            this.view.errorMessage(err);
        }
    }
    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let fname = document.getElementById("fname").value,
                lname = document.getElementById("lname").value;
            evt.preventDefault();
            try {
                await this.model.create({
                    fname: fname,
                    lname: lname
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
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