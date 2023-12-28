sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/ui/model/FilterType",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, formatter, MessageToast, FilterType, FilterOperator) {
	"use strict";

	function RemoveDuplicatesBy(arr, key) {
		return [...new Map(arr.map(item => [item[key], item])).values()]
	}

	var lv_qmnum;
	var oFieldItems;
	var oPanelItems = [];
	
	return Controller.extend("PP.ZManage_PV.controller.Update", {
		
		formatter: formatter,		

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf PP.ZManage_PV.view.Update
		 */
		onInit: function () {
			debugger;
			this.lv_qmnum = "";

			var BatchPanel = this.getView().byId("BatchPanel");
			var PanelItems = BatchPanel.getItems();
			this.oPanelItems = PanelItems;
			var newPanel = PanelItems[0].clone();
	
			var oFormContainers = newPanel.getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
			var oFormElements   = oFormContainers.getFormElements();
			this.oFieldItems = oFormElements[0].getFields()[0].getItems();

			var a = this.getView().byId("UploadCollection");
			a.setUploadUrl("/sap/opu/odata/sap/ZPRJ_GESTION_OT_SRV/FileSet");
			var s = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PV_SUBCONTRACTOR_SRV", false);
			this.getView().setModel(s)

			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			oRouters.getRoute("Update").attachPatternMatched(this._onObjectMatched, this);
			
		},
		
		_onObjectMatched: function (oEvent) {
			debugger;

			this.lv_qmnum = oEvent.getParameter("arguments").Qmnum;	

			var UploadCollection = this.getView().byId("UploadCollection");
			var FileItems = UploadCollection.getBinding("items");
			var Filters = [];
			Filters.push(new Filter("Ordre", FilterOperator.EQ, this.lv_qmnum));
			FileItems.filter(Filters, FilterType.Application);

			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PV_SUBCONTRACTOR_SRV");	

			var here = this;
			oModel.read("/ZCRITICAL_DEFECTCS_PV", {
				success: function (oData, oResponse) {
					debugger;
					
					var BatchPanel = here.getView().byId("BatchPanel");
					var PanelItems = BatchPanel.getItems();	
				    var oFormContainers = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers();
					var oForm = oFormContainers[0].getFormElements()[0];
					var oItems = oForm.getFields()[0].getItems();
					
					var ndx = 0;
					var oFieldItems = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getItems();
					
					if( oItems.length > 4 ){
						return;
					}
					
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
							}else{
								var oFieldLine = oFieldItems[i].clone();
								oFieldLine.getItems()[0].aCustomStyleClasses[0] = 'hidebutton'; 
								
					            oFieldLine.getItems()[1].getItems()[2].getItems()[1].setValue( CodeGroupItems[l].kurztext );    //Defect Type Description
							    oFieldLine.getItems()[1].getItems()[1].getItems()[1].setValue( CodeGroupItems[l].code );     //Defect Code
							    
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
			
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("qmnum", sap.ui.model.FilterOperator.EQ, this.lv_qmnum)
				],
				and: true
			});		
			
			var filter = new Array();
			filter.push(oFilter);

			var oCreatePVModel = new JSONModel();
			var oCreatePVModelTotalQty = new JSONModel();
			var oController = this;

			oModel.read("/ZMANAGE_PV_HEADER", {
				urlParameters: {
					"$expand": "to_batch_items,to_codegroup",
				},				
				filters: filter,
				success: function (oData, oResponse) {
					debugger;
					oCreatePVModel.setData(oData.results[0]);
					oController.getView().setModel(oCreatePVModel, "CreatePVModel");

					var BatchItems = RemoveDuplicatesBy( oData.results[0].to_batch_items.results, "batch" );
					// var BatchItems  = oData.results[0].to_batch_items.results;

					var DefectCodes = oData.results[0].to_codegroup.results;

					var BatchPanel = oController.getView().byId("BatchPanel");
					var PanelItems = BatchPanel.getItems();	
					
					PanelItems[0].getContent()[2].setProperty("enabled", false); //Disable Delete Batch button on the first Batch Item

					if( BatchItems.length > 1 ){
						for ( var i=0; i < BatchItems.length; i++ ){
							if( i == 0 ){
								PanelItems[0].getContent()[0].getItems()[0].getItems()[1].setValue(BatchItems[i].batch );            //batch
								PanelItems[0].getContent()[0].getItems()[1].getItems()[1].setValue(BatchItems[i].description );      //description
								PanelItems[0].getContent()[0].getItems()[2].getItems()[1].setValue(BatchItems[i].colac_supply_qty);  //Qty COL or AC Supply  
								PanelItems[0].getContent()[0].getItems()[3].getItems()[1].setValue(BatchItems[i].colac_used_qty);    //Qty COL or AC Used
								PanelItems[0].getContent()[0].getItems()[4].getItems()[1].setValue(BatchItems[i].colac_num_qty);     //Qty COL or AC Numbers
								PanelItems[0].getContent()[0].getItems()[5].getItems()[1].setValue(BatchItems[i].colac_scrap_qty);   //Qty COL or AC Scrap
								PanelItems[0].getContent()[0].getItems()[6].getItems()[1].setValue(BatchItems[i].colac_waste_qty);   //Qty COL or AC Waste								
							}else{
								var newPanel = PanelItems[0].clone();

								newPanel.getContent()[0].getItems()[0].getItems()[1].setValue(BatchItems[i].batch );            //batch
								newPanel.getContent()[0].getItems()[1].getItems()[1].setValue(BatchItems[i].description );      //description
								newPanel.getContent()[0].getItems()[2].getItems()[1].setValue(BatchItems[i].colac_supply_qty);  //Qty COL or AC Supply  
								newPanel.getContent()[0].getItems()[3].getItems()[1].setValue(BatchItems[i].colac_used_qty);    //Qty COL or AC Used
								newPanel.getContent()[0].getItems()[4].getItems()[1].setValue(BatchItems[i].colac_num_qty);     //Qty COL or AC Numbers
								newPanel.getContent()[0].getItems()[5].getItems()[1].setValue(BatchItems[i].colac_scrap_qty);   //Qty COL or AC Scrap
								newPanel.getContent()[0].getItems()[6].getItems()[1].setValue(BatchItems[i].colac_waste_qty);   //Qty COL or AC Waste	
					
								oController.getView().byId("BatchPanel").addItem(newPanel);								
							}
						}						
					}else{
						PanelItems[0].getContent()[0].getItems()[0].getItems()[1].setValue(BatchItems[0].batch );            //batch
						PanelItems[0].getContent()[0].getItems()[1].getItems()[1].setValue(BatchItems[0].description );      //description
						PanelItems[0].getContent()[0].getItems()[2].getItems()[1].setValue(BatchItems[0].colac_supply_qty);  //Qty COL or AC Supply  
						PanelItems[0].getContent()[0].getItems()[3].getItems()[1].setValue(BatchItems[0].colac_used_qty);    //Qty COL or AC Used
						PanelItems[0].getContent()[0].getItems()[4].getItems()[1].setValue(BatchItems[0].colac_num_qty);     //Qty COL or AC Numbers
						PanelItems[0].getContent()[0].getItems()[5].getItems()[1].setValue(BatchItems[0].colac_scrap_qty);   //Qty COL or AC Scrap
						PanelItems[0].getContent()[0].getItems()[6].getItems()[1].setValue(BatchItems[0].colac_waste_qty);   //Qty COL or AC Waste						
					}	
					
					var TotalQtyCOLACSupply = 0;
					var TotalQtyCOLACUsed = 0;
					var TotalQtyCOLACNum  = 0;
					
		 			var TotalQtyScrapBatch = 0;
		 			var TotalQtyWasteBatch = 0;
 			
					var TotalScrapSFPF = 0;
					var TotalWasteSFPF = 0;
					var TotalScrapAC = 0;
					var TotalWasteAC = 0;					

					var PanelItems = BatchPanel.getItems();	

					for (var i=0; i < PanelItems.length; i++){
						
						var oFormContainers = BatchPanel.getItems()[i].getContent()[1].getContent()[0].getItems()[0].getFormContainers();
						var oForm = oFormContainers[0].getFormElements()[0];
						var oItems = oForm.getFields()[0].getItems();
					
						//filter by batch
						var CodeGroups = DefectCodes.filter(element => {
										  return element.batch == PanelItems[i].getContent()[0].getItems()[0].getItems()[1].getValue();
									});	
						debugger;
						
						// var ndx = 0;
						// var oFieldItems = PanelItems[i].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getItems();
						
						var TotalQtyScrap = 0;
						var TotalQtyWaste = 0;
						
						var TotalLines = 0;
						
						var DefectGroup = ['Z0000001','Z0000002','Z0000003', 'Z0000004'];
							
						for(let l=0; l < DefectGroup.length; l++){

							//filter by CodeGroup
							var CodeGroupItems = CodeGroups.filter(row => {
								if( row.codegrp.includes(DefectGroup[l]) ){
									return row;
								}
							});	
							
							if(CodeGroupItems.length === 0){
								continue;
							}
							
							var TotalQty = 0;
							
							for ( var k=0; k < CodeGroupItems.length; k++ ){
								
								for( var j=0; j < oItems.length; j++ ){  //map quantities to dfault critical defects
									
									var default_defect = '';
									
									if( oItems[j].getId().includes( DefectGroup[l] ) && 
									    oItems[j].getItems()[1].getItems()[1].getItems()[1].getValue() === CodeGroupItems[k].codedmg  ){
										
										TotalQty += parseInt( CodeGroupItems[k].defect_qty );
											
										oItems[j].getItems()[1].getItems()[3].getItems()[1].setValue( CodeGroupItems[k].defect_qty );

										if( oItems[j].getItems()[1].getItems()[5] !== undefined ){
											oItems[j].getItems()[1].getItems()[5].getItems()[1].setValue( CodeGroupItems[k].bautl );
										}

										default_defect = 'X';
										break;
									}else{
										continue;
									}
								}
								
								if( default_defect === ''){
									TotalQty += parseInt( CodeGroupItems[k].defect_qty );
									
									switch (  DefectGroup[l] ){
										case "Z0000001":
											TotalLines = parseInt( oItems.filter( element => { return element.sId.includes( "Z0000001" ) } ).length );
											break;
										case "Z0000002":
											TotalLines = parseInt( oItems.filter( element => { return element.sId.includes( "Z0000001" ) } ).length ) + 
										            	 parseInt( oItems.filter( element => { return element.sId.includes( "Z0000002" ) } ).length );
										    break;
										case "Z0000003":
											TotalLines = parseInt( oItems.filter( element => { return element.sId.includes( "Z0000001" ) } ).length ) + 
											             parseInt( oItems.filter( element => { return element.sId.includes( "Z0000002" ) } ).length ) +		
											             parseInt( oItems.filter( element => { return element.sId.includes( "Z0000003" ) } ).length );	
											break;
										case "Z0000004":
											TotalLines = parseInt( oItems.filter( element => { return element.sId.includes( "Z0000001" ) } ).length ) + 
											             parseInt( oItems.filter( element => { return element.sId.includes( "Z0000002" ) } ).length ) +		
											             parseInt( oItems.filter( element => { return element.sId.includes( "Z0000003" ) } ).length ) +			
											             parseInt( oItems.filter( element => { return element.sId.includes( "Z0000004" ) } ).length );		
											 break;
									}
									
									var oFieldLine = oItems[TotalLines - 1].clone();
									oFieldLine.getItems()[0].aCustomStyleClasses[0] = 'hidebutton';	
									
						            oFieldLine.getItems()[1].getItems()[3].getItems()[1].setValue( CodeGroupItems[k].defect_qty );  //Qty
						            oFieldLine.getItems()[1].getItems()[2].getItems()[1].setValue( CodeGroupItems[k].shortext );    //Defect Type Description
								    oFieldLine.getItems()[1].getItems()[1].getItems()[1].setValue( CodeGroupItems[k].codedmg );     //Defect Code								
								  
	        						oItems.splice( TotalLines, 0, oFieldLine); 					
								}
								
								default_defect = '';

										
								if( DefectGroup[l] == "Z0000001" || DefectGroup[l] == "Z0000003" ){
									TotalQtyScrap += parseInt( CodeGroupItems[k].defect_qty ); // total Qty of Scrap per batch
								
									if( DefectGroup[l] == "Z0000001" ){ // Scrap SF / PF
										TotalScrapSFPF += parseInt( CodeGroupItems[k].defect_qty ); // Total Scrap SF PF of all Batches
									}else { // Scrap AC
										TotalScrapAC += parseInt( CodeGroupItems[k].defect_qty );  // Total Scrap AC of all Batches
									}
								}else if( DefectGroup[l] == "Z0000002" || DefectGroup[l] == "Z0000004" ){
									TotalQtyWaste += parseInt( CodeGroupItems[k].defect_qty ); // total Qty of waste per batch
									
									if( DefectGroup[l] == "Z0000002" ){ // Waste SF / PF
										TotalWasteSFPF += parseInt( CodeGroupItems[k].defect_qty ); //Total Waste SF PF of all Batches
									}else { // Wastep AC
										TotalWasteAC += parseInt( CodeGroupItems[k].defect_qty );   //Total Waste AC of all Batches
									}									
								}								
							}
							
				            debugger;
				            var Qty = 0;
				            for ( let x=0 ; x < oItems.length; x++ ){
				            	
				            	if( oItems[x].getItems()[1].getItems()[3].getItems()[1].getId().includes( DefectGroup[l] ) &&
				            	    oItems[x].getItems()[1].getItems()[3].getItems()[1].getValue() ){
									Qty = oItems[x].getItems()[1].getItems()[3].getItems()[1].getValue();
									var PercentageVal =  Math.round( ( Qty / TotalQty ) * 100 );
									
									oItems[x].getItems()[1].getItems()[4].getItems()[1].setValue( PercentageVal );				            		
				            	}
				            }
						}
			            oForm.getFields()[0].removeAllItems();
			           
			            for(let k = 0; k < oItems.length; k++){
			              var percent_val = parseInt( oItems[k].getItems()[1].getItems()[4].getItems()[1].getValue() );
			              
			           	  oForm.getFields()[0].addItem(oItems[k]);
			           	  
						  oForm.getFields()[0].getItems()[k].getItems()[1].getItems()[4].getItems()[1].setValue( percent_val );
			            }
			            
			            debugger;
			            
			            PanelItems[i].getContent()[0].getItems()[5].getItems()[1].setValue(TotalQtyScrap); //Set Value total Qty of Scrap per batch
			            PanelItems[i].getContent()[0].getItems()[6].getItems()[1].setValue(TotalQtyWaste); //Set Value total Qty of Waste per batch
			            
			            TotalQtyScrapBatch += parseInt(TotalQtyScrap);
			            TotalQtyWasteBatch += parseInt(TotalQtyWaste);
			            
			            TotalQtyCOLACSupply += parseInt( PanelItems[i].getContent()[0].getItems()[2].getItems()[1].getValue() );
			            TotalQtyCOLACUsed   += parseInt( PanelItems[i].getContent()[0].getItems()[3].getItems()[1].getValue() );
					    TotalQtyCOLACNum    += parseInt( PanelItems[i].getContent()[0].getItems()[4].getItems()[1].getValue() );
					}
					debugger;
					
		 			var TotalPercentScrap = 0;
		 			var TotalPercentWaste = 0;
		 			
 					var PVTotalQtyData = {    QtyCOLACSupply: TotalQtyCOLACSupply,
								              QtyCOLACUsed:  TotalQtyCOLACUsed,
								              QtyCOLACNum:   TotalQtyCOLACNum, 
								              QtyCOLACScrap: TotalQtyScrapBatch,
								              QtyCOLACWaste: TotalQtyWasteBatch,
								              TotalPercentScrap: 0,
								              TotalPercentWaste: 0,
								              TotalWasteSFPF:   TotalWasteSFPF,
								              TotalScrapSFPF:   TotalScrapSFPF,
								              TotalScrapAC:     TotalScrapAC,
								              TotalWasteAC:	    TotalWasteAC
										};	
		 			
		 			if (PVTotalQtyData.QtyCOLACScrap && PVTotalQtyData.QtyCOLACSupply ) { 
		 				var TotalPercentScrap =  Math.round( ( PVTotalQtyData.QtyCOLACScrap / PVTotalQtyData.QtyCOLACSupply ) * 100 );
		 				PVTotalQtyData.TotalPercentScrap = TotalPercentScrap;
		 			}
		 			
					if (PVTotalQtyData.QtyCOLACWaste && PVTotalQtyData.QtyCOLACSupply ) { 
		 				var TotalPercentWaste =  Math.round( ( PVTotalQtyData.QtyCOLACWaste / PVTotalQtyData.QtyCOLACSupply ) * 100 );
		 				PVTotalQtyData.TotalPercentWaste = TotalPercentWaste;
		 			}		 			

					oCreatePVModelTotalQty.setData(PVTotalQtyData);
					oController.getView().setModel(oCreatePVModelTotalQty, "CreatePVTotalQtyModel");
				},
				//).bind(this),
				error: function (oError) {
					debugger;
					//	alert("error");
				}
			});	
		},

		onValueHelpBatch: function (oEvent){
			debugger;
			this.lv_sId = oEvent.getSource().getId();
			this.lv_text = oEvent.getSource().getId().replace("BatchID", "BatchIDDesc");
			
			this._getDialogbatch().open();
		},
		
		_getDialogbatch: function () {
			if (!this.dialog_batch) {
				this.dialog_batch = sap.ui.xmlfragment("PP.ZManage_PV.view.Fragment.BatchSH_Update", this);
				this.getView().addDependent(this.dialog_batch)
			}
			return this.dialog_batch;
		},
		
		closeDialogBatch: function () {
			this._getDialogbatch().close()
		},

		onSave_Batch: function (oEvent) {
			debugger;
			var e = sap.ui.getCore().byId("table_BatchUpdate").getSelectedItem().getBindingContext().getObject();
			var c = e.Code;
			var t = e.Text;
			
			this.getView().byId( this.lv_sId ).setValue(c);
			this.getView().byId( this.lv_text ).setValue(t);
	
			this._getDialogbatch().close()
		},
		
		onValueHelpDefect: function(oEvent){
			debugger;
			this.lv_sId = oEvent.getSource().getId();
			this.lv_text = oEvent.getSource().getId().replace("DefectID", "DefectIDDesc");
				
			this._getDialogDefect().open();
		},
		
		_getDialogDefect: function(){ // Create Dialog

			if (!this.dialog_defect) {  
				this.dialog_defect = sap.ui.xmlfragment("PP.ZManage_PV.view.Fragment.DefectSH_Update", this);
				this.getView().addDependent(this.dialog_defect);
				
				debugger;
			}else{
				var oTable = sap.ui.getCore().byId("smartTable_DefectUpdate");
				
				if(oTable){
					oTable.rebindTable(); //re-trigger onBeforeRebindTableDefect function
				}				
			}
			return this.dialog_defect;			
		},

		closeDialogDefect: function () {
	
			this._getDialogDefect().close();
		},

		onSave_Defect : function (oEvent) {
			debugger;
			var e = sap.ui.getCore().byId("table_DefectUpdate").getSelectedItem().getBindingContext().getObject();
			
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
				this.dialog_component = sap.ui.xmlfragment("PP.ZManage_PV.view.Fragment.ComponentSh_Update", this);
				this.getView().addDependent(this.dialog_component);
				
				debugger;
			}else{
				var oTable = sap.ui.getCore().byId("smartTable_Component_Update");
				
				if(oTable){
					oTable.rebindTable(); //re-trigger onBeforeRebindTableComponent function
				}				
			}
			return this.dialog_component;				
		},

		onSave_Component : function (oEvent) {
			debugger;
			var e = sap.ui.getCore().byId("table_Component_Update").getSelectedItem().getBindingContext().getObject();
			
			this.getView().byId( this.lv_sId ).setValue(e.Component);
	
			this._getDialogComponent().close();
		},
		
		closeDialogComponent: function () {
	
			this._getDialogComponent().close();
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
						
			oEvent.getParameter("bindingParams").filters.push(oFilter);			
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

		   var DefectCodes = oForm.getFields()[0].getItems().filter( element => {
																	  return element.sId.includes( Id ) } );
																	  
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

		_onSaveData: function (oEvent) {
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
										  bautl: Assembly });
					}
				}
			};
			
			var mode = "";
			
			if( oEvent.getSource().getText().includes("Enregistrer") || oEvent.getSource().getText().includes("Save") ){
				mode = "U";
			}else if( oEvent.getSource().getText().includes("Supprimer") || oEvent.getSource().getText().includes("Delete") ){
				mode = "D";
			}else if( oEvent.getSource().getText().includes("Soumettre") || oEvent.getSource().getText().includes("Submit") ){
				mode = "S";
			}
			
			var C = new JSONModel({
				action:   mode,
				qmnum: this.lv_qmnum,
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
					
					if(e.action == "D"){
						if(e.qmnum){
							var msg = "Notification "  + e.qmnum + " has been deleted";
							MessageToast.show(msg);
						}else {
							var msg = "Error";
							MessageToast.show(msg);
						}						
						
					}else{
						if(e.qmnum){
							var msg = "Notification "  + e.qmnum + " has been saved";
							MessageToast.show(msg);
						}else {
							var msg = "Error";
							MessageToast.show(msg);
						}						
					}
	
					// MessageToast.show(t.data.Message);
					// var text = "ordre a été sauvegardé avec le numéro"
					// if (t.data.Message.includes(text)) {
					// 	here.flag = "X";
					// }

					var BatchPanel = here.getView().byId("BatchPanel");
					var PanelItems = BatchPanel.getItems();
					
					for (let y=0; y < PanelItems.length; y++ ){
						if(y==0){ continue; };
						here.getView().byId("BatchPanel").removeItem(1);
					}
		
					var oFormContainers = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
					var oFormElements   = oFormContainers.getFormElements();
					var oElements = oFormElements;
					oElements[0].getFields()[0].removeAllItems();
					
					for(var i=0; i < here.oFieldItems.length; i++){
						here.oFieldItems[i].getItems()[1].getItems()[1].getItems()[1].setValue('');
						here.oFieldItems[i].getItems()[1].getItems()[2].getItems()[1].setValue('');
						here.oFieldItems[i].getItems()[1].getItems()[3].getItems()[1].setValue('');
						here.oFieldItems[i].getItems()[1].getItems()[4].getItems()[1].setValue('');
						oElements[0].getFields()[0].addItem(here.oFieldItems[i]);
					}			
					
					oFormContainers.removeAllFormElements();			
					oFormContainers.insertFormElement(oElements[0]);				
					
					var oCreatePVModel = here.getView().getModel("CreatePVModel").getData();
					var lv_ebeln =  oCreatePVModel.ebeln;
					var lv_ebelp =  oCreatePVModel.ebelp;	
					
					var oRouters = sap.ui.core.UIComponent.getRouterFor(here);
					
					oRouters.navTo("DisplayPV", { Ebeln : lv_ebeln ,
						                          Ebelp : lv_ebelp
												}, true);					
					
					
				},
				error: function (e) {
					debugger;
					MessageToast.show(e.message)
				}
			});
		},

		_onAddBatch: function(oEvent) {
			
	    	debugger;
			var BatchPanel = this.getView().byId("BatchPanel");
			
			var PanelItems = BatchPanel.getItems();
			//var newPanel = PanelItems[0].clone();
			
			var newPanel = this.oPanelItems[0].clone();
			
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
				oFieldItem.getItems()[1].getItems()[1].getItems()[1].setValue('');
				oFieldItem.getItems()[1].getItems()[2].getItems()[1].setValue('');
				oFieldItem.getItems()[1].getItems()[3].getItems()[1].setValue('');
				oFieldItem.getItems()[1].getItems()[4].getItems()[1].setValue('');
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
				//this.getView().byId("BatchPanel").removeItem(1);
				BatchPanel.removeItem(1);
			}

			var oFormContainers = PanelItems[0].getContent()[1].getContent()[0].getItems()[0].getFormContainers()[0];
			var oFormElements   = oFormContainers.getFormElements();
			var oElements = oFormElements;
			oElements[0].getFields()[0].removeAllItems();
			
			for(var i=0; i < this.oFieldItems.length; i++){
				// this.oFieldItems[i].getItems()[1].getItems()[1].getItems()[1].setValue('');
				// this.oFieldItems[i].getItems()[1].getItems()[2].getItems()[1].setValue('');
				this.oFieldItems[i].getItems()[1].getItems()[3].getItems()[1].setValue('');
				this.oFieldItems[i].getItems()[1].getItems()[4].getItems()[1].setValue('');

				if( this.oFieldItems[i].getItems()[1].getItems()[5] !== undefined ){
					this.oFieldItems[i].getItems()[1].getItems()[5].getItems()[1].setValue('');
				}

				oElements[0].getFields()[0].addItem(this.oFieldItems[i]);
			}			
			
			oFormContainers.removeAllFormElements();			
			oFormContainers.insertFormElement(oElements[0]);				

			// this._getDialogbatch().destroy();
			// this._getDialogDefect().destroy();
			
			var oCreatePVModel = this.getView().getModel("CreatePVModel").getData();
			var lv_ebeln =  oCreatePVModel.ebeln;
			var lv_ebelp =  oCreatePVModel.ebelp;	
			
			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouters.navTo("DisplayPV", { Ebeln : lv_ebeln ,
				                          Ebelp : lv_ebelp
										}, true);
		},
		
		onUploadComplete: function (e) {
			this.getView().getModel().refresh()
		},	
		
		onBeforeUploadStarts: function (e) {
			debugger;
			var t = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: e.getParameter("fileName") + ";" + this.lv_qmnum
			});
			e.getParameters().addHeaderParameter(t);
			var a = this.getView().getModel();
			a.refreshSecurityToken();
			var s = a.oHeaders;
			var i = s["x-csrf-token"];
			var r = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: i
			});
			e.getParameters().addHeaderParameter(r)
		},		

		onFileDeleted: function (oEvent) {
			debugger;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PV_SUBCONTRACTOR_SRV");
			var File = oEvent.getParameter("item").getBindingContext().getPath();
			oModel.remove(File, {
				success: e => {
					MessageToast.show("FileDeleted")
				},
				error: e => {}
			});
			MessageToast.show("FileDeleted");
			this.getView().getModel().refresh()
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf PP.ZManage_PV.view.Update
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf PP.ZManage_PV.view.Update
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf PP.ZManage_PV.view.Update
		 */
		//	onExit: function() {
		//
		//	}

	});

});