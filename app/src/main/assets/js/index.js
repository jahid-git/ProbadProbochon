var dialog_handler;
var main_nav_handler;
var splach_screen_modal_handler;
var home_drawer_handler;
var isPaymentCompleted = false;

function onResume(){
    
}

function makePayment(){
    android.openPaymentDialog();
}

function paymentInfo(){
    dialog_handler = "payment-info-dialog";
    var btns = ["Pay Now","Close","Info"];
    if(android.getData("platform","android") == "ios"){
        btns = ["Info","Close","Pay Now"];
    }
    ons.notification.confirm({
        id: dialog_handler,
        title: "Payment Info!",
        message: "শেরা ৫০ টি মজার প্রবাদ পেতে \"Pay Now\" তে click করুন।",
        buttonLabels: btns,
        cancelable: true,
        modifier: "rowfooter",
    }).then(function (e) {
            dialog_handler = false;
            if(btns[e] == "Pay Now"){
                makePayment();
            } else if(btns[e] == "কুপন কোড"){
                
            }
        });
}

var pageIndex = 0;
document.addEventListener("init", function (event) {
    var page = event.target;
    if(android.getData("isPaymentCompleted","true") == "true"){
        isPaymentCompleted = true;
        try{
            page.querySelector(".bottom-toolbar, payment").style.display = "none";
        }catch(e){}
    }
    if (page.id === "splash-screen") {
        main_nav_handler = document.getElementById("main-nav-handler");
        main_nav_handler.setAttribute("animation",android.getData("animation","default"));
        if(android.getBrightness() >= Number.parseInt(android.getData("brightness","35"))){
            android.changeBrightness(android.getBrightness());
        } else {
            android.changeBrightness(android.getData("brightness","50"));
        }
        setTimeout(function() {
            main_nav_handler.replacePage("home.html");
        }, 3000);
    } else if (page.id === "home") {
        home_drawer_handler = page.querySelector("#home-drawer");
        refreshIndex();
        var pullHook = page.querySelector('#pull-hook');
        pullHook.onAction = function(done) {
            setTimeout(done,1000);
            refreshIndex();
        };
    } else if (page.id === "probad_page") {
        var main_container = page.querySelector("#main-container");
        
        page.querySelector("#page-title").innerHTML = mainDatabase[pageIndex].title;
        if(pageIndex <= 0){
            totalLines = mainDatabase[pageIndex].text.split(/[.।]+/);
            var code = "";
            totalLines.forEach(function(item,i){
                var c = item.charCodeAt(item.length-1);
                if(c == " "){
                    c = item.charCodeAt(item.length-2);
                    if(c == " "){
                        c = item.charCodeAt(item.length-3);
                    }
                }
                if (c >= 33 && c <= 126){
                    c = ".";
                } else {
                    c = '।';
                }
                code += "<span class='line style' id='line"+i+"'>"+ (item+c) +"</span>"
            });
            main_container.innerHTML = code + (isPaymentCompleted?"":"<div class='footer-gap'></div>");
        } else {
            totalLines = mainDatabase[pageIndex].text.split(/[.।]+/);
            var code = "";
            totalLines.forEach(function(item,i){
                var c = item.charCodeAt(item.length-1);
                if (c >= 33 && c <= 126){
                    code +=`<div class='card probad-item' style='border-left:5px solid ${getRandomColor()};'>
                                <div class='probad-item-header'>
                                    <div class='probad-item-number'>${getDigitBanglaFromEnglish(i+1)}</div>
                                    <div class='probad-item-btn'>
                                        <i class="header-btn std-copy" onclick='copy(${i});'></i>
                                        <i class="header-btn std-share-2" onclick='share(${i});'></i>
                                        <i class="header-btn std-volume-2" onclick='speak(${i+1});'></i>
                                    </div>
                                </div>
                                <div id="style">
                                    <span class='line auto-scroll' id='line${i}'>${item}.</span>
                                </div>
                            </div>`;
                } else {
                    code +=`<div class='card probad-item' style='border-left:5px solid ${getRandomColor()};'>
                                <div class='probad-item-header'>
                                    <div class='probad-item-number'>${getDigitBanglaFromEnglish(i+1)}</div>
                                    <div class='probad-item-btn'>
                                        <i class="header-btn std-copy" onclick='copy(${i});'></i>
                                        <i class="header-btn std-share-2" onclick='share(${i});'></i>
                                        <i class="header-btn std-volume-2" onclick='speak(${i+1});'></i>
                                    </div>
                                </div>
                                <div id="style">
                                    <span class='line auto-scroll' id='line${i}'>${item}।</span>
                                </div>
                            </div>`;
                }
            });
            main_container.innerHTML = code + (isPaymentCompleted?"":"<div class='footer-gap'></div>");
        }
        
        var style = page.getElementsByClassName("line");
        for(var i = 0;i < style.length;i++){
            style[i].style.color = "#" + settingsData.fontColor;
            style[i].style.fontSize = settingsData.fontSize + "px";
            style[i].style.fontStyle = settingsData.italic=="true"?"italic":"normal";
            style[i].style.fontWeight = settingsData.bold=="true"?"bold":"normal";
            style[i].style.fontFamily = settingsData.font;
        }
        
        if(isPaymentCompleted){
            page.querySelector("#reader-fab").setAttribute("style","margin-bottom:0px;");
        }
        
        page.querySelector("#reader-fab").addEventListener("open",function(){
            page.querySelector("#vertical-speak-speed").style.display = "inline-block";
        });
        
        page.querySelector("#reader-fab").addEventListener("close",function(){
            page.querySelector("#vertical-speak-speed").style.display = "none";
        });
        
        page.querySelector("#fullscreen").addEventListener("click",function(){
            main_nav_handler.replacePage("probad_page_fullscreen.html");
        });
        
        page.addEventListener("hide",function(){
            speakToggle(false);
        });
    } else if (page.id === "probad_page_fullscreen") {
        android.setFullscreen(true);
        var main_container = page.querySelector("#main-container");

        if(pageIndex <= 0){
            if(pageIndex == (-1)){
                page.querySelector("#page-title").innerHTML = "Text Reader";
                totalLines = textReaderData.split(/[.।]+/);
                page.querySelector("#edit").style.display = "inline-block";
            } else {
                totalLines = mainDatabase[pageIndex].text.split(/[.।]+/);
                page.querySelector("#page-title").innerHTML = mainDatabase[pageIndex].title;
                page.querySelector("#edit").style.display = "none";
            }
            var code = "";
            totalLines.forEach(function(item,i){
                var c = item.charCodeAt(item.length-1);
                if (c >= 33 && c <= 126){
                    c = ".";
                } else {
                    c = '।';
                }
                code += "<span class='line' id='line"+i+"'>"+ (item.replaceAll("\n","<br/>")+c) +"</span>"
            });
            main_container.innerHTML = "<div style='height:25px;width:100%;'></div>" + code;
        } else {
            page.querySelector("#page-title").innerHTML = mainDatabase[pageIndex].title;
            totalLines = mainDatabase[pageIndex].text.split(/[.।]+/);
            var code = "";
            totalLines.forEach(function(item,i){
                var c = item.charCodeAt(item.length-1);
                if (c >= 33 && c <= 126){
                    code +=`<div class='card probad-item' style='border-left:5px solid ${getRandomColor()};'>
                                <div class='probad-item-header'>
                                    <div class='probad-item-number'>${getDigitBanglaFromEnglish(i+1)}</div>
                                    <div class='probad-item-btn'>
                                        <i class="header-btn std-copy" onclick='copy(${i});'></i>
                                        <i class="header-btn std-share-2" onclick='share(${i});'></i>
                                        <i class="header-btn std-volume-2" onclick='speak(${i+1});'></i>
                                    </div>
                                </div>
                                <div id="style">
                                    <span class='line auto-scroll' id='line${i}'>${item}.</span>
                                </div>
                            </div>`;
                } else {
                    code +=`<div class='card probad-item' style='border-left:5px solid ${getRandomColor()};'>
                                <div class='probad-item-header'>
                                    <div class='probad-item-number'>${getDigitBanglaFromEnglish(i+1)}</div>
                                    <div class='probad-item-btn'>
                                        <i class="header-btn std-copy" onclick='copy(${i});'></i>
                                        <i class="header-btn std-share-2" onclick='share(${i});'></i>
                                        <i class="header-btn std-volume-2" onclick='speak(${i+1});'></i>
                                    </div>
                                </div>
                                <div>
                                    <span class='line auto-scroll' id='line${i}'>${item}।</span>
                                </div>
                            </div>`;
                }
            });
            main_container.innerHTML  = "<div style='height:25px;width:100%;'></div>" + code;
            page.querySelector("#edit").style.display = "none";
        }
        
        var style = page.getElementsByClassName("line");
        for(var i = 0;i < style.length;i++){
            style[i].style.color = "#" + settingsData.fontColor;
            style[i].style.fontSize = settingsData.fontSize + "px";
            style[i].style.fontStyle = settingsData.italic=="true"?"italic":"normal";
            style[i].style.fontWeight = settingsData.bold=="true"?"bold":"normal";
            style[i].style.fontFamily = settingsData.font;
        }
        
        page.querySelector("#reader-fab").addEventListener("open",function(){
            page.querySelector("#vertical-speak-speed").style.display = "inline-block";
        });
        
        page.querySelector("#reader-fab").addEventListener("close",function(){
            page.querySelector("#vertical-speak-speed").style.display = "none";
        });
        
        page.querySelector("#go-minimize").addEventListener("click",function(){
            android.setFullscreen(false);
            main_nav_handler.popPage();
        });
        
        page.addEventListener("hide",function(){
            speakToggle(false);
        });
        
    }
});

