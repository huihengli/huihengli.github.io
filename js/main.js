$(function () {
    // dark mode
    function syncThemeIcon() {
        var dark = document.documentElement.getAttribute("data-theme") === "dark";
        $(".theme-toggle i").toggleClass("fa-moon", !dark).toggleClass("fa-sun", dark);
    }
    syncThemeIcon();

    $(".theme-toggle").click(function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
        syncThemeIcon();
    });

    // current nav item: page path, plus the visible section on the home page
    function headerOffset() {
        return $("#page_header").outerHeight() + 16;
    }

    function updateActiveNav() {
        var path = location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
        var current = null;
        var sections = [];

        $(".menus_items a").each(function () {
            if (this.hostname !== location.hostname) return;
            var linkPath = this.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
            if (linkPath !== path) return;
            var section = this.hash ? document.getElementById(this.hash.slice(1)) : null;
            if (section) sections.push({ link: this, top: section.getBoundingClientRect().top });
            else if (!this.hash) current = this;
        });

        sections.forEach(function (item) {
            if (item.top <= headerOffset() + 8 || !current) current = item.link;
        });

        var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (sections.length && atBottom) current = sections[sections.length - 1].link;

        $(".menus_items a").removeClass("active");
        if (current) $(current).addClass("active");
    }
    $(window).on("scroll resize", updateActiveNav);
    updateActiveNav();

    // menu
    $(".menus_icon").click(function () {
        if ($(".header_wrap").hasClass("menus-open")) {
            $(".header_wrap").removeClass("menus-open").addClass("menus-close")
        } else {
            $(".header_wrap").removeClass("menus-close").addClass("menus-open")
        }
    })

    $(".m-social-links").click(function () {
        if ($(".author-links").hasClass("is-open")) {
            $(".author-links").removeClass("is-open").addClass("is-close")
        } else {
            $(".author-links").removeClass("is-close").addClass("is-open")
        }
    })

    $(".site-nav").click(function () {
        if ($(".nav").hasClass("nav-open")) {
            $(".nav").removeClass("nav-open").addClass("nav-close")
        } else {
            $(".nav").removeClass("nav-close").addClass("nav-open")
        }
    })

    $(document).click(function(e){
        var target = $(e.target);
        if(target.closest(".nav").length != 0) return;
        $(".nav").removeClass("nav-open").addClass("nav-close")
        if(target.closest(".author-links").length != 0) return;
        $(".author-links").removeClass("is-open").addClass("is-close")
        if((target.closest(".menus_icon").length != 0) || (target.closest(".menus_items").length != 0)) return;
        $(".header_wrap").removeClass("menus-open").addClass("menus-close")
    })

    // 显示 cdtop
    $(document).ready(function ($) {
        var offset = 100,
            scroll_top_duration = 700,
            $back_to_top = $('.nav-wrap');

        $(window).scroll(function () {
            ($(this).scrollTop() > offset) ? $back_to_top.addClass('is-visible') : $back_to_top.removeClass('is-visible');
        });

        $(".cd-top").on('click', function (event) {
            event.preventDefault();
            $('body,html').animate({
                scrollTop: 0,
            }, scroll_top_duration);
        });
    });

    // pjax
    $(document).pjax('a[target!=_blank]','.page', {
        fragment: '.page',
        timeout: 5000
    });
    $(document).on({
        'pjax:click': function() {
            $('body,html').animate({
                scrollTop: 0,
            }, 700);
        },
        'pjax:end': function() {
            updateActiveNav();
            if ($(".header_wrap").hasClass("menus-open")) {
                $(".header_wrap").removeClass("menus-open").addClass("menus-close")
            }
            if ($(".author-links").hasClass("is-open")) {
                $(".author-links").removeClass("is-open").addClass("is-close")
            }
            if ($(".nav").hasClass("nav-open")) {
                $(".nav").removeClass("nav-open").addClass("nav-close")
            }
        }
    });

    // smooth scroll
    $(function () {
        $('a[href*=\\#]:not([href=\\#])').click(function () {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - headerOffset()
                    }, 700);
                    return false;
                }
            }
        });
    });

})