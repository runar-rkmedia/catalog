"""Udacity assignment for creating a catalog."""

from flask import Flask, request, render_template
app = Flask(__name__)


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    if request.method == 'POST':
        return 'do_the_login()'
    else:
        return 'show_the_login_form()'


@app.route('/logout')
def logout():
    """Handle user logout."""
    return 'logout'


@app.route('/')
def view_home():
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