function refreshIndex(){
    var container = document.getElementById("container");
    var code = "";
    mainDatabase.forEach(function(item, i){
        if(i == 1 && !isPaymentCompleted){
            code += `<div onclick="paymentInfo();" class="card item payed">${item.title}</div>`;
        } else {
            code += `<div onclick="go(${i});" class="card item">${item.title}</div>`;
        }
    });
    container.innerHTML = code + (isPaymentCompleted?"":"<div class='footer-gap'></div>");
}

function go(i,b){
    pageIndex = i;
    if(i == -1){
        if(!b){
            main_nav_handler.pushPage('probad_page_fullscreen.html');
        } else {
            main_nav_handler.replacePage('probad_page_fullscreen.html');
        }
    } else {
        main_nav_handler.pushPage('probad.html');
    }
}

function getRandomColor(){
    var colors = ["red","blue","green","aqua","chocolate","coral","crimson","blueviolet","darkgray","greenyellow","mediumseagreen","sandybrown","royalblue","silver","lime","orange","hotpic"];
    return colors[Math.floor(Math.random()*colors.length)];
}

function onConsole(mess, line, type) {
    android.toast("Message:" + mess + "\nLine:" + line + "\nType:" + type);
}

function onBackPressed(){
    android.vibrate(100);
    if (home_drawer_handler.isOpen) {
        home_drawer_handler.close();
        return;
    }
    if(dialog_handler){
        if(dialog_handler == "reader-dialog"){
            document.getElementById("reader-fab").hideItems();
            document.getElementById("md-volume-up").setAttribute("icon","md-volume-up");
            speakToggle(false);
        }
        document.getElementById(dialog_handler).remove();
        dialog_handler = false;
        return;
    }
    if (main_nav_handler.pages.length > 1) {
        if(main_nav_handler.topPage.id == "probad_page_fullscreen"){
            android.setFullscreen(false);
        }
        main_nav_handler.popPage();
        return;
    }
    dialog_handler = "exit-dialog";
    var btns = ["Yes","No","Rate"];
    if(android.getData("platform","android") == "ios"){
        btns = ["Rate","No","Yes"];
    }
    ons.notification.confirm({
        id: dialog_handler,
        title: "Exit!",
        message: "Do you want to exit?",
        buttonLabels: btns,
        cancelable: true,
        modifier: "rowfooter",
    }).then(function (e) {
            dialog_handler = false;
            if(btns[e] == "Yes"){
                android.finish();
            } else if(btns[e] == "Rate"){
                android.rate();
            }
        });
}


