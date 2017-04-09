/*jshint esversion: 6 */
// I like pythons `.format` and want it in javascript
// Code from StackOverflow(site itself actually, not an answer)
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
    function() {
        "use strict";
        var str = this.toString();
        if (arguments.length) {
            var t = typeof arguments[0];
            var key;
            var args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments) :
                arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
            }
        }

        return str;
    };


// Form used for creating and editing catagories and items
var cuForm = `<form onsubmit="event.preventDefault(); return submitForm(this, '{url}', '{hideButton}');" method="{method}">
                <div class="row">
                    <div class="six columns">
                        <label for="form-name">{type} name</label>
                        <input class="u-full-width" type="text" name="name" id="form-name" placeholder="Title" value="{name}">
                    </div>
                </div>
                <label for="form-desc">Description</label>
                <textarea name="desc" class="u-full-width" placeholder="Something awesome goes here" id="form-desc">{desc}</textarea>
                <ul class="error"></ul>
                <input class="button-cancel"type="button" value="Cancel" onclick="hideMeShowOther('{hideButton}', '{showDiv}');">
                <input class="button-primary u-pull-right" type="submit" value="Submit">
            </form>
`;

// Form used for deleting items and catagories.
var dForm = `<form onsubmit="event.preventDefault(); return submitForm(this, '{url}', '{hideButton}');" method="{method}">
                <div class="row">
                Are you sure you want to delete this {type}
                <ul class="error"></ul>
                <input class="button-cancel"type="button" value="Cancel" onclick="hideMeShowOther('{hideButton}', '{showDiv}');">
                <input class="button-danger u-pull-right" type="submit" value="Yes, delete this">
            </form>
`;

// Parse the right form with the correct information
function itemForm(method, url, type, hideButton, showDiv = null, elementID = '', name = '', desc = '') {
    // method       the verb (get,post,put,delete)
    // url          url to use
    // type         'catagory' or 'item'
    // hideButton   button to hide.
    // showDiv      a div to show
    // elementID    ID of the element in the database
    // name         used when editing to fill in the previus value
    // desc         used when editing to fill in the previus value
    var form = cuForm;
    switch (method) {
        case 'delete':
            form = dForm;
            break;
    }
    return form.formatUnicorn({
        method: method,
        url: url,
        type: type,
        hideButton: hideButton,
        showDiv: showDiv,
        ID: elementID,
        name: name,
        desc: desc
    });
}
var items;

// Retrieve items from server, and output to site.
function getItems(url, div) {
  // url  url to use
  // div  div to put items into
    div.empty();
    $.getJSON(url, function(result) {
        if (result.items.length > 0) {
            items = result.items;
            jQuery('<div/>', {
                class: 'items tiles',
            }).appendTo(div);
            var containerDiv = div.find('div.items');
            for (var i = 0; i < result.items.length; i++) {
                item = result.items[i];
                jQuery('<div/>', {
                    id: 'item-' + i,
                    class: 'item tile',
                }).appendTo(containerDiv);

                var thisDiv = containerDiv.find('#item-' + i);

                jQuery('<div/>', {
                    class: 'item-name',
                    style: 'cursor: pointer;',
                    onclick: 'elementDisplayMore("item","#item-' + i + '",true,' + item.id + ');',
                    text: item.name
                }).appendTo(thisDiv);

                jQuery('<div/>', {
                    class: 'item-catagory',
                    text: (item.catagory)
                }).appendTo(thisDiv.children('div.item-name'));

                jQuery('<div/>', {
                    class: 'item-desc item-more no-display',
                }).appendTo(thisDiv);

                jQuery('<div/>', {
                    class: 'crud_buttons item-more no-display'
                }).appendTo(thisDiv);

                jQuery('<div/>', {
                    class: 'add-item form item-more no-display'
                }).appendTo(thisDiv);

            }
        }
    });
}
var catagories;

