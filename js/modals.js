define( ['jquery', 'remodal'],
    function($){
        console.log("LOADING MODALS");
        var test_count = 1, classes, add_test, tests_start, test, mod_tests;

        var generate_modalse = function (){
    
        };

        var empty_tests = function (){

        };
        
        var bind = function (elements, cl, apply_func) {
            classes = cl;
            add_test = elements.add_test;
            tests_start = elements.tests_start;
            test = elements.test;
            mod_tests = elements.mod_tests;
            $(test).click(function(){
                var options = {
                    closeOnEscape: false,
                    closeOnConfirm: false
                };
                $('[data-remodal-id=' + mod_tests + ']').remodal(options).open();
            });

            $(add_test).click(function(){
                test_count++;
                $('#all_tests').append("\n\
                        <div class=\"" + classes.some_test + "\">\n\
                            <textarea class='test_textarea' data-testid='" + test_count + "'></textarea>\n\
                            <textarea class='test_textarea' data-resultid='" + test_count + "' disabled></textarea>\n\
                            <div class='" + classes.dell_element + "' data-dell-id=\"" + test_count +"\"></div>\n\
                        </div>\n");
                $('[data-remodal-id=' + mod_tests + ']').scrollTop($('[data-remodal-id=' + mod_tests + ']').prop("scrollHeight"));
            });
            $('body').on('click','.' + classes.dell_element, function(){
                $(this).parent("."+classes.some_test).remove();
            });

            $(tests_start).click(function(){
                $('[data-testid]').each(function () {
                    var test_id = $(this).data("testid");
                    $('[data-resultid='+ test_id +']').val($(this).val());
                    apply_func('[data-resultid='+ test_id +']', this);
                });
            });
        };
        
        return { 
            test_count: test_count,
            bind : bind
        };
    }
);