var settingsData = {
            platform: android.getData("platform","android"),
            theme: android.getData("theme","light"),
            fontSize: android.getData("font_size", "25"),
            font: android.getData("font", "font-3"),
            italic: android.getData("italic","false"),
            bold: android.getData("bold","false"),
            fontColor: android.getData("font_color",android.getData("theme","light")=="dark"?"FFFFFF":"000000"),
            animation: android.getData("animation","fade"),
            brightness: android.getData("brightness",android.getBrightness())
        };
function showSettingsDialog(data){
    if(!data){
        settingsData = {
            platform: android.getData("platform","android"),
            theme: android.getData("theme","light"),
            fontSize: android.getData("font_size", "25"),
            font: android.getData("font", "font-3"),
            italic: android.getData("italic","false"),
            bold: android.getData("bold","false"),
            fontColor: android.getData("font_color",android.getData("theme","light")=="dark"?"FFFFFF":"000000"),
            animation: android.getData("animation","fade"),
            brightness: android.getData("brightness",android.getBrightness())
        }
    } else {
        settingsData = Object.create(data);
    }
    
    var fonts = "";
    for(var n = 1;n <= 24;n++){
        var c = (settingsData.font=="font-"+n)?"selected":"";
        fonts +="<option "+c+" value='font-"+n+"'>Font-"+n+"</option>";
    }
    
    var code = `
    <ons-row>
        <span style='font-size:14px;'>App settings:</span>
    </ons-row>
    
    <ons-row style="text-align:center;margin-top:8px;margin-bottom:8px;">
        <ons-col>
            <ons-radio onchange="changePlatform(this);" name="platform" value="android" ${settingsData.platform=="android"?"checked":""}></ons-radio>
            <label for="android_platform">Android</label>
        </ons-col>
        <ons-col>
            <ons-radio onchange="changePlatform(this);" name="platform" value="ios" ${settingsData.platform=="ios"?"checked":""}></ons-radio>
            <label for="ios_platform">IOS</label>
        </ons-col>
    </ons-row>
    
    <ons-row>
      <ons-col width="40px" style="text-align: center; line-height: 31px;">
        <i class="std-icon std-moon"></i>
      </ons-col>
      <ons-col>
          <ons-select onchange="changeTheme(this);" class="select">
              <option ${settingsData.theme=="light"?"selected":""} value="light">Light</option>
              <option ${settingsData.theme=="dark"?"selected":""} value="dark">Dark</option>
              <option ${(settingsData.theme=="default")?"selected":""} value="default">Default</option>
          </ons-select>
      </ons-col>
      <ons-col width="40px" style="text-align: center; line-height: 31px;">
        <i class="std-icon std-droplet"></i>
      </ons-col>
      <ons-col>
          <ons-select onchange="changeAnimation(this)" style="width:90%;" class="select">
              <option ${settingsData.animation=="fade"?"selected":""} value="fade">Fade</option>
              <option ${settingsData.animation=="slide"?"selected":""} value="slide">Slide</option>
              <option ${settingsData.animation=="lift"?"selected":""} value="lift">Lift</option>
              <option ${settingsData.animation=="none"?"selected":""} value="none">None</option>
          </ons-select>
      </ons-col>
    </ons-row>
    
    
    <ons-row>
      <span style='font-size:14px;'>Font settings:</span>
    </ons-row>
    
    <ons-row style="margin-top:8px;margin-bottom:10px;">
      <ons-col style="text-align:center;">
         <span id="demo_text" style="width:100%;color:#${settingsData.fontColor};font-family:${settingsData.font};font-style:${settingsData.italic=="true"?"italic":"normal"};font-weight:${settingsData.bold=="true"?"bold":"normal"};font-size:${settingsData.fontSize}px;">English/বাংলা</span>
      </ons-col>
      <ons-col width="30px">
         <input onchange="changeColor(this);" style="width:30px;height:30px;padding:0px;" type="color" value="#${settingsData.fontColor}"/>
      </ons-col>
    </ons-row>
    
    <ons-row>
      <ons-col width="40px" style="text-align: center; line-height: 31px;">
        <i class="std-icon std-feather"></i>
      </ons-col>
      <ons-col>
          <ons-select onchange="changeFonts(this);" class="select">
              <option value="font-0" ${(settingsData.font=="font-0")?"selected":""}>No Font</option>
              ${fonts}
          </ons-select>
      </ons-col>
      <ons-col width="40px" onclick="toggleItalic(this);" class="${settingsData.italic=="true"?"italic-enable":""}" style="border:1px solid #dddddd;text-align: center; line-height: 31px;margin-right:5px;">
          <i class="std-icon std-italic"></i>
      </ons-col>
      <ons-col width="40px" onclick="toggleBold(this);" class="${settingsData.bold=="true"?"bold-enable":""}" style="border:1px solid #dddddd;text-align: center; line-height: 31px;">
          <i class="std-icon std-bold"></i>
      </ons-col>
     </ons-row>
    
    <ons-row>
      <ons-col width="40px" style="text-align: center; line-height: 31px;">
        <i class="std-icon std-type"></i>
      </ons-col>
      <ons-col>
        <ons-range min="5" max="50" oninput="changeRange(this,'font_size', ' px');" style="width: 100%;" value="${settingsData.fontSize}"></ons-range>
      </ons-col>
      <ons-col width="50px" style="text-align: center; line-height: 31px;">
          <span id="font_size">${settingsData.fontSize} px</span>
      </ons-col>
    </ons-row>
    
    <ons-row>
      <span style='font-size:14px;'>Brightness:</span>
    </ons-row>
    <ons-row>
      <ons-col width="40px" style="text-align: center; line-height: 31px;">
        <i class="std-icon std-sun"></i>
      </ons-col>
      <ons-col>
        <ons-range min="5" oninput="changeRange(this,'brightness', '');" style="width: 100%;" value="${settingsData.brightness}"></ons-range>
      </ons-col>
      <ons-col width="40px" style="text-align: center; line-height: 31px;">
          <span id="brightness">${settingsData.brightness}</span>
      </ons-col>
    </ons-row>`;
    
    dialog_handler = "settings-dialog";
    var btns = ["Set","Cancel","Reset"];
    if(android.getData("platform","android") == "ios"){
        btns = ["Reset","Cancel","Set"];
    }
    ons.notification.confirm({
        id: dialog_handler,
        title: "",
        messageHTML: code,
        buttonLabels: btns,
        cancelable: true,
        modifier: "rowfooter"
    }).then(function (e) {
            dialog_handler = false;
            if(btns[e] == "Set"){
                setData();
            } else if(btns[e] == "Reset"){
                resetData();
            }
        });
}


