// QuickSearch script for JabRef HTML export
// Version: 3.0
//
// Copyright (c) 2006-2008, Mark Schenk
// Copyright (c) 2009, Holger Jeromin <jeromin(at)plt.rwth-aachen.de>, Chair of Process Control Engineering, Aachen University of Technology
//
// This software is distributed under a Creative Commons Attribution 3.0 License
// http://creativecommons.org/licenses/by/3.0/

// Some features:
// + optionally searches Abstracts and Reviews
// + allows RegExp searches
//   e.g. to search for entries between 1980 and 1989, type:  198[0-9]
//   e.g. for any entry ending with 'symmetry', type:  symmetry$
//   e.g. for all reftypes that are books: ^book$, or ^article$
//   e.g. for entries by either John or Doe, type john|doe
// + easy toggling of Abstract/Review/BibTeX

// Features from Holger Jeromin
// + incremental search in each column (input or dropdownbox)
// + global search can search with multiple search words in the row
//   global search of special regexp related to a cell is not possible anymore: ^2009$
//   but this is possible in the local searches
// + use of innerText/textContent for less function overhead

function initSearch() {

    // basic object detection
    if(!document.getElementById || !document.getElementsByTagName) { return; }
    if (!document.getElementById('qstable')||!document.getElementById('qs')) { return; }

    // find QS table and appropriate rows
    searchTable = document.getElementById('qstable');
    var allRows = searchTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // split all rows into entryRows and infoRows (e.g. abstract, review, bibtex)
    entryRows = new Array();
    infoRows = new Array(); absRows = new Array(); revRows = new Array();

    for (var i=0, k=0, j=0; i<allRows.length;i++) {
        if (allRows[i].className.match(/entry/)) {
            entryRows[j++] = allRows[i];
        } else {
            infoRows[k++] = allRows[i];
            // check for abstract/review
            if (allRows[i].className.match(/abstract/)) {
                absRows.push(allRows[i]);
            } else if (allRows[i].className.match(/review/)) {
                revRows.push(allRows[i]);
            }
        }
    }

    //number of entries and rows
    numRows = allRows.length;
    numEntries = entryRows.length;
    numInfo = infoRows.length;
    numAbs = absRows.length;
    numRev = revRows.length;

    //find the query field
    qsfield = document.getElementById('qsfield');

    //find statistics location
    stats = document.getElementById('stat');
    setStatistics(-1);
    document.getElementById('qs').style.display = 'block';
    qsfield.onkeyup = testEvent;
    qsfield.onchange = testEvent;
}

function quickSearch(tInput){

    var localSearchArray = new Array();
    var globalSearchText = null;
    var globalSearch = new Array();
    // only search for valid RegExp
    //this input is in the global field and the user has typed something in
    if (qsfield == tInput && tInput.value != ""){
        //clear all other search fields
        for(var i=0; i<tableheaders.length; i++) {
            if (tableheaders[i].lastChild.nodeName == "INPUT"){
                tableheaders[i].lastChild.value = "";
            }else if (tableheaders[i].lastChild.nodeName == "SELECT"){
                tableheaders[i].lastChild.selectedIndex = 0;
            }
            tableheaders[i].lastChild.className = '';
        }
        try {
            globalSearchText = qsfield.value.split(" ");
            for (var i = 0; i < globalSearchText.length; i++){
                if (globalSearchText[i]){
                    globalSearch[i] = new RegExp(globalSearchText[i],"i");
                }
            }
        }catch(err) {
            tInput.className = 'invalidsearch';
            if (window.console != null){
                window.console.error("Search Error: %s", err);
            }
            return;
        }
        //this input is a local search => clear the global search
    }else if (tInput.value != ""){
        qsfield.value = "";
    }
    closeAllInfo();
    qsfield.className = '';
    for(var i=0; i<tableheaders.length; i++) {
        if (tableheaders[i].lastChild.value != ""){
            try {
                if(searchSubString[i] == true){
                    localSearchArray[i] = new RegExp(tableheaders[i].lastChild.value,"i")
                }else{
                    localSearchArray[i] = new RegExp("^"+tableheaders[i].lastChild.value+"$","i")
                }
            }catch(err) {
                tableheaders[i].lastChild.className = 'invalidsearch';
                if (window.console != null){
                    window.console.error("Search Error: %s", err);
                }
                return;
            }
        }
        tableheaders[i].lastChild.className = '';
    }

    // count number of hits
    var hits = 0;
    //initialise variable
    var t;
    var inCells;
    var numCols;

    // start looping through all entry rows
    for (var i = 0; cRow = entryRows[i]; i++){
        var found = false;

        if (globalSearch.length == 0 && localSearchArray.length == 0){
            //no search selected
            found=true;
        }else if (globalSearch.length != 0){
            t = undefined != cRow.innerText?cRow.innerText:cRow.textContent;
            for (var k = 0; k < globalSearch.length; k++){
                if (t.search(globalSearch[k]) == -1){
                    found=false;
                    break;
                }else{
                    found=true;
                }
            }
        }else{
            inCells = cRow.getElementsByTagName('td');
            numCols = inCells.length;
            for (var j=0; j<numCols; j++) {
                if (undefined != localSearchArray[j]){
                    cCell = inCells[j];
                    t = undefined != cCell.innerText?cCell.innerText:cCell.textContent;
                    if (t.search(localSearchArray[j]) == -1){
                        found=false;
                        break;
                    }else{
                        found=true;
                    }
                }
            }
        }
        // look for further hits in Abstract and Review
        if(!found) {
            var articleid = cRow.id;
            if(searchAbstract && (abs = document.getElementById('abs_'+articleid))) {
                for (var k = 0; k < globalSearch.length; k++){
                    if ((undefined != abs.innerText?abs.innerText:abs.textContent).search(globalSearch[k]) == -1){
                        found=false;
                        break;
                    }else{
                        found=true;
                    }
                }
            }
            if(searchReview && (rev = document.getElementById('rev_'+articleid))) {
                for (var k = 0; k < globalSearch.length; k++){
                    if ((undefined != rev.innerText?rev.innerText:rev.textContent).search(globalSearch[k]) == -1){
                        found=false;
                        break;
                    }else{
                        found=true;
                    }
                }
            }
            articleid = null;
        }

        if(found) {
            cRow.className = 'entry show';
            hits++;
        } else {
            cRow.className = 'entry noshow';
        }
    }

    // update statistics
    setStatistics(hits)
}

//显示下拉数据
function toggleInfo(articleid,info) {
    var entry = document.getElementById(articleid);
    var abs = document.getElementById('abs_'+articleid);
    var rev = document.getElementById('rev_'+articleid);
    var bib = document.getElementById('bib_'+articleid);

    // Get the abstracts/reviews/bibtext in the right location
    // in unsorted tables this is always the case, but in sorted tables it is necessary.
    // Start moving in reverse order, so we get: entry, abstract,review,bibtex
    if (searchTable.className.indexOf('sortable') != -1) {
        if(bib) { entry.parentNode.insertBefore(bib,entry.nextSibling); }
        if(rev) { entry.parentNode.insertBefore(rev,entry.nextSibling); }
        if(abs) { entry.parentNode.insertBefore(abs,entry.nextSibling); }
    }

    if (abs && info == 'abstract') {
        if(abs.className.indexOf('abstract') != -1) {
            abs.className.indexOf('noshow') == -1?abs.className = 'abstract noshow':abs.className = 'abstract';
        }
    } else if (rev && info == 'review') {
        if(rev.className.indexOf('review') != -1) {
            rev.className.indexOf('noshow') == -1?rev.className = 'review noshow':rev.className = 'review';
        }
    } else if (bib && info == 'bibtex') {
        if(bib.className.indexOf('bibtex') != -1) {
            bib.className.indexOf('noshow') == -1?bib.className = 'bibtex noshow':bib.className = 'bibtex';
        }
    } else {
        return;
    }

    // check if one or the other is available
    var revshow = false;
    var absshow = false;
    var bibshow = false;
    (abs && abs.className.indexOf('noshow') == -1)? absshow = true: absshow = false;
    (rev && rev.className.indexOf('noshow') == -1)? revshow = true: revshow = false;
    (bib && bib.className == 'bibtex')? bibshow = true: bibshow = false;

    // highlight original entry
    if(entry) {
        if (revshow || absshow || bibshow) {
            entry.className = 'entry highlight show';
        } else {
            entry.className = 'entry show';
        }
    }

    // When there's a combination of abstract/review/bibtex showing, need to add class for correct styling
    if(absshow) {
        (revshow||bibshow)?abs.className = 'abstract nextshow':abs.className = 'abstract';
    }
    if (revshow) {
        bibshow?rev.className = 'review nextshow': rev.className = 'review';
    }

}

