"""Udacity assignment for creating a catalog."""

import sys
from config import configure_app
from flask import (
    Flask,
    flash,
    redirect,
    url_for,
    # request,
    render_template
    )
from sqlalchemy.orm.exc import NoResultFound
from flask_dance.contrib.github import (
    make_github_blueprint,
    # github
    )
from flask_dance.consumer.backend.sqla import (
    # OAuthConsumerMixin,
    SQLAlchemyBackend
    )
from flask_dance.consumer import oauth_authorized, oauth_error
from flask_login import (
    LoginManager,
    # UserMixin,
    current_user,
    login_required,
    login_user,
    logout_user
    )
from models import User, OAuth, db


app = Flask(__name__, instance_relative_config=True)
configure_app(app)

# Add github-blueprint for oauth
blueprint = make_github_blueprint(
    client_id=app.config['GITHUB_CLIENT_ID'],
    client_secret=app.config['GITHUB_CLIENT_SECRET'],
    scope='user:email',
)
app.register_blueprint(blueprint, url_prefix="/login")

# setup login manager
login_manager = LoginManager()
login_manager.login_view = 'github.login'


@login_manager.user_loader
def load_user(user_id):
    """Return user by user_id."""
    return User.query.get(int(user_id))


# setup SQLAlchemy backend
blueprint.backend = SQLAlchemyBackend(OAuth, db.session, user=current_user)


@oauth_authorized.connect_via(blueprint)
def github_logged_in(blueprint, token): # noqa
    """Create/login local user on successful OAuth login."""
    if not token:
        flash("Failed to log in with {name}".format(name=blueprint.name))
        return
    # figure out who the user is
    resp = blueprint.session.get("/user")
    if resp.ok:
        username = resp.json()["login"]
        email = resp.json()["email"]
        query = User.query.filter_by(email=email)
        try:
            user = query.one()
        except NoResultFound:
            # create a user
            user = User(username=username, email=email)
            db.session.add(user)
            db.session.commit()
        login_user(user)
        flash("Successfully signed in with GitHub")
    else:
        msg = "Failed to fetch user info from {name}".format(
            name=blueprint.name)
        flash(msg, category="error")


@oauth_error.connect_via(blueprint)
def github_error(blueprint, error, error_description=None, error_uri=None): # noqa
    """Notify on OAuth provider error."""
    msg = (
        "OAuth error from {name}! "
        "error={error} description={description} uri={uri}"
    ).format(
        name=blueprint.name,
        error=error,
        description=error_description,
        uri=error_uri,
    )
    flash(msg, category="error")


@app.route("/logout")
@login_required
def logout():
    """Log out user."""
    logout_user()
    flash("You have logged out")
    return redirect(url_for("index"))


@app.route('/')
def index():
    """View for home."""
    print(app.config["SQLALCHEMY_DATABASE_URI"])
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


# hook up extensions to app
db.init_app(app)
login_manager.init_app(app)

if __name__ == "__main__":
    if "--setup" in sys.argv:
        with app.app_context():
            db.create_all()
            db.session.commit()
            print("Database tables created")
    else:
        app.run(debug=True)