function changePlatform(dom){
    settingsData.platform = dom.value;
}

function changeTheme(dom){
    settingsData.theme = dom.value;
}

function changeAnimation(dom){
    settingsData.animation = dom.value;
}

function changeColor(dom){
    document.getElementById("demo_text").style.color= dom.value;
    settingsData.fontColor = dom.value.substring(1,dom.value.length);
}

function changeFonts(dom){
    settingsData.font = dom.value;
    demo_text.style.fontFamily = dom.value;
}

function toggleItalic(dom){
    var demo_text = document.getElementById("demo_text");
    if(dom.getAttribute("class")=="italic-enable"){
        dom.removeAttribute("class");
        demo_text.style.fontStyle = "normal";
        settingsData.italic = "false";
    } else {
        dom.setAttribute("class","italic-enable");
        demo_text.style.fontStyle = "italic";
        settingsData.italic = "true";
    }
}

function swipePlatform(dom){
    if(dom.innerText == "Swipe to iPhone"){
        android.setData("platform","ios");
    } else {
        android.setData("platform","android");
    }
    android.reCreate();
}

function toggleBold(dom){
    var demo_text = document.getElementById("demo_text");
    if(dom.getAttribute("class")=="bold-enable"){
        dom.removeAttribute("class");
        demo_text.style.fontWeight= "normal";
        settingsData.bold = "false";
    } else {
        dom.setAttribute("class","bold-enable");
        demo_text.style.fontWeight = "bold";
        settingsData.bold = "true";
    }
}

