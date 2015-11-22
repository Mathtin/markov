$(function(){
    var step_by_step;
    var clicked = false;
    var classes = {    //CSS class map
        space: "none",
        comment: "comment",
        production: "production",
        e_production: "production",
        incorrect: "incorrect",
        leftRule: "rule_span",
        rightRule: "rule_span"
    };
    var a = new TextareaExtension(document.getElementById("rules"), function(rules){
        rules = rules.map(function(str){ return mapping(str); });
        return rules;
    }, classes);
    window.onresize = function(event) {
        a.resize();
        a.scrollSync();
    };
    var iteration = 0;
    //Start button
    $('#start').click(function(){
        buttons_active(false);
        if ($('#set').val() === $('#result').val() || clicked){
            $('#history').empty();
            $('#history').append("<div class=\"history_note\" id=\"top_history\"><span class=\"hist_idf\">N</span><span class=\"hist_rulef\">Правило</span><span class=\"hist_resultf\">Результат</span></div>");
            clicked = false;
        }
        try {
            var rules_stack = parser($('#rules').val());
            if (!rules_stack.success) throw rules_stack.errors;
            var pipe = {
                func: function(){
                        this.iteration++;
                        var end_check = step(this.rules, $('#result').val(), this.iteration);
                        this.end = end_check.end;
                        if (!end_check.success || end_check.end){
                            if (!end_check.success) ErrorTrap(end_check.errors);
                            else $('#state').val("Успешное завершение алгоритма!");
                            buttons_active(true);
                            clearInterval(step_by_step);
                        }
                    },
                rules: rules_stack.result,
                end: false,
                iteration: iteration
            };
            step_by_step = setInterval(function() { pipe.func.call(pipe); }, parseInt($("#speed").val()));
        } catch (err){
            buttons_active(true);
            ErrorTrap(err);
            return 0;
        }
        return 0;
    });
    //Step button
    $('#step').click(function(){
        try {
            var rules_stack = parser($('#rules').val());
            if (!rules_stack.success) throw rules_stack.errors;
            iteration++;
            rules_stack = step(rules_stack.result, $('#result').val(),iteration);
            if (!rules_stack.success) throw rules_stack.errors;
        } catch (err){
            ErrorTrap(err);
            return 0;
        }
        if(rules_stack.end) $('#state').val("Успешное завершение алгоритма!");
        return 0;
    });
    
    $('#stop').click(function(){
        buttons_active(true);
        clearInterval(step_by_step);
    });
    
    $('#reset').click(function(){
        buttons_active(true);
        clearInterval(step_by_step);
        $('#result').val($('#set').val());
        $('#history').empty();
        $('#history').append("<div class=\"history_note\" id=\"top_history\"><span class=\"hist_idf\">N</span><span class=\"hist_rulef\">Правило</span><span class=\"hist_resultf\">Результат</span></div>");
        iteration = 0;
    });
    
    $('#set').keyup(function(){
        $('#result').val($('#set').val());
    });
    
    $('body').on('click','.hist_result', function () {
        $('#result').val($(this).data("strresult"));
        clicked = true;
    });
    
    $('body').on('click','.hist_rule', function () {
        var ctrl = document.getElementById("rules");
        console.log($(this).data("ruleline"));
        var pos = indexOfRule($(this).data("ruleline"));
        if(ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
    });

    /*Check LocalStorage*/
    if (('localStorage' in window) && window.localStorage !== null){
        var markov_in_ls = "markovbymathtinandplaguedo";
        var saved = localStorage.getItem(markov_in_ls);
        if(saved===null || saved === "[object Object]"){
            saved = JSON.stringify({set: "", result: "", rules: "", state: "" });
            localStorage.setItem(markov_in_ls, saved);
        }
        var saved_complex = JSON.parse(saved);
        $('#set').val(saved_complex.set);
        $('#rules').val(saved_complex.rules);
        $('#result').val($('#set').val());
        $('#set').keyup(update_cache());
        $('#rules').keyup(update_cache());
        a.dark();
    }
});

function update_cache(){
    var cache = {
        set: $('#set').val(),
        rules: $('#rules').val()
    };
    localStorage.setItem("markovbymathtinandplaguedo", JSON.stringify(cache));
}

function indexOfRule(line_num){
    if (line_num === 1) return 0;
    var text = $('#rules').val();
    var arr = text.split("\n");
    var index = arr[0].length + 1;
    for(var k = 1; k < arr.length; k++){
        index += arr[k].length + 1;
        if (k + 1 === line_num) return index - 1;
    }
}

function buttons_active(on){
    $("#start").prop("disabled", !on);
    $("#step").prop("disabled", !on);
    $("#speed").prop("disabled", !on);
}

function step(rules, text, iteration){
    for(var i=0; i<rules.length; i++)
        if (rules[i].left === "" || text.indexOf(rules[i].left)>=0){
            if (rules[i].left === "") text = rules[i].right + text;
            else text = text.replace(rules[i].left, rules[i].right);
            $('#result').val(text);
            $('#history').append("<div class=\"history_note\">"+ 
                    "<span class=\"hist_id\"> " + iteration + ". </span>" +
                    "<span class=\"hist_rule\" data-ruleline = \"" + rules[i].line + "\">" + rules[i].left + (rules[i].end ? " ->. " : " -> ") + rules[i].right + "</span>" +
                    "<span class=\"hist_result\" data-strresult = \"" + text + "\">" + text + "</span>" +
                    "</div>");
            if ($('#result').val().length>256) return {
                success: false,
                errors: [{
                    code: "BufferOverflow",
                    desc: "Переполнение буфера",
                    line: 0
                }]
            }; else if (!(rules[i].end) && $('#result').val() === $('#set').val())return {
                success: false,
                errors: [{
                    code: "Loop",
                    desc: "Зацикленный алгоритм",
                    line: 0
                }]
            };
            return { success: true, end: rules[i].end };
        }
    return {
        success: false,
        errors: [{
            code: "NoRules",
            desc: "Правила не найдены для текущего результата",
            line: 0
        }]
    };
};

function mapping(str){
    var map_arr = [];
    if (str === ""){
        map_arr.push({type: "space", index: 0, length: 0});
        return map_arr;
    }
    var temp = str.replace(/\/\/.*/g, "");
    if (temp !== str) map_arr.push({type: "comment", index: str.indexOf("//"), length: str.length - temp.length});
    if (temp.replace(/ /g, "") === "" && temp !== ""){
        map_arr.push({type: "space", index: 0, length: temp.length});
        return map_arr;
    } else if (temp === "") return map_arr;
    str = temp;
    if (temp.indexOf(" ->. ")>=0){
        map_arr.push({type: "e_production", index: str.indexOf(" ->. "), length: 5});
        temp = temp.split(" ->. ", 2);
    }else if (temp.indexOf(" -> ")>=0){
        map_arr.push({type: "production", index: str.indexOf(" -> "), length: 4});
        temp = temp.split(" -> ", 2);
    }else if (temp.indexOf("->.")>=0){
        if (temp.replace("->.", "").indexOf("->")>=0){
            map_arr.push({type: "incorrect", sub_type: "AmbiguousProduction", index: 0, length: temp.length});
            return map_arr;
        }
        map_arr.push({type: "e_production", index: str.indexOf("->."), length: 3});
        temp = temp.split("->.", 2);
    }else if (temp.indexOf("->")>=0){
        if (temp.replace("->", "").indexOf("->")>=0){
            map_arr.push({type: "incorrect", sub_type: "AmbiguousProduction", index: 0, length: temp.length});
            return map_arr;
        }
        map_arr.push({type: "production", index: str.indexOf("->"), length: 2});
        temp = temp.split("->", 2);
    }else {
        map_arr.push({type: "incorrect", sub_type: "ArrowExpected", index: 0, length: temp.length});
        return map_arr;
    }
    if (temp[0].replace(/ /g, "") === temp[1].replace(/ /g, "")) {
        map_arr.pop();
        map_arr.push({type: "incorrect", sub_type: "IncorrectRule", index: 0, length: str.length});
        return map_arr;
    }
    if (temp[0] !== "")
        map_arr.push({type: "leftRule", index: 0, length: temp[0].length});
    if (temp[1] !== "")
        map_arr.push({type: "rightRule", index: str.indexOf(temp[1], temp[0].length + 2), length: temp[1].length});
    return map_arr;
}

function parser(rules){
    $("#state").val("");
    rules = rules.split("\n");
    var end_trigger = false, success = true;
    rules = rules.map(function(str, i){
        var map = mapping(str);
        var left = "", right = "", end = false;
        for(var k = 0; k < map.length; k++){
            if (map[k].type === "incorrect"){
                var res = { success: false, code: map[k].sub_type, line: i + 1 };
                success = false;
                if (map[k].sub_type === "ArrowExpected") res.desc = "Ожидалось \"->\"";
                else if (map[k].sub_type === "IncorrectRule") res.desc = "Некорректное правило";
                else if (map[k].sub_type === "AmbiguousProduction") res.desc = "Неоднозначная продукция";
                return res;
            } else if (map[k].type === "leftRule") left = str.substr(map[k].index, map[k].length);
            else if (map[k].type === "rightRule") right = str.substr(map[k].index, map[k].length);
            else if (map[k].type === "e_production") end = true;
            if (end && !end_trigger) end_trigger = true;
        }
        if (left !== right) return { left: left, right: right, end: end, line: i + 1, success: true};
        else return "";
    });
    rules = rules.filter(function(str){ return str !== ""; });
    if (success) return { success: success, result: rules, alert: (end_trigger?"NoEnding":"") };
    else {
        rules = rules.filter(function(str){ return !str.success;});
        return { success: success, errors: rules };
    }
}

function ErrorTrap(err){
    var error_msg = "", error_console = "";
    for(var i=0; i<err.length; i++){
        error_console += "Error: " + err[i].code + " in line " + err[i].line + "\n";
        error_msg += "Ошибка: " + err[i].desc + " в строке  " + err[i].line + "\n";
    }
    console.log(error_console);
    $('#state').val(error_msg);
}
