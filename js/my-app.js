// Initialize app
var myApp = new Framework7();

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
	domCache: false
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

//Generate Three Week Chart for Chosen Location
myApp.onPageInit('map_B', function (page) {

myApp.alert("Click on the Map to Generate a Chart for a Location", "Three Week Charts");
	
	var map;
	
	require([
         "esri/config",
        "esri/map",
          "esri/arcgis/utils",
        "esri/tasks/Geoprocessor",
        "esri/tasks/GeometryService",
          "esri/graphic",
          "esri/geometry/webMercatorUtils",
          "esri/dijit/Popup",
          "esri/InfoTemplate",
          "esri/dijit/Search",
          "dojo/dom-construct",
          "dojo/dom",
		  "dojo/i18n!esri/nls/jsapi",
          "dojo/dom-attr",
          "dojo/query",
          "dojo/on",           
          "dojo/parser",
			"dijit/registry",
          "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
          "dijit/TitlePane",
        "dojo/domReady!"
      ], function (
        esriConfig, Map,  arcgisUtils, Geoprocessor, GeometryService,
		Graphic, webMercatorUtils, Popup, InfoTemplate, Search, 
		domConstruct, dom, esriBundle, domAttr, query, on, parser, registry
      ) {
		  		  
		  esriBundle.widgets.Search.main.placeholder = "Find address, place or lat/lon";

            map = new Map("map", {
            basemap: "hybrid",
               center: [-97, 40],
			  zoom: 3,
			   slider: false
		  
          });

		  esriConfig.defaults.geometryService = new GeometryService("http://gis.mymetcon.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");		
		       
         var search = new Search({
            map: map,
               showInfoWindowOnSelect: false,
               enableLabel: false,
               enableHighlight: false,
			   enableSuggestions: true
         },"search_B");
         search.startup();
		    
		var x,y;
            
		//Initial click function
         $$(document).on("click", function(evt){
			  
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            x = mp.x.toFixed(3);
            y = mp.y.toFixed(3);
			
          map.graphics.clear();
          var graphic = new Graphic(evt.mapPoint);

          map.graphics.add(graphic);
          map.infoWindow.setFeatures([graphic]);
		  map.infoWindow.resize(200,200);	
          map.infoWindow.setContent(" Longitude: " + x.toString() + " <br>Latitude: " + y.toString());
          map.infoWindow.show(evt.mapPoint)
		  map.infoWindow.setTitle("Forecast Reports");
		  
        }); 
		
		  var locationStr;
		
		  window.gp_chart = new Geoprocessor("http://gis.mymetcon.com/arcgis/rest/services/Three_Week_Chart/GPServer/ThreeWeekChart");
		  
		  //Three week chart link click
		  var link = domConstruct.create("a",{
                "class": "action", 
                "id": "chartLink_B",
                "innerHTML": "Generate Chart", //text that appears in the popup for the link 
                "href": "javascript: void(0);"
              }, query(".actionList", map.infoWindow.domNode)[0]);
          
		  on(link, "click", function()
				{ 

				window.navigator.notification.prompt(
				  "Enter Location Name: ", // message
				  handleLocationPrompt, // callback
				  "", //title
				  ["Ok", "Exit"] // button titles
				);

				// handle user's dialog action
				function handleLocationPrompt(results) {
				  if (results.buttonIndex === 1) {
					// Ok
					locationStr = results.input1;
					
					 var lat,lon = "";
					 lat = x.toString();
					 lon = y.toString();

				var taskParams = {
				  "Latitude": lat,
				  "Longitude": lon,
				  "Location": locationStr
				  
				};
				
				  domAttr.set(dom.byId("chartLink_B"), "innerHTML", "Generating Chart...");
				  window.gp_chart.execute(taskParams, gpChartResultAvailable);

				  }
				}
				});
			
			   var content = "";
			   var chartPath;
			   
			  function gpChartResultAvailable(results, messages){
				 domAttr.set(dom.byId("chartLink_B"),"innerHTML", "Three Week Chart");
				 //clear any existing features displayed in the popup 
				map.infoWindow.startup();
				
				 if(results == 0){
					  var chartPath = "http://gis.mymetcon.com/Test_Charts/Three_Week_Chart_for_" + locationStr + ".png";
					  //content = '<IMG SRC="' + chartPath + '" width=100% height=100%>';
			
				 }else{
					  content = " Unable To Generate Chart";
				 }
				
				map.infoWindow.resize(250, 170);
				map.infoWindow.setTitle("Click on Chart");
			
				var img = document.createElement("img");

				img.src=chartPath;
				img.width=240;
				img.height=160;
				img.addEventListener("click", function () {window.location = chartPath;});
				map.infoWindow.setContent(img);
				map.infoWindow.reposition();
			};
        }); 
});

