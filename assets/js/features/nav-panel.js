window.App = window.App || {};

window.App.navPanel = (function($) {

    function init() {
        var $body = $('body'),
            $nav = $('#nav'),
            $wrapper = $('#wrapper'),
            $header = $('#header');

        // Toggle.
        var $navPanelToggle = $(
            '<a href="#navPanel" id="navPanelToggle">Menu</a>'
        )
            .appendTo($wrapper);

        // Change toggle styling once we've scrolled past the header.
        $header.scrollex({
            bottom: '5vh',
            enter: function() {
                $navPanelToggle.removeClass('alt');
            },
            leave: function() {
                $navPanelToggle.addClass('alt');
            }
        });

        // Panel.
        var $navPanel = $(
            '<div id="navPanel">' +
                '<nav>' +
                '</nav>' +
                '<a href="#navPanel" class="close"></a>' +
            '</div>'
        )
            .appendTo($body)
            .panel({
                delay: 500,
                hideOnClick: true,
                hideOnSwipe: true,
                resetScroll: true,
                resetForms: true,
                side: 'right',
                target: $body,
                visibleClass: 'is-navPanel-visible'
            });

        // Get inner.
        var $navPanelInner = $navPanel.children('nav');

        // Keep nav content in place on mobile; clone into panel for the hamburger.
        breakpoints.on('>medium', function() {
            // Ensure desktop keeps normal styling and clear panel duplicates.
            $nav.find('.icons, .icon').removeClass('alt');
            if ($navPanelInner) $navPanelInner.empty();
        });

        breakpoints.on('<=medium', function() {
            // Do not move nodes away from #nav. Instead, clone into the panel so
            // the top nav stays visible on mobile pages.
            if ($navPanelInner) {
                $navPanelInner.empty();
                $nav.children().clone(true, true).appendTo($navPanelInner);
                $navPanelInner.find('.icons, .icon').addClass('alt');
            }
        });

        // Hack: Disable transitions on WP.
        if (browser.os == 'wp' && browser.osVersion < 10)
            $navPanel.css('transition', 'none');
    }

    return {
        init: init
    };

})(jQuery);
