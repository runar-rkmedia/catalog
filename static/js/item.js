// I like pythons `.format` and want it in javascript
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function(m, n) {
            return args[n];
        });
    };
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
    thisItem.children('div.item-more').css('display', 'block');
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
                    html: item.name + '<div class="item-catagory">' + item.catagory + '</div>'
                }).appendTo(containerDiv);
            }
        }
    });
}

// Retrueve catagories from server
function getCatagories(url, div) {
    $.getJSON(url, function(result) {
        if (result.catagories.length > 0) {
            jQuery('<div/>', {
                class: 'catagories tiles',
            }).appendTo(div);
            var containerDiv = div.find('div.catagories');
            for (var i = 0; i < result.catagories.length; i++) {
                catagory = result.catagories[i];
                jQuery('<div/>', {
                    id: 'catagory-' + i,
                    class: 'catagory tile',
                    style: 'cursor: pointer;',
                    onclick: 'catagoryDisplayMore(' + [
                            i,
                            "'catagory'", +
                            catagory.id,
                            "this"
                        ].join(",") +
                        ');',
                    text: catagory.name
                }).appendTo(containerDiv);
            }
        }
    });
}

function hideMeShowOther(thisButton, targetForm) {
  $(targetForm).toggle();
  $(thisButton).toggle();
}
// General handler for forms.
$(function() {
    $("form").submit(function(e) {
        e.preventDefault();
        var actionurl = e.currentTarget.action;
        $.ajax({
                url: actionurl,
                type: 'post',
                dataType: 'json',
                data: $(e.currentTarget).serialize(),
                success: function(data) {
                    console.log(data);
                }
        });

    });

});
