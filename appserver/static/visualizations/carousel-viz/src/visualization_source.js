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

           // Check for an empty data object
			if (data.rows.length < 1) {
				return false;
			}
			// We need a minimum of 3 fields returned
			if (data.fields.length < 3) {
				throw new SplunkVisualizationBase.VisualizationError("Missing values. Please include the following fields in your search query: value, unit, caption");
			}

			//Make sure we have the following: value, unit, caption
			var i = 0;
			var hasValue = false;
			var hasUnit = false;
			var hasCaption = false;
			var hasRange = false;
			for (i = 0; i < data.fields.length; i++) {
				if (data.fields[i].name == "value")
					hasValue = true;
				if (data.fields[i].name == "caption")
					hasCaption = true;
				if (data.fields[i].name == "unit")
					hasUnit = true;
				if (data.fields[i].name == "range" || data.fields[i].name == "style")
					hasRange = true;
			}

			// Check for invalid data
			if (!(hasValue && hasCaption && hasUnit )) {
				throw new SplunkVisualizationBase.VisualizationError('Missing values. Please include the following fields in your search query: value, unit, caption. E.g. ...| table value, unit, caption');
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
			oCarousel.setConfig(config, this.getPropertyNamespaceInfo().propertyNamespace);
			oCarousel.setData(data)
			this.$el.html(oCarousel.getHTML());
			textfill = require("textfill");
			slick = require("slick");
			
			oCarousel.start();

        },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 1000
            });
        },

        // Override to respond to re-sizing events
        reflow: function() {}
    });
});