// Retrieve a catagory or item from previously cached content
function getElementByID(type, elementID) {
  // type       'catagory' or 'item'
  // elementID  the ID of this element in the database
    var elements;
    switch (type.toLowerCase()) {
        case 'catagory':
            elements = catagories;
            break;
        case 'item':
            elements = items;
            break;
    }
    if (elements) {
        for (var i = 0; i < elements.length; i++) {
            var thisElement = elements[i];
            if (thisElement.id === parseInt(elementID)) {
                return thisElement;
            }
        }
    }
}
// Retrieve catagories from server
function getCatagories(url = '/json/catalog/', div = $('.catag')) {
    div.empty();
    $.getJSON(url, function(result) {
        if (result.catagories.length > 0) {
            catagories = result.catagories;

            // Container-div for elements
            jQuery('<div/>', {
                class: 'catagories tiles',
            }).appendTo(div);

            var containerDiv = div.find('div.catagories');
            for (var i = 0; i < result.catagories.length; i++) {
                catagory = result.catagories[i];
                var thisID = 'catagory-' + i;

                // Container-div for this element
                jQuery('<div/>', {
                    id: thisID,
                    class: 'catagory tile',
                }).appendTo(containerDiv);
                var thisContainer = containerDiv.children('#' + thisID);

                // Name-div (clickable)
                jQuery('<div/>', {
                    class: 'catagory-name',
                    text: catagory.name,
                    style: 'cursor: pointer;',
                    onclick: 'catagoryDisplayMore(' + [
                            i,
                            "'catagory'", +
                            catagory.id,
                            "'#" + thisID + "'"
                        ].join(",") +
                        ');'
                }).appendTo(thisContainer);

                // Description-div
                jQuery('<div/>', {
                    class: 'catagory-desc item-more no-display',
                }).appendTo(thisContainer);

                // Buttons-container
                jQuery('<div/>', {
                    class: 'crud_buttons item-more no-display'
                }).appendTo(thisContainer);

                // Form-container
                jQuery('<div/>', {
                    class: 'add-item form item-more no-display'
                }).appendTo(thisContainer);
            }
        }
    });
}
// Lazy check if user is logged in. (server check all input, so no worries)
function userLoggedIn() {
    if ($('#logged_in').length > 0) {
        return true;
    }
}
// Expand the selected catagory, and retrieve subitems.
function catagoryDisplayMore(index, type, id, thisDiv, refresh = false) {
    elementDisplayMore(type, thisDiv, true, id);
    var thisItem = $(thisDiv);
    var newDivID = 'catagory-' + index + '-items';
    if (refresh || document.getElementById(newDivID) === null) {
        jQuery('<div/>', {
            id: newDivID = newDivID,
            class: 'item-more'
        }).appendTo(thisDiv);
        getItems('/json/catalog/' + id, $('#' + newDivID));
    }
}

// Expand the selected element.
function elementDisplayMore(type, thisDiv, openThis = true, id = -1) {
    var thisItem = $(thisDiv);
    // type    : 'catagory' or 'item'
    // thisDiv : the div we are expanding
    // openThis: bool, should it expand or close?
    // id      : id of element in database
    thisItem.parent().children().removeClass(type + '-expand');
    thisItem.parent().children().children('div.item-more').css('display', 'none');
    thisItem.parent().children().children('div.item-close').css('display', 'none');
    if (openThis) {
        thisItem.addClass(type + '-expand');
        thisItem.children('.item-more').css('display', 'block');
        if (thisItem.children('div.button-close').length === 0) {
            jQuery('<div/>', {
                class: 'fa fa-close button-close  item-more u-pull-right',
                style: 'cursor: pointer;',
                onclick: 'elementDisplayMore("' + type + '","#' + thisItem.attr('id') + '", openThis=false);'
            }).prependTo(thisItem);
        }
        var formDiv = thisDiv + ' .form';
        var element = getElementByID(type, id);
        var descDiv = thisItem.children('div.' + type + '-desc');
        // Only add content if it is not already there.
        if (descDiv.is(':empty')) {
            descDiv.html(markdown.toHTML(element.description));

            // If user is logged in, add buttons to this element
            if (userLoggedIn()) {
                var crud_buttons = thisItem.children('div.crud_buttons');
                if (type === 'catagory') {
                    addCrudButton(
                        crud_buttons, 'new', 'item', formDiv, element.id);
                }
                addCrudButton(
                    crud_buttons, 'edit', type, formDiv, element.id);
                addCrudButton(
                    crud_buttons, 'delete', type, formDiv, element.id);
            }
        }
        $('html, body').animate({
            scrollTop: thisItem.offset().top - 100
        }, 200);
    }
}
// Add a button Create, Update, Delete -> Catagory and Item
function addCrudButton(div, request, type, formDiv, id) {
  // div    :The div to put button inn in
  // request:'new', 'edit', or 'delete'
  // type   :'catagory' or 'item'
  // formDiv:Divcontainer for the form
  // id     :id of the element in the database
    var text = '';
    var classes = '';
    switch (request) {
        case 'new':
            text = 'Add a new ' + type;
            classes = 'fa fa-plus-circle';
            break;
        case 'edit':
            text = 'Edit this ' + type;
            classes = 'fa fa-plus-circle';
            break;
        case 'delete':
            text = 'Delete this ' + type;
            classes = 'fa fa-trash-o';
            break;
    }
    var parameters = [formDiv, request, type, div.id, id].join('","');
    jQuery('<div/>', {
        class: 'myButton ' + classes,
        style: 'cursor: pointer;',
        onclick: 'showForm("' + parameters + '");',
        text: " " + text
    }).appendTo(div);
}

