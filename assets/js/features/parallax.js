window.App = window.App || {};

window.App.parallax = (function($) {

    function init() {
        $.fn._parallax = function(intensity) {

            var	$window = $(window),
                $this = $(this);

            if (this.length == 0 || intensity === 0)
                return $this;

            if (this.length > 1) {

                for (var i=0; i < this.length; i++)
                    $(this[i])._parallax(intensity);

                return $this;

            }

            if (!intensity)
                intensity = 0.25;

            $this.each(function() {

                var $t = $(this),
                    $bg = $('<div class="bg"></div>').appendTo($t),
                    on, off;

                on = function() {

                    $bg
                        .removeClass('fixed')
                        .css('transform', 'matrix(1,0,0,1,0,0)');

                    // Use throttled scroll for better performance
                    const throttledScroll = window.PerfUtils && window.PerfUtils.throttle ?
                        window.PerfUtils.throttle(function() {
                            var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);
                            $bg.css('transform', 'matrix(1,0,0,1,0,' + (pos * intensity) + ')');
                        }, 16) : function() {
                            var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);
                            $bg.css('transform', 'matrix(1,0,0,1,0,' + (pos * intensity) + ')');
                        };

                    $window.on('scroll._parallax', throttledScroll);

                };

                off = function() {

                    $bg
                        .addClass('fixed')
                        .css('transform', 'none');

                    $window
                        .off('scroll._parallax');

                };

                // Disable parallax on ..
                    if (browser.name == 'ie'			// IE
                    ||	browser.name == 'edge'			// Edge
                    ||	window.devicePixelRatio > 1		// Retina/HiDPI (= poor performance)
                    ||	browser.mobile)					// Mobile devices
                        off();

                // Enable everywhere else.
                    else {

                        breakpoints.on('>large', on);
                        breakpoints.on('<=large', off);

                    }

            });

            $window
                .off('load._parallax resize._parallax')
                .on('load._parallax resize._parallax', function() {
                    $window.trigger('scroll');
                });

            // Global passive listeners to improve scroll performance on mobile
            try {
                window.addEventListener('touchstart', function(){}, { passive: true });
                window.addEventListener('touchmove', function(){}, { passive: true });
                window.addEventListener('wheel', function(){}, { passive: true });
            } catch(_){ }

            return $(this);

        };

        $('#wrapper')._parallax(0.925);
    }

    return {
        init: init
    };

})(jQuery);
