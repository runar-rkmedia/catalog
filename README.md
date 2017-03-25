Place your catalog project in this directory.

## Notes


### Extensions:
-Flash-RESTful or Flask-Restless.
-Flask-Testing

[Flask extensions](http://flask.pocoo.org/extensions/)

##Requirements:

```
pip freeze > requirements.txt
pip install -r requirements.txt
```

## Setting up the database

You can create the database with the following command:
```
python app.py --setup
```

## Running the server

```
export FLASK_APP=app.py
flask run
```