function changeRange(dom,id,unit){
    document.getElementById(id).innerHTML = dom.value+unit;
    if(id == "font_size"){
        document.getElementById("demo_text").style.fontSize=dom.value+"px";
        settingsData.fontSize = dom.value;
    } else if(id == "brightness"){
        android.changeBrightness(dom.value);
        settingsData.brightness = dom.value;
    }
}

function setData(){
    android.setData("animation",settingsData.animation);
    android.setData("font",settingsData.font);
    android.setData("font_size",settingsData.fontSize);
    android.setData("font_color",settingsData.fontColor);
    android.setData("italic",settingsData.italic);
    android.setData("bold",settingsData.bold);
    android.setData("brightness",settingsData.brightness);
    main_nav_handler.setAttribute("animation",android.getData("animation","fade"));
    
    try {
        var style = document.getElementsByClassName("line");
        for(var i = 0;i < style.length;i++){
            style[i].style.color = "#" + settingsData.fontColor;
            style[i].style.fontSize = settingsData.fontSize + "px";
            style[i].style.fontStyle = settingsData.italic=="true"?"italic":"normal";
            style[i].style.fontWeight = settingsData.bold=="true"?"bold":"normal";
            style[i].style.fontFamily = settingsData.font;
        }
    } catch (e) {}
    
    if((android.getData("platform","android") != settingsData.platform)
    ||(android.getData("theme","light") != settingsData.theme)){
        android.setData("platform",settingsData.platform);
        try{
            speakToggle(false);
        }catch(e){}
        android.setData("theme",settingsData.theme);
        if(settingsData.theme == "dark"){
            android.setData("font_color","FFFFFF");
        } else {
            android.setData("font_color", "333333");
        }
        android.reCreate();
    }
}

function resetData(){
    var data = {
        platform: "android",
        theme: "light",
        animation: "fade",
        font: "font-3",
        fontSize: "25",
        fontColor: "000000",
        italic: "false",
        bold: "false",
        brightness: android.getBrightness()
    };
    showSettingsDialog(data);
}

