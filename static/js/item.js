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

function itemForm(method, url, type, hideButton, showDiv = null, itemID=-1) {
    var formID = ['form', method, type].join('-');
    console.log('itemFormname',name);
    console.log('itemFormdesc',desc);
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
    if (type==='Catagory') {
      console.log(catagories);
      for (var i = 0; i < catagories.length; i++) {
        var thisElement = catagories[i];
        console.log(thisElement.id, itemID);
        if (thisElement.id === parseInt(itemID)) {
          console.log('success', thisElement.id, itemID);
          name = thisElement.name;
          desc = thisElement.description;
          console.log(name, desc);
        }
      }
    }

    console.log('element', name);
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
// Expand the selected catagory, and retrieve subitems.
function catagoryDisplayMore(index, type, id, thisDiv) {
    itemDisplayMore(type, thisDiv);
    var thisItem = $(thisDiv);
    var newDivID = 'catagory-' + index + '-items';
    if (document.getElementById(newDivID) === null) {
        jQuery('<div/>', {
            id: newDivID = newDivID,
            class: 'item-more'
        }).appendTo(thisDiv);
        getItems('/json/catalog/' + id, $('#' + newDivID));
    }
}

// Expand the selected item.
function itemDisplayMore(type, thisDiv, openThis = true) {
    console.log(thisDiv);
    var thisItem = $(thisDiv);
    console.log(thisItem);
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
                onclick: 'itemDisplayMore("' + type + '","#' + thisItem.attr('id') + '", openThis=false);'
            }).prependTo(thisItem);
        }

        $('html, body').animate({
            scrollTop: thisItem.offset().top - 100
        }, 200);
    }
}

// Retrieve items from server
function getItems(url, div) {
    $.getJSON(url, function(result) {
        if (result.items.length > 0) {
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
                    onclick: 'itemDisplayMore("item","#item-' + i + '");',
                    text: item.name
                }).appendTo(thisDiv);

                jQuery('<div/>', {
                    class: 'item-catagory',
                    text: item.catagory
                }).appendTo(thisDiv.children('div.item-name'));

                jQuery('<div/>', {
                    class: 'item-description no-display item-more',
                    html: item.description
                }).appendTo(thisDiv);
            }
        }
    });
}
var catagories;
// Retrueve catagories from server
function getCatagories(url = '/json/catalog/', div = $('.catag')) {
    div.empty();
    $.getJSON(url, function(result) {
      catagories = result.catagories;
        if (result.catagories.length > 0) {
            jQuery('<div/>', {
                class: 'catagories tiles',
            }).appendTo(div);
            var containerDiv = div.find('div.catagories');
            for (var i = 0; i < result.catagories.length; i++) {
                var newFormDiv = 'new-item-form-div-' + i;
                var editFormDiv = 'edit-item-form-div-' + i;
                var deleteFormDiv = 'delete-item-form-div-' + i;
                catagory = result.catagories[i];
                var thisID = 'catagory-' + i;

                jQuery('<div/>', {
                    id: thisID,
                    class: 'catagory tile',
                }).appendTo(containerDiv);
                var thisContainer = containerDiv.find('#' + thisID);

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

                // TODO: only parse when showing item

                jQuery('<div/>', {
                    class: 'catagory-desc item-more no-display',
                    html: markdown.toHTML(catagory.description)
                }).appendTo(thisContainer);

                jQuery('<div/>', {
                    class: 'crud_buttons item-more no-display'
                }).appendTo(thisContainer);

                var crud_buttons = thisContainer.children('div.crud_buttons');

                addCrudButton(
                    crud_buttons, 'newItem', newFormDiv, catagory.id, i);
                addCrudButton(
                    crud_buttons, 'editCatagory', newFormDiv, catagory.id, i);
                addCrudButton(
                    crud_buttons, 'deleteCatagory', newFormDiv, catagory.id, i);

                jQuery('<div/>', {
                    id: newFormDiv,
                    class: 'add-item item-more no-display'
                }).appendTo(thisContainer);
            }
        }
    });
}

function addCrudButton(div, request, formDiv, id, i) {
    switch (request) {
        case 'newItem':
            var text = 'Add a new item';
            var classes = 'fa fa-plus-circle';
            break;
        case 'editCatagory':
            text = 'Edit this catagory';
            classes = 'fa fa-trash-o';
            break;
        case 'deleteCatagory':
            text = 'Delete this catagory';
            classes = 'fa fa-plus-circle';
            break;
    }
    var thisID = request + '-' + i;
    var parameters = ['#' + formDiv, request, '#' + thisID, id].join('","');
    jQuery('<div/>', {
        id: thisID,
        class: 'myButton ' + classes,
        style: 'cursor: pointer;',
        onclick: 'showForm("' + parameters + '");',
        text: " " + text
    }).appendTo(div);
}

function showForm(containerDiv, request, hideButton, itemID=-1, name="", desc="") {
    $(containerDiv).empty();
    $(hideButton).hide();
    $(containerDiv).show();
    var method = 'post';
    var type = 'Item';
    var headline = '';
    var headlineClasses = '';
    var url = 'json/catalog/' + itemID + '/';
    switch (request) {
        case 'newCatagory':
            type = 'Catagory';
            headline = 'Create a new catagory';
            url = 'json/catalog/';
            break;
        case 'newItem':
            type = 'Item';
            headline = 'Create a new item under catagory';
            break;
        case 'editCatagory':
            type = 'Catagory';
            headline = 'Edit catagory';
            method = 'put';
            break;
        case 'deleteCatagory':
            type = 'Catagory';
            headline = 'Delete catagory';
            headlineClasses = 'danger';
            method = 'delete';
            break;
    }
    jQuery('<h3/>', {
        class: headlineClasses,
        text: headline
    }).appendTo($(containerDiv));
    $(containerDiv).append(itemForm(
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
        // if (!$(targetForm).length >0 ) {
        //   console.log('did not find targetForm:' + targetForm);
        // }
        // if (!$(thisButton).length >0 ) {
        //   console.log('did not find thisButton:' + thisButton);
        // }
        // $(thisButton).css('background-color: red;');
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
