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

var newItemForm = `<form id={formID} onsubmit="event.preventDefault(); return submitForm(this, '{url}', '{hideButton}');" method="{method}">
<input type="hidden" name="ID" value="{ID}">
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

var deleteForm = `<form id={formID} onsubmit="event.preventDefault(); return submitForm(this, '{url}', '{hideButton}');" method="{method}">
<input type="hidden" name="ID" value="{ID}">
                <div class="row">
                Are you sure you want to delete this {type}
                <ul class="error"></ul>
                <input class="button-cancel"type="button" value="Cancel" onclick="hideMeShowOther('{hideButton}', '{showDiv}');">
                <input class="button-danger u-pull-right" type="submit" value="Yes, delete this">
            </form>
`;
var items;

// Retrieve items from server
function getItems(url, div) {
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

function getElementByID(type, catID) {
    var elements;
    switch (type.toLowerCase()) {
        case 'catagory':
            elements = catagories;
            break;
        case 'item':
            elements = items;
            break;
    }
    for (var i = 0; i < elements.length; i++) {
        var thisElement = elements[i];
        if (thisElement.id === parseInt(catID)) {
            return thisElement;
        }
    }
}
// Retrueve catagories from server
function getCatagories(url = '/json/catalog/', div = $('.catag')) {
    div.empty();
    $.getJSON(url, function(result) {
        if (result.catagories.length > 0) {
            catagories = result.catagories;
            jQuery('<div/>', {
                class: 'catagories tiles',
            }).appendTo(div);
            var containerDiv = div.find('div.catagories');
            for (var i = 0; i < result.catagories.length; i++) {
                catagory = result.catagories[i];
                var thisID = 'catagory-' + i;

                jQuery('<div/>', {
                    id: thisID,
                    class: 'catagory tile',
                }).appendTo(containerDiv);
                var thisContainer = containerDiv.children('#' + thisID);

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

                jQuery('<div/>', {
                    class: 'catagory-desc item-more no-display',
                }).appendTo(thisContainer);

                jQuery('<div/>', {
                    class: 'crud_buttons item-more no-display'
                }).appendTo(thisContainer);

                jQuery('<div/>', {
                    class: 'add-item form item-more no-display'
                }).appendTo(thisContainer);
            }
        }
    });
}

function itemForm(method, url, type, hideButton, showDiv = null, itemID = '') {
    var formID = ['form', method, type].join('-');
    if (!showDiv) {
        showDiv = '#' + formID;
    }
    var form = newItemForm;
    switch (method) {
        case 'delete':
            form = deleteForm;
            break;
    }
    var name = "";
    var desc = "";
    if (itemID >= 0) {
        var thisElement = getElementByID(type, itemID);
        if (thisElement) {
            name = thisElement.name;
            desc = thisElement.description;
        }
    }
    return form.formatUnicorn({
        formID: formID,
        method: method,
        url: url,
        type: type,
        hideButton: hideButton,
        showDiv: showDiv,
        ID: itemID,
        name: name,
        desc: desc
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

// Expand the selected item.
function elementDisplayMore(type, thisDiv, openThis = true, id = -1) {
    var thisItem = $(thisDiv);
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
        if (descDiv.is(':empty')) {
            descDiv.html(markdown.toHTML(element.description));

            if (userLoggedIn()) {
                var crud_buttons = thisItem.children('div.crud_buttons');
                if (type === 'catagory') {
                    addCrudButton(
                        crud_buttons, 'newitem', formDiv, element.id);
                }
                addCrudButton(
                    crud_buttons, 'edit' + type, formDiv, element.id);
                addCrudButton(
                    crud_buttons, 'delete' + type, formDiv, element.id);
            }
        }

        $('html, body').animate({
            scrollTop: thisItem.offset().top - 100
        }, 200);
    }
}

function addCrudButton(div, request, formDiv, id) {
    var text = '';
    var classes = '';
    switch (request) {
        case 'newitem':
            text = 'Add a new item';
            classes = 'fa fa-plus-circle';
            break;
        case 'edititem':
            text = 'Edit this item';
            classes = 'fa fa-plus-circle';
            break;
        case 'deleteitem':
            text = 'Delete this item';
            classes = 'fa fa-plus-circle';
            break;
        case 'newcatagory':
            text = 'Add a new catagory';
            classes = 'fa fa-plus-circle';
            break;
        case 'editcatagory':
            text = 'Edit this catagory';
            classes = 'fa fa-trash-o';
            break;
        case 'deletecatagory':
            text = 'Delete this catagory';
            classes = 'fa fa-plus-circle';
            break;
    }
    var parameters = [formDiv, request, div.id, id].join('","');
    jQuery('<div/>', {
        class: 'myButton ' + classes,
        style: 'cursor: pointer;',
        onclick: 'showForm("' + parameters + '");',
        text: " " + text
    }).appendTo(div);
}

function showForm(containerDiv, request, hideButton, itemID = -1, name = "", desc = "") {
    var cDiv = $(containerDiv + ':first');
    cDiv.empty();
    $(hideButton).hide();
    cDiv.show();
    var method = 'post';
    var type = 'Item';
    var headline = '';
    var headlineClasses = '';
    var url = 'json/catalog/' + itemID + '/';
    switch (request) {
        case 'newcatagory':
            type = 'Catagory';
            headline = 'Create a new catagory';
            url = 'json/catalog/';
            break;
        case 'newitem':
            type = 'Item';
            headline = 'Create a new item under catagory';
            break;
        case 'editcatagory':
            type = 'Catagory';
            headline = 'Edit catagory';
            method = 'put';
            break;
        case 'deletecatagory':
            type = 'Catagory';
            headline = 'Delete catagory';
            headlineClasses = 'danger';
            method = 'delete';
            break;
    }
    jQuery('<h3/>', {
        class: headlineClasses,
        text: headline
    }).appendTo(cDiv);
    cDiv.append(itemForm(
        method = method,
        url = url,
        type = type,
        hideButton = hideButton,
        showDiv = containerDiv,
        itemID = itemID,
        name = name,
        desc = name
    ));
}

function hideMeShowOther(thisButton, targetForm) {
    $(document).ready(function() {
        if ($(targetForm).css('display') == 'none') {
            $(targetForm).show();
            $(thisButton).hide();
        } else {
            $(targetForm).hide();
            $(thisButton).show();
        }
        // $("input:text:visible:first").focus();
    });
}
// General handler for forms.
$(function() {
    $("form").submit(function(e) {
        e.preventDefault();
    });

});

function submitForm(thisForm, url, showOnSuccess) {
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
                    }
                    addNotification(k, data[k], errorDiv);
                }
            }
        }
    });
}

function clearNotifications(errorDiv = null) {
    if (!errorDiv || errorDiv.length === 0) {
        errorDiv = $('ul.flashes');
    }
    $(errorDiv).empty();
}

function addNotification(type, msg, errorDiv = null) {
    if (!errorDiv || errorDiv.length === 0) {
        errorDiv = $('ul.flashes');
    }
    // clearNotifications();
    jQuery('<li/>', {
        class: type,
        text: msg
    }).appendTo(errorDiv);
    $('div.notifications').show();
    setTimeout(dismiss, 8000);
}

function dismiss(fadeTime = 400) {
    $('div.notifications').fadeOut(fadeTime, clearNotifications());
}
$(document).ready(function() {
    var flashli = $('ul.flashes').find('li');
    if (flashli.length > 0) {
        $('div.notifications').show();
        setTimeout(dismiss, 8000);
    }
    jQuery('<div/>', {
        id: 'new-add-catagory-form-div',
        class: 'add-addCatagory no-display'
    }).appendTo($("div.add-catagory"));
});