function setStatistics (hits) {
    if(hits < 0) { hits=numEntries; }
    if(stats) { stats.firstChild.data = hits + '/' + numEntries}
}

function closeAllInfo(){
    for (var i=0; i < numInfo; i++){
        if (infoRows[i].className.indexOf('noshow') ==-1) {
            infoRows[i].className = infoRows[i].className + ' noshow';
        }
    }
}

function testEvent(e){
    if (!e) var e = window.event;
    quickSearch(this);
}

function clearQS() {
    qsfield.value = '';
    for(var i=0; i<tableheaders.length; i++) {
        if (tableheaders[i].lastChild.nodeName == "INPUT"){
            tableheaders[i].lastChild.value = "";
        }else if (tableheaders[i].lastChild.nodeName == "SELECT"){
            tableheaders[i].lastChild.selectedIndex = 0;
        }
        //get rid of error color
        tableheaders[i].lastChild.className = '';
    }
    quickSearch(qsfield);
}

// Automagically create a dropdown box for column heades marked with the 'dropd' class
// Mostly useful for year / BibTeX-type fields

function populateSelect() {
    // find the column with the dropdowns
    var selectNum = 0;
    var searchTable = document.getElementById('qstable');
    tableheaders = searchTable.getElementsByTagName('thead')[0].getElementsByTagName('th');
    var allRows = searchTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    //initialise variables
    var interactionelement;
    var brelement;
    var selectlist;
    var colsinrow;
    var entryContent;
    var usedentries;
    searchSubString = new Array(tableheaders.length);

    for(var i=0; i<tableheaders.length; i++) {
        if(tableheaders[i].className=="input") {
            interactionelement = document.createElement('input');
            interactionelement.type = "text";
            if(i==2)
            {interactionelement.size = 22;} else {interactionelement.size = 13;}
            interactionelement.autocomplete = "off";
            interactionelement.onkeyup = testEvent;
            interactionelement.onchange = testEvent;
            searchSubString[i] = true;
        }else if(tableheaders[i].className=="dropd") {
            selectlist = new Array();
            for(var k=0; k<allRows.length; k++) {
                colsinrow = allRows[k].getElementsByTagName('td');
                if(colsinrow.length >= i) {
                    entryContent = undefined != colsinrow[i].innerText?colsinrow[i].innerText:colsinrow[i].textContent;
                    //avoid empty entrys
                    if ("" != entryContent && undefined != entryContent){
                        selectlist.push(entryContent);
                    }
                }
            }
            // sort the entry array
            selectlist.sort();

            //clear duplicate entrys
            usedentries = new Array();
            usedentries.push(selectlist[0]);
            for(j=1; j<selectlist.length;j++) {
                if(selectlist[j]!= selectlist[j-1]) {
                    usedentries.push(selectlist[j]);
                }
            }
            //create select Element
            interactionelement = document.createElement('select');
            interactionelement.id="select" + selectNum++;
            //create descriptive first Element
            interactionelement.appendChild(document.createElement('option'));
            interactionelement.lastChild.appendChild(document.createTextNode('- all -'));
            interactionelement.lastChild.value = "";
            //create all Elements
            for(k=0; k<usedentries.length; k++) {
                interactionelement.appendChild(document.createElement('option'));
                interactionelement.lastChild.value = usedentries[k];
                interactionelement.lastChild.appendChild(document.createTextNode(usedentries[k]));
            }
            interactionelement.onchange = testEvent;
            searchSubString[i] = false;
        }
        //prevent clicking in the element start sorting the table
        interactionelement.onclick = cancelBubble;
        brelement = document.createElement('br');
        tableheaders[i].appendChild(brelement);
        tableheaders[i].appendChild(interactionelement);
    }
}

function cancelBubble(e){
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
}


// Sort Table Script
// Version: 1.1
//
// Copyright (c) 2006-2008, Mark Schenk
// Copyright (c) 2009, Holger Jeromin <jeromin(at)plt.rwth-aachen.de>, Chair of Process Control Engineering, Aachen University of Technology

// Features from Holger Jeromin
// + use of innerText/textContent for less function overhead
// + search optimisation (only search in cell.firstchild) deactivated, firefox is fast enough with the use of textContent

// This software is distributed under a Creative Commons Attribution 3.0 License
// http://creativecommons.org/licenses/by/3.0/

// Sorting of columns with a lot of text can be slow, so some speed optimizations can be enabled,
// using the following variable
var SORT_SPEED_OPT = false;
// the optimization has one limitation on the functionality: when sorting search
// results, the expanded info, e.g. bibtex/review, is collapsed. In the non-optimized
// version they remain visible.

if (window.addEventListener) {
    window.addEventListener("load",initSortTable,false) }
else if (window.attachEvent) {
    window.attachEvent("onload", initSortTable); }

function initSortTable() {
    var alltables = document.getElementsByTagName('table');
    for(i=0;i<alltables.length;i++) {
        var currentTable = alltables[i];
        if(currentTable.className.indexOf('sortable') !=-1) {
            var thead = currentTable.getElementsByTagName('thead')[0];
            thead.title = 'Click on any column header to sort';
            for (var i=0;cell = thead.getElementsByTagName('th')[i];i++) {
                cell.onclick = function () { resortTable(this); };
                // make it possible to have a default sort column
                if(cell.className.indexOf('sort')!=-1) {
                    resortTable(cell)
                }
            }
        }
    }
}

var SORT_COLUMN_INDEX;