// Create the correct form needed and show it.
function showForm(containerDiv, request, type, hideButton, elementID = -1) {
  // containerDiv: Div to put form in
  // request     : 'new', 'edit' or 'delete'
  // type        : 'catagory' or 'item'
  // hideButton  : 'a button to hide on success'
  // elementID   : the id of the element in the database
    var cDiv = $(containerDiv + ':first');
    cDiv.empty();
    $(hideButton).hide();
    cDiv.show();
    var method = 'post';
    var headline = '';
    var name = '';
    var desc = '';
    var headlineClasses = '';
    var element = getElementByID(type, elementID);

    // Use the correct url
    var url = 'json/catalog/';
    switch (request + type) {
        case 'newitem':
        case 'editcatagory':
        case 'deletecatagory':
            url += elementID + '/';
            break;
        case 'edititem':
        case 'deleteitem':
            url += element.catagory_id + '/' + elementID + '/';
            break;
    }
    // Use the correct headline and method
    switch (request + type) {
        case 'newitem':
        case 'newcatagory':
            headline = 'Create a new ' + type;
            break;
        case 'edititem':
            headline = 'Edit an item under catagory';
            method = 'put';
            break;
        case 'editcatagory':
            headline = 'Edit catagory';
            method = 'put';
            break;
        case 'deleteitem':
        case 'deletecatagory':
            headline = 'Delete catagory';
            headlineClasses = 'danger';
            method = 'delete';
            break;
    }
    // If editing, we fill in the existing name and description in the form
    if (request === 'edit') {
        name = element.name;
        desc = element.description;
    }
    // Create a headline for this form
    jQuery('<h3/>', {
        class: headlineClasses,
        text: headline
    }).appendTo(cDiv);
    // Create the form.
    cDiv.append(itemForm(
        method = method,
        url = url,
        type = type,
        hideButton = hideButton,
        showDiv = containerDiv,
        itemID = elementID,
        name = name,
        desc = desc
    ));
    // Focus the first text-field (if any)
    cDiv.find("input:text:visible:first").focus();
}

// Will Hide the first element, and show the second.
function hideMeShowOther(thisButton, targetForm) {
    $(document).ready(function() {
        if ($(targetForm).css('display') == 'none') {
            $(targetForm).show();
            $(thisButton).hide();
        } else {
            $(targetForm).hide();
            $(thisButton).show();
        }
    });
}

// Handle submitting forms
function submitForm(thisForm, url, showOnSuccess) {
    // thisForm:      (this) the origin form
    // url:           the url to go to
    // showOnSuccess: buttons to be displayed after submitting
    thisForm = $(thisForm);
    $.ajax({
        url: url,
        type: thisForm.attr('method'),
        dataType: 'json',
        data: thisForm.serialize(),
        success: function(data) {
            clearNotifications(thisForm.children('.error'));
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    errorDiv = null;
                    if (k === 'error') {
                        errorDiv = thisForm.children('.error');
                    } else if (k === 'success') {
                        thisForm.hide();
                        $(showOnSuccess).show();
                        getCatagories();
                        getItems('/json/catalog/items/latest/', $('.items'));
                    }
                    addNotification(k, data[k], errorDiv);
                }
            }
        }
    });
}

// Remove all notifications
function clearNotifications(errorDiv = null) {
    if (!errorDiv || errorDiv.length === 0) {
        errorDiv = $('ul.flashes');
    }
    $(errorDiv).empty();
}

// Output a notification.
function addNotification(type, msg, errorDiv = null) {
    // args
    // type:      'catagory' or 'item'
    // msg:       the message to be displayed
    // errordiv:  an optional div to output the error to instead of the top notification-bar. Useful for forms.
    if (!errorDiv || errorDiv.length === 0) {
        errorDiv = $('ul.flashes');
    }
    jQuery('<li/>', {
        class: type,
        text: msg
    }).appendTo(errorDiv);
    $('div.notifications').show();
    setTimeout(dismiss, 8000);
}

// Dismiss a notification
function dismiss(fadeTime = 400) {
    $('div.notifications').fadeOut(fadeTime, clearNotifications());
}
$(document).ready(function() {
    // If a notification is sent from flask, display it.
    var flashli = $('ul.flashes').find('li');
    if (flashli.length > 0) {
        $('div.notifications').show();
        setTimeout(dismiss, 8000);
    }
    // add a placeholder-div for adding a form.
    jQuery('<div/>', {
        id: 'new-add-catagory-form-div',
        class: 'add-addCatagory no-display'
    }).appendTo($("div.add-catagory"));
    // retrieve tha latest items
    getCatagories();
    getItems('/json/catalog/items/latest/', $('.items'));
});
