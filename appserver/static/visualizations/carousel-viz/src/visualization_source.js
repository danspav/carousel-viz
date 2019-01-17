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
			'slick',
			'splunkjs/mvc'
			
            // Add required assets to this list
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            vizUtils,
			carousel_viz,
			textfill,
			slick,
			mvc
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
				data.fields = [{'name':"value"}];
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
			oCarousel.mvc = mvc;
			oCarousel.height = this.$el.height();
			oCarousel.setConfig(config, this.getPropertyNamespaceInfo().propertyNamespace);
			oCarousel.setData(data)
			this.$el.html(oCarousel.getHTML());
			textfill = require("textfill");
			slick = require("slick");
			this.oCarousel = oCarousel;
			this.oCarousel.start();
			window.jQuery('#' + this.oCarousel.id).slick('slickNext');
			window.jQuery('#' + this.oCarousel.id).slick('slickPrev');
			//setTimeout(function(){oCarousel.resize(oCarousel.height );},1000);
			//Set up the drilldown ability
			var vizObj = this;
			
			window.jQuery("div#" + oCarousel.id + " div.singlevaluebox").click(function(){
				var objValueSpan = $(this).find("div.value span")[0];
				var rawValue = $(objValueSpan).attr('rawValue');
				var unitValue = $(objValueSpan).attr('data-unit');
				var formattedValue = $(objValueSpan).attr('valueField');
				
				var objCaptionSpan = $(this).find("div.caption span")[0];
				var caption = $(objCaptionSpan).text();
				// Set the tokens
				var aTokens={	"rawValue": {"key": this.objCarousel.tokenRawValue, "value": rawValue},
								"formattedValue": {"key": this.objCarousel.tokenFormattedValue, "value": formattedValue},		
								"caption": {"key": this.objCarousel.tokenCaption, "value":caption},
								"unit" : {"key": this.objCarousel.tokenUnit, "value":unitValue}
					};
				setTokens(aTokens);
				vizObj.drilldownToCategory(formattedValue, rawValue, event);
			});
        },

		
		setTokens: function(aTokens){
			for (var tok in aTokens) {
				this._setToken(aTokens[tok]['key'],aTokens[tok]['value']);
			}
		},
		
		_setToken : function(name, value) {
			var defaultTokenModel = mvc.Components.get('default');
			if (defaultTokenModel) {
				defaultTokenModel.set(name, value);
			}
			var submittedTokenModel = mvc.Components.get('submitted');
			if (submittedTokenModel) {
				submittedTokenModel.set(name, value);
			}
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
			if(this.oCarousel) { this.oCarousel.resize(this.$el.height());}
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