/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"PP/ZManage_PV/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});