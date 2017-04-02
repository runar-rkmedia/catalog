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

function itemForm(method, url, type, hideButton, showDiv=null) {
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
function itemDisplayMore(type, thisDiv) {
    var thisItem = $(thisDiv);
    thisItem.parent().children().removeClass(type + '-expand');
    thisItem.parent().children().children('div.item-more').css('display', 'none');
    thisItem.addClass(type + '-expand');
    thisItem.children('.item-more').css('display', 'block');
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
                    style: 'cursor: pointer;',
                    onclick: 'itemDisplayMore("item",this);',
                    html: item.name + '<div class="item-catagory">' + item.catagory + '</div>' + '<div class="item-description no-display item-more">' + item.description + '</div>'
                }).appendTo(containerDiv);
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
                catagory = result.catagories[i];
                var thisID = 'catagory-' + i;
                jQuery('<div/>', {
                    id: thisID,
                    class: 'catagory tile',
                    style: 'cursor: pointer;'
                }).appendTo(containerDiv);
                var thisContainer = containerDiv.find('#' + thisID);
                jQuery('<div/>', {
                    class: 'catagory-name',
                    text: catagory.name,
                    onclick: 'catagoryDisplayMore(' + [
                            i,
                            "'catagory'", +
                            catagory.id,
                            "'#" + thisID +"'"
                        ].join(",") +
                        ');'
                }).appendTo(thisContainer);
                jQuery('<div/>', {
                    class: 'catagory-desc item-more no-display',
                    html: catagory.description
                }).appendTo(thisContainer);
                jQuery('<div/>', {
                    id: 'new-item-button',
                    class: 'myButton fa fa-plus-circle item-more no-display',
                    onclick: 'hideMeShowOther(this, "#new-item-form-div");',
                    text: 'Add a new item.'
                }).appendTo(thisContainer);
                jQuery('<div/>', {
                    id: 'new-item-form-div',
                    class: 'add-item no-display'
                }).appendTo(thisContainer);
                thisContainer.children('#new-item-form-div').append(itemForm(
                    method='post',
                    url='json/catalog/' + catagory.id + '/',
                    type='Item',
                    hideButton='#new-item-button',
                    showDiv='#new-item-form-div'
                ));
            }
        }
    });
}

function hideMeShowOther(thisButton, targetForm) {
    $(document).ready(function() {
      if ($(targetForm).css('display') == 'none') {
        $(targetForm).show();
        $(thisButton).hide();
      }else {
        $(targetForm).hide();
        $(thisButton).show();
      }
        if (!$(targetForm).length >0 ) {
          console.log('did not find targetForm:' + targetForm);
        }
        if (!$(thisButton).length >0 ) {
          console.log('did not find thisButton:' + thisButton);
        }
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
    $("div.add-catagory").children('#new-add-catagory-form-div').append(itemForm(
        method='post',
        url='/json/catalog/',
        type='Catagory',
        hideButton='#form-post-Catagory',
        showDiv='#new-add-catagory-form-div'
    ));
});
