/*
 * Visualization source
 */
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
			'carousel-viz',
			'textfill',
			'slick'
            // Add required assets to this list
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            vizUtils,
			carousel_viz,
			textfill,
			slick
        ) {
  
    // Extend from SplunkVisualizationBase
    return SplunkVisualizationBase.extend({
  
        initialize: function() {
            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.$el = $(this.el);
     
            // Initialization logic goes here
        },

        // Optionally implement to format data returned from search. 
        // The returned object will be passed to updateView as 'data'
        formatData: function(data) {


			// Be kind - if there are no results, fake it. My pet peeve is having the single value viz not show anything when there are no results, forcing me to add somehing like "|append [makeresults| eval total=""] head 1" at the end of my searches
			if (data.fields.length < 1) {
				//throw new SplunkVisualizationBase.VisualizationError("Missing values. Please include the following fields in your search query: value,optionally:  unit, caption. E.g. ...| table value, unit, caption");
				data.fields = [{0:"value"}];
				data.rows = [["&emdash;"]]
				data.meta={"done":true}
			}

			return data;
        },
  
        // Implement updateView to render a visualization.
        //  'data' will be the data object returned from formatData or from the search
        //  'config' will be the configuration property object
        updateView: function(data, config) {
            
            if (!data) {
				return;
			}

			// Assign datum to the data object returned from formatData
			if (!data.meta.done)
				return;
			
			
			// Clear the div
			this.$el.empty();

			var carousel_viz = require('carousel-viz');
			
			// Now load the visualisation
			var oCarousel= new carousel_viz.carousel_viz();
			oCarousel.height = this.$el.height();
			oCarousel.setConfig(config, this.getPropertyNamespaceInfo().propertyNamespace);
			oCarousel.setData(data)
			this.$el.html(oCarousel.getHTML());
			textfill = require("textfill");
			slick = require("slick");
			this.oCarousel = oCarousel;
			this.oCarousel.resize(this.$el.height());
			this.oCarousel.start();
			//Set up the drilldown ability
			window.jQuery("div#" + oCarousel.id + " div.singlevaluebox").click(function(){
				var objDiv = $("div#" + oCarousel.id + " div.singlevaluebox").find("div.value span.val");
				var catFieldValue = objDiv.text();
				var catName = objDiv.getAttribute('valField');
				drilldownToCategory(catName, catFieldValue, event);
			});
        },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 1000
            });
        },

        // Override to respond to re-sizing events
        reflow: function() {
			this.oCarousel.resize(this.$el.height());		
		},
    
	
		drilldownToCategory: function(categoryName, categoryFieldValue, browserEvent) {
			var data = {};
			data[categoryName] = categoryFieldValue;

			this.drilldown({
				action: SplunkVisualizationBase.FIELD_VALUE_DRILLDOWN,
				data: data
			}, browserEvent);
		}

	});
	
});