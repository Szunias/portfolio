(function($) {

    // Breakpoints.
    breakpoints({
        default:   ['1681px',   null       ],
        xlarge:    ['1281px',   '1680px'   ],
        large:     ['981px',    '1280px'   ],
        medium:    ['737px',    '980px'    ],
        small:     ['481px',    '736px'    ],
        xsmall:    ['361px',    '480px'    ],
        xxsmall:   [null,       '360px'    ]
    });

    // Scrolly.
    $('.scrolly').scrolly();

    // Initialize features
    if (window.App) {
        for (var feature in window.App) {
            if (window.App.hasOwnProperty(feature) && typeof window.App[feature].init === 'function') {
                window.App[feature].init();
            }
        }
    }

})(jQuery);
