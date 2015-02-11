// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

$(document).ready(function () { 


    // --- Data model for Page 

    function Page( input ) {
        var dat = this;
        dat.Name    = input.name;
        dat.Number  = input.number;  
        dat.ValidationViewModel = input.validationViewModel ;

        dat.GetName = function () { return dat.Name; }

        dat.Validate = function () {
            if (dat.ValidationViewModel == undefined || dat.ValidationViewModel == null) { return true; }
            dat.ValidationViewModel.errors.showAllMessages();
            return dat.ValidationViewModel.isValid();
        }
    }


    // --- Data model for Pages

    function Pages() {
        var dis = this;
        dis.PageArray = null; 
        dis.CurrentPage = ko.observable();
        dis.NavArray = null;
            
        //return array from js object
        dis.GetNavArray = function (ExcludeFromNavTitles) {
            var array = [];
                
            var index = 0;
            for (var key in dis.PageArray) {
                if (!inArray(key, ExcludeFromNavTitles)) {
                    array[index] = key;
                    index++;
                }
            }
            return array;
        }

        dis.ShowNavigation = ko.computed(function () {
            if (dis.CurrentPage() == undefined || dis.NavArray == null) { return false; }
            var currentName = dis.CurrentPage().Name;
            return inArray(currentName, dis.NavArray);
        });

        function inArray(item_to_check, TitlesArray) {
            var inArray = false;
            for (var index = 0; index < TitlesArray.length; index++) {
                if (item_to_check == TitlesArray[index]) {
                    inArray = true;
                }
            }
            return inArray;
        }
            

        //Takes string arg - converts to Page
        dis.NavPageSelector = function (PageVal) {
            var Page = dis.PageArray[PageVal];
            dis.GoToPage(Page);
        }

        //For navigation, takes a string
        dis.GoToPage = function (Page) {
            var pageIsValid = dis.CurrentPage().Validate();
            if (pageIsValid) {
                console.log("--- GoToPage ---");
                console.log(Page);
                dis.CurrentPage(Page);
            }
        }

        // will find next page along from dis.CurrentPage
        dis.Next = function () {
            var setToNext = false;
            var nextPage = null;
            for (var key in dis.PageArray) {
                if (setToNext) {
                    dis.GoToPage(dis.PageArray[key]);
                    return;
                }
                setToNext = dis.CurrentPage() == dis.PageArray[key] ? true : false;
            }
        }


    }




    // --- Data model for form data
        
    function FormData() {

        var that = this;

        that.titles = [
            { "caption": "Mr", "value": "Mr" },
            { "caption": "Mrs", "value": "Mrs" },
            { "caption": "Miss", "value": "Miss" },
            { "caption": "Ms", "value": "Ms" }
        ];

        that.Title      = ko.observable();
        that.FirstName  = ko.observable();  
        that.LastName   = ko.observable(); 

        var today = new Date();
        var hh = today.getHours();
        var mm = today.getMinutes();
        var ss = today.getSeconds();

        var dd = today.getDate();
        var MM = today.getMonth() + 1; //January is 0 in JS by convention!
        var yyyy = today.getFullYear();

        that.currentHour = ko.observable(hh);
        that.currentMin = ko.observable(mm);
        that.currentSec = ko.observable(ss);

        that.CurrentTime = ko.computed(function () {
            return dateTimeConcat(that.currentHour(), that.currentMin(), that.currentSec(), ":");
        });
            
        that.currentDay = ko.observable(dd);
        that.currentMonth = ko.observable(MM);
        that.currentYear = ko.observable(yyyy);
        that.CurrentDate = ko.computed(function () {
            return dateTimeConcat(that.currentDay(), that.currentMonth(), that.currentYear(), "/");
        });

        that.hours = generateSelectArray({ size: 24, startNo: 0 });            
        that.mins = generateSelectArray({ size: 60, startNo: 0 });
        that.secs = generateSelectArray({ size: 60, startNo: 0 });


        that.days_Current = ko.observableArray();
        that.days = ko.observableArray();
        that.months = generateSelectArray({ size: 12, startNo: 1 });
        that.years = generateSelectArray({ size: 116, startNo: 1900 });
            
        that.day = ko.observable(1);
        that.month = ko.observable(1);
        that.year = ko.observable(1990);
        that.DOB = ko.computed(function () {
            return dateTimeConcat(that.day(), that.month(), that.year(), "/");
        });

        that.Feedback = ko.observable();
            
        // get days of month according to month and if leap year
        that.getDays_DOB = ko.computed(function () {
            var currentYear = that.year();
            var currentMonth = that.month();
            var SelectListDays = generateUpdatedSelectArray(currentMonth, currentYear);
            that.days(SelectListDays);
        });
            
        that.getDays_Current = ko.computed(function () {
            var currentYear = that.currentYear();
            var currentMonth = that.currentMonth();
            var SelectListDays = generateUpdatedSelectArray(currentMonth, currentYear);
            that.days_Current(SelectListDays);
        });

        function generateUpdatedSelectArray(currentMonth, currentYear) {
            var daysInFeb = leapYear(currentYear) == true ? 29 : 28;
            var monthToDayMapping = [0, 31, daysInFeb, 31, 30, , 31, 30, 31, 31, 30, 31, 30, 31]; //array starts at 1 not 0
            var daysInMonth = monthToDayMapping[currentMonth];
            daysInMonth = daysInMonth == undefined ? 31 : daysInMonth;
            var SelectListDays = generateSelectArray({ size: daysInMonth, startNo: 1 });
            return SelectListDays;
        }


        // --- Validation - with ko.validate

        var validationModel = ko.validatedObservable({
            FirstName: that.FirstName.extend({ required: true }),
            LastName: that.LastName.extend({ required: true })
        });

        // --- Setup Pages

        that.Pages = new Pages();

        that.Pages.PageArray = {
            "Home" :    new Page({ "name": "Home",  "number": 0, "validationViewModel": null }),
            "Who":      new Page({ "name": "Who", "number": 1, "validationViewModel": validationModel }),
            "Where":    new Page({ "name": "Where", "number": 2, "validationViewModel": null }),
            "When":     new Page({ "name": "When", "number": 3, "validationViewModel": null }),
            "Submit":   new Page({ "name": "Submit", "number": 4, "validationViewModel": null }),
            "Thanks":   new Page({ "name": "Thanks", "number": 5, "validationViewModel": null })
        };
            
        //set the current page as the Home page [0] in array
        that.Pages.CurrentPage(that.Pages.PageArray.Home);

        var ExcludeFromNavTitles = ["Home","Thanks"];
        that.Pages.NavArray = that.Pages.GetNavArray(ExcludeFromNavTitles);

        // --- Location / Google Maps ---
        
        //Coord enum - with default location
        var Coords = {
            "lat": 51.508742,
            "lon": -0.120850
        }

        that.Location = Coords;
        that.MapButton = ko.observable("Incorrect Location, I will select");
        that.MapMarker = undefined;
        that.googleMap;

        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
        //navigator.geolocation.getCurrentPosition(geolocationFailure);

        function geolocationFailure() {
            that.ChangeLocation();
        }


        function geolocationSuccess(position) {
            that.Location.lat = position.coords.latitude;
            that.Location.lon = position.coords.longitude;
            that.createMap();
        }

        that.ChangeLocation = function () {
            var mbVal = that.MapButton();
            if (mbVal == "Select this location") {
                var centre = that.googleMap.getCenter();
                that.Location.lat = centre.k;
                that.Location.lon = centre.D;
                that.createMap();
            }
            else {
                that.MapButton("Select this location");
                that.createMap();
            }
        }

        that.createMap = function(){
            var myCenter = new google.maps.LatLng(that.Location.lat, that.Location.lon);

            var mapProp = {
                center: myCenter,
                zoom: 5,
                panControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            //dont recreate map if already exists 
            if (that.googleMap == undefined || that.googleMap == null) {
                that.googleMap = new google.maps.Map(document.getElementById("googleMap"), mapProp);
            }

            if (that.MapMarker == undefined) {
                that.MapMarker = new google.maps.Marker({
                    position: myCenter,
                    animation: google.maps.Animation.DROP,
                    draggable: true
                });
            }
            else {
                that.MapMarker.animation = google.maps.Animation.DROP;
                that.MapMarker.position = myCenter;
            }

            that.MapMarker.setMap(that.googleMap);

        }

        
        that.SubmitAllData = function () {
            console.log("----- Form Output data -----");
            console.log(that);
            that.Pages.Next();
        }


        // --- Static Methods/Functions

        function dateTimeConcat(arg1 ,arg2 , arg3, div ) {
            var out = "";
            out += arg1 + div;
            out += arg2 + div;  
            out += arg3
            return out;
        }

        function generateSelectArray(options) {
            var array = [];
            for (var i = 0; i < options.size; i++) {
                var str = i + options.startNo;
                array[i] = { "number": str, "value": str };
            }
            return array;
        };

        function leapYear(year) {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
        }



    }
        

    // --- View model for form
    function FormViewModel() {
        var self = this;
        self.FormData = new FormData();

    }

    // --- register sliding binding
    ko.bindingHandlers.slideVisible = {
        update: function (element, valueAccessor, allBindings) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value);
            var duration = allBindings.get('slideDuration') || 400; // 400ms is default duration unless otherwise specified

            if (valueUnwrapped == true)
                $(element).slideDown(duration); // Make the element visible    
            else
                $(element).slideUp(duration);   // Make the element invisible
                   
        }
    };


    // --- knockout validation config
    ko.validation.init({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true
    });

    ko.applyBindings(new FormViewModel());



});




