function loadData() {

    var $body = $('catagory');
    // var $wikiElem = $('#wikipedia-links');
    // var $nytHeaderElem = $('#nytimes-header');
    // var $nytElem = $('#nytimes-articles');
    // var $greeting = $('#greeting');
    // var $bgimg = $('#bgimg');
    // var $streetInput = $('#street');
    // var $cityInput = $('#city');
    // var streetInput = $('#street').val();
    // var cityInput = $('#city').val();

    // clear out old data before new request
    // $nytElem.html('');
    // $wikiElem.html('');

    // load streetview
    // $bgimg.attr('src', 'http://maps.googleapis.com/maps/api/streetview?size=600x300&location=' + ',' + streetInput + cityInput);


    get_NYT_articles('Washington', $body);



    return false;
}


function get_NYT_articles(searchTerm, div) {
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
        'api-key': "4783a51876ec44dc80dfa6f6b8c70abb",
        'q': searchTerm,
        'fq': "type_of_material:'Article'",
        'fl': "headline,lead_paragraph,type_of_material,web_url"
    });
    $.getJSON(url, function(result) {
      console.log(result);
            // var articles = [];
            // $.each(result.response.docs, function(key, value) {
            //     var headline = value.headline.main.split(";");
            //     articles.push("<li><a href='" + value.web_url + "'>" + headline[0] + "<br /><small>" + headline[1] + "</small>" + "</a><p class'nytimes-lead_paragraph>" + value.lead_paragraph + "</p></li>");
            //     console.log('value' + value);
            // });
            // if (articles.length < 1) {
            //     div.append("Could not find any articles for this location.");
            //
            // }
            // div.append(articles.join(""));
        });

}
// loadData();
// $('#form-container').submit(loadData);


function itemDisplayMore(id, totalDivs) {
    for (var i = 1; i <= totalDivs; i++) {
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
