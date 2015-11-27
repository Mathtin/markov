define(['jquery', 'markov'], function($, markov) {
    var classes = {    //CSS class map
        space: "none",
        comment: "comment",
        production: "production",
        e_production: "production",
        incorrect: "incorrect",
        leftRule: "rule_span",
        rightRule: "rule_span",
        history_note: "history_note",
        hist_id: "hist_id",
        hist_rule: "hist_rule",
        hist_result: "hist_result",
        history_notef: "history_notef",
        hist_idf: "hist_idf",
        hist_rulef: "hist_rulef",
        hist_resultf: "hist_resultf",
        dell_element: "dell_element",
        some_test: "some_test"
    };
    
    var elements = {
        main: '#content',
        set: '#set',
        result: '#result',
        rules: '#rules',
        state: '#state',
        reset: '#reset',
        start: '#start',
        speed: '#speed',
        stop: '#stop',
        step: '#step',
        history: '#history',
        test: '#test',
        mod_tests: 'tests',
        add_test: '#add_test',
        tests_start: '#tests_start'
    };
    
    var ErrorTrap = function (err){
        var error_msg = "", error_console = "";
        for(var i=0; i<err.length; i++){
            error_console += "Error: " + err[i].code + (err[i].line!==0?" in line " + err[i].line:"") + "\n";
            error_msg += "Ошибка: " + err[i].desc + (err[i].line!==0?" в строке  " + err[i].line:"") + "\n";
        }
        console.log(error_console);
        $('#state').val($('#state').val() + error_msg + '\n');
    };
    
    markov.bind(elements, classes, ErrorTrap);
    
});