var speakSettingsData = {};
var totalLines = [];
var lineIndex = 0;
var startIndex = 0;
var endIndex = 0;
var isRepeat;
var speakTimer;

function speakToggle(checker,isPause){
    var lineDom = document.getElementById("line"+lineIndex);
    if(!isPause){
        lineDom.style.backgroundColor = "transparent";
    }
    clearInterval(speakTimer);
    android.speakStop();
    if(checker){
        lineDom.style.backgroundColor = "#" + android.getData("text_hightlight_color","00FF00");
        if(lineIndex%3 == 0){
            lineDom.scrollIntoView(true);
        }
        
        var fab = document.getElementById("reader-fab");
        if(!fab.isOpen()){
            fab.showItems();
            document.getElementById("md-volume-up").setAttribute("icon","md-stop");
            document.getElementById("vertical-speak-speed").value = android.getData("speak_speed","5");
            document.getElementById("vertical-speak-speed").style.display = "inline-block";
        }
        document.getElementById("md-play").setAttribute("icon","md-pause");
        android.speakStart(totalLines[lineIndex]);

        if(!isRepeat){
            document.getElementById("md-repeat-one").setAttribute("icon","md-repeat");
        }
        document.getElementById("vertical-speak-speed").value = android.getData("speak_speed","5");
        
        speakTimer = setInterval(function(){
            if(lineIndex < endIndex){
                if(android.isSpeaking() == "false"){
                    if(!isRepeat){
                        speakNext(true);
                    }else{
                        speakToggle(true);
                    }
                }
            } else {
                speakToggle(false);
                document.getElementById("reader-fab").hideItems();
                document.getElementById("md-volume-up").setAttribute("icon","md-volume-up");
            }
        },100);
    }
}

function speakNext(b){
    document.getElementById("line"+lineIndex).style.backgroundColor = "transparent";
    lineIndex++
    if(!b && !lineIndex < endIndex){
        endIndex = totalLines.length;
    }
    if(lineIndex >= totalLines.length){
        lineIndex = 0;
        if(b){
            speakToggle(false);
            document.getElementById("reader-fab").hideItems();
            document.getElementById("md-volume-up").setAttribute("icon","md-volume-up");
            return;
        }
    }
    if(lineIndex < endIndex){
        speakToggle(true);
    }
}

function speakPrevious(){
    document.getElementById("line"+lineIndex).style.backgroundColor = "transparent";
    lineIndex--;
    if(lineIndex <= 0){
        lineIndex = 0;
    }
    speakToggle(true);
}

function changeSpeakSpeed(dom,bool){
    android.speakSpeed(dom.value+"");
    android.setData("speak_speed",dom.value+"");
    if(bool){
        speakToggle(true);
    }
}

function changeSpeakVolume(dom){
    android.setVolume(dom.value);
    android.speakStart("Test sound volume");
    android.setData("volume",dom.value+"");
}

function changeHightlightColor(dom){
    document.getElementById('speak_demo_text').style.backgroundColor = dom.value;
    var color = dom.value.substring(1,dom.value.length);
    android.setData("text_hightlight_color",color);
}

function changeStart(dom){
    if(dom > 0){
        var n = dom;
        dom = {
            value: n
        }
    }
    if(dom.value >= 1 && dom.value <= totalLines.length&&!isNaN(dom.value)){
        lineIndex = dom.value-1;
    } else {
        lineIndex = 0;
    }
}

function changeEnd(dom){
    if(dom > 0){
        var n = dom;
        dom = {
            value: n
        }
    }
    if(dom.value >= 1 && dom.value <= totalLines.length && !isNaN(dom.value)){
        endIndex = dom.value;
    } else {
        endIndex = totalLines.length;
    }
}

