from flask import make_response, abort
from config import db
from models import Person, PersonSchema, Note

def read_all():

    people = Person.query.order_by(Person.lname).all()

    person_schema = PersonSchema(many=True)
    data = person_schema.dump(people)
    return data

def read_one(person_id):

    person = (
        Person.query.filter(Person.person_id == person_id)
        .outerjoin(Note)
        .one_or_none()
    )

    if person is not None:

        person_schema = PersonSchema()
        data = person_schema.dump(person)
        return data

    else:
        abort(404, f"Person not found for Id: {person_id}")

def create(person):

    fname = person.get("fname")
    lname = person.get("lname")

    existing_person = (
        Person.query.filter(Person.fname == fname)
        .filter(Person.lname == lname)
        .one_or_none()
    )

    if existing_person is None:

        schema = PersonSchema()
        new_person = Person(lname=lname, fname=fname)

        db.session.add(new_person)
        db.session.commit()

        data = schema.dump(new_person)

        return data, 201

    else:
        abort(409, f"Person {fname} {lname} exists already")

def update(person_id, person):


    fname = person.get("fname")
    lname = person.get("lname")

    update_person = Person.query.filter(
        Person.person_id == person_id
    ).one_or_none()

    if update_person is not None:

        schema = PersonSchema()
        update = Person(lname=lname, fname=fname)

        update.person_id = update_person.person_id

        db.session.merge(update)
        db.session.commit()

        data = schema.dump(update_person)

        return data, 200

    else:
        abort(404, f"Person not found for Id: {person_id}")

def delete(person_id):

    person = Person.query.filter(Person.person_id == person_id).one_or_none()

    if person is not None:
        db.session.delete(person)
        db.session.commit()
        return make_response(f"Person {person_id} deleted", 200)

    else:
        abort(404, f"Person not found for Id: {person_id}")