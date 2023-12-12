sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, Controller, Filter, FilterOperator, model, MessageToast) {
	"use strict";

	return BaseController.extend("PP.ZManage_PV.controller.View1", {
		onInit: function () {
			debugger;

			this._oCustomComboBox = this.byId("ComboBox");
			
			model = this;
			var filterBar = this.getView().byId("smartFilterBarPV");
			
			filterBar.addEventDelegate({
				onAfterRendering: function (e){
					var text = model.getOwnerComponent().getModel("i18n").getResourceBundle();
					
					let FilterItems = e.srcControl.getAllFilterItems();
					
					for ( let y = 0; y < FilterItems.length; y++ ){
						if( FilterItems[y].getLabel() == "Delivery Date" ){
							e.srcControl.getAllFilterItems()[y].setLabel( text.getText("FilterDeliveryDateLabel") );  // index Delivery Date filter
						}else if( FilterItems[y].getLabel() == "Vendor" ) {
							e.srcControl.getAllFilterItems()[y].setLabel( text.getText("FilterVendorLabel") );  // index Vendor filter
						}
					}
				}
			})
		
			var Table = this.getView().byId("smartTable_ResponsiveTable");
			Table.addEventDelegate({
				onAfterRendering: function (e){
					var text = model.getOwnerComponent().getModel("i18n").getResourceBundle();
					var Columns = e.srcControl.getTable().getColumns();
					
					for ( let y = 0; y < Columns.length; y++ ){
						if ( Columns[y].sId.includes('smartTable_ResponsiveTable-lpein') ){
							
							Columns[y].getHeader().setProperty("text", text.getText("smartTable_ResponsiveTable-lpein") );
							
						}else if( Columns[y].sId.includes('smartTable_ResponsiveTable-pv_number') ){
							
							Columns[y].getHeader().setProperty("text", text.getText("smartTable_ResponsiveTable-pv_number") );
							
						}else if( Columns[y].sId.includes('smartTable_ResponsiveTable-txz01') ){
							
							Columns[y].getHeader().setProperty("text", text.getText("smartTable_ResponsiveTable-txz01") );
							
						}else if( Columns[y].sId.includes('smartTable_ResponsiveTable-lifnr') ){
							Columns[y].getHeader().setProperty("text", text.getText("smartTable_ResponsiveTable-lifnr") );
						}
					}
				}
			})			
			
			// var t = this.getView().byId("IdfilterBar"),
			// 	i = this;
			// t.addEventDelegate({
			// 	onAfterRendering: function (e) {
			// 		var t = i.getOwnerComponent().getModel("i18n").getResourceBundle();
			// 		var r = e.srcControl._oSearchButton;
			// 		r.setText(t.getText("Actualiser"))
			// 	}
			// });
			
		},
		
		// handleSelectionChange: function() {
		onDisplayPV: function() {
			
			if( this.getView().byId("tableGestionPv").getSelectedItem() ){
				var oTable = this.getView().byId("tableGestionPv").getSelectedItem().getBindingContext().getObject();
			
				var lv_ebeln = oTable.ebeln;
				var lv_ebelp = oTable.ebelp;
	
				this.getRouter().navTo("DisplayPV", {
						Ebeln : lv_ebeln ,
						Ebelp: lv_ebelp
					}, true);
					//var table = this.getView().byId("tableGestionPv");
		            //table.removeSelections(true);				
			}else{
				var text = model.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageToast.show(text.getText("PleaseSelectARow"));
			}
		},
		
		onAfterRendering: function(){
			debugger;

			var oSmartTable = this.byId("smartTable_ResponsiveTable");
			oSmartTable.onAfterRendering = function() {
				debugger;
				var oToolbar = this.byId("stickyToolbar"),
					oParent = oToolbar.$().parent();
				if (oParent) {
					oParent.addClass("stickyToolbar");
				}
			}.bind(this);	
	
			// var oSmartTable = this.byId("smartTable_ResponsiveTable");
			
			// oSmartTable.onAfterRendering = function() {
			// 		var oToolbar = this.byId("stickyToolbar"),
			// 		    oParent = oToolbar.$().parent();
			// 		if (oParent) {
			// 			oParent.addClass("cimtStickyToolbar");
			// 		}
			// 	}.bind(this);				
		
	
			// var Table = this.getView().byId("tableGestionPv");
	
			// Table.onAfterRenderin = function() {
			// 		Table.addStyleClass("cimtStickyTableMSW");
			// 		var oToolbar = this.byId("stickyToolbar"),
			// 		iTop = oToolbar.$().outerHeight();
			// 		if ($("head").find("style#cimtStickyTableMSW").length !== 0 ){
			// 			$("head").find("style#cimtStickyTableMSW").remove();
			// 		}
			// 		var style = $("<style id='cimtStickyTableMSW'></style>");
			// 		$(style).html(" .cimtStickyTableMSW > table > thead > tr," +
			// 			".cimtStickyTableMSW > table > thead > tr > th {" +
			// 			"	position: sticky;" +
			// 			"	position: -webkit-sticky;" +
			// 			"	top: " + iTop + "px;" +
			// 			"	z-index: 100;" +
			// 			"}");
			// 		$("head").prepend(style); //eslint-disable-line
			// 	}.bind(this);				
		},
		
		onDispalyCreate: function (evt) {
            // MessageToast.show(evt.getSource().getId() + " Pressed");
            // var oRouter = this.getOwnerComponent().getRouter();
            // oRouter.navTo("CreatePV");
            
            if( this.getView().byId("tableGestionPv").getSelectedItem() ){

				var oTable = this.getView().byId("tableGestionPv").getSelectedItem().getBindingContext().getObject();
			
				var lv_ebeln = oTable.ebeln;
				var lv_ebelp = oTable.ebelp; 
				var lv_txz01 = oTable.txz01;

	            // var oRouter = this.getOwnerComponent().getRouter();
	            // oRouter.navTo("CreatePV");
	            
				this.getRouter().navTo("CreatePV", {
						Ebeln : lv_ebeln ,
						Ebelp: lv_ebelp,
						Txz01 : lv_txz01
					}, true);	            
            
            } else {
				var text = model.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageToast.show(text.getText("PleaseSelectARow"));            	
            }
        },
        
 /* Begin insert DPO REMC03A-68    */   
		/** The hasValue attribute needs to be set because custom filters
			must be handled by the application. When a value is set, the Filters
			button of the SmartFilterBar control should update its counter.
		*/        
		customFieldChange: function(oEvent) {
			var oControl = oEvent.getSource(),
				bHasValue = false;

			if (oControl.getSelectedKeys().length > 0) {
				bHasValue = true;
			}
			oControl.data("hasValue", bHasValue);
		},        
		
        onBeforeRebindTable: function(oEvent) {
        	debugger;
			var mBindingParams = oEvent.getParameter("bindingParams"),
				aSelectedPV = this._oCustomComboBox.getSelectedKey();
				
				if( aSelectedPV == "2"){
					mBindingParams.filters.push( new sap.ui.model.Filter( "pv_number", FilterOperator.EQ, "0" ) );  //Without PV
				}else{
					mBindingParams.filters.push( new sap.ui.model.Filter( "pv_number", FilterOperator.NE, "0" ) );  //WIth PV
				}
				
        }
 /* End insert DPO REMC03A-68    */     
	});
});