// Set up the store
var preferences = {};

// Is local storage supported?
preferences.supported = function() {

    try {

        return window.localStorage !== undefined;

    } catch (e) {

        return false;

    }

};

// Get a key
preferences.get = function(key) {

    // Does the browser support local storage?
    if (this.supported()) {

        return window.localStorage[key] != 'undefined' ? JSON.parse(window.localStorage[key]) : undefined;

    }

};

// Set a key
preferences.set = function(key, value) {

    // Does the browser support local storage?
    if (this.supported()) {

        window.localStorage[key] = JSON.stringify(value);
        return value;

    }

};

// Unset a key
preferences.unset = function(key) {

    // Does the browser support local storage?
    if (this.supported()) {

        return window.localStorage.removeItem(key)

    }

};

// Set up the user object
var user = {};

user.getDrink = function() {

    var drink = preferences.get('drink');
    return drink !== undefined ? drink : user.setDrink(1);

};

user.setDrink = function(drink) {

    preferences.set('drink', drink);
    return drink;

};

// Does the user want bubbles displayed?
user.getBubblez = function() {

    var bubblez = preferences.get('bubblez');
    return bubblez !== undefined ? bubblez : user.setBubblez(true);

};

user.setBubblez = function(bubble_status) {

    preferences.set('bubblez', bubble_status);
    return bubble_status;

};