function toggleBtn(id, _id){
    var dom = document.getElementById(id);
    if(dom.getAttribute("icon") == _id){
        dom.setAttribute("icon",id);
    } else {
        dom.setAttribute("icon",_id);
    }
    
    if(id == "md-volume-up"){
        var dom = document.getElementById("reader-fab");
        if(dom.isOpen()){
            speakToggle(false);
        } else {
            speakSettingsData = {
                total: totalLines.length,
                start: 1,
                end: totalLines.length,
                volume: android.getData("volume",15+""),
                speakSpeed: android.getData("speak_speed",8+""),
                textHightlightColor: android.getData("text_hightlight_color","00FF00")
            }
            
            lineIndex = speakSettingsData.start-1;
            endIndex = speakSettingsData.end;
            
            android.setData("volume",speakSettingsData.volume+"");
            android.setData("speak_speed", speakSettingsData.speakSpeed);
            
            var code = `
                <ons-row style="margin-top:8px;margin-bottom:10px;">
                
                    <ons-col width="45px;">
                        <span style='font-size:14px;'>Start:</span>
                    </ons-col>
                
                    <ons-col width="50px;">
                        <ons-input min="1" max="${speakSettingsData.total}" oninput="changeStart(this);" type="number" value="${speakSettingsData.start}"></ons-input>
                    </ons-col>
                    
                    <ons-col width="45px;">
                        <span style='font-size:14px;'>to end:</span>
                    </ons-col>
                
                    <ons-col width="50px;">
                        <ons-input min="2" max="${speakSettingsData.total}" oninput="changeEnd(this);" type="number" value="${speakSettingsData.end}"></ons-input>
                    </ons-col>
                    
                </ons-row>
                
                <ons-row style="margin-top:8px;margin-bottom:10px;">
                    <ons-col style="text-align:center;">
                        <span id="speak_demo_text" style="width:100%;background:#${speakSettingsData.textHightlightColor};color:#${android.getData("font_color",android.getData("theme","light")=="dark"?"FFFFFF":"000000")};font-family:${android.getData("font","font-0")};font-style:${android.getData("italic","false")=="true"?"italic":"normal"};font-weight:${android.getData("bold","false")=="true"?"bold":"normal"};font-size:${android.getData("font-size","20")}px;">English/বাংলা</span>
                    </ons-col>
                    <ons-col width="30px">
                        <input onchange="changeHightlightColor(this);" style="width:30px;height:30px;padding:0px;" type="color" value="#${speakSettingsData.textHightlightColor}"/>
                    </ons-col>
                </ons-row>
    
                    <ons-row>
                    <span style='font-size:14px;'>Reading speed</span>
                </ons-row>
                <ons-row>
                    <ons-col width="40px" style="text-align: center; line-height: 31px;">
                        <i class="std-icon std-speaker"></i>
                    </ons-col>
                    <ons-col>
                        <ons-range min="1" max="30" onchange="changeSpeakSpeed(this);android.speakStart('Test reading speed');" oninput="changeRange(this,'speak_speed', '');" style="width: 100%;" value="${speakSettingsData.speakSpeed}"></ons-range>
                    </ons-col>
                    <ons-col width="40px" style="text-align: center; line-height: 31px;">
                        <span id="speak_speed">${speakSettingsData.speakSpeed}</span>
                    </ons-col>
                </ons-row>
                
                <ons-row>
                    <span style='font-size:14px;'>Sound volume:</span>
                </ons-row>
                <ons-row>
                    <ons-col width="40px" style="text-align: center; line-height: 31px;">
                        <i class="std-icon std-volume-1"></i>
                    </ons-col>
                    <ons-col>
                        <ons-range min="1" max="15" onchange='changeSpeakVolume(this);' oninput="changeRange(this,'volume', '');" style="width: 100%;" value="${speakSettingsData.volume}"></ons-range>
                    </ons-col>
                    <ons-col width="40px" style="text-align: center; line-height: 31px;">
                        <span id="volume">${speakSettingsData.volume}</span>
                    </ons-col>
                </ons-row>`;
                
            dialog_handler = "reader-dialog";
            
            var btns = ["Start","Cancel"];
            if(android.getData("platform","android") == "ios"){
                btns = ["Cancel","Start"];
            }
            ons.notification.confirm({
                id: dialog_handler,
                title: "Reader Settings",
                messageHTML: code,
                buttonLabels: btns,
                cancelable: true,
                modifier: "rowfooter"
            }).then(function (e) {
                dialog_handler = false;
                if(btns[e] == "Start"){
                    
                    if(lineIndex > endIndex){
                        lineIndex = 0;
                        endIndex = totalLines.length;
                    }
                    document.getElementById("line"+lineIndex).scrollIntoView(true);
                    isRepeat = false;
                    speakToggle(true);
                } else {
                    document.getElementById("reader-fab").hideItems();
                    document.getElementById("md-volume-up").setAttribute("icon","md-volume-up");
                    speakToggle(false);
                }
            });
        }
    } else if(id == "md-repeat-one"){
        if(id == dom.getAttribute("icon")){
            isRepeat = true;
        } else {
            isRepeat = false;
        }
    } else if(id == "md-play") {
        if(id == dom.getAttribute("icon")){
            speakToggle(false,true);
        } else {
            speakToggle(true);
        }
    }
}

