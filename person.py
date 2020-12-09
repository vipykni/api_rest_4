from flask import (
  make_response,
  abort,
)
from config import db
from models import (
  Person,
  PersonSchema,
)

def read_all():

  people = Person.query \
    .order_by(Person.lname) \
    .all()

  person_schema = PersonSchema(many=True)
  return person_schema.dump(people).data

def read_one(person_id):

  person = Person.query \
    .filter(Person.person_id == person_id) \
    .one_or_none()

  if person is not None:

    person_schema = PersonSchema()
    return person_schema.dump(person).data

  else:
    abort(404, 'Person not found for Id: {person_id}'.format(person_id=person_id))

def create(person):

  fname = person.get('fname')
  lname = person.get('lname')

  existing_person = Person.query \
    .filter(Person.fname == fname) \
    .filter(Person.lname == lname) \
    .one_or_none()

  if existing_person is None:

    schema = PersonSchema()
    new_person = schema.load(person, session=db.session).data

    db.session.add(new_person)
    db.session.commit()

    return schema.dump(new_person).data, 201

  else:
    abort(409, f'Person {fname} {lname} exists already')