function resortTable(td) {
    var column = td.cellIndex;
    var table = getParent(td,'TABLE');

    var allRows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var newRows = new Array();

    for (var i=0, k=0; i<allRows.length;i++) {

        var rowclass = allRows[i].className;

        if (rowclass.indexOf('entry') != -1) {
            newRows[k++] = allRows[i];
        }

        if (SORT_SPEED_OPT) {
            // remove highlight class
            allRows[i].className = rowclass.replace(/highlight/,'');
            // close information
            if(rowclass.indexOf('entry') == -1 && rowclass.indexOf('noshow') == -1) { allRows[i].className = rowclass + ' noshow';}
        }
    }

    // If other sort functions are deemed necessary (e.g. for
    // dates and currencies) they can be added.
    var sortfn = ts_sort_caseinsensitive;
    SORT_COLUMN_INDEX = column;
    newRows.sort(sortfn);

    // create a container for showing sort arrow
    var arrow =  td.getElementsByTagName('span')[0];
    if (!arrow) { var arrow = td.insertBefore(document.createElement('span'), td.childNodes[1]);}

    if (td.className) {
        if (td.className.indexOf('sort_asc') !=-1) {
            td.className = td.className.replace(/_asc/,"_des");
            newRows.reverse();
            arrow.innerHTML = ' &uarr;';
        } else if (td.className.indexOf('sort_des') !=-1) {
            td.className = td.className.replace(/_des/,"_asc");
            arrow.innerHTML = ' &darr;';
        } else {
            td.className += ' sort_asc';
            arrow.innerHTML = ' &darr;';
        }
    } else {
        td.className += 'sort_asc';
        arrow.innerHTML = ' &darr;';
    }

    // Remove the classnames and up/down arrows for the other headers
    var ths = table.getElementsByTagName('thead')[0].getElementsByTagName('th');
    for (var i=0; i<ths.length; i++) {
        if(ths[i]!=td && ths[i].className.indexOf('sort_')!=-1) {
            // argh, moronic JabRef thinks (backslash)w is an output field!!
            //ths[i].className = ths[i].className.replace(/sort_(backslash)w{3}/,"");
            ths[i].className = ths[i].className.replace(/sort_asc/,"");
            ths[i].className = ths[i].className.replace(/sort_des/,"");

            // remove span
            var arrow =  ths[i].getElementsByTagName('span')[0];
            if (arrow) { ths[i].removeChild(arrow); }
        }
    }

    // We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
    for (i=0;i<newRows.length;i++) {
        table.getElementsByTagName('tbody')[0].appendChild(newRows[i]);

        if(!SORT_SPEED_OPT){
            // moving additional information, e.g. bibtex/abstract to right locations
            // this allows to sort, even with abstract/review/etc. still open
            var articleid = newRows[i].id;

            var entry = document.getElementById(articleid);
            var abs = document.getElementById('abs_'+articleid);
            var rev = document.getElementById('rev_'+articleid);
            var bib = document.getElementById('bib_'+articleid);

            var tbody = table.getElementsByTagName('tbody')[0];
            // mind the order of adding the entries
            if(abs) { tbody.appendChild(abs); }
            if(rev) { tbody.appendChild(rev); }
            if(bib) { tbody.appendChild(bib); }
        }
    }
}


function ts_sort_caseinsensitive(a,b) {
    aa = (undefined != a.cells[SORT_COLUMN_INDEX].innerText?a.cells[SORT_COLUMN_INDEX].innerText:a.cells[SORT_COLUMN_INDEX].textContent).toLowerCase();
    bb = (undefined != b.cells[SORT_COLUMN_INDEX].innerText?b.cells[SORT_COLUMN_INDEX].innerText:b.cells[SORT_COLUMN_INDEX].textContent).toLowerCase();
    if (aa==bb) return 0;
    if (aa<bb) return -1;
    return 1;
}

function ts_sort_default(a,b) {
    aa = (undefined != a.cells[SORT_COLUMN_INDEX].innerText?a.cells[SORT_COLUMN_INDEX].innerText:a.cells[SORT_COLUMN_INDEX].textContent);
    bb = (undefined != b.cells[SORT_COLUMN_INDEX].innerText?b.cells[SORT_COLUMN_INDEX].innerText:b.cells[SORT_COLUMN_INDEX].textContent);
    if (aa==bb) return 0;
    if (aa<bb) return -1;
    return 1;
}

function getParent(el, pTagName) {
    if (el == null) {
        return null;
    } else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase()) {
        return el;
    } else {
        return getParent(el.parentNode, pTagName);
    }
}



// Search settings
var searchAbstract = true;
var searchReview = true;

