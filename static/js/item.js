/*jshint esversion: 6 */
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
                    html: item.name + '<div class="item-catagory">' + item.catagory + '</div>'+ '<div class="item-description no-display item-more">' + item.description + '</div>'
                }).appendTo(containerDiv);
            }
        }
    });
}
// Retrueve catagories from server
function getCatagories(url='/json/catalog/', div=$('.catag')) {
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
                    style: 'cursor: pointer;',
                    onclick: 'catagoryDisplayMore(' + [
                            i,
                            "'catagory'", +
                            catagory.id,
                            "this"
                        ].join(",") +
                        ');'
                }).appendTo(containerDiv);
                var thisContainer = containerDiv.find('#'+thisID);
                jQuery('<div/>',{
                  class: 'catagory-name',
                  text: catagory.name
                }).appendTo(thisContainer);
                jQuery('<div/>',{
                  class: 'catagory-desc item-more no-display',
                  text: catagory.description
                }).appendTo(thisContainer);
            }
        }
    });
}

function hideMeShowOther(thisButton, targetForm) {
    $(targetForm).toggle();
    $(thisButton).toggle();
    $("input:text:visible:first").focus();
}
// General handler for forms.
$(function() {
    $("form").submit(function(e) {
        e.preventDefault();
    });

});

function submitForm(thisForm, url, method, showOnSuccess) {
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
                errorDiv=null;
                if (k === 'error') {
                  errorDiv = thisForm.children('.error');
                }else if (k === 'success') {
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

function clearNotifications(errorDiv=null) {
  if (!errorDiv || errorDiv.length===0) {
    errorDiv = $('ul.flashes');
  }
  $(errorDiv).empty();
}
function addNotification(type, msg, errorDiv=null) {
  if (!errorDiv || errorDiv.length===0) {
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

function dismiss(fadeTime=400) {
    $('div.notifications').fadeOut(fadeTime,clearNotifications());
}
$(document).ready(function(){
  var flashli = $('ul.flashes').find('li');
  if (flashli.length>0) {
    $('div.notifications').show();
    setTimeout(dismiss, 8000);
  }
});
