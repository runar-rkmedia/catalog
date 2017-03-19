"""Udacity assignment for creating a catalog."""

from flask import Flask, session, redirect, url_for, request, render_template
app = Flask(__name__)

# TODO: Move to config-file
# In production, a truly random key shoud be stored in a production-config,
# which will override this. For dev-purposes, just use 'dev' as secret key.
app.secret_key = 'dev'


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('index'))
    return '''
        <form method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
    '''


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