/* Destroy search widget after navigating away from the page. 
The app will re-register the widget ID each time the map is loaded
and will lock up if the same ID is registered more than once. */

myApp.onPageBeforeRemove('map_B', function (page){
	require(["dijit/registry"],
			function(registry){
	 widget = registry.byId("search_B");
	 widget.destroy();
	})
});

//Generate Three Week Chart for User's Location
myApp.onPageInit('map_A', function (page) {
	
	var map;

	require([
         "esri/config",
        "esri/map",
          "esri/arcgis/utils",
        "esri/tasks/Geoprocessor",
        "esri/tasks/GeometryService",
          "esri/graphic",
          "esri/geometry/webMercatorUtils",
		  "esri/geometry/Point", 
        "esri/symbols/SimpleMarkerSymbol", 
		"esri/symbols/SimpleLineSymbol",
        "esri/graphic", 
		"esri/Color",
          "esri/dijit/Popup",
          "esri/InfoTemplate",
          "esri/dijit/HomeButton",
          "esri/dijit/Search",
          "dojo/dom-construct",
          "dojo/dom",
		  "dojo/i18n!esri/nls/jsapi",
          "dojo/dom-attr",
          "dojo/query",
          "dojo/on",           
          "dojo/parser",
          "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
          "dijit/TitlePane",
        "dojo/domReady!"
      ], function (
        esriConfig, Map,  arcgisUtils, Geoprocessor, GeometryService,
		Graphic, webMercatorUtils, Point,
        SimpleMarkerSymbol, SimpleLineSymbol,
        Graphic, Color, Popup, InfoTemplate, HomeButton, Search, 
		domConstruct, dom, esriBundle, domAttr, query, on, parser
      ) {
		 
		  
		  esriBundle.widgets.Search.main.placeholder = "Find address, place or lat/lon";

            map = new Map("map", {
            basemap: "hybrid",
               center: [-97, 40],
			   zoom: 3,
			   slider: false,
		
          });

		  esriConfig.defaults.geometryService = new GeometryService("http://gis.mymetcon.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");		
		  esri.config.defaults.map.zoomDuration = 750; //time in milliseconds; default is 500
          esri.config.defaults.map.zoomRate = 25; //refresh rate of zoom animation; default is 25

		window.gp_chart = new Geoprocessor("http://gis.mymetcon.com/arcgis/rest/services/Three_Week_Chart/GPServer/ThreeWeekChart");

		window.setTimeout(generateChart,2500);
		
			function generateChart(){
				
					console.log("generating chart");
				
					var randomNumber = Math.floor((Math.random() * 1000) + 1);
					
					var randNumb = randomNumber.toString();
							
					var locationStr = "Your_Location_" + randNumb;
					console.log(locationStr);
					
					var options = {
						  enableHighAccuracy: true,
						  timeout: 5000,
						  maximumAge: 0
						};
						
					window.navigator.geolocation.getCurrentPosition(gotLocation,onError,options)
					
					function onError(error) {
					console.log('code: ' + error.code + '\n' +
						'message: ' + error.message + '\n');
						}
				
					function gotLocation(position) {
						
						 function addGraphic(pt){
						  var symbol = new SimpleMarkerSymbol(
							SimpleMarkerSymbol.STYLE_CIRCLE, 
							12, 
							new SimpleLineSymbol(
							  SimpleLineSymbol.STYLE_SOLID,
							  new Color([255,0,0, 0.5]), 
							  8
							), 
							new Color([255,0,0, 0.9])
						  );
						  graphic = new Graphic(pt, symbol);
						  map.graphics.add(graphic);
						  
						}
						
					var Latitude = position.coords.latitude;
					var Longitude = position.coords.longitude;
					
					 var pt = new Point(Longitude, Latitude);
					  addGraphic(pt);
					  map.centerAndZoom(pt, 17);
		
					var latitude = Latitude.toFixed(3);
					var longitude = Longitude.toFixed(3);
					
					 var y = latitude.toString();
					 var x = longitude.toString();

		//For some reason PhoneGap swaps lat and lon before it hits the MetCon Server
					var taskParams = {
					  "Latitude": x,
					  "Longitude": y,
					  "Location": locationStr
					};
					
					var content = "";
				    var chartPath;
	
				  function gpChartResultAvailable(results, messages){
					  
					 if(results == 0){
						  var chartPath = "http://gis.mymetcon.com/Test_Charts/Three_Week_Chart_for_" + locationStr + ".png";
						  window.location = chartPath;
						  window.open(chartPath,"_self");
					 }
					 
		
				};
				
				window.gp_chart.execute(taskParams, gpChartResultAvailable);
					
				}
			}
		
			   
			
		}); 
	
	
});


