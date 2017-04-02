## Notes


### Extensions:
-Flash-RESTful or Flask-Restless.
-Flask-Testing

[Flask extensions](http://flask.pocoo.org/extensions/)

## Requirements:

```Shell
pip freeze > requirements.txt
pip install -r requirements.txt
```

# Choices made

- `flask-dance` to easily set up OAuth-providers.
- Single-Page App(SPA) with ajax-calls to server, and rendering as much as possible in jquery.
- Markdown is supported as input for the description-field in both catagory and items, but for sequrity, html is not. The input is cleaned using `bleach`, and then parsed to markdown before being stored on the server. Doing this in the database is a lot faster than parsing it on the fly. However, it is not as flexible.

## Setting up the database

You can create the database with the following command:
```Shell
python app.py --setup
```

## Setting up the config-files

Because I don't want to store my config-files with my secrets publicly on github, you will have to create your own. But don't worry, it is not much work.
Create a folder called `instance` and within the folder, create a file called `config.cfg`. Put this into that file:
GitHubGitHubGitHub
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
