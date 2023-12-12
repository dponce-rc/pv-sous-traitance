sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Controller, JSONModel) {
	"use strict";
	// Declare globale variable
	var lv_ebeln, lb_ebelp;

	return BaseController.extend("PP.ZManage_PV.controller.DisplayPV", {

		onInit: function () {
			debugger;

			// Init data 
			this.lv_ebeln = "";
			this.lv_ebelp = "";

			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			oRouters.getRoute("DisplayPV").attachPatternMatched(this._onObjectMatched, this);

		},

		_onNavBack: function () {
			debugger;
			this.getRouter().navTo("RouteView1", {}, true);
		},

		_onObjectMatched: function (oEvent) {
			debugger;
			// Get parametre from url
			this.lv_ebeln = oEvent.getParameter("arguments").Ebeln;
			this.lv_ebelp = oEvent.getParameter("arguments").Ebelp;

			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PV_SUBCONTRACTOR_SRV");

			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, this.lv_ebeln),
					new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, this.lv_ebelp)
				],
				and: true
			});

			var filter = new Array();
			filter.push(oFilter);

			var oModelPVList = new JSONModel();
			var oController = this;

			oModel.read("/ZItems_PVSet", {
				filters: filter,
				success: function (oData, oResponse) {
					debugger;
					oModelPVList.setData(oData);
					oController.getView().setModel(oModelPVList, "oModelPVList");
				},
				//).bind(this),
				error: function (oError) {
					debugger;
					//	alert("error");
				}
			});
		},
		onSelectionChange: function (event) {
			debugger;
			// Get the selected item
			var selectedItem = event.getParameter("listItem");
			// Get the router instance
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// Navigate to the target page passing any necessary parameters
			
			//oRouter.navTo("Update", {}, true);
			
			var lv_qmnum = selectedItem.getTitle();
			oRouter.navTo("Update", {
					Qmnum : lv_qmnum 
				}, true
			);			
			
		}, 
		test: function() {
			
		}

	});

});