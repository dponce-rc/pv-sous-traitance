sap.ui.define([], function () {
  "use strict";

  return {

    // formatter method contains the formatting logic
    // parameter oValue gets passed from the view ...
    // ... that uses the formatter
    
	fnDateTimeFormatter: function(oValue){
	  if (oValue == undefined || oValue == "") {
	  return;
	  }
	  return new Date(oValue);
	},
	
	fnFloatToDecimalFormatter: function(oValue){
	  if (oValue == undefined || oValue == "") {
	  return;
	  }
	  return parseFloat(oValue).toFixed(3);
	  //return oValue.toFixed(3);
	}
	
  };

});