Place your catalog project in this directory.

## Notes


### Extensions:
-Flash-RESTful or Flask-Restless.
-Flask-Testing

[Flask extensions](http://flask.pocoo.org/extensions/)

##Requirements:

```Shell
pip freeze > requirements.txt
pip install -r requirements.txt
```

## Setting up the database

You can create the database with the following command:
```Shell
python app.py --setup
```

## Setting up the config-files

Because I don't want to store my config-files with my secrets publicly on github, you will have to create your own. But don't worry, it is not much work.
Create a folder called `instance` and within the folder, create a file called `config.cfg`. Put this into that file:

```INI
TESTING=False
DEBUG=True
GITHUB_CLIENT_ID="your_key_here"
GITHUB_CLIENT_SECRET="your_key_here"
TWITTER_API_KEY="your_key_here"
TWITTER_API_SECRET="your_key_here"
```

## Running the server

```Shell
export FLASK_APP=app.py
flask run
```
