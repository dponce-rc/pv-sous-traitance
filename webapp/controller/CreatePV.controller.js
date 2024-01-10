sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"../model/formatter",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Filter, formatter, MessageToast) {
	"use strict";
	
	var lv_ebeln, lv_ebelp;
	
	var lv_sId, lv_text;
	
	var oFieldItems;
	
	return Controller.extend("PP.ZManage_PV.controller.CreatePV", {
		
		formatter: formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf PP.ZManage_PV.view.CreatePV
		 */
		onInit: function () {
			debugger;
			
			this.lv_ebeln = "";
			this.lv_ebelp = "";
			this.lv_txz01 = "";
			
			var BatchPanel = this.getView().byId("BatchPanel");
			
			var PanelItems = BatchPanel.getItems();
			var newPanel = PanelItems[0].clone();
	
			var oFormContainers = newPanel.getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
			var oFormElements   = oFormContainers.getFormElements();
			this.oFieldItems = oFormElements[0].getFields()[0].getItems();
			
			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			oRouters.getRoute("CreatePV").attachPatternMatched(this._onObjectMatched, this);
			
			var oData = { QtyCOLACSupply: 0,
			              QtyCOLACUsed: 0,
			              QtyCOLACNum: 0, 
			              QtyCOLACScrap: 0,
			              QtyCOLACWaste: 0,
			              TotalPercentScrap: 0,
			              TotalPercentWaste: 0,
			              TotalWasteSFPF: 0,
			              TotalScrapSFPF: 0,
			              TotalScrapAC: 0,
			              TotalWasteAC: 0
			};
			
			var CreatePVTotalQtyModel = new JSONModel();
			CreatePVTotalQtyModel.setData(oData);
			this.getView().setModel(CreatePVTotalQtyModel, "CreatePVTotalQtyModel");
			
		},
		
		_onObjectMatched: function (oEvent) {
			debugger;
			// Get parametre from url
			this.lv_ebeln = oEvent.getParameter("arguments").Ebeln;
			this.lv_ebelp = oEvent.getParameter("arguments").Ebelp;

			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PV_SUBCONTRACTOR_SRV");	
			
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("ebeln", sap.ui.model.FilterOperator.EQ, this.lv_ebeln),
					new sap.ui.model.Filter("ebelp", sap.ui.model.FilterOperator.EQ, this.lv_ebelp)
				],
				and: true
			});		
			
			var filter = new Array();
			filter.push(oFilter);

			var oCreatePVModel = new JSONModel();
			var oController = this;

			oModel.read("/ZMANAGE_PV_HEADER", {
				filters: filter,
				success: function (oData, oResponse) {
					debugger;
					oCreatePVModel.setData(oData.results[0]);
					oController.getView().setModel(oCreatePVModel, "CreatePVModel");
				},
				//).bind(this),
				error: function (oError) {
					debugger;
					//	alert("error");
				}
			});	
			
			var here = this;
			oModel.read("/ZCRITICAL_DEFECTCS_PV", {
				// filters: filter,
				success: function (oData, oResponse) {
					debugger;
					
					var BatchPanel = here.getView().byId("BatchPanel");
					var PanelItems = BatchPanel.getItems();	
				    var oFormContainers = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers();
					var oForm = oFormContainers[0].getFormElements()[0];
					var oItems = oForm.getFields()[0].getItems();
					
					if(oItems.length > 4 ){ return; };

					var ndx = 0;
					var oFieldItems = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getItems();
					
					for (let i = 0; i < oFieldItems.length; i++){
						
						
						if( oFieldItems[i].getId().includes("Z0000001") ){
							var CodeGroup = "Z0000001";
						}else if ( oFieldItems[i].getId().includes("Z0000002") ){
							var CodeGroup = "Z0000002";
						}else if( oFieldItems[i].getId().includes("Z0000003") ){
							var CodeGroup = "Z0000003";
						}else if ( oFieldItems[i].getId().includes("Z0000004") ){
							var CodeGroup = "Z0000004";
						}

						var CodeGroupItems = oData.results.filter(row => {
							if( row.codegruppe.includes(CodeGroup) ){
								return row;
							}
						});	
						
						CodeGroupItems.sort((a, b) => {
						  if (a.code < b.code  ) {
						    return -1;
						  }
						  if (a.code > b.code  ) {
						    return 1;
						  }
						  // names must be equal
						  return 0;
						});
					
						for(let l=0; l < CodeGroupItems.length; l++){
							if(l === 0 ){
								oItems[ndx].getItems()[1].getItems()[1].getItems()[1].setValue( CodeGroupItems[l].code);		
								oItems[ndx].getItems()[1].getItems()[2].getItems()[1].setValue( CodeGroupItems[l].kurztext );
								oItems[ndx].getItems()[1].getItems()[3].getItems()[1].setValue( '' );
								oItems[ndx].getItems()[1].getItems()[4].getItems()[1].setValue( '' );

								if( oItems[ndx].getItems()[1].getItems()[5] !== undefined ){
									oItems[ndx].getItems()[1].getItems()[5].getItems()[1].setValue('');
								}

							}else{
								var oFieldLine = oFieldItems[i].clone();
								oFieldLine.getItems()[0].aCustomStyleClasses[0] = 'hidebutton'; 
								
					            oFieldLine.getItems()[1].getItems()[2].getItems()[1].setValue( CodeGroupItems[l].kurztext );    //Defect Type Description
							    oFieldLine.getItems()[1].getItems()[1].getItems()[1].setValue( CodeGroupItems[l].code );        //Defect Code
					            oFieldLine.getItems()[1].getItems()[3].getItems()[1].setValue( '' );    
							    oFieldLine.getItems()[1].getItems()[4].getItems()[1].setValue( '' ); 
								
								if( oFieldLine.getItems()[1].getItems()[5] !== undefined ){
									oFieldLine.getItems()[1].getItems()[5].getItems()[1].setValue( '' );
								}
							    
					            oItems.splice( ndx, 0, oFieldLine);								
							}
							ndx++;
						}
					}
				
		            oForm.getFields()[0].removeAllItems();
		           
		            for(let k = 0; k < oItems.length; k++){
		              
		           	  oForm.getFields()[0].addItem(oItems[k]);
		            }		
		            
		            here.oFieldItems = oItems;  //store to global variable
					 
				},
				//).bind(this),
				error: function (oError) {
					debugger;
					//	alert("error");
				}
			});			
		},
		
		_onAddWaste: function (oEvent) {
			debugger;
           var oForm = oEvent.getSource().getParent().getParent().getParent();
           
           var Id = oEvent.getSource().getId();
           
           for ( let x=0; x < oForm.getFields()[0].getItems().length; x++ ){
           	 if( oForm.getFields()[0].getItems()[x].getItems()[0].getId().includes( Id ) ){
           	 	var ndx = x;				
           	 	break;
           	 }
           }
		   
		   if( Id.includes("Z0000001") ){
				var sId = "Z0000001";
			}else if ( Id.includes("Z0000002") ){
				var sId = "Z0000002";
			}else if( Id.includes("Z0000003") ){
				var sId = "Z0000003";
			}else if ( Id.includes("Z0000004") ){
				var sId = "Z0000004";
			}
							
		   var DefectCodes = oForm.getFields()[0].getItems().filter( element => {
																	//   return element.sId.includes( Id ) } );
																	  return element.sId.includes( sId ) } );
			
           var oFieldItemsCopy = oForm.getFields()[0].getItems()[ndx].clone();
           
           oFieldItemsCopy.getItems()[0].aCustomStyleClasses[0] = 'hidebutton'; //hide button - css style maintain div space
           
           oFieldItemsCopy.getItems()[1].getItems()[3].getItems()[1].setValue(''); //Qty
           oFieldItemsCopy.getItems()[1].getItems()[2].getItems()[1].setValue(''); //Defect Type Description
		   oFieldItemsCopy.getItems()[1].getItems()[1].getItems()[1].setValue(''); //Defect Code

           var oItems = oForm.getFields()[0].getItems();
           //oItems.splice( ndx + 1, 0, oFieldItemsCopy);
           oItems.splice( DefectCodes.length + ndx, 0, oFieldItemsCopy);
          
           oForm.getFields()[0].removeAllItems();
           
           for(let i = 0; i < oItems.length; i++){
           	 oForm.getFields()[0].addItem(oItems[i]);
           }
           
		},
		
		_onAddBatch: function(oEvent) {
			
	    	debugger;
			var BatchPanel = this.getView().byId("BatchPanel");
			
			var PanelItems = BatchPanel.getItems();
			var newPanel = PanelItems[0].clone();
			
			newPanel.getContent()[0].getItems()[0].getItems()[1].setValue(''); //batch
			newPanel.getContent()[0].getItems()[1].getItems()[1].setValue(''); //description
			newPanel.getContent()[0].getItems()[2].getItems()[1].setValue(''); 
			newPanel.getContent()[0].getItems()[3].getItems()[1].setValue(''); 
			newPanel.getContent()[0].getItems()[4].getItems()[1].setValue('');
			newPanel.getContent()[0].getItems()[5].getItems()[1].setValue('');
			newPanel.getContent()[0].getItems()[6].getItems()[1].setValue('');
			
			newPanel.getContent()[2].setProperty("enabled", true);
			
			var oFormContainers = newPanel.getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
			var oFormElements   = oFormContainers.getFormElements();
			var oElements = oFormElements;
			oElements[0].getFields()[0].removeAllItems();
			
			for(var i=0; i < this.oFieldItems.length; i++){
				var oFieldItem = this.oFieldItems[i].clone();     //need to clone again for the new sId

				oFieldItem.getItems()[1].getItems()[3].getItems()[1].setValue(''); //clear qty
				oFieldItem.getItems()[1].getItems()[4].getItems()[1].setValue(''); // clear percentage

				if( oFieldItem.getItems()[1].getItems()[5] !== undefined ){
					oFieldItem.getItems()[1].getItems()[5].getItems()[1].setValue( '' );
				}

				if( oFieldItem.getItems()[1].getItems()[6] !== undefined ){
					oFieldItem.getItems()[1].getItems()[6].getItems()[1].setValue( '' );
				}				

				oElements[0].getFields()[0].addItem(oFieldItem);
			}			
			
			oFormContainers.removeAllFormElements();
			oFormContainers.insertFormElement(oElements[0]);

			this.getView().byId("BatchPanel").addItem(newPanel);
		},
		
		_onDeleteBatch: function(oEvent){

			debugger;

			var SelectedId = oEvent.getSource().getId();

			var BatchPanel = this.getView().byId("BatchPanel");
			var PanelItems = BatchPanel.getItems();		
			
			var BatchIndex = 0;
			for (let i = 0; i < PanelItems.length; i++ ){
				BatchIndex = i;
				if( PanelItems[i].getContent()[2].sId == SelectedId ){
					break;
				}
			}
			
			BatchPanel.removeItem(BatchIndex);
		},
		
		_onNavBack: function () {
			debugger;
			
			var BatchPanel = this.getView().byId("BatchPanel");
			var PanelItems = BatchPanel.getItems();
			
			for (let y=0; y < PanelItems.length; y++ ){
				if(y==0){ continue; };
				this.getView().byId("BatchPanel").removeItem(1);
			}

			var oFormContainers = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
			var oFormElements   = oFormContainers.getFormElements();
			var oElements = oFormElements;
			oElements[0].getFields()[0].removeAllItems();
			
			for(var i=0; i < this.oFieldItems.length; i++){
				this.oFieldItems[i].getItems()[1].getItems()[3].getItems()[1].setValue( '' );    
				this.oFieldItems[i].getItems()[1].getItems()[4].getItems()[1].setValue( '' ); 

				if( this.oFieldItems[i].getItems()[1].getItems()[5] !== undefined ){
					this.oFieldItems[i].getItems()[1].getItems()[5].getItems()[1].setValue( '' );
				}

				oElements[0].getFields()[0].addItem(this.oFieldItems[i]);
			}			
			
			oFormContainers.removeAllFormElements();
			oFormContainers.insertFormElement(oElements[0]);		
			
			// this._getDialogbatch().destroy(); 
			// this._getDialogDefect().destroy();
			
			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			oRouters.navTo("RouteView1", {}, true);
		},
		
		_onSaveData: function () {
			debugger;
			
			var oCreatePVModel = this.getView().getModel("CreatePVModel").getData();
			var oCreatePVTotalQtyModel = this.getView().getModel("CreatePVTotalQtyModel").getData();
			
			var BatchPanel = this.getView().byId("BatchPanel");
			var PanelItems = BatchPanel.getItems();
			
			var BatchItems = [];
			var CodeGroups = [];
			
			for( let i=0; i < PanelItems.length; i++){
				var oContentItems = PanelItems[i].getContent()[0].getItems();
				
				for( let l = 0; l < oContentItems.length; l++ ){
					
					if( oContentItems[l].getItems()[1].getId().includes("BatchIDDesc") ){
						
						var BatchIDDesc = oContentItems[l].getItems()[1].getValue();	
					}else if( oContentItems[l].getItems()[1].getId().includes("BatchID") ){
						
						var BatchID = oContentItems[l].getItems()[1].getValue();
					}else if( oContentItems[l].getItems()[1].getId().includes("QtyCOLACSupply") ){
						
						var QtyCOLACSupply = oContentItems[l].getItems()[1].getValue();
					}else if( oContentItems[l].getItems()[1].getId().includes("QtyCOLACUsed") ){
						
						var QtyCOLACUsed = oContentItems[l].getItems()[1].getValue();
					}else if( oContentItems[l].getItems()[1].getId().includes("QtyCOLACNum") ){
						
						var QtyCOLACNum = oContentItems[l].getItems()[1].getValue();
					}else if( oContentItems[l].getItems()[1].getId().includes("TotalQtyScrap") ){
						
						var TotalQtyScrap = oContentItems[l].getItems()[1].getValue();
					}else if( oContentItems[l].getItems()[1].getId().includes("TotalQtyWaste") ){
						
						var TotalQtyWaste = oContentItems[l].getItems()[1].getValue();
					}
				}

				if( QtyCOLACSupply =='' ){ QtyCOLACSupply = 0; }

				if( QtyCOLACUsed =='' ){ QtyCOLACUsed = 0; }

				if( TotalQtyScrap =='' ){ TotalQtyScrap = 0; }

				if( QtyCOLACNum =='' ){ QtyCOLACNum = 0;}

				if( TotalQtyWaste =='' ){ TotalQtyWaste = 0;}


				BatchItems.push({ batch: BatchID,
				                  ebeln: oCreatePVModel.ebeln,
					              ebelp: oCreatePVModel.ebelp,
					              colac_num_qty: QtyCOLACNum,
					              colac_scrap_qty: TotalQtyScrap,
					              colac_supply_qty: QtyCOLACSupply,
					              colac_used_qty: QtyCOLACUsed,
					              colac_waste_qty: TotalQtyWaste,
					              description: BatchIDDesc });
					              
				var oFormContainers = PanelItems[i].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
				var oFormElements   = oFormContainers.getFormElements();
				var oFieldItems     = oFormElements[0].getFields()[0].getItems();
				
					
				for ( let y=0; y < oFieldItems.length; y++ ){
					var DefectCode = oFieldItems[y].getItems()[1].getItems()[1].getItems()[1].getValue();
					var DefectQty  = oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue();

					if( oFieldItems[y].getItems()[1].getItems()[5] !== undefined ){
						var Assembly   = oFieldItems[y].getItems()[1].getItems()[5].getItems()[1].getValue();
					}
					
					if(DefectCode && DefectQty){
						var BatchID = PanelItems[i].getContent()[0].getItems()[0].getItems()[1].getValue();
						
						if( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getId().includes("Z0000001") ){
							var CodeGrp = "Z0000001";							
						}else if( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getId().includes("Z0000002") ){
							var CodeGrp = "Z0000002";
						}else if( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getId().includes("Z0000003") ){
							var CodeGrp = "Z0000003";
						}else if( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getId().includes("Z0000004") ) {
							var CodeGrp = "Z0000004";
						}
						
						CodeGroups.push({ batch: BatchID,
						                  codedmg: DefectCode,  //damage code
							              codegrp: CodeGrp,    //Code Group
							              fmgeig:  DefectQty,
							              fmgfrd:  DefectQty,
										  bautl:   Assembly });
					}
				}
			};

			if( BatchItems.length === 0 || CodeGroups.length === 0 ){
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("Notif_NoBatchCode");
				MessageToast.show(msg, { duration: 8000 } );
				return;
			}
			
			var C = new JSONModel({
				action:   "C",
				bsart: oCreatePVModel.bsart,
				cup_code: oCreatePVModel.numcup,
				deviceid: oCreatePVModel.deviceid,
				ebeln: oCreatePVModel.ebeln,
				ebelp: oCreatePVModel.ebelp,
				erdat: oCreatePVModel.erdat,
				erdat2: oCreatePVModel.erdat2,
			    lifnum: oCreatePVModel.lifnum,
				matnr: oCreatePVModel.matnr,
				meins: oCreatePVModel.meins,
				mgein: oCreatePVModel.mgein,
				numcup: oCreatePVModel.numcup,
				qmnum:  oCreatePVModel.qmnum,
				refnum: oCreatePVModel.refnum,
				sfcode: oCreatePVModel.sfcode,
				txz01: oCreatePVModel.txz01,
				zzvolu: oCreatePVModel.zzvolu,
				hdr_txt: oCreatePVModel.hdr_txt,
				to_batch_items: BatchItems,
				to_codegroup: CodeGroups
			});
			
			var y = {};
			y = JSON.parse(JSON.stringify(C.oData));
			var x = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PV_SUBCONTRACTOR_SRV");
			debugger;
			var here = this;
			var flag = "";
			x.create("/ZMANAGE_PV_HEADER", y, {
				success: function (e, t) {
					debugger;
					
					if(e.qmnum){
						var msg = "Notification "  + e.qmnum + " has been created";
						MessageToast.show(msg);
					}else {
						var msg = "Error";
						MessageToast.show(msg);
					}

					var oRouters = sap.ui.core.UIComponent.getRouterFor(here);
					oRouters.navTo("RouteView1", {}, true);

					// MessageToast.show(t.data.Message);
					// var text = "ordre a été sauvegardé avec le numéro"
					// if (t.data.Message.includes(text)) {
					// 	here.flag = "X";
					// }
				},
				error: function (e) {
					debugger;
					MessageToast.show(e.message)
				}
			})
			
		},
		
		onValueHelpBatch: function (oEvent){
			debugger;
			this.lv_sId = oEvent.getSource().getId();
			this.lv_text = oEvent.getSource().getId().replace("BatchID", "BatchIDDesc");
			
			this._getDialogbatch().open();
		},
		
		_getDialogbatch: function () {
			if (!this.dialog_batch) {
				this.dialog_batch = sap.ui.xmlfragment("PP.ZManage_PV.view.Fragment.BatchSh", this);
				this.getView().addDependent(this.dialog_batch)
			}
			return this.dialog_batch;
		},
		
		closeDialogBatch: function () {
			this._getDialogbatch().close()
		},

		onSave_Batch: function (oEvent) {
			debugger;
			var e = sap.ui.getCore().byId("table_Batch").getSelectedItem().getBindingContext().getObject();
			var c = e.Code;
			var t = e.Text;
			
			this.getView().byId( this.lv_sId ).setValue(c);
			this.getView().byId( this.lv_text ).setValue(t);
	
			this._getDialogbatch().close();
		},
		
		onValueHelpDefect: function(oEvent){
			debugger;
			this.lv_sId = oEvent.getSource().getId();
			this.lv_text = oEvent.getSource().getId().replace("DefectID", "DefectIDDesc");
				
			this._getDialogDefect().open();
		},
		
		_getDialogDefect: function(){ // Create Dialog

			if (!this.dialog_defect) {  
				this.dialog_defect = sap.ui.xmlfragment("PP.ZManage_PV.view.Fragment.DefectSh", this);
				this.getView().addDependent(this.dialog_defect);
				
				debugger;
			}else{
				var oTable = sap.ui.getCore().byId("smartTable_Defect");
				
				if(oTable){
					oTable.rebindTable(); //re-trigger onBeforeRebindTableDefect function
				}				
			}
			return this.dialog_defect;			
		},

		closeDialogDefect: function () {
	
			this._getDialogDefect().close();
		},
		
		// dialogAfterclose: function () {
		// 	debugger;
		// 	// this.dialog_defect.destroy = undefined;
		// },
		


		onSave_Defect : function (oEvent) {
			debugger;
			var e = sap.ui.getCore().byId("table_Defect").getSelectedItem().getBindingContext().getObject();
			
			this.getView().byId( this.lv_sId ).setValue(e.Code);
			this.getView().byId( this.lv_text ).setValue(e.Text);
	
			this._getDialogDefect().close();
		},

		onValueHelpComponent: function(oEvent){
			debugger;
			this.lv_sId = oEvent.getSource().getId();
			this.lv_text = oEvent.getSource().getId().replace("DefectID", "DefectIDDesc");
				
			this._getDialogComponent().open();			
		},
		
		_getDialogComponent: function(){
			if (!this.dialog_component) {  
				this.dialog_component = sap.ui.xmlfragment("PP.ZManage_PV.view.Fragment.ComponentSh", this);
				this.getView().addDependent(this.dialog_component);
				
				debugger;
			}else{
				var oTable = sap.ui.getCore().byId("smartTable_Component");
				
				if(oTable){
					oTable.rebindTable(); //re-trigger onBeforeRebindTableComponent function
				}				
			}
			return this.dialog_component;				
		},

		onSave_Component : function (oEvent) {
			debugger;
			var e = sap.ui.getCore().byId("table_Component").getSelectedItem().getBindingContext().getObject();
			
			this.getView().byId( this.lv_sId ).setValue(e.Component);
	
			this._getDialogComponent().close();
		},
		
		closeDialogComponent: function () {
	
			this._getDialogComponent().close();
		},		
		
		onBeforeRebindTableDefect : function(oEvent){
			debugger;
			
			let value1 = "";
			
			if(this.lv_sId.includes("Z0000001")){
				value1 = "Z0000001";
			}else if(this.lv_sId.includes("Z0000002")){
				value1 = "Z0000002";
			}else if(this.lv_sId.includes("Z0000003")){
				value1 = "Z0000003";
			}else if(this.lv_sId.includes("Z0000004")){
				value1 = "Z0000004";
			}
			
			var oFilter = new Filter({
				path: "Codegruppe",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: value1
			});
			
			oEvent.getParameter("bindingParams").filters.push(oFilter);
		},
		
		onBeforeRebindTableComponent : function(oEvent){
			debugger;

			var oCreatePVModel = this.getView().getModel("CreatePVModel").getData();
			var lv_ebeln =  oCreatePVModel.ebeln; 
			var lv_ebelp =  oCreatePVModel.ebelp;	 
			
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("PurchaseOrder", sap.ui.model.FilterOperator.EQ, lv_ebeln),
					new sap.ui.model.Filter("PurchaseOrderItem", sap.ui.model.FilterOperator.EQ, lv_ebelp)
				],
				and: true
			});		
			
			// var filter = new Array();
			// filter.push(oFilter);
			
			oEvent.getParameter("bindingParams").filters.push(oFilter);			
		},
		
		handleDatePickerChange: function (oEvent){
			// Format date to remove UTC issue
			var oDatePicker = oEvent.getSource();
			var oBinding = oDatePicker.getBinding("dateValue");
			var oNewDate = oDatePicker.getDateValue();
			if (oNewDate) {
				var sPath = oBinding.getContext().getPath() + "/" + oBinding.getPath();
				var oFormatDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-ddTKK:mm:ss"
				});
				oBinding.getModel().setProperty(sPath, new Date(oFormatDate.format(oNewDate)));
			}			
		},
		
		onLiveChange: function (oEvent){
			debugger;
			
			var GroupCode;
			
			var Source = oEvent.getSource();
			var SourceId = Source.sId;
			
			if( SourceId.includes("Z0000001") ){
				GroupCode = "Z0000001";
				
			}else if( SourceId.includes("Z0000002") ){
				GroupCode = "Z0000002";
				
			}else if( SourceId.includes("Z0000003") ){
				GroupCode = "Z0000003";
				
			}else if( SourceId.includes("Z0000004") ){
				GroupCode = "Z0000004";
			}
			
			var PanelId = Source.getEventingParent().getEventingParent().getEventingParent().getEventingParent().getEventingParent().getEventingParent().getEventingParent().getEventingParent().getEventingParent().getEventingParent();
			
			var BatchPanel = this.getView().byId("BatchPanel");
			var PanelItems = BatchPanel.getItems();
			
			var SelectedPanel = PanelItems.filter(element => {
							  return element.sId == PanelId.sId;
							});
	
			var oFormContainers = SelectedPanel[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
			var oFormElements = oFormContainers.getFormElements();
			var oFieldItems = oFormElements[0].getFields()[0].getItems();			
			
			var SelectedFields = oFieldItems.filter(row => {
				if( row.sId.includes(GroupCode) ){
					return row;
				}
			});
			
			var TotalQty = 0;
			var PercentageId;
			var Qty = 0;
			
			for (let x=0; x < SelectedFields.length; x++){ //compute total qty per code group
				debugger;
				
				if(SelectedFields[x].getItems()[1].getItems()[3].getItems()[1].getValue() !== '' ){
					TotalQty += parseInt( SelectedFields[x].getItems()[1].getItems()[3].getItems()[1].getValue() );					
				}
			}
			
			for (let i=0; i < SelectedFields.length; i++ ){
				Qty = SelectedFields[i].getItems()[1].getItems()[3].getItems()[1].getValue();
				
				var PercentageVal =  Math.round( ( Qty / TotalQty ) * 100 );
				
				SelectedFields[i].getItems()[1].getItems()[4].getItems()[1].setValue(PercentageVal)
			}
			
			var TotalQtyScrap = 0;
			var TotalQtyWaste = 0;
			
			for(let y=0; y < oFieldItems.length; y++ ){
				
				if( oFieldItems[y].getId().includes("Z0000001") || oFieldItems[y].getId().includes("Z0000003")  ) {  //scrap
					
					if( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() !== '' ){
						
						TotalQtyScrap += parseInt( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() );						
					}
				}else if( oFieldItems[y].getId().includes("Z0000002") || oFieldItems[y].getId().includes("Z0000004") ){ //waste
					
					if( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() !== '' ){
						
						TotalQtyWaste += parseInt( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() );						
					}
				}
			}
			
			SelectedPanel[0].getContent()[0].getItems()[5].getItems()[1].setValue(TotalQtyScrap); //Set Value total Qty of Scrap per batch
 			SelectedPanel[0].getContent()[0].getItems()[6].getItems()[1].setValue(TotalQtyWaste); //Set Value total Qty of Waste per batch
			
			
			//Compute Quantities for all batches 			
 			var TotalQtyScrapBatch = 0;
 			var TotalQtyWasteBatch = 0;

			var TotalScrapSFPF = 0;
			var TotalWasteSFPF = 0;
			var TotalScrapAC = 0;
			var TotalWasteAC = 0;
			
 			//Get total qty f Scrap and waste for all batches
 			for ( let l=0; l < PanelItems.length; l++ ){
 				if ( PanelItems[l].getContent()[0].getItems()[5].getItems()[1].getValue() !== '' ){
					TotalQtyScrapBatch += parseInt( PanelItems[l].getContent()[0].getItems()[5].getItems()[1].getValue() ); //Total qty per batch Scrap 					
 				}
 				
 				if ( PanelItems[l].getContent()[0].getItems()[6].getItems()[1].getValue() !== ''  ){
					TotalQtyWasteBatch += parseInt( PanelItems[l].getContent()[0].getItems()[6].getItems()[1].getValue() ); //Total qty per batch Waste 					
 				}
 				
				var oFormContainers = PanelItems[l].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
				var oFormElements = oFormContainers.getFormElements();
				var oFieldItems = oFormElements[0].getFields()[0].getItems();
				
				for ( let y=0; y < oFieldItems.length; y++){
					
					if(oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() !== '') { 
						if(oFieldItems[y].getId().includes("Z0000001") ){
							TotalScrapSFPF += parseInt( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() );
						}else if(oFieldItems[y].getId().includes("Z0000002") ){
							TotalWasteSFPF += parseInt( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() );
						}else if(oFieldItems[y].getId().includes("Z0000003") ){
							TotalScrapAC += parseInt( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() );
						}else if(oFieldItems[y].getId().includes("Z0000004")){
							TotalWasteAC += parseInt( oFieldItems[y].getItems()[1].getItems()[3].getItems()[1].getValue() );
						}						
					};
				}
 			}
 			
 			var CreatePVTotalQtyModel = this.getView().getModel("CreatePVTotalQtyModel");
 			var CreatePVTotalQtyData = CreatePVTotalQtyModel.getData();

			CreatePVTotalQtyData.TotalScrapSFPF = TotalScrapSFPF;
			CreatePVTotalQtyData.TotalWasteSFPF = TotalWasteSFPF;
			CreatePVTotalQtyData.TotalScrapAC = TotalScrapAC;
			CreatePVTotalQtyData.TotalWasteAC = TotalWasteAC;
				
 			CreatePVTotalQtyData.QtyCOLACScrap = TotalQtyScrapBatch;
 			CreatePVTotalQtyData.QtyCOLACWaste = TotalQtyWasteBatch;
 			
 			var TotalPercentScrap = 0;
 			var TotalPercentWaste = 0;
 			
 			if (CreatePVTotalQtyData.QtyCOLACScrap && CreatePVTotalQtyData.QtyCOLACSupply ) { 
 				var TotalPercentScrap =  Math.round( ( CreatePVTotalQtyData.QtyCOLACScrap/ CreatePVTotalQtyData.QtyCOLACSupply ) * 100 );
 				CreatePVTotalQtyData.TotalPercentScrap = TotalPercentScrap;
 			}
 			
			if (CreatePVTotalQtyData.QtyCOLACWaste && CreatePVTotalQtyData.QtyCOLACSupply ) { 
 				var TotalPercentWaste =  Math.round( ( CreatePVTotalQtyData.QtyCOLACWaste/ CreatePVTotalQtyData.QtyCOLACSupply ) * 100 );
 				CreatePVTotalQtyData.TotalPercentWaste = TotalPercentWaste;
 			}
 			
			CreatePVTotalQtyModel.setData(CreatePVTotalQtyData);
			this.getView().setModel(CreatePVTotalQtyModel, "CreatePVTotalQtyModel"); 			
		},
		
		onLiveChangeBatch: function(oEvent){
			debugger;
			
			var BatchPanel = this.getView().byId("BatchPanel");
			var PanelItems = BatchPanel.getItems(); 		
			
			var TotalQtyCOLACSupply = 0;
			var TotalQtyCOLACUsed = 0;
			var TotalQtyCOLACNum  = 0;
			
			for ( let i=0; i < PanelItems.length; i++ ){
				debugger;
				
				if( PanelItems[i].getContent()[0].getItems()[2].getItems()[1].getValue() !== '' ){
					TotalQtyCOLACSupply += parseInt( PanelItems[i].getContent()[0].getItems()[2].getItems()[1].getValue() );					
				}
				
				if ( PanelItems[i].getContent()[0].getItems()[3].getItems()[1].getValue() !== '' ) {
					TotalQtyCOLACUsed += parseInt( PanelItems[i].getContent()[0].getItems()[3].getItems()[1].getValue() );					
				}
				
				if( PanelItems[i].getContent()[0].getItems()[4].getItems()[1].getValue() !== '' ){
					TotalQtyCOLACNum += parseInt( PanelItems[i].getContent()[0].getItems()[4].getItems()[1].getValue() );					
				}
			}
			
			var CreatePVTotalQtyModel = this.getView().getModel("CreatePVTotalQtyModel");
 			var CreatePVTotalQtyData = CreatePVTotalQtyModel.getData();
 			
 			CreatePVTotalQtyData.QtyCOLACSupply = TotalQtyCOLACSupply;
 			CreatePVTotalQtyData.QtyCOLACUsed =  TotalQtyCOLACUsed;               
 			CreatePVTotalQtyData.QtyCOLACNum = TotalQtyCOLACNum;    
 
  			var TotalPercentScrap = 0;
 			var TotalPercentWaste = 0;
 			
 			if(CreatePVTotalQtyData.QtyCOLACScrap && CreatePVTotalQtyData.QtyCOLACSupply){
 				var TotalPercentScrap =  Math.round( ( CreatePVTotalQtyData.QtyCOLACScrap / CreatePVTotalQtyData.QtyCOLACSupply ) * 100 );
 				CreatePVTotalQtyData.TotalPercentScrap = TotalPercentScrap; 			
 			}
 
  			if(CreatePVTotalQtyData.QtyCOLACWaste && CreatePVTotalQtyData.QtyCOLACSupply){
 				var TotalPercentWaste =  Math.round( ( CreatePVTotalQtyData.QtyCOLACWaste / CreatePVTotalQtyData.QtyCOLACSupply ) * 100 );
 				CreatePVTotalQtyData.TotalPercentWaste = TotalPercentWaste; 			
 			}
 			
			CreatePVTotalQtyModel.setData(CreatePVTotalQtyData);
			this.getView().setModel(CreatePVTotalQtyModel, "CreatePVTotalQtyModel");  			
		}

		// BatchDialogAfterClose: function(){
		// 	debugger;
		//     var oView = this.getView()
		//     var oDialog = oView.byId('BatchSearchHelpDialog');
		
		//     //clear dialog Data
		//     var oDialogData = oDialog.getModel('dialog').getData();
		//     Object.getOwnPropertyNames(oDialogData).forEach(function(d) {
		//          oDialogData[d] = null;
		//      });
		
		//   dialogModel.setData(oDialogData);
		//   oDialog.close();
		//   oDialog.destroy();			
		// },


		// DefectDialogAfterClose: function(){
		// 	debugger;
		//     var oView = this.getView()
		//     var oDialog = oView.byId('DefectSearchHelpDialog');
		
		//     //clear dialog Data
		//     var oDialogData = oDialog.getModel('dialog').getData();
		//     Object.getOwnPropertyNames(oDialogData).forEach(function(d) {
		//          oDialogData[d] = null;
		//      });
		
		//   dialogModel.setData(oDialogData);
		//   oDialog.close();
		//   oDialog.destroy();			
		// },		
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