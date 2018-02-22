function titleEdit() {
    d3.select("#headTitle1").html("Repository of Publications on " +
        "Reliability of Deep Learning Systems").style({
        "position":"absolute",
        'left': '17%',
        "top": '25px',
        'font-size': '30px',
        'font-family': 'bold'
    });
    d3.select("#authorDiv").style({
        "position":"absolute",
        'top':"5px",
        'right': '120px',
        'width': "60px",
        'height': "20px",
        'border-radius': '3px',
        "cursor":"pointer",
        "background-color":"#E0E0E0"
    }).on("mouseover",function () {
        d3.select(this).style({
            'background': '#AED6F1'
        });

    }).on("mouseout",function () {
        d3.select(this).style({
            'background': '#E0E0E0'
        });
    }).on("click",function () {
            d3.select("#abInfo").style({
                "opacity": 1.0,
                'z-index': '3'
            });
            d3.select("#abInfo").html("This page is maintained by Qiang Hu, PANGU Research Lab, Department of Advanced Information Technology, Kyushu University, Fukuoka, Japan. \n" +
                "&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Email: zhao [AT] ait.kyushu-u.ac.jp");

    }).html("Author").style({
        "text-align":"center",
        "vertical-align":"middle",
        "font-size": "15px"
    });
    d3.select("#bibDiv").style({
        "position":"absolute",
        'top':"5px",
        'right': '50px',
        'width': "60px",
        'height': "20px",
        'border-radius': '3px',
        "cursor":"pointer",
        "background-color":"#E0E0E0"
    }).on("mouseover",function () {
        d3.select(this).style({
            'background': '#AED6F1'
        });

    }).on("mouseout",function () {
        d3.select(this).style({
            'background': '#E0E0E0'
        });
    }).on("click",function () {
        d3.select("#abInfo").style({
            "opacity": 1.0,
            'z-index': '3'
        });
        d3.select("#abInfo").html("if you would like to cite the repository website please use this BibTeX entry:\n" +
            "@misc{yzmham:dltest-repository, \n" +
            "author = Qiang Hu and Lei Ma and Jianjun Zhao,\n" +
            "title = The {DLT} Repository: {A} repository and analysis of research articles on Reliability of Deep Learning Systems, &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp\n" +
            "publisher = {{PANGU Research Group, Kyushu  University}}, &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp \n" +
            "note = https://pangukaitian.github.io/pangu/en/index.htmle_repository/ \n" +
            "}")
    }).html("BibTex").style({
        "text-align":"center",
        "vertical-align":"middle",
        "font-size": "15px"
    });
    d3.select("#abInfo").style({
        "position":"absolute",
        'top':"70px",
        'right': '50px',
        'width': "450px",
        'border-radius': '3px',
        'background': '#F0F0F0',
        'height': "95px",
        "opacity": 0.0,
        'z-index': '0'
    }).html("");

    d3.select("#headTitle").on("click",function () {
        d3.select("#abInfo").style({
            "opacity": 0.0,
            'z-index': '0'
        });
    });
    d3.select("#qstable").on("click",function () {
        d3.select("#abInfo").style({
            "opacity": 0.0,
            'z-index': '0'
        });
    })

}
