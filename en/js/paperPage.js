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
        // date： 发表时间
        // type：文章类型
        // application： 应用
        // abstract：简介
        insertData("data001","2017.05.18","Kexin Pei, Yinzhi Cao, Junfeng Yang, Suman Jana","DeepXplore: Automated Whitebox Testing of Deep Learning Systems","https://arxiv.org/abs/1705.06640","2017","Testing for DL Systems","Testing","Deep learning (DL) systems are increasingly deployed in safety- and security-critical domains including self-driving cars and malware detection, where the correctness and predictability of a system's behavior for corner case inputs are of great importance. Existing DL testing depends heavily on manually labeled data and therefore often fails to expose erroneous behaviors for rare inputs. We design, implement, and evaluate DeepXplore, the first whitebox framework for systematically testing real-world DL systems. First, we introduce neuron coverage for systematically measuring the parts of a DL system exercised by test inputs. Next, we leverage multiple DL systems with similar functionality as cross-referencing oracles to avoid manual checking. Finally, we demonstrate how finding inputs for DL systems that both trigger many differential behaviors and achieve high neuron coverage can be represented as a joint optimization problem and solved efficiently using gradient-based search techniques. \\nDeepXplore efficiently finds thousands of incorrect corner case behaviors (e.g., self-driving cars crashing into guard rails and malware masquerading as benign software) in state-of-the-art DL models with thousands of neurons trained on five popular datasets including ImageNet and Udacity self-driving challenge data. For all tested DL models, on average, DeepXplore generated one test input demonstrating incorrect behavior within one second while running only on a commodity laptop. We further show that the test inputs generated by DeepXplore can also be used to retrain the corresponding DL model to improve the model's accuracy by up to 3%.");
        insertData("data002","2017.06.14","Ian Goodfellow,Nicolas Papernot","The challenge of verification and testing of machine learning","http://www.cleverhans.io/security/privacy/ml/2017/06/14/verification.html","2017","Testing for DL Systems","Testing","in our second post, we gave some background explaining why attacking machine learning is often easier than defending it. We saw some of the reasons why we do not yet have completely effective defenses against adversarial examples, and we speculated about whether we can ever expect such a defense.In this post, we explore the types of guarantees one can expect a machine learning model to possess. We argue that the limitations of existing defenses point to the lack of verification of machine learning models. Indeed, to design reliable systems, engineers typically engage in both testing and verification");
        insertData("data003","2017.08.28","Yuchi Tian, Kexin Pei, Suman Jana, Baishakhi Ray","DeepTest: Automated Testing of Deep-Neural-Network-driven Autonomous Cars","https://arxiv.org/abs/1708.08559","2017","Testing for DL Systems","Testing","Recent advances in Deep Neural Networks (DNNs) have led to the development of DNN-driven autonomous cars that, using sensors like camera, LiDAR, etc., can drive without any human intervention. Most major manufacturers including Tesla, GM, Ford, BMW, and Waymo/Google are working on building and testing different types of autonomous vehicles. The lawmakers of several US states including California, Texas, and New York have passed new legislation to fast-track the process of testing and deployment of autonomous vehicles on their roads.However, despite their spectacular progress, DNNs, just like traditional software, often demonstrate incorrect or unexpected corner case behaviors that can lead to potentially fatal collisions. Several such real-world accidents involving autonomous cars have already happened including one which resulted in a fatality. Most existing testing techniques for DNN-driven vehicles are heavily dependent on the manual collection of test data under different driving conditions which become prohibitively expensive as the number of test conditions increases.In this paper, we design, implement and evaluate DeepTest, a systematic testing tool for automatically detecting erroneous behaviors of DNN-driven vehicles that can potentially lead to fatal crashes. First, our tool is designed to automatically generated test cases leveraging real-world changes in driving conditions like rain, fog, lighting conditions, etc. DeepTest systematically explores different parts of the DNN logic by generating test inputs that maximize the numbers of activated neurons. DeepTest found thousands of erroneous behaviors under different realistic driving conditions (e.g., blurring, rain, fog, etc.) many of which lead to potentially fatal crashes in three top performing DNNs in the Udacity self-driving car challenge.");
        insertData("data004","2017.10.21","Matthew Wicker, Xiaowei Huang, Marta Kwiatkowska","Feature-Guided Black-Box Safety Testing of Deep Neural Networks","https://arxiv.org/abs/1710.07859","2017","Testing for DL Systems","Testing","Despite the improved accuracy of deep neural networks, the discovery of adversarial examples has raised serious safety concerns. Most existing approaches for crafting adversarial examples necessitate some knowledge (architecture, parameters, etc) of the network at hand. In this paper, we focus on image classifiers and propose a feature-guided black-box approach to test the safety of deep neural networks that requires no such knowledge. Our algorithm employs object detection techniques such as SIFT (Scale Invariant Feature Transform) to extract features from an image. These features are converted into a mutable saliency distribution, where high probability is assigned to pixels that affect com- position of the image with respect to the human visual system. We formulate the crafting of adversarial examples as a two-player turn-based stochastic game, where the first player's objective is to find an adversarial example by manipulating the features, and the second player can be cooperative, adversarial, or random. We show that, theoretically, the two-player game can converge to the optimal strategy, and that the optimal strategy represents a globally minimal adversarial image. Using Monte Carlo tree search we gradually explore the game state space to search for adversarial examples. Our experiments show that, despite the black- box setting, manipulations guided by a perception-based saliency distribution are competitive with state-of-the-art methods that rely on white-box saliency matrices or sophisticated optimization procedures. Finally, we show how our method can be used to evaluate robustness of neural networks in safety-critical applications such as traffic sign recognition in self-driving cars.");
        insertData("data005","2018.02","Wei Yang , Tao Xie","Telemade: A Testing Framework for Learning-Based Malware Detection Systems","https://pdfs.semanticscholar.org/4635/49e227c32e355cf4ccea462b991512b54104.pdf","2018","Testing for DL Systems","Testing","Learning-based malware detectors may be errorneous due to two inherent limitations. First, there is a lack of differentiability: selected features may not reflect essential differences between malware and benign apps. Second, there is a lack of comprehensiveness: the machine learning (ML) models are usually based on prior knowledge of existing malware (i.e., training dataset) so malware can evolve to evade the detection. There is a strong need for an automated framework to help security analysts to detect errors in learning-based malware detection systems. Existing techniques to generate adversarial samples for learning-based systems (that take images as inputs) employ feature mutations based on feature vectors. Such techniques are infeasible to generate adversarial samples (e.g., evasive malware) for malware detection system because the synthesized mutations may break the inherent constraints posed by code structures of the malware, causing either crashes or malfunctioning of malicious payloads. To address the challenge, we propose Telemade, a testing framework for learning-based malware detectors.");
        insertData("data006","2017","Tommaso Dreossi, Shromona Ghosh, Alberto Sangiovanni-Vincentelli, Sanjit A. Seshia","Systematic Testing of Convolutional Neural Networks for Autonomous Driving","https://people.eecs.berkeley.edu/~tommasodreossi/papers/rmlw2017.pdf","2017","Testing for DL Systems","Testing","We present a framework to systematically analyze convolutional neural networks (CNNs) used in classification of cars in autonomous vehicles. Our analysis procedure comprises an image generator that produces synthetic pictures by sampling in a lower dimension image modification subspace and a suite of visualization tools. The image generator produces images which can be used to test the CNN and hence expose its vulnerabilities. The presented framework can be used to extract insights of the CNN classifier, compare across classification models, or generate training and validation datasets.");
        insertData("data007","2018.02","Oreoluwa Alebiosu, Siwakorn Srisakaokul, Angello Astorga, Tao Xie","Multiple-Implementation Testing of Supervised Learning Software","https://pdfs.semanticscholar.org/079a/c1a1481d1fb8be2ee8d2101737746f2b50e6.pdf","2018","Testing for ML Systems","Testing","Machine learning (ML) software, used to implement an ML algorithm, is widely used in many application domains such as financial, business, and engineering domains. Faults in ML software can cause substantial losses in these application domains. Thus, it is very critical to conduct effective testing of ML software to detect and eliminate its faults. However, testing ML software is difficult, especially on producing test oracles used for checking behavior correctness (such as using expected properties or expected test outputs). To tackle the test-oracle issue, in this paper, we present a novel black-box approach of multiple-implementation testing for supervised learning software. The insight underlying our approach is that there can be multiple implementations (independently written) for a supervised learning algorithm, and majority of them may produce the expected output for a test input (even if none of these implementations are fault-free). In particular, our approach derives a pseudo-oracle for a test input by running the test input on n implementations of the supervised learning algorithm, and then using the common test output produced by a majority (determined by a percentage threshold) of these n implementations. Our approach includes techniques to address challenges in multiple-implementation testing (or generally testing) of supervised learning software: definition of a test case in testing supervised learning software, along with resolution of inconsistent algorithm configurations across implementations. The evaluations on our approach show that our multiple-implementation testing is effective in detecting real faults in real-world ML software (even popularly used ones), including 5 faults from 10 NaiveBayes implementations and 4 faults from 20 k-nearest neighbor implementations.");
        insertData("data008","2011.04","Xiaoyuan Xiea, Joshua W.K. Ho , Christian Murphyc , Gail Kaiser, Baowen Xue, Tsong Yueh Chena","Testing and validating machine learning classifiers by metamorphic testing","https://pdfs.semanticscholar.org/ed45/fe2cf73b2da28e5d6039dfe3b6b68d2df39f.pdf","2011","Testing for ML Systems","Testing","Machine learning algorithms have provided core functionality to many application domains – such as bioinformatics, computational linguistics, etc. However, it is difficult to detect faults in such applications because often there is no “test oracle” to verify the correctness of the computed outputs. To help address the software quality, in this paper we present a technique for testing the implementations of machine learning classification algorithms which support such applications. Our approach is based on the technique “metamorphic testing”, which has been shown to be effective to alleviate the oracle problem. Also presented include a case study on a real-world machine learning application framework, and a discussion of how programmers implementing machine learning algorithms can avoid the common pitfalls discovered in our study. We also conduct mutation analysis and cross-validation, which reveal that our method has high effectiveness in killing mutants, and that observing expected cross-validation result alone is not sufficiently effective to detect faults in a supervised classification program. The effectiveness of metamorphic testing is further confirmed by the detection of real faults in a popular open-source classification program.");
        insertData("data009","2009","X.Xie, J.W.K.Ho, C.Murphy, G.Kaiser, B.W.Xu, and T.Y.Chen","Application of Metamorphic Testing to Supervised Classifiers","http://www.cs.columbia.edu/wp-content/uploads/sites/7/2011/03/3478-Xie-QSIC09.pdf","2009","Testing for ML Systems","Testing","Many applications in the field of scientific computing - such as computational biology, computational linguistics, and others - depend on Machine Learning algorithms to provide important core functionality to support solutions in the particular problem domains. However, it is diffi- cult to test such applications because often there is no “test oracle” to indicate what the correct output should be for arbitrary input. To help address the quality of such software, in this paper we present a technique for testing the implementations of supervised machine learning classification algorithms on which such scientific computing software depends. Our technique is based on an approach called “metamorphic testing”, which has been shown to be effective in such cases. More importantly, we demonstrate that our technique not only serves the purpose of verifi- cation, but also can be applied in validation. In addition to presenting our technique, we describe a case study we performed on a real-world machine learning application framework, and discuss how programmers implementing machine learning algorithms can avoid the common pitfalls discovered in our study. We also discuss how our findings can be of use to other areas outside scientific computing, as well.");
        insertData("data010","1981","M.D.Davis, E.J.Weyuker","Pseudo-oracles for non-testable programs","https://dl.acm.org/citation.cfm?id=809889","1981","Testing for ML Systems","Testing","The most commonly used method of validating a program is by testing. The programmer typically runs the program on some test cases, and if and when they run correctly, the program is considered to be correct. We know that many difficult problems are associated with testing. One such problem is that it is a fundamental part of the testing process to require the ability to infer properties of a program by observing the program's behavior on selected inputs. The most common property that one hopes to infer through testing is correctness. But unless the program is run on the entire input domain, there are infinitely many programs which produce the correct output on the selected inputs, but produce incorrect output for some other element of the domain.");
        insertData("data011","2008","Christian Murphy, Gail Kaiser, Lifeng Hu, Leon Wu","Properties of Machine Learning Applications for Use in Metamorphic Testing","http://ecommons.luc.edu/cgi/viewcontent.cgi?article=1036&amp;context=cs_facpubs#page=896","2008","Testing for ML Systems","Testing","It is challenging to test machine learning (ML) applications, which are intended to learn properties of data sets where the correct answers are not already known. In the absence of a test oracle, one approach to testing these applications is to use metamorphic testing, in which properties of the application are exploited to define transformation functions on the input, such that the new output will be unchanged or can easily be predicted based on the original output; if the output is not as expected, then a defect must exist in the application. Here, we seek to enumerate and classify the metamorphic properties of some machine learning algorithms, and demonstrate how these can be applied to reveal defects in the applications of interest. In addition to the results of our testing, we present a set of properties that can be used to define these metamorphic relationships so that metamorphic testing can be used as a general approach to testing machine learning applications.");
        insertData("data012","2016.12","Shin Nakajima, Hai Ngoc Bui","Dataset Coverage for Testing Machine Learning Computer Programs","http://ieeexplore.ieee.org/abstract/document/7890601/?reload=true","2016","Testing for ML Systems","Testing","Machine learning programs are non-testable, and thus testing with pseudo oracles is recommended. Although metamorphic testing is effective for testing with pseudo oracles, identifying metamorphic properties has been mostly ad hoc. This paper proposes a systematic method to derive a set of metamorphic properties for machine learning classifiers, support vector machines. The proposal includes a new notion of test coverage for the machine learning programs; this test coverage provides a clear guideline for conducting a series of metamorphic testing.");
        insertData("data013","2017","Shin Nakajima","Generalized Oracle for Testing Machine Learning Computer Programs","http://fmse.di.unimi.it/faacs2017/papers/paperFAACS2.pdf","2017","Testing for ML Systems","Testing","Computation results of machine learning programs are not possible to be anticipated, because the results are sensitive to distribution of data in input dataset. Additionally, these computer programs sometimes adopt randomized algorithms for finding sub-optimal solutions or improving runtime efficiencies to reach solutions. The computation is probabilistic and the results vary from execution to execution even for a same input. The characteristics imply that no deterministic test oracle exists to check correctness of programs. This paper studies how a notion of oracles is elaborated so that these programs can be tested, and shows a systematic way of deriving testing properties from mathematical formulations of given machine learning problems.");



    });
    window.addEventListener("load",initSearch,false);
}
else if (window.attachEvent) {
    window.attachEvent("onload", initSearch); }
if (window.addEventListener) {
    window.addEventListener("load",populateSelect,false) }
else if (window.attachEvent) {
    window.attachEvent("onload",populateSelect); }
