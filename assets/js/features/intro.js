window.App = window.App || {};

window.App.intro = (function($) {

    function init() {
        var $window = $(window),
            $intro = $('#intro'),
            $main = $('#main');

        if ($intro.length > 0) {

            // Hack: Fix flex min-height on IE.
            if (browser.name == 'ie') {
                $window.on('resize.ie-intro-fix', function() {

                    var h = $intro.height();

                    if (h > $window.height())
                        $intro.css('height', 'auto');
                    else
                        $intro.css('height', h);

                }).trigger('resize.ie-intro-fix');
            }

            // Hide intro on scroll (<= small).
            breakpoints.on('<=small', function() {

                $main.unscrollex();

                $main.scrollex({
                    mode: 'middle',
                    top: '15vh',
                    bottom: '-15vh',
                    enter: function() {
                        $intro.addClass('hidden');
                    },
                    leave: function() {
                        $intro.removeClass('hidden');
                    }
                });

            });

        }
    }

    return {
        init: init
    };

})(jQuery);