//Generate Climate Chart for Chosen Location
myApp.onPageInit('map_C', function (page) {
	
 myApp.alert("Click on the Map to Generate a Chart for a Location", "Climate Charts");
	
  var map;

	require([
         "esri/config",
        "esri/map",
          "esri/arcgis/utils",
        "esri/tasks/Geoprocessor",
        "esri/tasks/GeometryService",
          "esri/graphic",
          "esri/geometry/webMercatorUtils",
          "esri/dijit/Popup",
          "esri/InfoTemplate",
          "esri/dijit/Search",
          "dojo/dom-construct",
          "dojo/dom",
		  "dojo/i18n!esri/nls/jsapi",
          "dojo/dom-attr",
          "dojo/query",
          "dojo/on",           
          "dojo/parser",
			"dijit/registry",
          "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
          "dijit/TitlePane",
        "dojo/domReady!"
      ], function (
        esriConfig, Map,  arcgisUtils, Geoprocessor, GeometryService,
		Graphic, webMercatorUtils, Popup, InfoTemplate, Search, 
		domConstruct, dom, esriBundle, domAttr, query, on, parser, registry
      ) {
		  
		  esriBundle.widgets.Search.main.placeholder = "Find address, place or lat/lon";
		  esriConfig.defaults.geometryService = new GeometryService("http://gis.mymetcon.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");		
		 
		 map = new Map("map", {
            basemap: "hybrid",
               center: [-97, 40],
			  zoom: 3,
			   slider: false
		  
          });
           
           var search = new Search({
            map: map,
               showInfoWindowOnSelect: false,
               enableLabel: false,
               enableHighlight: false,
			   enableSuggestions: true
         },"search_C");
         search.startup();
		
		var x,y;
            
		//Initial click function	
          $$(document).on("click", function(evt){
			  
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            x = mp.x.toFixed(3);
            y = mp.y.toFixed(3);
			
          map.graphics.clear();
          var graphic = new Graphic(evt.mapPoint);

          map.graphics.add(graphic);
          map.infoWindow.setFeatures([graphic]);
		  map.infoWindow.resize(200,200);	
          map.infoWindow.setContent(" Longitude: " + x.toString() + " <br>Latitude: " + y.toString());
          map.infoWindow.show(evt.mapPoint)
		  map.infoWindow.setTitle("Climate Reports");
		  
        }); 
		
		  var locationStr;
		
		  window.gp_chart = new Geoprocessor("http://gis.mymetcon.com/arcgis/rest/services/ClimateChartv2/GPServer/ClimateChart");
		  
		  //Three week chart link click
		  var link = domConstruct.create("a",{
                "class": "action", 
                "id": "chartLink_C",
                "innerHTML": "Generate Chart", //text that appears in the popup for the link 
                "href": "javascript: void(0);"
              }, query(".actionList", map.infoWindow.domNode)[0]);
          
		  on(link, "click", function()
				{ 

				window.navigator.notification.prompt(
				  "Enter Location Name: ", // message
				  handleLocationPrompt, // callback
				  "", //title
				  ["Ok", "Exit"] // button titles
				);

				// handle user's dialog action
				function handleLocationPrompt(results) {
				  if (results.buttonIndex === 1) {
					// Ok
					locationStr = results.input1;
					
					 var lat,lon = "";
					 lat = x.toString();
					 lon = y.toString();

				var taskParams = {
				  "Latitude": lat,
				  "Longitude": lon,
				  "Location": locationStr
				  
				};
				
				  domAttr.set(dom.byId("chartLink_C"), "innerHTML", "Generating Chart...");
				  window.gp_chart.execute(taskParams, gpChartResultAvailable);

				  }
				}
			});
			
			   var content = "";
			   var chartPath;
			   
			  function gpChartResultAvailable(results, messages){
				 domAttr.set(dom.byId("chartLink_C"),"innerHTML", "Climate Chart");
				 //clear any existing features displayed in the popup 
				map.infoWindow.startup();
				
				 if(results == 0){
					  var chartPath = "http://gis.mymetcon.com/Test_Charts/Climate_Chart_for_" + locationStr + ".png";
					  //content = '<IMG SRC="' + chartPath + '" width=100% height=100%>';
			
				 }else{
					  content = " Unable To Generate Chart";
				 }
				
				map.infoWindow.resize(250, 170);
				map.infoWindow.setTitle("Click on Chart");
			
				var img = document.createElement("img");

				img.src=chartPath;
				img.width=240;
				img.height=160;
				img.addEventListener("click", function () {window.location = chartPath;});
				map.infoWindow.setContent(img);
				map.infoWindow.reposition();

			};
        }); 
   
});

