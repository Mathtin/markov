function TextareaExtension(target , processor, tags){
    //Regular find line function
    var findLine = function (text, line) {
        for (var i = 0 ; i < text.length - line.length +1; i++) {
            var equals = true;
            for (var j = 0; j < line.length && equals; j++) {
                    equals = (line[j] === text[i + j]);
            }
            if (equals && (text.length - i === line.length || text[line.length + i] === '\n')) return i;
        }
    };
    //Regular tag convertion (inserting span tags in text)
    var tag_convert = function(map, line) {
        var result = "";
        //Index sorting
        for (var i = 0; i < map.length; i++)
            for (var k = i + 1; k < map.length; k++)
                if (map[i].index > map[k].index) {
                    var g = map[i];
                    map[i] = map[k];
                    map[k] = g;
                }
        //Inserting span tags
        for (var i in map)
            result += "<span class='" + tags[map[i].type] + "'>" + (map[i].length===0?"":line.substr(map[i].index, map[i].length)) + "</span>";
        return result;
    };
    //Regular function of setting style options
    var setStyleOptions = function(){
        preItem.className = "text-area-selection";
        target.parentNode.appendChild(preItem);
        preItem.style.top = target.offsetTop + "px";
        preItem.style.left = target.offsetLeft + "px";
        target.style.background = "transparent";
        target.style["-webkit-text-fill-color"] = "#000";
    };
    var changed = false;
    var timer = setTimeout(analyse, 700);
    //Analyser
    function analyse(){
        if(changed){
            target.style["-webkit-text-fill-color"] = "transparent";
            target.style.background = "transparent";
            var text = target.value;
            var rules = text.split(/\n/g);
            var result = "";
            var rules_map = processor(rules);
            if (text === "") preItem.style.color = "transparent";
            else for (var i in rules_map) {
                var lineIndex = findLine(text, rules[i]);
                result += text.substr(0, lineIndex) + tag_convert(rules_map[i], rules[i]);
                text = text.substr(lineIndex + rules[i].length, text.length);
            }
            result += text;
            if (rules[rules.length - 1] === "") result += "<br>";
            //result = result.replace(/\n/g, "</br>");
            preItem.innerHTML = result;
            changed = false;
            preItem.scrollTop = target.scrollTop;
        }
    };
    //Anylser dark trigger
    this.dark = function (){
        if(changed) {
            clearTimeout(timer);
            timer = setTimeout(analyse, 700);
        }
        else {
            changed = true;
            timer = setTimeout(analyse, 700);
        }
        target.style["-webkit-text-fill-color"] = "#000";
        target.style.background = "#fff";
    };
    //Scroll sync
    this.scrollSync = function () {
        preItem.scrollTop = target.scrollTop;
    };
    //Inner resizing function
    this.resize = function () {
        preItem.style.top = target.offsetTop  + "px";
        preItem.style.left = target.offsetLeft + "px";
    };
    //Process (main)
    var preItem = document.createElement("pre");
    setStyleOptions();
    if (target.addEventListener) {
        target.addEventListener("change", this.dark, false);
        target.addEventListener("keyup", this.dark, false);
        target.addEventListener("keydown", this.dark, false);
        target.addEventListener("scroll", this.scrollSync, false);
        target.addEventListener("mousemove", this.resize, false);
    } else if (target.attachEvent) {
        target.attachEvent("onchange", this.dark);
        target.attachEvent("onkeyup", this.dark);
        target.attachEvent("onkeydown", this.dark);
        target.attachEvent("onscroll", this.scrollSync);
        target.attachEvent("mousemove", this.resize);
    }
}