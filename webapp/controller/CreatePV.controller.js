sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("PP.ZManage_PV.controller.CreatePV", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf PP.ZManage_PV.view.CreatePV
		 */
		onInit: function () {
			debugger;
			
			var oButton = new sap.m.Button({ text: "Hello World!", press: "_onAddSFPF" })
			var oLabel1 = new sap.m.Label({ text: "F-SF-01"});
			var oInput1 = new sap.m.Input({ "value": "", "type": "Number"});
			var oLabel2 = new sap.m.Label({ text: "%Scrap"});
			var oInput2 = new sap.m.Input({ "value": "", "type": "Number"});
			var fields  = [];
			
			fields.push(oButton);
			fields.push(oLabel1);
			fields.push(oInput1);
			fields.push(oLabel2);
			fields.push(oInput2);			

            var oData = { Qty1: "12",
					      Qty2: "23",
					      Qty3: "45",
					      Qty4: "56",
					      Qty5: "69",
					      TotalScrap: "100",
					      TotalWaste: "100",
					      TotalWasteSFPF: "75",
					      TotalScrapSFPF: "80",
					      TotalScrapAC: "80",
					      TotalWasteAC: "75",
					      BatchFlag: true,
					      BatchValue: "BATCH01",
					      COLACSupplyQty: "200",
					      COLACUsedQty:"200",
					      COLACnumber: "200",
					      COLACscrap: "200",
					      COLACwaste: "200",
					      fieldinput: []
				};				
				
				
		    oData.fieldinput.push(fields);
		    var CreatePVModel = new JSONModel();
			CreatePVModel.setData(oData);
			this.getView().setModel(CreatePVModel, "CreatePVModel");
			

			//this.getOwnerComponent().getModel("CreatePVModel").setData(oData);
		},
		
		_onAddSFPF: function (oEvent) {
			debugger;
           var oForm = oEvent.getSource().getParent().getParent().getParent();
           var oLength = oForm.getFormElements().length;
           var oSubjectElement = this.getView().byId("FieldInputElement");
           var oSubjectElementCopy = oSubjectElement.clone();
           var oFields = oSubjectElementCopy.getFields()[0];
           
           //items[0] <- index 0 - button
           oFields.mAggregations.items[0].setProperty("visible", false); //hide button in succeeding input fields
           
           var oInputFields = oFields.mAggregations.items[1].getItems();
           
           oForm.insertFormElement(oSubjectElementCopy, oLength + 1);			
		},
		
		_onNavBack: function () {
			debugger;
			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			oRouters.navTo("RouteView1", {}, true);
		},
		
		_onSaveData: function () {
			debugger;
			
			//var oCreatePVModel = this.getOwnerComponent().getModel("CreatePVModel");///.setProperty("Qty1", "99");
			
			var oCreatePVModel = this.getView().getModel("CreatePVModel").getData();
			
			
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf PP.ZManage_PV.view.CreatePV
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf PP.ZManage_PV.view.CreatePV
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf PP.ZManage_PV.view.CreatePV
		 */
		//	onExit: function() {
		//
		//	}

	});

});