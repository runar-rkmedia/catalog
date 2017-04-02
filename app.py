"""Udacity assignment for creating a catalog."""

import sys
from config import configure_app
from flask import (
    Flask,
    flash,
    redirect,
    url_for,
    request,
    jsonify,
    render_template
)
from flask_misaka import Misaka  # noqa
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
from models import db, User, OAuth, Catagory, CatagoryItem
from flask_scss import Scss


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
login_manager.login_view = 'login'
login_manager.init_app(app)

Misaka(app)


@login_manager.user_loader
def load_user(user_id):
    """Return user by user_id."""
    return User.query.get(int(user_id))


# setup SQLAlchemy backend
blueprint.backend = SQLAlchemyBackend(
    OAuth, db.session, user=current_user)


@oauth_authorized.connect_via(blueprint)
def github_logged_in(blueprint, token):  # noqa
    """Create/login local user on successful OAuth login."""
    if not token:
        flash(
            "Failed to log in with {name}".format(name=blueprint.name))
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
def github_error(blueprint, error, error_description=None, error_uri=None):  # noqa
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
    return redirect(url_for("view_catalog"))


@app.route('/login')
def login():
    """View for login."""
    return render_template('login.html')


@app.route('/')
def view_catalog():
    """View for home."""
    catagories = Catagory.query.all()
    items = CatagoryItem.query.all()
    print(items)
    return render_template(
        'catalogs.html',
        catagories=catagories,
        items=items,
        item_show_catagory=True,
    )


@app.route('/json/catalog/', methods=['GET', 'POST'])
def json_catalog():
    """Return a json of the catagories, or create a new catagory."""
    if request.method == 'POST':
        response = {}
        if not current_user.is_authenticated:
            response['error'] = 'You are not logged in'
            return jsonify(response)
        method = request.form['_method']
        if method == 'post':
            catagory_name = request.form['Catagory-name']
            catagory_desc = request.form['Catagory-desc']
            try:
                Catagory.create_catagory(
                    name=catagory_name,
                    description=catagory_desc,
                    created_by_user_id=current_user.id
                )
            except ValueError as e:
                response['error'] = str(e)
            else:
                response['success'] = 'Successfully added catagory'
            return jsonify(response)
    catagories = Catagory.query.all()
    return jsonify(catagories=[i.serialize for i in catagories])


@app.route('/json/catalog/<int:catagory_id>/', methods=[
    'GET', 'POST', 'PUT', 'DELETE'])
def json_catalog_catagory(catagory_id):
    """Return a json-object of the items in a catagory."""
    response = {}
    if request.method == 'POST':
        if not current_user.is_authenticated:
            response['error'] = 'You are not logged in'
            return jsonify(response)
        method = request.form['_method']
        print(request.form)
        if method == 'post':
            catagory_name = request.form['Item-name']
            catagory_desc = request.form['Item-desc']
            try:
                CatagoryItem.create_catagory_item(
                    name=catagory_name,
                    description=catagory_desc,
                    created_by_user_id=current_user.id,
                    catagory_id=catagory_id
                )
            except ValueError as e:
                response['error'] = str(e)
            else:
                response['success'] = 'Successfully added catagory'
            return jsonify(response)
        response['error'] = 'we post an item'
        return jsonify(response)
    items = CatagoryItem.query.filter_by(catagory_id=catagory_id).all()
    return jsonify(items=[i.serialize for i in items])


@app.route('/json/catalog/items/latest/')
def json_catalog_catagory_latest_items():
    """Return a json-object of the items in a catagory."""
    items = CatagoryItem.query.order_by('time_created').limit(10)
    return jsonify(items=[i.serialize for i in items])


@app.route('/catalog/<catagory>')
def view_catagory(catagory):
    """View for catagories."""
    catagory = Catagory.query.filter_by(name=catagory).first()
    items = CatagoryItem.query.filter_by(catagory_id=catagory.id).all()
    return render_template('catagory.html', catagory=catagory, items=items)


@app.route('/new/catalog/catagory/', methods=['GET', 'POST'])
@login_required
def view_catagory_new():
    """View for creating a catagory."""
    if request.method == 'POST':
        print(current_user.id)
        catagory_name = request.form['catagory_name']
        catagory_desc = request.form['catagory_desc']
        try:
            Catagory.create_catagory(
                name=catagory_name,
                description=catagory_desc,
                created_by_user_id=current_user.id
            )
        except ValueError as e:
            flash(e)
        else:
            flash("Successfully created catagory.")
            return redirect(url_for('view_catalog'))
    return render_template('new_catagory.html')


@app.route('/edit/catalog/<catagory>/')
def view_catagory_edit(catagory):
    """View for editing a catagory."""
    return 'Editing catagory {!s}'.format(catagory)


@app.route('/delete/catalog/<catagory>/')
def view_catagory_delete(catagory):
    """View for deleting a catagory."""
    return 'Deleting catagory {!s}'.format(catagory)


@app.route('/catalog/<catagory>/<item>')
def view_catagory_item(catagory, item):
    """View an item under a catagory."""
    return 'catagory {!s} {!s}'.format(catagory, item)


@app.route('/new/catalog/<catagory>')
def view_catagory_new_item(catagory):
    """Create a new item under a catagory."""
    return 'catagory {!s}'.format(catagory)


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
        # setup scss-folders

Scss(app, static_dir='static/css/', asset_dir='assets/scss/')
