$(function(){
    $('body').happyloader({
        happyloaderBar: 'happy-loader-bar-center',
        callback: function(){
            console.log('happyloader -> callback');
        }
    }); 
});