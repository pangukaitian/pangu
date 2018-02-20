function insertData(id,timeStamp,author,title,url,type,application,abstract) {
    // id: 论文id
    // timeStamp: 时间戳
    // author：作者
    // title：文章标题
    // url：链接
    // type：文章类型
    // application： 应用
    // abstract：简介
    var tr = d3.select("#tbody1").append("tr").attr({
        "id":id,
        "class":"entry"
    }).on('mouseover', function () {
        d3.select(this).style({
            'background': '#EFEFEF'
        });
    }).on("mouseout",function () {
        d3.select(this).style({
            'background': ''
        });
    });
    tr.append("td").html(timeStamp);
    tr.append("td").html(author);

    var titleTd = tr.append("td").style({
        // "position":"absolute",
        // "width":"25%"
    }).html(title);
    var titleLink = titleTd.append("p").attr("class","infolinks").html("[");
    titleLink.append("a").style("cursor","pointer").on("click",function(){
        toggleInfo(id,'abstract')
    }).html("Abstract");
    titleLink.append("span").html("]  [");
    titleLink.append("a").attr("href",url).html("URL");
    titleLink.append("span").html("]");

    // tr.append("td").html(date);
    tr.append("td").html(type);
    tr.append("td").html(application);

    var absTr = d3.select("#tbody1").append("tr").attr({
        "id":"abs_" + id,
        "class":"abstract noshow"
    });
    absTr.append("td").attr("colspan","8").append("b").html("Abstract:").html(abstract);
}