/* Destroy search widget after navigating away from the page. 
The app will re-register the widget ID each time the map is loaded
and will lock up if the same ID is registered more than once. */

myApp.onPageBeforeRemove('map_C', function (page){
	require(["dijit/registry"],
			function(registry){
	 widget = registry.byId("search_C");
	 widget.destroy();
	})
});

//Generate Climate Chart for User's Location
myApp.onPageInit('map_D', function (page) {
	
	var map;

	require([
         "esri/config",
        "esri/map",
          "esri/arcgis/utils",
        "esri/tasks/Geoprocessor",
        "esri/tasks/GeometryService",
          "esri/graphic",
          "esri/geometry/webMercatorUtils",
		  "esri/geometry/Point", 
        "esri/symbols/SimpleMarkerSymbol", 
		"esri/symbols/SimpleLineSymbol",
        "esri/graphic", 
		"esri/Color",
          "esri/dijit/Popup",
          "esri/InfoTemplate",
          "esri/dijit/HomeButton",
          "esri/dijit/Search",
          "dojo/dom-construct",
          "dojo/dom",
		  "dojo/i18n!esri/nls/jsapi",
          "dojo/dom-attr",
          "dojo/query",
          "dojo/on",           
          "dojo/parser",
        "dijit/registry",
          "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
          "dijit/TitlePane",
        "dojo/domReady!"
      ], function (
        esriConfig, Map,  arcgisUtils, Geoprocessor, GeometryService,
		Graphic, webMercatorUtils, Point,
        SimpleMarkerSymbol, SimpleLineSymbol,
        Graphic, Color, Popup, InfoTemplate, HomeButton, Search, 
		domConstruct, dom, esriBundle, domAttr, query, on, parser, registry
      ) {
		  
		  esriBundle.widgets.Search.main.placeholder = "Find address, place or lat/lon";

            map = new Map("map", {
            basemap: "hybrid",
               center: [-97, 40],
			   zoom: 3,
			   slider: false,
		
          });

		  esriConfig.defaults.geometryService = new GeometryService("http://gis.mymetcon.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");		
		  esri.config.defaults.map.zoomDuration = 750; //time in milliseconds; default is 500
          esri.config.defaults.map.zoomRate = 25; //refresh rate of zoom animation; default is 25

		window.gp_chart = new Geoprocessor("http://gis.mymetcon.com/arcgis/rest/services/ClimateChartv2/GPServer/ClimateChart");

		window.setTimeout(generateChart,2500);
		
			function generateChart(){
				
					console.log("generating chart");
				
					var randomNumber = Math.floor((Math.random() * 1000) + 1);
					
					var randNumb = randomNumber.toString();
							
					var locationStr = "Your_Location_" + randNumb;
					console.log(locationStr);
					
					var options = {
						  enableHighAccuracy: true,
						  timeout: 5000,
						  maximumAge: 0
						};
						
					window.navigator.geolocation.getCurrentPosition(gotLocation,onError,options)
					
					function onError(error) {
					console.log('code: ' + error.code + '\n' +
						'message: ' + error.message + '\n');
						}
				
					function gotLocation(position) {
						
						 function addGraphic(pt){
						  var symbol = new SimpleMarkerSymbol(
							SimpleMarkerSymbol.STYLE_CIRCLE, 
							12, 
							new SimpleLineSymbol(
							  SimpleLineSymbol.STYLE_SOLID,
							  new Color([255,0,0, 0.5]), 
							  8
							), 
							new Color([255,0,0, 0.9])
						  );
						  graphic = new Graphic(pt, symbol);
						  map.graphics.add(graphic);
						  
						}
						
					var Latitude = position.coords.latitude;
					var Longitude = position.coords.longitude;
					
					 var pt = new Point(Longitude, Latitude);
					  addGraphic(pt);
					  map.centerAndZoom(pt, 17);
		
					var latitude = Latitude.toFixed(3);
					var longitude = Longitude.toFixed(3);
					
					 var y = latitude.toString();
					 var x = longitude.toString();

		//For some reason PhoneGap swaps lat and lon before it hits the MetCon Server
					var taskParams = {
					  "Latitude": x,
					  "Longitude": y,
					  "Location": locationStr
					};
					
					var content = "";
				    var chartPath;
	
				  function gpChartResultAvailable(results, messages){
					  
					 if(results == 0){
						  var chartPath = "http://gis.mymetcon.com/Test_Charts/Climate_Chart_for_" + locationStr + ".png";
						  window.location = chartPath;
						  window.open(chartPath,"_self");
						}
				};
				window.gp_chart.execute(taskParams, gpChartResultAvailable);
		
				}
			}
		
			
		}); 
	
});
