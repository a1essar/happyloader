/* ========================================================================
 * happyloaders: jquery.happyloader.js v1.0.0
 * ========================================================================
 * Copyright 2013 Happycms.ru
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * ======================================================================== 
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    
    var VERSION = '1.0.0';
    
    // Create the defaults once
    var happyloader = 'happyloader',
        defaults = {
            happyloaderOverlay : 'happy-loader-overlay',
            happyloaderBar : 'happy-loader-bar',
            happyloaderImages : 'happyloader-images',
            happyloaderInformer : 'happy-loader-informer',
            customRenderBar: false,
            customRemoveLoader: false,
            debug : false,
            callback: function() {},
        };

    function Plugin( element, options ) {
        this.element = element;
        this.$element = $(this.element);
        this.$body = $('body');
        this.urls = [];
        this.imageCounter = 0;
        this.timer = Date.now();

        this.options = $.extend( {
        }, defaults, options, $(this.element).data('happyloader-options')) ;
        
        this._defaults = defaults;
        this._name = happyloader;
        
        this.version = VERSION;

        this.init();
        this.bindMethods();
        this.bindEventListeners();
    }

    Plugin.prototype = {
        init: function() {
            this.render();  
            this.findImagesElements();  
        },

        render: function(){ 
            $('<div/>').addClass(this.options.happyloaderOverlay).appendTo('body');
            $('<div/>').addClass(this.options.happyloaderImages).css('display', 'none').appendTo('body');
            $('<div/>').addClass(this.options.happyloaderBar).appendTo('.'+this.options.happyloaderOverlay);
            $('<div/>').addClass(this.options.happyloaderInformer).html('0%').appendTo('.'+this.options.happyloaderOverlay);
        },
        
        renderBar: function(){
            if (typeof this.options.customRenderBar === 'function') {
                this.options.customRenderBar(this);
                return true;
            }
            
            var percentage = parseInt(this.imageCounter*100/this.urls.length);
            var windowWidth = $(window).width();
            var width = parseInt((percentage * windowWidth)/100);
            $('.'+this.options.happyloaderBar).stop(true, true).animate({'width' : width}, 300, $.proxy(function(){
                $('.'+this.options.happyloaderInformer).html(percentage+'%');    
            }, this));
        },
        
        removeLoader: function(){
            if (typeof this.options.customRemoveLoader === 'function') {
                this.options.customRemoveLoader(this);
                return true;
            }
            
            $('.'+this.options.happyloaderBar).promise().done($.proxy(function() {
                $('.'+this.options.happyloaderImages).remove();
                $('.'+this.options.happyloaderOverlay).animate({'opacity' : 0}, 300, $.proxy(function(){
                    $('.'+this.options.happyloaderOverlay).remove();    
                    
                    if(this.options.debug == true){
                        console.log('end loader');    
                    }
                }, this));
                
                this.options.callback();
            }, this));
        },
        
        draw: function() {

        },
        
        findImagesElements: function(){
            var elements = this.$element.find('*:not(script)');
            elements = elements.add(this.$element);
            var elementsSize = elements.size();
            
            for(var i = 0; i < elementsSize; i++){
                this.findImage(elements[i]);  
            }     
            
            if(this.urls.length <= 0){
                this.removeLoader();
                return true;    
            }
            
            this.createImages(this.urls);
            
            if(this.options.debug == true){
                console.log('end find images', this.urls);    
            }
             
        },
        
        findImage: function(element){
            var element = $(element);
            var tag = element[0].tagName.toLowerCase();
            var url = '';
            
            if(element.css('background-image') == 'none' && element.is('[src]') == true && tag == 'img' ){
                url = element.attr('src');
                findUrl = url.toLowerCase();

                if(findUrl.indexOf('jpg') + 1 > 0 || findUrl.indexOf('jpeg') + 1 > 0 || findUrl.indexOf('png') + 1 > 0 || findUrl.indexOf('gif') + 1 > 0){
                    this.urls.push(url);
                    return true;     
                }
            }
            
            if(element.css('background-image') !== 'none'){
                url = element.css('background-image'); 
                
                if(url.indexOf('gradient') + 1 > 0){
                    return false;
                }

                if(url.indexOf('data') + 1 > 0){
                    return false;
                }
                
                url = url.replace(/url\(\"/g, "");
                url = url.replace(/url\(/g, "");
                url = url.replace(/\"\)/g, "");
                url = url.replace(/\)/g, "");
                
                /* проверка на multi images */
                if(url.indexOf(',') + 1 > 0){
                    var a = url.split(',');
                    
                    for(var i = 0, len = a.length; i < len; i++){
                        this.urls.push(a[i].replace(/^\%20|\%20$/g, ''));    
                    }
                    
                    return true;
                }

                this.urls.push(url); 
                return true;  
            }
        },
        
        loadImage: function(element){
            element.on('load error', $.proxy(function () {
                 this.completeImageLoad(element);

                 if(this.options.debug == true){
                    console.log('load image');    
                 }
            }, this));           
        },
        
        completeImageLoad: function(element){
            this.imageCounter++;
            var imageSize = this.urls.length;
            
            this.renderBar(this.imageCounter);
            
            if(this.imageCounter >= this.urls.length){
                this.removeLoader();    
            }    
        },
        
        createImages: function(){
            var urlsSize = this.urls.length;
            var image = '';
            
            for(var i = 0; i < urlsSize; i++){
                image = $('<img />');
                image.attr('src', this.urls[i]).appendTo('.'+this.options.happyloaderImages);
                this.loadImage(image);    
            }
        },
        
        bindMethods: function(){
        },
        
        bindEventListeners: function(){
        }
    };

    $.fn[happyloader] = function ( options ) {
        // global events
        onWindowResize = bind(onWindowResize, this); 
        addEventListener($(window), 'load', onWindowResize); 
        addEventListener($(window), 'resize', onWindowResize);
        
        return this.each(function () {
            if (!$.data(this, "plugin_" + happyloader)) {
                $.data(this, "plugin_" + happyloader,
                new Plugin( this, options ));
            }
        });
    };

    function onWindowResize(e){
        this.each(function () {
            $.data(this, "plugin_" + happyloader).renderBar();  
        });
    }
    
    function bind(fn, context) {
        return function() {
            return fn.apply(context, arguments);
        };
    };
        
    function addEventListener(element, type, callback) {
        element.on(type, callback);
    };
        
    function removeEventListener(element, type, callback) {
        element.off(type, callback);
    };
}));
