// I like pythons `.format` and want it in javascript
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
  };
}

function itemDisplayMore(id, totalDivs) {
  console.log(id,totalDivs);
    for (var i = 0; i < totalDivs; i++) {
      console.log(i);
        var thisItem = $('#item-' + i);
        var moreItem = thisItem.children('div.item-more');
        if (i === id) {
            moreItem.css('display', 'block');
            thisItem.addClass('item-expand');
        } else {
            moreItem.css('display', 'none');
            thisItem.removeClass('item-expand');
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
          <div id="item-{0}" class="item tile" onclick="itemDisplayMore({0},{1})">
            <div class="item-name">{2}
              <span class="item-catagory">({3})</span>
            </div>
            <div class="item-more no-display">
              <div class="item-desc">{3}</div>
            </div>
          </div>`.format(i,result.items.length,item['name'],item['catagory'])
      }
      itemsHTML += ('</div>');
      div.append(itemsHTML);
    }
      });
}
