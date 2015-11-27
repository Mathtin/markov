define( ['jquery'],
    function($){
        console.log("LOADING HISTORY HANDLER");
        
        var history, classes, enabled = true;
        
        var setOnRuleSelectHandler = function(func){
            $('body').on('click','.' + classes.hist_rule, func);
        };
        
        var setOnResultSelectHandler = function(func){
            $('body').on('click','.' + classes.hist_result, func);
        };
        
        var bind = function(hist_el, cl){
            classes = cl;
            history = hist_el;
        };
        
        var clean = function() { 
            $(history).empty();
            $(history).append("<div class=\"" + classes.history_notef + "\">"+ 
                            "<span class=\"" + classes.hist_idf + "\">N</span>" +
                            "<span class=\"" + classes.hist_rulef + "\">Правило</span>" +
                            "<span class=\"" + classes.hist_resultf+ "\">Результат</span></div>");
        };
        
        var add = function(rule, text, iteration, speed){
            $(history).append("<div class=\"" + classes.history_note + "\">"+ 
                            "<span class=\"" + classes.hist_id + "\"> " + iteration + ". </span>" +
                            "<span class=\"" + classes.hist_rule + "\" data-ruleline = \"" + rule.line + "\">" + rule.left + (rule.end ? " ->. " : " -> ") + rule.right + "</span>" +
                            "<span class=\"" + classes.hist_result+ "\" data-strresult = \"" + text + "\">" + text + "</span></div>");
            $(history).scrollTop($(history).prop("scrollHeight"));
        };       
        
        return {
            setOnRuleSelectHandler: setOnRuleSelectHandler,
            setOnResultSelectHandler: setOnResultSelectHandler,
            enabled: enabled,
            bind: bind,
            clean: clean,
            add: add
        };
    }
);