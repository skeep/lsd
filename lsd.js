var lsd = (function() {
	'use strict';

	function query(tableName, filter) {
		var data = [];
		var tables = JSON.parse(localStorage.tables);
		if (!filter) {
			var mapList = tables[tableName].map;
			for (var key in mapList) {
				data.push(JSON.parse(localStorage[mapList[key]]));
			}
		} else {
			var abbreviation = filter.v;
			var field = filter.f;
			var list = tables[tableName].index[field].list.map(function(val) {
				return {
					value: val,
					score: 0.0
				};
			});
			var results = [];
			list.forEach(function(field, index) {
				var score = LiquidMetal.score(field.value, abbreviation);
				field.score = score;
				if (score > 0.5) results.push(field);
			});

			results.sort(function(a, b) {
				return (b.score - a.score);
			});

			var idArr = [];
			results.forEach(function(value, index) {
				var temp = tables[tableName].index[field].map[value.value];
				temp.forEach(function(value) {
					idArr.push(value);
				});
			});
			idArr.forEach(function(value) {
				data.push(JSON.parse(localStorage[tables[tableName].map[value]]));
			});
		}
		return data;
	}

	function index(tableName, field) {
		var tables = JSON.parse(localStorage.tables);
		var table = tables[tableName];
		if (table.fields[field].type === 'string' || table.fields[field].type === 'number' || table.fields[field].type === 'boolean') {
			if (table.fields[field].indexed === false) {
				table.fields[field].indexed = true;
				var data = query(tableName);
				//console.log(data);
				var index = table.index || {};
				index[field] = {
					list: [],
					map: {}
				};
				data.forEach(function(_value, _index) {
					if (!index[field].map[_value[field]]) {
						index[field].list.push(_value[field]);
						index[field].map[_value[field]] = [];
						index[field].map[_value[field]].push(_value.id);
					} else {
						index[field].map[_value[field]].push(_value.id);
					}
				});
				if (table.fields[field].type === 'string') {
					index[field].list = index[field].list.sort();
				} else if (table.fields[field].type === 'number') {
					index[field].list = index[field].list.sort(function(a, b) {
						return (a - b);
					});
				}
				tables[tableName].index = index;
				localStorage.tables = JSON.stringify(tables);
			}
		}
	}

	function remove(tableName, id) {
		var tables = JSON.parse(localStorage.tables);
		var uid = tables[tableName].map[id];
		localStorage.removeItem(uid);
		// id = id + '';
		delete tables[tableName].map[id];
		localStorage.tables = JSON.stringify(tables);
	}


	function store(tableName, data) {
		var id = '';
		var table = getTable(tableName);
		if (data.hasOwnProperty('id')) {
			var dataId = data.id;
			var storedData = read(tableName, dataId);
			id = table.map[dataId];
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					storedData[key] = data[key];
				}
			}
			data = storedData;
			//data augmentation
			data.modified = new Date();
		} else {
			var needle = table.needle;
			id = randomUUID();
			//data augmentation
			data.created = new Date();
			data.modified = new Date();
			data.id = needle;
			//table augmentation
			table.needle = needle + 1;
			table.map[needle] = id;
			for (var objKey in data) {
				table.fields[objKey] = {
					type: typeof data[objKey],
					indexed: false
				};
			}
			var tables = getTables();
			tables[tableName] = table;
			localStorage.tables = JSON.stringify(tables);
		}
		putData(id, data);
	}

	function read(tableName, id) {
		var tables = JSON.parse(localStorage.tables);
		var uid = tables[tableName].map[id];
		if (typeof uid !== 'undefine') {
			return JSON.parse(localStorage[uid]);
		} else {
			console.log('data not found');
			return false;
		}
	}

	//Initialize DB

	function initDB() {
		if (!getTables()) {
			localStorage.tables = '{}';
			return true;
		}
	}

	// get all tables

	function getTables() {
		if (localStorage.tables) {
			return JSON.parse(localStorage.tables);
		} else {
			return false;
		}
	}

	// get a perticular table

	function getTable(name) {
		var table = getTables()[name];
		if (table) {
			return table;
		} else {
			return false;
		}
	}

	// Create new table

	function createTable(name, schema) {
		if (!getTable(name)) {
			initDB();
			var tables = getTables();
			var tableProps = {
				needle: 1,
				created: new Date(),
				map: {},
				fields: {}
			};
			tables[name] = tableProps;
			putData('tables', tables);
			return true;
		} else {
			console.log('table exisit');
		}
	}

	function putData(key, value){
		localStorage[key] = JSON.stringify(value);
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
		remove: remove,
		query: query,
		index: index
	};

})();