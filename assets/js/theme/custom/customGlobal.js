import utils from '@bigcommerce/stencil-utils';
import quickShop from './quickShop';
import ajaxAddToCart from './ajaxAddToCart';

export default function(context) {
    const themeSettings = context.themeSettings;

    /* Scroll position */
    var scroll_position = $(window).scrollTop();

    var check_JS_load = true;

    /* Contains all functions  that are needed to be executed after JS is loaded */
    function loadFunction () {
        if(check_JS_load) {
            check_JS_load = false;

            /* Add global function here */
            closeSidebar();
            clickOverlay();
            ajaxAddToCart(context);
            quickShop(context);
            toogleFooterMobile();

            /* Mega Menu Editor */

            /* Logion  / Register Modal */
            authPopup();
            authSidebarMobile();
            getScrollbarWidth();
        }
    }

    function eventLoad(){
        /* Top Promotion Function */
        context.themeSettings.show_topPromotion && handleTopPromotion();

        $(document).ready(function() {
            var $header = $('header.header'),
                height_header = $header.outerHeight(),
                header_top_height = $('#custom_topPromotion').outerHeight();

            /* Load when scroll */
            $(window).on('scroll', (e) => {
                const $target = $(e.currentTarget);
                const tScroll = $target.scrollTop();

                headerSticky(tScroll, $header, height_header, header_top_height);
            });
        });


        $(document).ready(function() {
            sectionLoad();
        });

        /* Load when user action on site */
        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                loadFunction();
            });
        });

         /* Load When Match Media Function For Tablet */
        window.matchMedia('(max-width: 1024px)').addEventListener('change', () => {});

        /* Load When Match Media Function For Mobile */
        window.matchMedia('(max-width: 768px)').addEventListener('change', () => {});

        /* Load When Match Media Function For Small Mobile */
        window.matchMedia('(max-width: 550px)').addEventListener('change', () => {});
    }
    eventLoad();

    /* Hide all Sidebar */
    function hideAllSidebar() {
        const body = document.body;
        const removeClassArray = ['has-activeNavPages', 'openCartSidebar', 'openAuthSidebar'];
        const menuMobileIcon = document.querySelector('.mobileMenu-toggle');

        /* Hide menu sidebar */
        if(body.classList.contains('has-activeNavPages')) {
            menuMobileIcon.click();
        }

        removeClassArray.forEach((sidebarClass)=>{
            if(body.classList.contains(sidebarClass)) {
                body.classList.remove(sidebarClass);
            }
        });
    }

    /* Close sidebar */
    function closeSidebar() {
        const closeButtons = document.querySelectorAll('.custom-sidebar-close');
        if(!closeButtons) return;
        
        for(let i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', (e) => {
                e.preventDefault();
                hideAllSidebar();
            });
        }
    }

    function clickOverlay() {
        const backgroundOverlay = document.querySelector('.background-overlay');
        if(!backgroundOverlay) return;

        backgroundOverlay.addEventListener('click', (e) => {
            hideAllSidebar();
        });
    }

    /* Custom Animate */
    function customAnimate(section) {
        if(section.matches('.animate-loaded')) return;

        section.classList.add('animate-loaded');

        section.classList.add('animated');
    }

    /* Custom Slick Slider */
    function customSlickSlider(section) {
        if(section.matches('.slick-slider-loaded')) return;

        section.classList.add('slick-slider-loaded');

        const sectionSlickOptions = section.getAttribute('data-slick-options');
        if(!sectionSlickOptions) return;

        const options = JSON.parse(sectionSlickOptions);
        $(section).slick(options);
    }

    function sectionLoad() {
        const handler = (entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const section = entry.target;
                    const sectionType = section.getAttribute('data-section-load');

                    switch(sectionType) {
                        case 'animation':
                            customAnimate(section);
                            break;
                        
                        case 'slick-slider':
                            customSlickSlider(section);
                            break;

                        case 'recent-post': 
                            recentlyPostSlick(section);
                            break;
                        
                        default:
                            break;
                    }
                }
            });
        }

        const sections = document.querySelectorAll('[data-section-load]'),
        options = {
            threshold: .05
        };

        if(!sections) return;

        const observer = new IntersectionObserver(handler, options);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /* Header Top Promotion */
    function handleTopPromotion() {
        const closePromotion = document.querySelector('.promotion-close');
        if(!closePromotion) return;

        /* Handle when click close button */
        closePromotion.addEventListener('click', function(event) {
            event.preventDefault();
        
            $('#custom_topPromotion').slideToggle();

            /* Save Close Time */
            localStorage.setItem('lastHiddenTime', new Date().getTime());
        });

        /* Check if promotion is closed */
        const lastHiddenTime = localStorage.getItem('lastHiddenTime');

        if(lastHiddenTime) {
            const currentTime = new Date().getTime();
            const timeHide = 1; // 1 day
            const timeDiff = currentTime - lastHiddenTime;
            const timeDiffInDay = timeDiff / (1000 * 60 * 60 * 24);

            if(timeDiffInDay > timeHide) {
                $('#custom_topPromotion').removeClass("u-hidden");
            }
        } else {
            $('#custom_topPromotion').removeClass("u-hidden");
        }
    }


    /* Header Sticky */
    function headerSticky(tScroll, $header, height_header, header_top_height) {
        if (themeSettings.show_sticky_header) {
            if (tScroll > header_top_height && tScroll < scroll_position) {
                $header.addClass('is-sticky');
                $header.css('animation-name', 'fadeInDown');

            } else {
                $header.removeClass('is-sticky');
                // $('.header-height').remove();
                $header.css('animation-name', '');
            }

            scroll_position = tScroll;
        }
    }

    /* Footer Mobile Toggle */
    function toogleFooterMobile() {
        if(window.innerWidth > 550) return;

        const $footerHeadingToggle = $('.footer-info-heading--toggle');

        $footerHeadingToggle.on('click', (e) => {
            e.preventDefault();

            const $target = $(e.currentTarget);
            const $thisFooterInfo = $target.parents('.footer-info-col');
            const $thisFooterInfo_list = $thisFooterInfo.find('.footer-info-list');

            $thisFooterInfo.toggleClass('open-dropdown');

            if ($thisFooterInfo.hasClass('open-dropdown')) {
                $thisFooterInfo_list.slideDown(400);
            }
            else {
                $thisFooterInfo_list.slideUp(400);
            }
        });
    }

    function authPopup() {
        let authButton = document.querySelector("[data-login-form]");

        if(!authButton) return;

        authButton.addEventListener('click', (e) => {
            e.preventDefault();

            const target = e.currentTarget;

            if (!document.body.classList.contains('page-type-login')) {
                if (!target.nextElementSibling) return;

                target.nextElementSibling.classList.toggle('is-open'); 
            } else {
                $('html, body').animate(
                    {
                        scrollTop: $('.login').offset().top,
                    },
                    700
                );
            }
        });

        document.addEventListener('click', (event) => {
            const customAuthPopup = document.querySelector('.custom-auth-popup');

            if (!customAuthPopup) return;
        
            if (customAuthPopup.classList.contains('is-open')) {
                if (
                    !event.target.closest('.custom-auth-popup') &&
                    !event.target.closest('[data-login-form]')
                ) {
                    customAuthPopup.classList.remove('is-open');
                }
            }
        });
    }
    
    function authSidebarMobile() {
        const loginMobileButton = document.querySelector("[data-login-form]"),
            authSidebar = document.querySelector('.custom-auth-sidebar');

        if(!loginMobileButton || !authSidebar) return;

        loginMobileButton.addEventListener('click', (e) => {
            e.preventDefault();

            if (!document.body.classList.contains('page-type-login')) {
                if(authSidebar.classList.contains('is-open')) {
                    authSidebar.classList.remove('is-open');
                    document.body.classList.remove('openAuthSidebar');
                } else {
                    authSidebar.classList.add('is-open');
                    document.body.classList.add('openAuthSidebar');
                }
                
            } else {
                $('html, body').animate(
                    {
                        scrollTop: $('.login').offset().top,
                    },
                    700
                );
            }
        })
    }

    /* Get Scrollbar width */
    function getScrollbarWidth() {
        const width = window.innerWidth - document.documentElement.clientWidth;
        
        if (width > 17) return;
        document.documentElement.style.setProperty('--scrollbar-width', `${width}px`);
    }
      
    window.matchMedia('(max-width: 1024px)').addEventListener('change', () => {
        getScrollbarWidth();
    });
} 