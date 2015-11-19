function preprocessor(rules){
    rules = rules.map(function(str, i){
        var map_arr = [];
        var temp = str.replace(/\/\/.*/g, "");
        if (temp !== str) map_arr.push({type: "comment", index: str.indexOf("//"), length: rules[i].length - temp.length});
        if (temp === "") return map_arr;
        str = temp;
        if (temp.indexOf(" ->. ")>=0){
            map_arr.push({type: "production", index: str.indexOf(" ->. "), length: 5});
            temp = temp.split(" ->. ", 2);
        }else if (temp.indexOf(" -> ")>=0){
            map_arr.push({type: "production", index: str.indexOf(" -> "), length: 4});
            temp = temp.split(" -> ", 2);
        }else if (temp.indexOf("->.")>=0){
            if (temp.replace("->.", "").indexOf("->")>=0){
                map_arr.push({type: "incorrect"});
                return map_arr;
            }
            map_arr.push({type: "production", index: str.indexOf("->."), length: 3});
            temp = temp.split("->.", 2);
        }else if (temp.indexOf("->")>=0){
            if (temp.replace("->", "").indexOf("->")>=0){
                map_arr.push({type: "incorrect"});
                return map_arr;
            }
            map_arr.push({type: "production", index: str.indexOf("->"), length: 2});
            temp = temp.split("->", 2);
        }else {
            if (temp === "") return map_arr;
            map_arr.push({type: "incorrect"});
            return map_arr;
        }
        if (temp[0] === temp[1]) {
            map_arr.push({type: "incorrect"});
            return map_arr;
        }
        if (temp[0] !== "")
            map_arr.push({type: "left_rule", index: 0, length: temp[0].length});
        if (temp[1] !== "")
            map_arr.push({type: "right_rule", index: str.indexOf(temp[1], temp[0].length + 2), length: temp[1].length});
        return map_arr;
    });
    return rules;
}

function TextareaExtension(target , processor, font){
    var findText = function (text, line) {
        for (var i = 0 ; i < text.length - line.length +1; i++) {
            var equals = true;
            for (var j = 0; j < line.length && equals; j++) {
                    equals = (line[j] === text[i + j]);
            }
            if (equals && (text.length - i === line.length || text[line.length + i] === '\n')) return i;
        }
    };
    
    var tag_convert = function(map, line) {
        var result = "";
        for (var i = 0; i < map.length; i++){
            if (map[i].type === "incorrect"){
                var com = -1;
                for (var c = 0; c < map.length; c++) if (map[c].type === "comment") com = c;
                if (com >=0) 
                    result = "<span class='incorrect'>" + line.substr(0, map[com].index) + "</span>" + "<span class='comment'>" + line.substr(map[com].index, map[com].length) + "</span>";
                else result = "<span class='incorrect'>" + line + "</span>";
                return result;
            } else for (var k = i + 1; k < map.length; k++){
                if (map[k].type !== "incorrect" && map[i].index > map[k].index) {
                    var g = map[i];
                    map[i] = map[k];
                    map[k] = g;
                }
            }
        }
        for (var i in map){
            if (map[i].type === "comment")
                result += "<span class='comment'>" + line.substr(map[i].index, map[i].length) + "</span>";
            else if (map[i].type === "production")
                result += "<span class='production'>" + line.substr(map[i].index, map[i].length) + "</span>";
            else if (map[i].type === "left_rule" || map[i].type === "right_rule")
                result += "<span class='rule_span'>" + line.substr(map[i].index, map[i].length) + "</span>";
        }
        return result;
    };

    var setStyleOptions = function(){
        preItem.className = "text-area-selection";
        target.parentNode.appendChild(preItem);
        target.style.font = preItem.style.font = font || "14px Arial";
        preItem.style.width = target.style.width;
        preItem.style.height = target.style.height;
        preItem.style.top = target.offsetTop + "px";
        preItem.style.left = target.offsetLeft + "px";
        target.style.background = "transparent";
        target.style["-webkit-text-fill-color"] = "transparent";
        target.style.overflow = "auto";
        preItem.style.margin = "1px 0px 0px 1px";
    };
    
    var called = false;
    
    var anta = function(){
        target.style["-webkit-text-fill-color"] = "transparent";
        target.style.background = "transparent";
        var text = target.value;
        var rules = text.split(/\n/g);
        var result = "";
        var rules_map = processor(rules);
        if (text === "") preItem.style.color = "transparent";
        else for (var i in rules_map) {
            var textIndex = findText(text, rules[i]);
            result += text.substr(0, textIndex) + tag_convert(rules_map[i], rules[i]);
            text = text.substr(textIndex + rules[i].length, text.length);
        }
        result += text;
        //result = result.replace(/\n/g, "</br>");
        preItem.innerHTML = result;
    };
    
    this.analyse = function (){
        if (!called){
            target.style["-webkit-text-fill-color"] = "#000";
            target.style.background = "#fff";
            called = true;
            $.debounce(800, anta)();
            called = false;
        }
    };

    this.scrollSync = function () {
        preItem.scrollTop = target.scrollTop;
    };

    this.resize = function () {
        preItem.style.width = target.style.width;
        preItem.style.height = target.style.height;
        preItem.style.top = target.offsetTop  + "px";
        preItem.style.left = target.offsetLeft + "px";
    };

    var preItem = document.createElement("pre");
   
    setStyleOptions();

    if (target.addEventListener) {
        target.addEventListener("change", this.analyse, false);
        target.addEventListener("keyup", this.analyse, false);
        target.addEventListener("keydown", this.analyse, false);
        target.addEventListener("scroll", this.scrollSync, false);
        target.addEventListener("mousemove", this.resize, false);
    } else if (target.attachEvent) {
        target.attachEvent("onchange", this.analyse);
        target.attachEvent("onkeyup", this.analyse);
        target.attachEvent("onkeydown", this.analyse);
        target.attachEvent("onscroll", this.scrollSync);
        target.attachEvent("mousemove", this.resize);
    }
}

