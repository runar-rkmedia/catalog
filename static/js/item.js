// I like pythons `.format` and want it in javascript
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function(m, n) {
            return args[n];
        });
    };
}

function formatDivID(id, type) {
    return $('#' + type + '-' + id);
}

function catagoryDisplayMore(index, totalDivs, type, id) {
    itemDisplayMore(index, totalDivs, type);
    var thisItem = formatDivID(index, type);
    var newDivID = 'catagory-' + index + '-items';
    if (document.getElementById(newDivID) === null) {
        thisItem.append('<div id="{0}" class="item-more"></div>'.format(newDivID));
        getItems('/json/catalog/' + id, $('#' + newDivID));
    }
}

function itemDisplayMore(index, totalDivs, type) {
    for (var i = 0; i < totalDivs; i++) {
        var thisItem = formatDivID(i, type);
        var moreItem = thisItem.children('div.item-more');
        if (i === index) {
            moreItem.css('display', 'block');
            thisItem.addClass(type + '-expand');
        } else {
            moreItem.css('display', 'none');
            thisItem.removeClass(type + '-expand');
        }
    }
}

function getItems(url, div) {
    $.getJSON(url, function(result) {
        if (result.items.length > 0) {
            itemsHTML = '<div class="items tiles">';
            for (var i = 0; i < result.items.length; i++) {
                item = result.items[i];
                itemsHTML += `
          <div id="item-{0}" class="item tile" onclick="itemDisplayMore({0},{1}, 'item')">
            <div class="item-name">{2}
              <span class="item-catagory">({3})</span>
            </div>
            <div class="item-more no-display">
              <div class="item-desc">{3}</div>
            </div>
          </div>`.format(i, result.items.length, item['name'], item['catagory'])
            }
            itemsHTML += ('</div>');
            div.append(itemsHTML);
        }
    });
}

function getCatagories(url, div) {
    $.getJSON(url, function(result) {
        console.log(result);
        if (result.catagories.length > 0) {
            catagoriesHTML = '<div class="catagories tiles">';
            for (var i = 0; i < result.catagories.length; i++) {
                catagory = result.catagories[i];
                catagoriesHTML += `
        <div id="catagory-{0}" class="catagory tile" style="cursor: pointer;" onclick="catagoryDisplayMore({0}, {1}, 'catagory', {3});">
              {2}
        </div>`.format(i, result.catagories.length, catagory['name'], catagory['id'])
            }
            catagoriesHTML += ('</div>');
            div.append(catagoriesHTML);
        }
    });
}
