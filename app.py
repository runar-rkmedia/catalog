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
from flask_assets import Environment, Bundle


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

# To minify css, js etc.
assets = Environment(app)
js = Bundle('js/item.js',
            filters='rjsmin', output='js/minified.js')
assets.register('js_all', js)


def update_DB_output_json(success_msg, func, **kwargs):
    """."""
    response = {}
    try:
        func(**kwargs)
    except ValueError as e:
        response['error'] = str(e)
    else:
        response['success'] = success_msg  # noqa
    return jsonify(response)


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

        form_name = request.form['name']
        form_desc = request.form['desc']
        try:
            Catagory.create(
                name=form_name,
                description=form_desc,
                created_by_user_id=current_user.id
            )
        except ValueError as e:
            response['error'] = str(e)
        else:
            response['success'] = 'Successfully added catagory'
        return jsonify(response)
    catagories = Catagory.query.filter_by(archived=False).all()
    return jsonify(catagories=[i.serialize for i in catagories])


@app.route('/json/catalog/<int:catagory_id>/', methods=[
    'GET', 'POST', 'PUT', 'DELETE'])
def json_catalog_catagory(catagory_id):
    """Handle JSON-requests for a catagory and its items"""
    # Create an item
    if request.method == 'POST':
        form_name = request.form['name']
        form_desc = request.form['desc']
        return update_DB_output_json(
            success_msg="Successfully created item '{}'".format(form_name),
            func=CatagoryItem.create,
            name=form_name,
            description=form_desc,
            created_by_user_id=current_user.id,
            catagory_id=catagory_id
        )

    # Edit a catagory
    if request.method == 'PUT':
        form_name = request.form['name']
        form_desc = request.form['desc']
        return update_DB_output_json(
            success_msg="Successfully edited catagory '{}'".format(form_name),
            func=Catagory.edit,
            name=form_name,
            description=form_desc,
            created_by_user_id=current_user.id,
            catagory_id=catagory_id
        )

    # Delete a catagory
    if request.method == 'DELETE':
        return update_DB_output_json(
            success_msg="Successfully deleted catagory",
            func=Catagory.delete,
            created_by_user_id=current_user.id,
            catagory_id=catagory_id
        )
    items = CatagoryItem.query.join(
        CatagoryItem.catagory
    ).filter(
        CatagoryItem.catagory_id == catagory_id,
        Catagory.archived == False, # noqa
        CatagoryItem.archived == False, # noqa
    ).all()
    return jsonify(items=[i.serialize for i in items])


@app.route('/json/catalog/<int:catagory_id>/<int:item_id>/', methods=[
    'GET', 'PUT', 'DELETE'])
def json_catalog_catagory_items(catagory_id, item_id):
    """Handle JSON-requests for a items"""
    # Edit an item
    if request.method == 'PUT':
        form_name = request.form['name']
        form_desc = request.form['desc']
        return update_DB_output_json(
            success_msg="Successfully edited item '{}'".format(form_name),
            func=CatagoryItem.edit,
            name=form_name,
            description=form_desc,
            created_by_user_id=current_user.id,
            item_id=item_id
        )
    # Delete an item
    if request.method == 'DELETE':
        return update_DB_output_json(
            success_msg="Successfully deleted catagory",
            func=CatagoryItem.delete,
            created_by_user_id=current_user.id,
            item_id=item_id
        )
    # Get json-info
    item = CatagoryItem.query.filter_by(catagory_id=catagory_id, id=item_id, archived=False).first()  # noqa
    return jsonify(item.serialize)


@app.route('/json/catalog/items/latest/')
def json_catalog_catagory_latest_items():
    """Return a json-object of the items in a catagory."""
    items = CatagoryItem.query.join(
        CatagoryItem.catagory
    ).filter(
        Catagory.archived == False, # noqa
        CatagoryItem.archived == False, # noqa
    ).order_by(
        'time_created'
    ).limit(10)
    return jsonify(items=[i.serialize for i in items])


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
            # Create database-structure, and add som default-data.
            db.create_all()
            db.session.add(User(
                username='Jimmy',
                email='jimmy@example.com',
                full_name='Jimmy Joe'))
            db.session.add(Catagory(
                name='Snowboarding',
                description='A really __cool__ activity.',
                created_by_user_id=1))
            db.session.add(Catagory(
                name='Skating',
                description='**Tony Hawk** does it',
                created_by_user_id=1))
            db.session.add(CatagoryItem(
                name='Snow',
                description='You need this to ride on',
                catagory_id=1,
                created_by_user_id=1))
            db.session.add(CatagoryItem(
                name='Boots',
                description="Otherwise you'll fall off",
                catagory_id=1,
                created_by_user_id=1))
            db.session.commit()
            db.session.add(CatagoryItem(
                name='Board with wheels',
                description="Get moving",
                catagory_id=2,
                created_by_user_id=1))
            db.session.commit()
            print("Database tables created")
    else:
        app.run(debug=True)
if app.debug:
    # setup scss-folders
    Scss(app, static_dir='static/css/', asset_dir='assets/scss/')
    app.config['ASSETS_DEBUG'] = True
