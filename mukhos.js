var mukhos = (function() {
	'use strict';
	var query = function(prefix) {
		var data = [];
		for (var key in localStorage) {
			if (key.indexOf(prefix) === 0) {
				data.push({
					key: parseInt(key.replace(prefix, ''), 10),
					data: JSON.parse(localStorage[key])
				});
			}
		}
		return data;
	};
	var remove = function(tableName, id) {
		var tables = JSON.parse(localStorage.tables);
		var uid = tables[tableName].index[id];
		localStorage.removeItem(uid);
		// id = id + '';
		delete tables[tableName].index[id];
		localStorage.tables = JSON.stringify(tables);
	};

	function createTable(tableName) {

		var tables = localStorage.tables || '{}';
		tables = JSON.parse(tables);
		if (typeof tables[tableName] === 'undefined') {
			var tableProp = {
				needle: 1,
				created: new Date()
			};
			tables[tableName] = tableProp;
			localStorage.tables = JSON.stringify(tables);
		} else {
			console.log('Table : "' + tableName + '" exist');
		}

	}

	function store(tableName, data) {
		var id = '';
		var tables = JSON.parse(localStorage.tables);
		if (data.hasOwnProperty('id')) {
			var dataId = data.id;
			id = tables[tableName].index[dataId];
			var storedData = read(tableName, data.id);
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					storedData[key] = data[key];
				}
			}
			data = storedData;
			data.modified = new Date();
		} else {
			data.created = new Date();
			data.modified = new Date();
			id = randomUUID();
			var needle = tables[tableName].needle;
			data.id = needle;
			if (typeof tables[tableName].index === 'undefined') {
				tables[tableName].index = {};
			}
			tables[tableName].index[needle] = id;
			tables[tableName].needle = needle + 1;
			localStorage.tables = JSON.stringify(tables);
		}
		localStorage[id] = JSON.stringify(data);
	}

	function read(tableName, id) {
		var tables = JSON.parse(localStorage.tables);
		var uid = tables[tableName].index[id];
		console.log(uid);
		if (typeof uid !== 'undefine') {
			return JSON.parse(localStorage[uid]);
		} else {
			console.log('data not found');
			return false;
		}

	}
	/* randomUUID.js - Version 1.0
	 *
	 * Copyright 2008, Robert Kieffer
	 *
	 * This software is made available under the terms of the Open Software License
	 * v3.0 (available here: http://www.opensource.org/licenses/osl-3.0.php )
	 *
	 * The latest version of this file can be found at:
	 * http://www.broofa.com/Tools/randomUUID.js
	 *
	 * For more information, or to comment on this, please go to:
	 * http://www.broofa.com/blog/?p=151
	 */

	/**
	 * Create and return a "version 4" RFC-4122 UUID string.
	 */

	function randomUUID() {
		var s = [],
			itoh = '0123456789ABCDEF';

		// Make array of random hex digits. The UUID only has 32 digits in it, but we
		// allocate an extra items to make room for the '-'s we'll be inserting.
		var i, j;
		for (i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);

		// Conform to RFC-4122, section 4.4
		s[14] = 4; // Set 4 high bits of time_high field to version
		s[19] = (s[19] & 0x3) | 0x8; // Specify 2 high bits of clock sequence

		// Convert to hex chars
		for (j = 0; j < 36; j++) {
			s[j] = itoh[s[j]];
		}

		// Insert '-'s
		s[8] = s[13] = s[18] = s[23] = '-';

		return s.join('');
	}

	return {
		createTable: createTable,
		store: store,
		read: read,
		remove: remove
	};

})();