function col_md_9_width() {
    var titleWidth = parseInt(d3.select("#title-width").style("width").split("p")[0]);
	//console.log(titleWidth+"title");
	if(titleWidth>=940)
		titleWidth=titleWidth-222.5;
	//console.log(titleWidth+"mainbody");
	d3.select("#mainbody-width").style("width",""+titleWidth+"px");
}
	window.onresize = function(){
		col_md_9_width();
	}
	
	window.onload = function(){
		col_md_9_width();
	}