if (window.addEventListener) {
    window.addEventListener("load",function () {
        titleEdit();
        //添加数据
        // id: 论文id
        // timeStamp: 时间戳
        // author：作者
        // title：文章标题
        // url：链接
        // type：文章类型
        // application： 应用
        // abstract：简介
        insertData("data001","2017.05.18","Kexin Pei, Yinzhi Cao, Junfeng Yang, Suman Jana","DeepXplore: Automated Whitebox Testing of Deep Learning Systems","https://arxiv.org/abs/1705.06640","Testing for DL Systems","Testing","Deep learning (DL) systems are increasingly deployed in safety- and security-critical domains including self-driving cars and malware detection, where the correctness and predictability of a system's behavior for corner case inputs are of great importance. Existing DL testing depends heavily on manually labeled data and therefore often fails to expose erroneous behaviors for rare inputs. We design, implement, and evaluate DeepXplore, the first whitebox framework for systematically testing real-world DL systems. First, we introduce neuron coverage for systematically measuring the parts of a DL system exercised by test inputs. Next, we leverage multiple DL systems with similar functionality as cross-referencing oracles to avoid manual checking. Finally, we demonstrate how finding inputs for DL systems that both trigger many differential behaviors and achieve high neuron coverage can be represented as a joint optimization problem and solved efficiently using gradient-based search techniques. \\nDeepXplore efficiently finds thousands of incorrect corner case behaviors (e.g., self-driving cars crashing into guard rails and malware masquerading as benign software) in state-of-the-art DL models with thousands of neurons trained on five popular datasets including ImageNet and Udacity self-driving challenge data. For all tested DL models, on average, DeepXplore generated one test input demonstrating incorrect behavior within one second while running only on a commodity laptop. We further show that the test inputs generated by DeepXplore can also be used to retrain the corresponding DL model to improve the model's accuracy by up to 3%.");
        insertData("data002","2017.06.14","Ian Goodfellow,Nicolas Papernot","The challenge of verification and testing of machine learning","http://www.cleverhans.io/security/privacy/ml/2017/06/14/verification.html","Testing for DL Systems","Testing","in our second post, we gave some background explaining why attacking machine learning is often easier than defending it. We saw some of the reasons why we do not yet have completely effective defenses against adversarial examples, and we speculated about whether we can ever expect such a defense.In this post, we explore the types of guarantees one can expect a machine learning model to possess. We argue that the limitations of existing defenses point to the lack of verification of machine learning models. Indeed, to design reliable systems, engineers typically engage in both testing and verification");
        insertData("data003","2017.08.28","Yuchi Tian, Kexin Pei, Suman Jana, Baishakhi Ray","DeepTest: Automated Testing of Deep-Neural-Network-driven Autonomous Cars","https://arxiv.org/abs/1708.08559","Testing for DL Systems","Testing","Recent advances in Deep Neural Networks (DNNs) have led to the development of DNN-driven autonomous cars that, using sensors like camera, LiDAR, etc., can drive without any human intervention. Most major manufacturers including Tesla, GM, Ford, BMW, and Waymo/Google are working on building and testing different types of autonomous vehicles. The lawmakers of several US states including California, Texas, and New York have passed new legislation to fast-track the process of testing and deployment of autonomous vehicles on their roads.However, despite their spectacular progress, DNNs, just like traditional software, often demonstrate incorrect or unexpected corner case behaviors that can lead to potentially fatal collisions. Several such real-world accidents involving autonomous cars have already happened including one which resulted in a fatality. Most existing testing techniques for DNN-driven vehicles are heavily dependent on the manual collection of test data under different driving conditions which become prohibitively expensive as the number of test conditions increases.In this paper, we design, implement and evaluate DeepTest, a systematic testing tool for automatically detecting erroneous behaviors of DNN-driven vehicles that can potentially lead to fatal crashes. First, our tool is designed to automatically generated test cases leveraging real-world changes in driving conditions like rain, fog, lighting conditions, etc. DeepTest systematically explores different parts of the DNN logic by generating test inputs that maximize the numbers of activated neurons. DeepTest found thousands of erroneous behaviors under different realistic driving conditions (e.g., blurring, rain, fog, etc.) many of which lead to potentially fatal crashes in three top performing DNNs in the Udacity self-driving car challenge.");
        insertData("data004","2017.10.21","Matthew Wicker, Xiaowei Huang, Marta Kwiatkowska","Feature-Guided Black-Box Safety Testing of Deep Neural Networks","https://arxiv.org/abs/1710.07859","Testing for DL Systems","Testing","Despite the improved accuracy of deep neural networks, the discovery of adversarial examples has raised serious safety concerns. Most existing approaches for crafting adversarial examples necessitate some knowledge (architecture, parameters, etc) of the network at hand. In this paper, we focus on image classifiers and propose a feature-guided black-box approach to test the safety of deep neural networks that requires no such knowledge. Our algorithm employs object detection techniques such as SIFT (Scale Invariant Feature Transform) to extract features from an image. These features are converted into a mutable saliency distribution, where high probability is assigned to pixels that affect com- position of the image with respect to the human visual system. We formulate the crafting of adversarial examples as a two-player turn-based stochastic game, where the first player's objective is to find an adversarial example by manipulating the features, and the second player can be cooperative, adversarial, or random. We show that, theoretically, the two-player game can converge to the optimal strategy, and that the optimal strategy represents a globally minimal adversarial image. Using Monte Carlo tree search we gradually explore the game state space to search for adversarial examples. Our experiments show that, despite the black- box setting, manipulations guided by a perception-based saliency distribution are competitive with state-of-the-art methods that rely on white-box saliency matrices or sophisticated optimization procedures. Finally, we show how our method can be used to evaluate robustness of neural networks in safety-critical applications such as traffic sign recognition in self-driving cars.");
        insertData("data005","2018.02","Wei Yang , Tao Xie","Telemade: A Testing Framework for Learning-Based Malware Detection Systems","https://pdfs.semanticscholar.org/4635/49e227c32e355cf4ccea462b991512b54104.pdf","Testing for DL Systems","Testing","Learning-based malware detectors may be errorneous due to two inherent limitations. First, there is a lack of differentiability: selected features may not reflect essential differences between malware and benign apps. Second, there is a lack of comprehensiveness: the machine learning (ML) models are usually based on prior knowledge of existing malware (i.e., training dataset) so malware can evolve to evade the detection. There is a strong need for an automated framework to help security analysts to detect errors in learning-based malware detection systems. Existing techniques to generate adversarial samples for learning-based systems (that take images as inputs) employ feature mutations based on feature vectors. Such techniques are infeasible to generate adversarial samples (e.g., evasive malware) for malware detection system because the synthesized mutations may break the inherent constraints posed by code structures of the malware, causing either crashes or malfunctioning of malicious payloads. To address the challenge, we propose Telemade, a testing framework for learning-based malware detectors.");
        insertData("data006","2017.08.10","Tommaso Dreossi, Shromona Ghosh, Alberto Sangiovanni-Vincentelli, Sanjit A. Seshia","Systematic Testing of Convolutional Neural Networks for Autonomous Driving","https://people.eecs.berkeley.edu/~tommasodreossi/papers/rmlw2017.pdf","Testing for DL Systems","Testing","We present a framework to systematically analyze convolutional neural networks (CNNs) used in classification of cars in autonomous vehicles. Our analysis procedure comprises an image generator that produces synthetic pictures by sampling in a lower dimension image modification subspace and a suite of visualization tools. The image generator produces images which can be used to test the CNN and hence expose its vulnerabilities. The presented framework can be used to extract insights of the CNN classifier, compare across classification models, or generate training and validation datasets.");
        insertData("data007","2018.02","Oreoluwa Alebiosu, Siwakorn Srisakaokul, Angello Astorga, Tao Xie","Multiple-Implementation Testing of Supervised Learning Software","https://pdfs.semanticscholar.org/079a/c1a1481d1fb8be2ee8d2101737746f2b50e6.pdf","Testing for ML Systems","Testing","Machine learning (ML) software, used to implement an ML algorithm, is widely used in many application domains such as financial, business, and engineering domains. Faults in ML software can cause substantial losses in these application domains. Thus, it is very critical to conduct effective testing of ML software to detect and eliminate its faults. However, testing ML software is difficult, especially on producing test oracles used for checking behavior correctness (such as using expected properties or expected test outputs). To tackle the test-oracle issue, in this paper, we present a novel black-box approach of multiple-implementation testing for supervised learning software. The insight underlying our approach is that there can be multiple implementations (independently written) for a supervised learning algorithm, and majority of them may produce the expected output for a test input (even if none of these implementations are fault-free). In particular, our approach derives a pseudo-oracle for a test input by running the test input on n implementations of the supervised learning algorithm, and then using the common test output produced by a majority (determined by a percentage threshold) of these n implementations. Our approach includes techniques to address challenges in multiple-implementation testing (or generally testing) of supervised learning software: definition of a test case in testing supervised learning software, along with resolution of inconsistent algorithm configurations across implementations. The evaluations on our approach show that our multiple-implementation testing is effective in detecting real faults in real-world ML software (even popularly used ones), including 5 faults from 10 NaiveBayes implementations and 4 faults from 20 k-nearest neighbor implementations.");
        insertData("data008","2011.04","Xiaoyuan Xiea, Joshua W.K. Ho , Christian Murphyc , Gail Kaiser, Baowen Xue, Tsong Yueh Chena","Testing and validating machine learning classifiers by metamorphic testing","https://pdfs.semanticscholar.org/ed45/fe2cf73b2da28e5d6039dfe3b6b68d2df39f.pdf","Testing for ML Systems","Testing","Machine learning algorithms have provided core functionality to many application domains – such as bioinformatics, computational linguistics, etc. However, it is difficult to detect faults in such applications because often there is no “test oracle” to verify the correctness of the computed outputs. To help address the software quality, in this paper we present a technique for testing the implementations of machine learning classification algorithms which support such applications. Our approach is based on the technique “metamorphic testing”, which has been shown to be effective to alleviate the oracle problem. Also presented include a case study on a real-world machine learning application framework, and a discussion of how programmers implementing machine learning algorithms can avoid the common pitfalls discovered in our study. We also conduct mutation analysis and cross-validation, which reveal that our method has high effectiveness in killing mutants, and that observing expected cross-validation result alone is not sufficiently effective to detect faults in a supervised classification program. The effectiveness of metamorphic testing is further confirmed by the detection of real faults in a popular open-source classification program.");
        insertData("data009","2009.08.24","X.Xie, J.W.K.Ho, C.Murphy, G.Kaiser, B.W.Xu, and T.Y.Chen","Application of Metamorphic Testing to Supervised Classifiers","http://www.cs.columbia.edu/wp-content/uploads/sites/7/2011/03/3478-Xie-QSIC09.pdf","Testing for ML Systems","Testing","Many applications in the field of scientific computing - such as computational biology, computational linguistics, and others - depend on Machine Learning algorithms to provide important core functionality to support solutions in the particular problem domains. However, it is diffi- cult to test such applications because often there is no “test oracle” to indicate what the correct output should be for arbitrary input. To help address the quality of such software, in this paper we present a technique for testing the implementations of supervised machine learning classification algorithms on which such scientific computing software depends. Our technique is based on an approach called “metamorphic testing”, which has been shown to be effective in such cases. More importantly, we demonstrate that our technique not only serves the purpose of verifi- cation, but also can be applied in validation. In addition to presenting our technique, we describe a case study we performed on a real-world machine learning application framework, and discuss how programmers implementing machine learning algorithms can avoid the common pitfalls discovered in our study. We also discuss how our findings can be of use to other areas outside scientific computing, as well.");
        insertData("data010","1981","M.D.Davis, E.J.Weyuker","Pseudo-oracles for non-testable programs","https://dl.acm.org/citation.cfm?id=809889","Testing for ML Systems","Testing","The most commonly used method of validating a program is by testing. The programmer typically runs the program on some test cases, and if and when they run correctly, the program is considered to be correct. We know that many difficult problems are associated with testing. One such problem is that it is a fundamental part of the testing process to require the ability to infer properties of a program by observing the program's behavior on selected inputs. The most common property that one hopes to infer through testing is correctness. But unless the program is run on the entire input domain, there are infinitely many programs which produce the correct output on the selected inputs, but produce incorrect output for some other element of the domain.");
        insertData("data011","2008.01","Christian Murphy, Gail Kaiser, Lifeng Hu, Leon Wu","Properties of Machine Learning Applications for Use in Metamorphic Testing","http://ecommons.luc.edu/cgi/viewcontent.cgi?article=1036&amp;context=cs_facpubs#page=896","Testing for ML Systems","Testing","It is challenging to test machine learning (ML) applications, which are intended to learn properties of data sets where the correct answers are not already known. In the absence of a test oracle, one approach to testing these applications is to use metamorphic testing, in which properties of the application are exploited to define transformation functions on the input, such that the new output will be unchanged or can easily be predicted based on the original output; if the output is not as expected, then a defect must exist in the application. Here, we seek to enumerate and classify the metamorphic properties of some machine learning algorithms, and demonstrate how these can be applied to reveal defects in the applications of interest. In addition to the results of our testing, we present a set of properties that can be used to define these metamorphic relationships so that metamorphic testing can be used as a general approach to testing machine learning applications.");
        insertData("data012","2016.12.06","Shin Nakajima, Hai Ngoc Bui","Dataset Coverage for Testing Machine Learning Computer Programs","http://ieeexplore.ieee.org/abstract/document/7890601/?reload=true","Testing for ML Systems","Testing","Machine learning programs are non-testable, and thus testing with pseudo oracles is recommended. Although metamorphic testing is effective for testing with pseudo oracles, identifying metamorphic properties has been mostly ad hoc. This paper proposes a systematic method to derive a set of metamorphic properties for machine learning classifiers, support vector machines. The proposal includes a new notion of test coverage for the machine learning programs; this test coverage provides a clear guideline for conducting a series of metamorphic testing.");
        insertData("data013","2017","Shin Nakajima","Generalized Oracle for Testing Machine Learning Computer Programs","http://fmse.di.unimi.it/faacs2017/papers/paperFAACS2.pdf","Testing for ML Systems","Testing","Computation results of machine learning programs are not possible to be anticipated, because the results are sensitive to distribution of data in input dataset. Additionally, these computer programs sometimes adopt randomized algorithms for finding sub-optimal solutions or improving runtime efficiencies to reach solutions. The computation is probabilistic and the results vary from execution to execution even for a same input. The characteristics imply that no deterministic test oracle exists to check correctness of programs. This paper studies how a notion of oracles is elaborated so that these programs can be tested, and shows a systematic way of deriving testing properties from mathematical formulations of given machine learning problems.");
        insertData("data014","2016.05.24","Osbert Bastani, Yani Ioannou, Leonidas Lampropoulos, Dimitrios Vytiniotis, Aditya Nori, and Antonio Criminisi.","Measuring Neural Net Robustness with Constraints","http://papers.nips.cc/paper/6339-measuring-neural-net-robustness-with-constraints.pdf","Verification for DL System","Verification","Despite having high accuracy, neural nets have been shown to be susceptible to adversarial examples, where a small perturbation to an input can cause it to become mislabeled. We propose metrics for measuring the robustness of a neural net and devise a novel algorithm for approximating these metrics based on an encoding of robustness as a linear program. We show how our metrics can be used to evaluate the robustness of deep neural nets with experiments on the MNIST and CIFAR-10 datasets. Our algorithm generates more informative estimates of robustness metrics compared to estimates based on existing algorithms. Furthermore, we show how existing approaches to improving robustness “overfit” to adversarial examples generated using a specific algorithm. Finally, we show that our techniques can be used to additionally improve neural net robustness both according to the metrics that we propose, but also according to previously proposed metrics.");
        insertData("data015","2017.05.05","Xiaowei Huang, Marta Kwiatkowska, Sen Wang, and Min Wu.","Safety Verification of Deep Neural Networks","http://qav.comlab.ox.ac.uk/papers/hkww17.pdf","Verification for DL System","Verification","Deep neural networks have achieved impressive experimental results in image classification, but can surprisingly be unstable with respect to adversarial perturbations, that is, minimal changes to the input image that cause the network to misclassify it. With potential applications including perception modules and end-to-end controllers for self-driving cars, this raises concerns about their safety. We develop a novel automated verification framework for feed-forward multi-layer neural networks based on Satisfiability Modulo Theory (SMT). We focus on safety of image classification decisions with respect to image manipulations, such as scratches or changes to camera angle or lighting conditions that would result in the same class being assigned by a human, and define safety for an individual decision in terms of invariance of the classification within a small neighbourhood of the original image. We enable exhaustive search of the region by employing discretisation, and propagate the analysis layer by layer. Our method works directly with the network code and, in contrast to existing methods, can guarantee that adversarial examples, if they exist, are found for the given region and family of manipulations. If found, adversarial examples can be shown to human testers and/or used to fine-tune the network. We implement the techniques using Z3 and evaluate them on state-of-the-art networks, including regularised and deep learning networks. We also compare against existing techniques to search for adversarial examples and estimate network robustness.");
        insertData("data016","2017.05.19","Guy Katz, Clark Barrett, David L. Dill, Kyle Julian, and Mykel J. Kochenderfer.","Reluplex: An Efficient SMT Solver for Verifying Deep Neural Networks","http://theory.stanford.edu/~barrett/pubs/KBD+17.pdf","Verification for DL System","Verification","Deep neural networks have emerged as a widely used and effective means for tackling complex, real-world problems. However, a major obstacle in applying them to safety-critical systems is the great difficulty in providing formal guarantees about their behavior. We present a novel, scalable, and efficient technique for verifying properties of deep neural networks (or providing counter-examples). The technique is based on the simplex method, extended to handle the non-convex Rectified Linear Unit (ReLU ) activation function, which is a crucial ingredient in many modern neural networks. The verification procedure tackles neural networks as a whole, without making any simplifying assumptions. We evaluated our technique on a prototype deep neural network implementation of the next-generation airborne collision avoidance system for unmanned aircraft (ACAS Xu). Results show that our technique can successfully prove properties of networks that are an order of magnitude larger than the largest networks verified using existing methods.");
        insertData("data017","2017.09,19","Nina Narodytska, Shiva Prasad Kasiviswanathan, Leonid Ryzhyk, Mooly Sagiv, Toby Walsh.","Verifying Properties of Binarized Deep Neural Networks","https://arxiv.org/abs/1709.06662","Verification for DL System","Verification","Understanding properties of deep neural networks is an important challenge in deep learning. In this paper, we take a step in this direction by proposing a rigorous way of verifying properties of a popular class of neural networks, Binarized Neural Networks, using the well-developed means of Boolean satisfiability. Our main contribution is a construction that creates a representation of a binarized neural network as a Boolean formula. Our encoding is the first exact Boolean representation of a deep neural network. Using this encoding, we leverage the power of modern SAT solvers along with a proposed counterexample-guided search procedure to verify various properties of these networks. A particular focus will be on the critical property of robustness to adversarial perturbations. For this property, our experimental results demonstrate that our approach scales to medium-size deep neural networks used in image classification tasks. To the best of our knowledge, this is the first work on verifying properties of deep neural networks using an exact Boolean encoding of the network.");
        insertData("data018","2017.10.09","Chih-Hong Cheng, Georg N¨uhrenberg, and Harald Ruess.","Verification of Binarized Neural Networks via Inter-Neuron Factoring","https://arxiv.org/abs/1710.03107","Verification for DL System","Verification","We study the problem of formal verification of Binarized Neural Networks (BNN), which have recently been proposed as a energy-efficient alternative to traditional learning networks. The verification of BNNs, using the reduction to hardware verification, can be even more scalable by factoring computations among neurons within the same layer. By proving the NP-hardness of finding optimal factoring as well as the hardness of PTAS approximability, we design polynomial-time search heuristics to generate factoring solutions. The overall framework allows applying verification techniques to moderately-sized BNNs for embedded devices with thousands of neurons and inputs.");
        insertData("data019","2018.01.18","Lindsey Kuper,Guy Katz,Justin Gottschlich,Kyle Julian,Clark Barrett, Mykel Kochenderfer.","Toward Scalable Verification for Safety-Critical Deep Networks","https://arxiv.org/abs/1801.05950","Verification for DL System","Verification","The increasing use of deep neural networks for safety-critical applications, such as autonomous driving and flight control, raises concerns about their safety and reliability. Formal verification can address these concerns by guaranteeing that a deep learning system operates as intended, but the state of the art is limited to small systems. In this work-in-progress report we give an overview of our work on mitigating this difficulty, by pursuing two complementary directions: devising scalable verification techniques, and identifying design choices that result in deep learning systems that are more amenable to verification.");
        insertData("data020","2018.02.16","Rudy Bunel,Ilker Turkaslan,Philip H.S. Torr,Pushmeet Kohli,M.Pawan Kumar","Piecewise Linear Neural Networks verification: A comparative study","https://openreview.net/pdf?id=BkPrDFgR-","Verification for DL System","Verification","The success of Deep Learning and its potential use in many important safety- critical applications has motivated research on formal verification of Neural Net- work (NN) models. Despite the reputation of learned NN models to behave as black boxes and theoretical hardness results of the problem of proving their prop- erties, researchers have been successful in verifying some classes of models by exploiting their piecewise linear structure. Unfortunately, most of these works test their algorithms on their own models and do not offer any comparison with other approaches. As a result, the advantages and downsides of the different al- gorithms are not well understood. Motivated by the need of accelerating progress in this very important area, we investigate the trade-offs of a number of different approaches based on Mixed Integer Programming, Satisfiability Modulo Theory, as well as a novel method based on the Branch-and-Bound framework. We also propose a new data set of benchmarks, in addition to a collection of previously released testcases that can be used to compare existing methods. Our analysis not only allowed a comparison to be made between different strategies, the compar- ision of results from different solvers also revealed implementation bugs in pub- lished methods. We expect that the availability of our benchmark and the analysis of the different approaches will allow researchers to invent and evaluate promising approaches for making progress on this important topic.");
        insertData("data021","2010","Luca Pulina and Armando Tacchella","An Abstraction-Refinement Approach to Verification of Artificial Neural Networks","https://pdfs.semanticscholar.org/72e5/5b90b5b791646266b0da8f6528d99aa96be5.pdf","Verification for ML System","Verification","A key problem in the adoption of artificial neural networks in safetyrelated applications is that misbehaviors can be hardly ruled out with traditional analytical or probabilistic techniques. In this paper we focus on specific networks known as Multi-Layer Perceptrons (MLPs), and we propose a solution to verify their safety using abstractions to Boolean combinations of linear arithmetic constraints. We show that our abstractions are consistent, i.e., whenever the abstract MLP is declared to be safe, the same holds for the concrete one. Spurious counterexamples, on the other hand, trigger refinements and can be leveraged to automate the correction of misbehaviors. We describe an implementation of our approach based on the HYSAT solver, detailing the abstraction-refinement process and the automated correction strategy. Finally, we present experimental results confirming the feasibility of our approach on a realistic case study.");
        insertData("data022","2012.04","Pulina.L, and Tacchella.A","Challenging SMT solvers to verify neural networks","http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.866.7776&rep=rep1&type=pdf","Verification for ML System","Verification","In recent years, Satisfiability Modulo Theory (SMT) solvers are becoming increasingly popular in the Computer Aided Verification and Reasoning community. Used natively or as back-engines, they are accumulating a record of success stories and, as witnessed by the annual SMT competition, their performances and capacity are also increasing steadily. Introduced in previous contributions of ours, a new application domain providing an outstanding challenge for SMT solvers is represented by verification of Multi-Layer Perceptrons (MLPs) a widely-adopted kind of artificial neural network. In this paper we present an extensive evaluation of the current state-of-the-art SMT solvers and assess their potential in the promising domain of MLP verification. Keywords: Empirical evaluation of SMT solvers, applications of automated reasoning, formal methods for adaptive systems");
        insertData("data023","2001.07.01","Radosiaw R Zakrzewski","Verification of a trained neural network accuracy","http://ieeexplore.ieee.org/abstract/document/938410/","Verification for ML System","Verification","n safety-critical applications it is necessary to verify if a neural net does not display any undesirable behavior due to overtraining. In particular in civil aviation, novel algorithms undergo the utmost scrutiny before the flight software is approved for use in aircraft. Neural nets' reputation for unpredictability has impeded their use in safety-critical applications. The paper presents a deterministic method for verification of a neural net trained to approximate another, difficult to implement mapping. First, approximation error is evaluated on a uniform grid of testing points. Then, maximal growth rates of both functions are used to bound the error anywhere between the testing points. The technique allows us to verify accuracy of nets that replace large multidimensional look-up tables. Practical ramifications of the method and further possible extensions are discussed.");
        insertData("data024","2017.05.03","Ruediger Ehlers","Formal Verification of Piece-Wise Linear Feed-Forward Neural Networks","https://arxiv.org/abs/1705.01320","Verification for ML System","Verification","We present an approach for the verification of feed-forward neural networks in which all nodes have a piece-wise linear activation function. Such networks are often used in deep learning and have been shown to be hard to verify for modern satisfiability modulo theory (SMT) and integer linear programming (ILP) solvers.The starting point of our approach is the addition of a global linear approximation of the overall network behavior to the verification problem that helps with SMT-like reasoning over the network behavior. We present a specialized verification algorithm that employs this approximation in a search process in which it infers additional node phases for the non-linear nodes in the network from partial node phase assignments, similar to unit propagation in classical SAT solving. We also show how to infer additional conflict clauses and safe node fixtures from the results of the analysis steps performed during the search. The resulting approach is evaluated on collision avoidance and handwritten digit recognition case studies.");
        insertData("data025","2017.05.19"," Patrick McDaniel, Ian Goodfellow, Somesh Jha, Z.Berkay Celik, and Ananthram Swami","Practical Black-Box Attacks against Machine Learning","https://arxiv.org/abs/1602.02697","Cryptography and Security","","Machine learning (ML) models, e.g., deep neural networks (DNNs), are vulnerable to adversarial examples: malicious inputs modified to yield erroneous model outputs, while appearing unmodified to human observers. Potential attacks include having malicious content like malware identified as legitimate or controlling vehicle behavior. Yet, all existing adversarial example attacks require knowledge of either the model internals or its training data. We introduce the first practical demonstration of an attacker controlling a remotely hosted DNN with no such knowledge. Indeed, the only capability of our black-box adversary is to observe labels given by the DNN to chosen inputs. Our attack strategy consists in training a local model to substitute for the target DNN, using inputs synthetically generated by an adversary and labeled by the target DNN. We use the local substitute to craft adversarial examples, and find that they are misclassified by the targeted DNN. To perform a real-world and properly-blinded evaluation, we attack a DNN hosted by MetaMind, an online deep learning API. We find that their DNN misclassifies 84.24% of the adversarial examples crafted with our substitute. We demonstrate the general applicability of our strategy to many ML techniques by conducting the same attack against models hosted by Amazon and Google, using logistic regression substitutes. They yield adversarial examples misclassified by Amazon and Google at rates of 96.19% and 88.94%. We also find that this black-box attack strategy is capable of evading defense strategies previously found to make adversarial example crafting harder.");
        insertData("data026","2014","Christian Szegedy, Wojciech Zaremba, Ilya Sutskever, Joan Bruna, Dumitru Erhan, Ian Goodfellow, Rob Fergus","Intriguing properties of neural networks","https://research.google.com/pubs/pub42503.html","","","Deep neural networks are highly expressive models that have recently achieved state of the art performance on speech and visual recognition tasks. While their expressiveness is the reason they succeed, it also causes them to learn uninterpretable solutions that could have counter-intuitive properties. In this paper we report two such properties. First, we find that there is no distinction between individual high level units and random linear combinations of high level units, according to various methods of unit analysis. It suggests that it is the space, rather than the individual units, that contains of the semantic information in the high layers of neural networks. Second, we find that deep neural networks learn input-output mappings that are fairly discontinuous to a significant extend. We can cause the network to misclassify an image by applying a certain imperceptible perturbation, which is found by maximizing the network's prediction error. In addition, the specific nature of these perturbations is not a random artifact of learning: the same perturbation can cause a different network, that was trained on a different subset of the dataset, to misclassify the same input.");
        insertData("data027","2016.07.08","Alexey Kurakin, Ian Goodfellow, Samy Bengio","Adversarial examples in the physical world","https://arxiv.org/abs/1607.02533","Computer Vision and Pattern Recognition"," Recognition","Most existing machine learning classifiers are highly vulnerable to adversarial examples. An adversarial example is a sample of input data which has been modified very slightly in a way that is intended to cause a machine learning classifier to misclassify it. In many cases, these modifications can be so subtle that a human observer does not even notice the modification at all, yet the classifier still makes a mistake. Adversarial examples pose security concerns because they could be used to perform an attack on machine learning systems, even if the adversary has no access to the underlying model. Up to now, all previous work have assumed a threat model in which the adversary can feed data directly into the machine learning classifier. This is not always the case for systems operating in the physical world, for example those which are using signals from cameras and other sensors as an input. This paper shows that even in such physical world scenarios, machine learning systems are vulnerable to adversarial examples. We demonstrate this by feeding adversarial images obtained from cell-phone camera to an ImageNet Inception classifier and measuring the classification accuracy of the system. We find that a large fraction of adversarial examples are classified incorrectly even when perceived through the camera.");
        insertData("data028","2014.12.20","Ian J. Goodfellow, Jonathon Shlens, Christian Szegedy","Explaining and Harnessing Adversarial Examples","https://arxiv.org/abs/1412.6572","Machine Learning","","Several machine learning models, including neural networks, consistently misclassify adversarial examples---inputs formed by applying small but intentionally worst-case perturbations to examples from the dataset, such that the perturbed input results in the model outputting an incorrect answer with high confidence. Early attempts at explaining this phenomenon focused on nonlinearity and overfitting. We argue instead that the primary cause of neural networks' vulnerability to adversarial perturbation is their linear nature. This explanation is supported by new quantitative results while giving the first explanation of the most intriguing fact about them: their generalization across architectures and training sets. Moreover, this view yields a simple and fast method of generating adversarial examples. Using this approach to provide examples for adversarial training, we reduce the test set error of a maxout network on the MNIST dataset.");
        insertData("data029","2015.04.02","Anh Nguyen, Jason Yosinski, Jeff Clune","Deep Neural Networks are Easily Fooled: High Confidence Predictions for Unrecognizable Images","https://arxiv.org/abs/1412.1897","Computer Vision and Pattern Recognition","Recognition","Deep neural networks (DNNs) have recently been achieving state-of-the-art performance on a variety of pattern-recognition tasks, most notably visual classification problems. Given that DNNs are now able to classify objects in images with near-human-level performance, questions naturally arise as to what differences remain between computer and human vision. A recent study revealed that changing an image (e.g. of a lion) in a way imperceptible to humans can cause a DNN to label the image as something else entirely (e.g. mislabeling a lion a library). Here we show a related result: it is easy to produce images that are completely unrecognizable to humans, but that state-of-the-art DNNs believe to be recognizable objects with 99.99% confidence (e.g. labeling with certainty that white noise static is a lion). Specifically, we take convolutional neural networks trained to perform well on either the ImageNet or MNIST datasets and then find images with evolutionary algorithms or gradient ascent that DNNs label with high confidence as belonging to each dataset class. It is possible to produce images totally unrecognizable to human eyes that DNNs believe with near certainty are familiar objects, which we call \"fooling images\" (more generally, fooling examples). Our results shed light on interesting differences between human vision and current DNNs, and raise questions about the generality of DNN computer vision.");
        insertData("data030","2016","Ian H Witten, Eibe Frank, Mark A Hall, and Christopher J Pal","Data Mining: Practical machine learning tools and techniques","ftp://ftp.ingv.it/pub/manuela.sbarra/Data%20Mining%20Practical%20Machine%20Learning%20Tools%20and%20Techniques%20-%20WEKA.pdf","Data Mining","","This book presents this new discipline in a very accessible form: as a text both to train the next generation of practitioners and researchers and to inform lifelong learners like myself. Witten and Frank have a passion for simple and elegant solutions. They approach each topic with this mindset, grounding all concepts in concrete examples, and urging the reader to consider the simple techniques first, and then progress to the more sophisticated ones if the simple ones prove inadequate");
        insertData("data031","2017.03.22","Nicholas Carlini, David Wagner","Towards Evaluating the Robustness of Neural Networks","https://arxiv.org/abs/1608.04644","Cryptography and Security","","Neural networks provide state-of-the-art results for most machine learning tasks. Unfortunately, neural networks are vulnerable to adversarial examples: given an input x and any target classification t, it is possible to find a new input x′ that is similar to x but classified as t. This makes it difficult to apply neural networks in security-critical areas. Defensive distillation is a recently proposed approach that can take an arbitrary neural network, and increase its robustness, reducing the success rate of current attacks' ability to find adversarial examples from 95% to 0.5%.In this paper, we demonstrate that defensive distillation does not significantly increase the robustness of neural networks by introducing three new attack algorithms that are successful on both distilled and undistilled neural networks with 100% probability. Our attacks are tailored to three distance metrics used previously in the literature, and when compared to previous adversarial example generation algorithms, our attacks are often much more effective (and never worse). Furthermore, we propose using high-confidence adversarial examples in a simple transferability test we show can also be used to break defensive distillation. We hope our attacks will be used as a benchmark in future defense attempts to create neural networks that resist adversarial examples.");
        insertData("data032","2017.05.02","Moustapha Cisse, Piotr Bojanowski, Edouard Grave, Yann Dauphin, Nicolas Usunier","Parseval Networks: Improving Robustness to Adversarial Examples","https://arxiv.org/abs/1704.08847","Machine Learning","","We introduce Parseval networks, a form of deep neural networks in which the Lipschitz constant of linear, convolutional and aggregation layers is constrained to be smaller than 1. Parseval networks are empirically and theoretically motivated by an analysis of the robustness of the predictions made by deep neural networks when their input is subject to an adversarial perturbation. The most important feature of Parseval networks is to maintain weight matrices of linear and convolutional layers to be (approximately) Parseval tight frames, which are extensions of orthogonal matrices to non-square matrices. We describe how these constraints can be maintained efficiently during SGD. We show that Parseval networks match the state-of-the-art in terms of accuracy on CIFAR-10/100 and Street View House Numbers (SVHN) while being more robust than their vanilla counterpart against adversarial examples. Incidentally, Parseval networks also tend to train faster and make a better usage of the full capacity of the networks.");
        insertData("data033","2014.12.11","Shixiang Gu, Luca Rigazio","Towards Deep Neural Network Architectures Robust to Adversarial Examples","https://arxiv.org/abs/1412.5068","Learning","Recognition","Recent work has shown deep neural networks (DNNs) to be highly susceptible to well-designed, small perturbations at the input layer, or so-called adversarial examples. Taking images as an example, such distortions are often imperceptible, but can result in 100% mis-classification for a state of the art DNN. We study the structure of adversarial examples and explore network topology, pre-processing and training strategies to improve the robustness of DNNs. We perform various experiments to assess the removability of adversarial examples by corrupting with additional noise and pre-processing with denoising autoencoders (DAEs). We find that DAEs can remove substantial amounts of the adversarial noise. How- ever, when stacking the DAE with the original DNN, the resulting network can again be attacked by new adversarial examples with even smaller distortion. As a solution, we propose Deep Contractive Network, a model with a new end-to-end training procedure that includes a smoothness penalty inspired by the contractive autoencoder (CAE). This increases the network robustness to adversarial examples, without a significant performance penalty.");
        insertData("data034","2017.02.21","Jan Hendrik Metzen, Tim Genewein, Volker Fischer, Bastian Bischoff","On Detecting Adversarial Perturbations","https://arxiv.org/abs/1702.04267","Machine Learning","Recognition","Machine learning and deep learning in particular has advanced tremendously on perceptual tasks in recent years. However, it remains vulnerable against adversarial perturbations of the input that have been crafted specifically to fool the system while being quasi-imperceptible to a human. In this work, we propose to augment deep neural networks with a small \"detector\" subnetwork which is trained on the binary classification task of distinguishing genuine data from data containing adversarial perturbations. Our method is orthogonal to prior work on addressing adversarial perturbations, which has mostly focused on making the classification network itself more robust. We show empirically that adversarial perturbations can be detected surprisingly well even though they are quasi-imperceptible to humans. Moreover, while the detectors have been trained to detect only a specific adversary, they generalize to similar and weaker adversaries. In addition, we propose an adversarial attack that fools both the classifier and the detector and a novel training procedure for the detector that counteracts this attack.");
        insertData("data035","2017.05.15","Nicolas Papernot, Patrick McDaniel","Extending Defensive Distillation","https://arxiv.org/abs/1705.05264","Learning","","Machine learning is vulnerable to adversarial examples: inputs carefully modified to force misclassification. Designing defenses against such inputs remains largely an open problem. In this work, we revisit defensive distillation---which is one of the mechanisms proposed to mitigate adversarial examples---to address its limitations. We view our results not only as an effective way of addressing some of the recently discovered attacks but also as reinforcing the importance of improved training techniques.");
        insertData("data036","2016.03.14","Nicolas Papernot, Patrick McDaniel, Xi Wu, Somesh Jha, Ananthram Swami","Distillation as a Defense to Adversarial Perturbations against Deep Neural Networks","https://arxiv.org/abs/1511.04508","Cryptography and Security","Computing","Deep learning algorithms have been shown to perform extremely well on many classical machine learning problems. However, recent studies have shown that deep learning, like other machine learning techniques, is vulnerable to adversarial samples: inputs crafted to force a deep neural network (DNN) to provide adversary-selected outputs. Such attacks can seriously undermine the security of the system supported by the DNN, sometimes with devastating consequences. For example, autonomous vehicles can be crashed, illicit or illegal content can bypass content filters, or biometric authentication systems can be manipulated to allow improper access. In this work, we introduce a defensive mechanism called defensive distillation to reduce the effectiveness of adversarial samples on DNNs. We analytically investigate the generalizability and robustness properties granted by the use of defensive distillation when training DNNs. We also empirically study the effectiveness of our defense mechanisms on two DNNs placed in adversarial settings. The study shows that defensive distillation can reduce effectiveness of sample creation from 95% to less than 0.5% on a studied DNN. Such dramatic gains can be explained by the fact that distillation leads gradients used in adversarial sample creation to be reduced by a factor of 10^30. We also find that distillation increases the average minimum number of features that need to be modified to create adversarial samples by about 800% on one of the DNNs we tested.");
        insertData("data037","2016.01.16","Uri Shaham, Yutaro Yamada, Sahand Negahban","Understanding Adversarial Training: Increasing Local Stability of Neural Nets through Robust Optimization","https://arxiv.org/abs/1511.05432","Machine Learning","Computing","We propose a general framework for increasing local stability of Artificial Neural Nets (ANNs) using Robust Optimization (RO). We achieve this through an alternating minimization-maximization procedure, in which the loss of the network is minimized over perturbed examples that are generated at each parameter update. We show that adversarial training of ANNs is in fact robustification of the network optimization, and that our proposed framework generalizes previous approaches for increasing local stability of ANNs. Experimental results reveal that our approach increases the robustness of the network to existing adversarial examples, while making it harder to generate new ones. Furthermore, our algorithm improves the accuracy of the network also on the original test data.");
        insertData("data038","2017.12.05","Weilin Xu, David Evans, Yanjun Qi","Feature Squeezing: Detecting Adversarial Examples in Deep Neural Networks","https://arxiv.org/abs/1704.01155","Computer Vision and Pattern Recognition","Recognition","Although deep neural networks (DNNs) have achieved great success in many tasks, they can often be fooled by \\emph{adversarial examples} that are generated by adding small but purposeful distortions to natural examples. Previous studies to defend against adversarial examples mostly focused on refining the DNN models, but have either shown limited success or required expensive computation. We propose a new strategy, \\emph{feature squeezing}, that can be used to harden DNN models by detecting adversarial examples. Feature squeezing reduces the search space available to an adversary by coalescing samples that correspond to many different feature vectors in the original space into a single sample. By comparing a DNN model's prediction on the original input with that on squeezed inputs, feature squeezing detects adversarial examples with high accuracy and few false positives. This paper explores two feature squeezing methods: reducing the color bit depth of each pixel and spatial smoothing. These simple strategies are inexpensive and complementary to other defenses, and can be combined in a joint detection framework to achieve high detection rates against state-of-the-art attacks.");
        insertData("data039","2014.07.04","Yuqian Zhang, Cun Mu, Han-wen Kuo, John Wright","Toward Guaranteed Illumination Models for Non-Convex Objects Yuqian Zhang, Cun Mu, Han-wen Kuo, John Wright","https://arxiv.org/abs/1307.1437","Computer Vision and Pattern Recognition","Recognition","Illumination variation remains a central challenge in object detection and recognition. Existing analyses of illumination variation typically pertain to convex, Lambertian objects, and guarantee quality of approximation in an average case sense. We show that it is possible to build V(vertex)-description convex cone models with worst-case performance guarantees, for non-convex Lambertian objects. Namely, a natural verification test based on the angle to the constructed cone guarantees to accept any image which is sufficiently well-approximated by an image of the object under some admissible lighting condition, and guarantees to reject any image that does not have a sufficiently good approximation. The cone models are generated by sampling point illuminations with sufficient density, which follows from a new perturbation bound for point images in the Lambertian model. As the number of point images required for guaranteed verification may be large, we introduce a new formulation for cone preserving dimensionality reduction, which leverages tools from sparse and low-rank decomposition to reduce the complexity, while controlling the approximation error with respect to the original cone.");
        insertData("data040","2016.04.15","Stephan Zheng, Yang Song, Thomas Leung, Ian Goodfellow","Improving the Robustness of Deep Neural Networks via Stability Training","https://arxiv.org/abs/1604.04326","Computer Vision and Pattern Recognition","Recognition","In this paper we address the issue of output instability of deep neural networks: small perturbations in the visual input can significantly distort the feature embeddings and output of a neural network. Such instability affects many deep architectures with state-of-the-art performance on a wide range of computer vision tasks. We present a general stability training method to stabilize deep networks against small input distortions that result from various types of common image processing, such as compression, rescaling, and cropping. We validate our method by stabilizing the state-of-the-art Inception architecture against these types of distortions. In addition, we demonstrate that our stabilized model gives robust state-of-the-art performance on large-scale near-duplicate detection, similar-image ranking, and classification on noisy datasets.");



    });
    window.addEventListener("load",initSearch,false);
}
else if (window.attachEvent) {
    window.attachEvent("onload", initSearch); }
if (window.addEventListener) {
    window.addEventListener("load",populateSelect,false) }
else if (window.attachEvent) {
    window.attachEvent("onload",populateSelect); }