function speak(i){
    speakToggle(false);
    if(i > 0 && i <= totalLines.length){
        changeStart(i);
        changeEnd(i);
        speakToggle(true);
    }
}

function copy(i){
    var text = document.getElementById("line"+i).innerText;
    android.toast("Text is copyed!\n"+text);
    android.setCopyText(text);
}

function share(i){
    var text = document.getElementById("line"+i).innerText;
    alert("Share:\n"+text)
}

var textReaderData;

function changeReaderText(dom){
    var text = dom.value;
    if(text.charAt(text.length-1) == "." || text.charAt(text.length-1) == "।"){
        text = text.substring(0,text.length-1);
    }
    textReaderData = text;
}

function setTextReaderText(text){
    text = text.replaceAll("@@__@@","'");
    text = text.replaceAll("##__##","\n\n");
    textReaderData = text;
    document.getElementById('input-text').value = textReaderData;
}

function textReader(b){
    if(!b){
        textReaderData = "";
    }
    var code = `
    <ons-row style="margin-bottom:10px;">
        <ons-col>
            <ons-button onclick="android.importImgs();">Form Images</button>
        </ons-col>
        <ons-col>
            <ons-button onclick="android.importPDF();">Form PDF</button>
        </ons-col>
    </ons-row>
    <ons-row>
        <ons-col>
            <textarea id="input-text" oninput="changeReaderText(this);" type="text" style="width:100%;height:300px;resize:none;" placeholder="Enter text here." value=""></textarea>
        </ons-col>
    </ons-row>
    `;
    
    dialog_handler = "text-reader-dialog";
    var btns = ["Go to Read","Close"];
    if(android.getData("platform","android") == "ios"){
        btns = ["Close","Go to Read"];
    }
    ons.notification.confirm({
        id: dialog_handler,
        title: "Text Reader",
        messageHTML: code,
        buttonLabels: btns,
        cancelable: true,
        modifier: "rowfooter",
    }).then(function (e) {
            dialog_handler = false;
            if(btns[e] == "Go to Read"){
                if(textReaderData != ""){
                    go(-1,b);
                } else {
                    dialog_handler = "empty-dialog";
                    ons.notification.alert({
                        id: "empty-dialog",
                        title: "Empty!",
                        message: "Please input valid text!"
                    }).then(function(){
                        dialog_handler = false;
                    });
                }
            }
        });
        if(b){
            document.getElementById("input-text").value = textReaderData;
        }
}

var pdfStart = 0;
var pdfEnd;

function changePdfStart(dom){
    pdfStart = dom.value;
}

function changePdfEnd(dom){
    pdfEnd = dom.value;
}

function showPdfSettingsDialog(totalPages){
    pdfStart = 0;
    pdfEnd = totalPages;
    var code = `
        <ons-row style="margin-top:8px;">
            <ons-col>
                <span style='font-size:14px;'>Total Pages:${totalPages}</span>
            </ons-col>
        </ons-row>
        <ons-row style="margin-top:8px;margin-bottom:10px;">
            <ons-col width="45px;">
                <span style='font-size:14px;'>Start:</span>
            </ons-col>
            <ons-col width="50px;">
                <ons-input min="0" max="${totalPages}" oninput="changePdfStart(this);" type="number" value="0"></ons-input>
            </ons-col>
            <ons-col width="45px;">
                <span style='font-size:14px;'>to end:</span>
            </ons-col>
            <ons-col width="50px;">
                <ons-input min="1" max="${totalPages}" oninput="changePdfEnd(this);" type="number" value="${totalPages}"></ons-input>
            </ons-col>
        </ons-row>
    `;
    
    dialog_handler = "pdf-settings-dialog";
    var btns = ["Extra Text","Close"];
    if(android.getData("platform","android") == "ios"){
        btns = ["Close","Extra Text"];
    }
    ons.notification.confirm({
        id: dialog_handler,
        title: "PDF Pages",
        messageHTML: code,
        buttonLabels: btns,
        cancelable: true,
        modifier: "rowfooter",
    }).then(function (e) {
            dialog_handler = false;
            if(btns[e] == "Extra Text"){
                android.pdfToText(pdfStart,pdfEnd);
            }
        });
}

var finalEnlishToBanglaNumber={'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
 
function getDigitBanglaFromEnglish(num) {
    var retStr = num+"";
    for (var x in finalEnlishToBanglaNumber) {
         retStr = retStr.replace(new RegExp(x, 'g'), finalEnlishToBanglaNumber[x]);
    }
    return retStr;
};







