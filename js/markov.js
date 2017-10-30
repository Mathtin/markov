define( ['TextareaExtension', 'jquery', 'syntax', 'historyUI', 'cache', 'utils', 'modals'],
    function( TextareaExtension, $, syntax, historyUI, cache, utils, modals) {
        console.log("LOADING MRK ENGINE");
        
        var step_by_step, iteration = 0, clicked = false, main, eventChanged, textAreaTarget;
        
        var set, result, start, start, stop, reset, speed, step, rules, state, classes, area, settings, set_menu, set_trigger = true, spaceSensitivity = false;
        
        var ErrorTrap;
        
        var switchButtons = function(on){
            $(start).prop("disabled", !on);
            $(step).prop("disabled", !on);
            $(speed).prop("disabled", !on);
        };
        
        var makeStep = function (rules, text, source, spaceSensitive) {
            if ($(source).val() === "") return {
                        success: false,
                        errors: [{
                            code: "EmptySet",
                            desc: "Пустая установка",
                            line: 0
                        }]};
            if (!spaceSensitive) text = text.replace(/ /g,"");
            // console.log(rules);
            for(var i=0; i<rules.length; i++)
                if (rules[i].left === "" || text.indexOf(rules[i].left)>=0){
                    if (rules[i].left === "") text = rules[i].right + text;
                    else text = text.replace(rules[i].left, rules[i].right);
                    if (text.length>bufferLength) 
                        return {
                            success: false,
                            errors: [{
                                code: "BufferOverflow",
                                desc: "Переполнение буфера",
                                line: 0
                            }]
                        }; 
                    else if (!(rules[i].end) && text === $(source).val()) 
                        return {
                            success: false,
                            errors: [{
                                code: "Loop",
                                desc: "Зацикленный алгоритм",
                                line: 0
                            }]
                        };
                    return { success: true, rules: rules[i], result: text };
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
        
        var start_function = function(){
            switchButtons(false);
            historyUI.enabled = false;
            if ($(set).val() === $(result).val() || clicked){
                historyUI.clean();
                clicked = false;
            }
            try {
                var rules_stack = syntax.parse($(rules).val(), $(spaceSensitivity).prop("checked"));
                if (!rules_stack.success) throw rules_stack.errors;
                var pipe = {
                    func: function(){
                            this.iteration++;
                            var res = makeStep(this.rules, $(result).val(), set, $(spaceSensitivity).prop("checked"));
                            if (!res.success || res.rules.end){
                                if (!res.success) ErrorTrap(res.errors);
                                else {
                                    $(result).val(res.result);
                                    $(state).val($(state).val() + "Успешное завершение алгоритма!\n");
                                    historyUI.add(res.rules, res.result, this.iteration, parseInt($(speed).val()));
                                }
                                switchButtons(true);
                                historyUI.enabled = true;
                                clearInterval(step_by_step);
                                return 0;
                            } else {
                                this.end = res.rules.end;
                                $(result).val(res.result);
                            }
                            historyUI.add(res.rules, res.result, this.iteration, parseInt($(speed).val()));
                        },
                    rules: rules_stack.result,
                    end: false,
                    iteration: iteration
                };
                step_by_step = setInterval(function() { pipe.func.call(pipe); }, parseInt($(speed).val()));
            } catch (err){
                switchButtons(true);
                historyUI.enabled = true;
                ErrorTrap(err);
                return 0;
            }
            return 0;
        };
        
        var step_function = function(){
            try {
                var rules_stack = syntax.parse($(rules).val(), $(spaceSensitivity).prop("checked"));
                if (!rules_stack.success) throw rules_stack.errors;
                iteration++;
                rules_stack = makeStep(rules_stack.result, $(result).val(), set, $(spaceSensitivity).prop("checked"));
                if (!rules_stack.success) throw rules_stack.errors;
                historyUI.add(rules_stack.rules, rules_stack.result, iteration, 100);
                $(result).val(rules_stack.result);
            } catch (err){
                ErrorTrap(err);
                return 0;
            }
            if(rules_stack.end) $(state).val($(state).val() + "Успешное завершение алгоритма!\n");
            return 0;
        };
        
        var bind = function (elements, cl, err_func){
            ErrorTrap = err_func; main = elements.main;
            //INPUTS
            set = elements.set; result = elements.result;
            //BUTTONS
            start = elements.start; stop = elements.stop; reset = elements.reset; speed = elements.speed; step = elements.step;
            settings = elements.settings; set_menu = elements.set_menu;
            //TEXT AREAS
            rules = elements.rules; state = elements.state;
            $(main).append("<div id=\"foot\"><span>by <a href=\"https://vk.com/mathtin\" target=\"blank\">Mathtin</a> & <a href=\"https://vk.com/plaguedo\" target=\"blank\">Plaguedo</a> as a part of Corrupted Project</span></div>");
            var foot = document.getElementById("foot");
            foot.style["text-align"] = "right";
            foot.style.padding = "0px 5px 5px 0px";
            foot.style["font-size"] = "8pt";
            spaceSensitivity = elements.space_sensitivity;
            textAreaTarget = document.getElementById(rules.replace("#", ""));
            area = new TextareaExtension(textAreaTarget, function(rules){return rules.map(syntax.mapping);}, cl, function(){return $(spaceSensitivity).prop("checked");});
            window.onresize = function(event) { area.scrollSync(); area.resize(); };
            modals.bind(elements, cl, function(target, source){
                var rules_stack = syntax.parse($(rules).val(), $(spaceSensitivity).prop("checked"));
                if (!rules_stack.success) return rules_stack;
                var end = false;
                while (!end){
                    var result = makeStep(rules_stack.result, $(target).val(), source, $(spaceSensitivity).prop("checked"));
                    if (!result.success) {
                        var error_msg = "";
                        for(var i=0; i<result.errors.length; i++)
                            error_msg += "Ошибка: " + result.errors[i].desc + (result.errors[i].line!==0?" в строке  " + result.errors[i].line:"") + "\n";
                        $(target).val(error_msg);
                        break;
                    }
                    else $(target).val(result.result);
                    end = result.rules.end;
                }
            });
            historyUI.bind(elements.history, cl);
            historyUI.setOnResultSelectHandler(function () {
                if (historyUI.enabled){
                    $(result).val($(this).data("strresult"));
                    $(state).val($(state).val() + "Выбран результат " + $(this).data("strresult") + '\n');
                    clicked = true;
                }
            });
            historyUI.setOnRuleSelectHandler(function () {
                var pos = utils.indexOfRule($(this).data("ruleline"), $(rules).val());
                area.hilightLine(pos);
            });
            classes = cl;
            if (document.createEvent) {
                eventChanged = document.createEvent("HTMLEvents");
                eventChanged.initEvent("change", true, true);
            } else {
                eventChanged = document.createEventObject();
                eventChanged.eventType = "change";
            }
            eventChanged.eventName = "change";
            $(elements.space_sensitivity).click(function(){
                cache.update_cache(set, rules, $(this).prop("checked"));
                if (document.createEvent) {
                    textAreaTarget.dispatchEvent(eventChanged);
                } else {
                    textAreaTarget.fireEvent("on" + eventChanged.eventType, eventChanged);
                }
            });
            $(set_menu).hide();
            $(settings).click(function(){
                if (set_trigger) {
                    this.style.animation = "rotate 700ms linear";
                    this.style["-webkit-animation"] = "rotate 700ms linear";
                    set_trigger = false;
                    $(set_menu).slideDown(700);
                } else {
                    this.style.animation = "revRotate 700ms linear";
                    this.style["-webkit-animation"] = "revRotate 700ms linear";
                    set_trigger = true;
                    $(set_menu).slideUp(700);
                }
            });
            $(start).click(start_function);
            $(step).click(step_function);
            $(stop).click(function(){
                switchButtons(true);
                historyUI.enabled = true;
                clearInterval(step_by_step);
            });
            $(set).keyup(function(){ 
                $(result).val($(set).val()); 
                cache.update_cache(set, rules, spaceSensitivity);
            });
            $(reset).click(function(){
                $(state).val("");
                switchButtons(true);
                historyUI.enabled = true;
                clearInterval(step_by_step);
                $(result).val($(set).val());
                historyUI.clean();
                iteration = 0;
            });
            $(reset).click(function(){
                $(state).val("");
                switchButtons(true);
                historyUI.enabled = true;
                clearInterval(step_by_step);
                $(result).val($(set).val());
                historyUI.clean();
                iteration = 0;
            });
            cache.apply_cache(elements);
            $(rules).keyup(function(){ cache.update_cache(set, rules, spaceSensitivity) });
            area.dark();
            setTimeout(area.resize(), area.time_delay + 100);
        };
        
        var bufferLength = 128;
        
        return {
            bind: bind,
            bufferLength: bufferLength
        };
    }
);