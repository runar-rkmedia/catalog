"""Udacity assignment for creating a catalog."""

from config import configure_app
from flask import (Flask, flash, session, redirect,
                   url_for, request, render_template)
from flask_dance.contrib.github import make_github_blueprint, github
from database import db_session
from models import User


app = Flask(__name__, instance_relative_config=True)
configure_app(app)

# Add github-blueprint for oauth
blueprint = make_github_blueprint(
    client_id=app.config['GITHUB_CLIENT_ID'],
    client_secret=app.config['GITHUB_CLIENT_SECRET'],
)
app.register_blueprint(blueprint, url_prefix="/login")


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    # error = None
    if not github.authorized:
        return redirect(url_for("github.login"))
    resp = github.get("/user")
    assert resp.ok
    return "You are @{login} on GitHub".format(login=resp.json()["login"])
    # if request.method == 'POST':
    #     session['username'] = request.form['username']
    #     flash('You were successfully logged in')
    #     return redirect(url_for('index'))
    # return render_template('login.html', error=error)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Handle user signup."""
    print('ssfds')
    error = None
    if request.method == 'POST':
        username = request.form['username']
        full_name = request.form['full_name']
        email = request.form['email']
        # picture = request.form['picture']
        u = User(username=username, full_name=full_name,
                 email=email)
        db_session.add(u)
        db_session.commit()
        return redirect(url_for('index'))
    return render_template('signup.html', error=error)


@app.route('/logout')
def logout():
    """Handle user logout."""
    session.pop('username', None)
    return redirect(url_for('index'))


@app.route('/')
def index():
    """View for home."""
    return render_template('catalogs.html')


@app.route('/catalog.json')
def json_catalog():
    """View for home."""
    return 'Hello, World!'


@app.route('/catalog/<catagory>')
def view_catagory(catagory):
    """View for catagories."""
    return 'catagory {!s}'.format(catagory)


@app.route('/edit/catalog/<catagory>/')
def view_catagory__edit(catagory):
    """View for editing a catagory."""
    return 'Editing catagory {!s}'.format(catagory)


@app.route('/delete/catalog/<catagory>/')
def view_catagory__delete(catagory):
    """View for deleting a catagory."""
    return 'Deleting catagory {!s}'.format(catagory)


@app.route('/catalog/<catagory>/<item>')
def view_catagory_item(catagory, item):
    """View an item under a catagory."""
    return 'catagory {!s} {!s}'.format(catagory, item)


@app.route('/edit/catalog/<catagory>/<item>')
def view_catagory_edit_item(catagory, item):
    """View for editing an item under a catagory."""
    return 'Editing item {!s} from {!s}'.format(item, catagory)


@app.route('/delete/catalog/<catagory>/<item>')
def view_catagory_delete_item(catagory, item):
    """View for deleting an item under a catagory."""
    return 'Deleting item {!s} from {!s}'.format(item, catagory)


@app.errorhandler(404)
def page_not_found(error):
    """View for pages not found."""
    return render_template('page_not_found.html'), 404


@app.teardown_appcontext
def shutdown_session(exception=None):
    """Shutdown the database-session."""
    db_session.remove()
