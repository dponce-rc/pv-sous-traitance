sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller"
], function (BaseController, Controller) {
	"use strict";

	return BaseController.extend("PP.ZManage_PV.controller.View1", {
		onInit: function () {
		debugger;
		},
		handleSelectionChange: function() {
			var oTable = this.getView().byId("tableGestionPv").getSelectedItem().getBindingContext().getObject();
			var lv_ebeln = oTable.ebeln;
			var lv_ebelp = oTable.ebelp;

		this.getRouter().navTo("DisplayPV", {
				Ebeln : lv_ebeln ,
				Ebelp: lv_ebelp
			}, true);
			var table = this.getView().byId("tableGestionPv");
            table.removeSelections(true);
		},
		onDispalyCreate: function (evt) {
            // MessageToast.show(evt.getSource().getId() + " Pressed");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("CreatePV");
        }
	});
});