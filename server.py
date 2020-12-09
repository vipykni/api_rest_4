from flask import render_template
import config

connex_app = config.connex_app

connex_app.add_api("swagger.yml")

@connex_app.route("/")
def home():

    return render_template("home.html")


@connex_app.route("/people")
@connex_app.route("/people/<int:person_id>")
def people(person_id=""):

    return render_template("people.html", person_id=person_id)

@connex_app.route("/people/<int:person_id>")
@connex_app.route("/people/<int:person_id>/notes")
@connex_app.route("/people/<int:person_id>/notes/<int:note_id>")
def notes(person_id, note_id=""):

    return render_template("notes.html", person_id=person_id, note_id=note_id)

if __name__ == "__main__":
    connex_app.run(debug=True)