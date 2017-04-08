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

var newItemForm = `<form id={formID} onsubmit="event.preventDefault(); return submitForm(this, '{url}', '{hideButton}');">
              <input type="hidden" name="_method" value="{method}"/>
                <div class="row">
                    <div class="six columns">
                        <label for="form-name">{type} name</label>
                        <input class="u-full-width" type="text" name="{type}-name" id="form-name" placeholder="Title">
                    </div>
                </div>
                <label for="form-desc">Description</label>
                <textarea name="{type}-desc" class="u-full-width" placeholder="Something awesome goes here" id="form-desc"></textarea>
                <ul class="error"></ul>
                <input class="button-cancel"type="button" value="Cancel" onclick="hideMeShowOther('{hideButton}', '{showDiv}');">
                <input class="button-primary u-pull-right" type="submit" value="Submit">
            </form>
`;

function itemForm(method, url, type, hideButton, showDiv = null) {
    var formID = ['form', method, type].join('-');
    if (!showDiv) {
        showDiv = '#' + formID;
    }
    return newItemForm.formatUnicorn({
        formID: formID,
        method: method,
        url: url,
        type: type,
        hideButton: hideButton,
        showDiv: showDiv,
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
// Retrueve catagories from server
function getCatagories(url = '/json/catalog/', div = $('.catag')) {
    div.empty();
    $.getJSON(url, function(result) {
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

                jQuery('<div/>', {
                    class: 'catagory-desc item-more no-display',
                    html: catagory.description
                }).appendTo(thisContainer);

                jQuery('<div/>', {
                    class: 'crud_buttons item-more no-display'
                }).appendTo(thisContainer);

                var crud_buttons = thisContainer.children('div.crud_buttons');

                addCrudButton(
                  crud_buttons, 'newItem', newFormDiv, catagory.id, i);
                addCrudButton(
                  crud_buttons, 'editCatagory', editFormDiv, catagory.id, i);
                addCrudButton(
                  crud_buttons, 'deleteCatagory', deleteFormDiv, catagory.id, i);

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
            var text = 'Edit this catagory';
            var classes = 'fa fa-trash-o';
            break;
        case 'deleteCatagory':
            var text = 'Delete this catagory';
            var classes = 'fa fa-plus-circle';
            break;
    }
    var thisID = request + '-' + i;
    jQuery('<div/>', {
        id: thisID,
        class: 'myButton ' + classes,
        style: 'cursor: pointer;',
        onclick: 'showForm("#' + formDiv + '","newItem","#' + thisID + '",' + catagory.id + ');',
        text: " " + text
    }).appendTo(div);
}

function showForm(containerDiv, request, hideButton, catagoryID) {
    console.log($(containerDiv));
    $(containerDiv).empty();
    $(hideButton).hide();
    $(containerDiv).show();
    var method = 'post';
    var type = 'Item';
    var url = 'json/catalog/' + catagoryID + '/';
    if (request === 'newCatagory') {
        type = 'Catagory';
        url = 'json/catalog/';
    }
    console.log($(containerDiv));
    $(containerDiv).append(itemForm(
        method = method,
        url = url,
        type = type,
        hideButton = hideButton,
        showDiv = containerDiv
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
    console.log(url);
    $.ajax({
        url: url,
        type: 'post',
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
