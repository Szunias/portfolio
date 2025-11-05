window.App = window.App || {};

window.App.preloader = (function($) {

    function init() {
        var $body = $('body');

        // Remove preloader as soon as DOM is ready - don't wait for all resources
        $(document).ready(function() {
            $body.removeClass('is-preload');
            $body.addClass('is-loaded');
            $body.removeClass('page-exit page-enter');
        });
    }

    return {
        init: init
    };

})(jQuery);