$(document).ready(function() {

    var BEEROCLOCK = 24; // 5 PM
    const GLASS_FULL = 100;

    var drink = {},
        index,
        full_query_string = window.location.href.split('?')[1],
        $hours = $('.countdown-hours > .digit'),
        $minutes = $('.countdown-minutes > .digit'),
        $seconds = $('.countdown-seconds > .digit');

    // Split it up into key value pairs
    full_query_string = typeof full_query_string == 'undefined' ? [] : full_query_string.split('&');

    // Loop through the query string and set up an object based on it
    query_string = {};
    
    for (index in full_query_string) {

        // Split up the key value pair
        item = full_query_string[index].split('=');

        // Add it to our object
        query_string[item[0]] = item[1];

    }

    // Allow overriding of beer o'clock for debug
    if (typeof query_string.t != 'undefined') {

        BEEROCLOCK = query_string.t;

    }

    // Define our different drinks
    var drinks = {
        // Pint of Lager
        1: {
            glass: "uk-pint",
            liquid: "drink-lager",
            bubbles: true,
            bubbles_min: 20,
            bubbles_max: 40,
            bubbles_small: 2,
            bubbles_big: 6
        },
        
        // Pint of Ale
        2: {
            glass: "uk-pint",
            liquid: "drink-ale",
            bubbles: false,
            bubbles_min: "0",
            bubbles_max: "0",
            bubbles_small: "0",
            bubbles_big: "0"
        },
        
        // Pint of Stout
        3: {
            glass: "uk-pint",
            liquid: "drink-stout",
            bubbles: false,
            bubbles_min: 0,
            bubbles_max: 0,
            bubbles_small: 0,
            bubbles_big: 0
        },
        
        // Bottle of Lager
        4: {
            glass: "beer-bottle",
            liquid: "drink-lager-light",
            bubbles: true,
            bubbles_min: 10,
            bubbles_max: 30,
            bubbles_small: 2,
            bubbles_big: 4
        },
        
        // Gin & Tonic
        5: {
            glass: "hiball",
            liquid: "drink-gintonic",
            bubbles: true,
            bubbles_min: 10,
            bubbles_max: 30,
            bubbles_small: 2,
            bubbles_big: 4
        },
        
        // Coke Mixer
        6: {
            glass: "hiball",
            liquid: "drink-cola",
            bubbles: true,
            bubbles_min: 10,
            bubbles_max: 30,
            bubbles_small: 2,
            bubbles_big: 4
        },
        
        // Bottle of Alcopop
        7: {
            glass: "beer-bottle alcopop-bottle",
            liquid: "drink-blue-alcopop",
            bubbles: true,
            bubbles_min: 10,
            bubbles_max: 30,
            bubbles_small: 1,
            bubbles_big: 2
        }
    };

    // Is it beer o'clock? i.e the weekend or after beer o'clock on the current day
    drink.canHaz = function() {

        return (new Date).getHours() >= BEEROCLOCK;

    };

    // Add leading zeros to numbers
    drink.leadingZero = function(number) {

        return number < 10 ? '0' + number : number;

    };

    // Format a Date object a bit more nicely
    drink.formatTime = function(date) {

        var hours = this.leadingZero(date.getHours()),
            minutes = this.leadingZero(date.getMinutes()),
            seconds = this.leadingZero(date.getSeconds());

        return {
            hours: hours.toString().split(''),
            minutes: minutes.toString().split(''),
            seconds: seconds.toString().split('')
        };

    };

    // A Date object for when beer o'clock is
    drink.getDate = function() {

        var drink_date = new Date;

        // If it's already past beer o'clock then we need to wait till tomorrow
        if (drink_date.getHours() >= BEEROCLOCK) {

            drink_date.setDate(drink_date.getDate() + 1);

        }

        drink_date.setHours(BEEROCLOCK);
        drink_date.setMinutes(0);
        drink_date.setSeconds(0);

        return drink_date;

    };

    // How long till you can haz beer!
    drink.howLong = function() {

        var beeroclock_date = this.getDate(),
            now = this.canHaz() ? beeroclock_date : new Date;

        return new Date(beeroclock_date - now);

    };

    // How full should the beer glass be?
    drink.howLongPercentage = function() {

        if (this.canHaz()) {

            return GLASS_FULL;

        }

        var now = new Date / 1000,
            beer = this.getDate() / 1000;

        return parseInt(GLASS_FULL - (((beer - now) / 86400) * 100));

    };

    drink.pour = function() {

        // Update the page content
        var time = drink.howLong();
        var pretty_time = drink.formatTime(time);

        // Update the hours display
        $.each($hours, function(index, value) {
            
            $hours[index].innerHTML = pretty_time.hours[index];

        });

        // Update the minutes display
        $.each($minutes, function(index, value) {
            
            $minutes[index].innerHTML = pretty_time.minutes[index];

        });

        // Update the seconds display
        $.each($seconds, function(index, value) {
            
            $seconds[index].innerHTML = pretty_time.seconds[index];

        });

        // Update the title
        if (drink.canHaz()) {

            document.title = "It's Beer o'clock now!";

        } else {

            var time_string = '';

            if (time.getHours() > 0) {

                time_string += time.getHours() + 'h ';

            }

            if (time.getMinutes() > 0) {

                time_string += time.getMinutes() + 'm ';

            }

            time_string += time.getSeconds() + 's ';

            document.title = time_string;
            // window.location.hash = time_string;

        }

        // Fill up that beer glass!
        $(".tasty-beverage").css({
            height: drink.howLongPercentage() + '%'
        });

    }
    
    drink.releaseTheBubblez = function(drinkId) {
        
        // Get variables
        var $bubbles = $('.bubbles');
        
        // Get bubble settings
        var drink = drinks[user.getDrink()];

        var min_bubble_count = drink.bubbles_min, // Minimum number of bubbles
            max_bubble_count = drink.bubbles_max, // Maximum number of bubbles
            min_bubble_size = drink.bubbles_small, // Smallest possible bubble diameter (px)
            max_bubble_size = drink.bubbles_big; // Largest possible bubble diameter (px)
                
        // If drink has bubbles, generate our bubbles from the above options
        $bubbles.empty();

        if (drink.bubbles) {

            var bubbleCount = min_bubble_count + Math.floor(Math.random() * (max_bubble_count + 1));
            
            for (var i = 0; i < bubbleCount; i++) {

                $bubbles.append('<div class="bubble-container"><div class="bubble"></div></div>');
            
            }

        }

        // Make each bubble random
        $bubbles.find('> .bubble-container').each(function() {

            // Randomise their size
            var size_rand = min_bubble_size + Math.floor(Math.random() * (max_bubble_size + 1));
            
            // Randomly position the bubbles
            var pos_rand = Math.floor(Math.random() * 101);
            
            // Randomise the time they start rising
            var delay_rand = Math.floor(Math.random() * 16);
            
            // Randomise their speed
            var speed_rand = 3 + Math.floor(Math.random() * 9);
            
            // Cache the this selector
            var $this = $(this);

            // Stick the above to the bubble container
            $this.css({
                'left' : pos_rand + '%',
                
                '-webkit-animation-duration' : speed_rand + 's',
                '-moz-animation-duration' : speed_rand + 's',
                '-ms-animation-duration' : speed_rand + 's',
                'animation-duration' : speed_rand + 's',
                
                '-webkit-animation-delay' : delay_rand + 's',
                '-moz-animation-delay' : delay_rand + 's',
                '-ms-animation-delay' : delay_rand + 's',
                'animation-delay' : delay_rand + 's'
            });
            
            // And set the bubble size
            $this.children('.bubble').css({
                'width' : size_rand + 'px',
                'height' : size_rand + 'px'
            });

        });
    };
    
    drink.bubblesOn = function() {

        // Create the bubbles
        drink.releaseTheBubblez();
        
        // Show the bubbles
        $('.bubbles').fadeIn('1000', function(){
            
            // Start the animation
            $('.bubble-container').css({
                'animation-play-state' : 'running',
                '-webkit-animation-play-state' : 'running'
            });
            
            // Change the toggle text
            $('.bubble-toggle').text('Bubbles Off');
        });

    };
    
    drink.bubblesOff = function() {  

        // Hide the bubbles
        $('.bubbles').fadeOut('2500', function() {
            // Stop the animation
            $('.bubble-container').css({
                'animation-play-state' : 'paused',
                '-webkit-animation-play-state' : 'paused'
            });
            
            // Remove the bubble divs
            $('.bubbles').empty();
            
            // Change the toggle text
            $('.bubble-toggle').text('Bubbles On');
        });

    };
    
    drink.toggleBubblez = function() {

        if (!user.getBubblez()) {

            user.setBubblez(true);
            drink.bubbles_on();
        
        } else {
        
            user.setBubblez(false);
            drink.bubbles_off();
        
        }

    }; 
    
    // User Settings
    drink.set = function() {

        // Save the drink to user preferences
        user.setDrink(drink);
        
        // Get the drink settings
        var drink = drinks[user.getDrink()];
        
        // Clear existing and set the drink type
        $('#drink-type').removeClass().fadeOut('100', function() {

            $(this).addClass(drink.glass + ' ' + drink.liquid).fadeIn('250');

        });
        
        // Get rid of existing bubbles
        $('.bubbles').empty();
        
        // If drink has bubbles, and user hasn't disabled them, run the bubble cannon
        if (drink.bubbles && user.getBubblez()) {

            drink.releaseTheBubblez(user.getDrink());

        }
        
        // Toggle button
        var $bubble_toggle = $('.bubble-toggle');
        
        // Show/Hide toggle button based on drink settings
        if (!drink.bubbles) {

            $bubble_toggle.hide();

        } else {

            $bubble_toggle.show();

        }
        
        // Set toggle button text based on user prefs
        if (user.getBubblez()) {

            $bubble_toggle.text('Bubbles Off');

        } else {

            $bubble_toggle.text('Bubbles On');

        }
    }
        
    // Customise form - save settings
    $('#settings-form').on('submit', function(event) {

        // Prevent the browser from submitting the form normally
        event.preventDefault();
        
        var values = {};

        // Serialize the form into a storable format
        $.each($(this).serializeArray(), function(i, field) {

            values[field.name] = field.value;

        });
        
        // Set the drink type
        user.setDrink(values['drink_type']);

        // Close the panel
        $('.settings-panel').slideToggle();

    });
           
    // Toggle the Bubble Cannon
    $('.bubble-toggle').on('click', drink.toggleBubblez);
    
    // Settings Panel Toggle
    $('.settings-toggle').on('click', $('.settings-panel').slideToggle);
    
    // What will it be?
    drink.set(user.getDrink());
    
    // And go..
    drink.pour();
    setInterval(drink.pour, 1000);
    
});

// Delay loading of sharing stuff
// until everything else has loaded
$(window).on('load', function() {

    // Facebooks
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.async = true; js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1&appId=441260642628600";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk')); 
    
    // Twitter
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    
    // Google Plus
    window.___gcfg = {lang: 'en-GB'};
    (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
    
    $('.social-sharing').delay(500).fadeIn();

});