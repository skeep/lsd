/**
* localStorage Helper
*
* Helper class to create object store in localStorage and do basic create, read, update, delete operations
* @author Suman Paul
*/
var lsd = (function () {
	'use strict';

	function remove(objectStore, id) {
		var os = getTable(objectStore);
		var uid = os.map[id];
		localStorage.removeItem(uid);
		delete os.map[id];
		var collections = getTables();
		collections[objectStore] = os;
		localStorage.tables = JSON.stringify(collections);
	}

	function store(objectStore, dataObj) {
		var id = '';
		var table = getTable(objectStore);
		var data = dataObj;
		if (data.hasOwnProperty('id')) {
			var dataId = data.id;
			var storedData = read(objectStore, dataId);
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
			var tables = getTables();
			tables[objectStore] = table;
			localStorage.tables = JSON.stringify(tables);
		}
		var putDataInLS = putData(id, data);
		if(putDataInLS){
			return data;
		} else {
			return false;
		}
	}

	function read(objectStore, id) {
		var os = getTable(objectStore);
		if (id) {
			var uid = os.map[id];
			if (typeof uid !== 'undefine') {
				if (localStorage[uid]) {
					return JSON.parse(localStorage[uid]);
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			var data = [];
			var mapList = os.map;
			for (var key in mapList) {
				data.push(JSON.parse(localStorage[mapList[key]]));
			}
			return data;
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
				map: {}
			};
			tables[name] = tableProps;
			putData('tables', tables);
		}
		return true;
	}

	//write in localStorage

	function putData(key, value) {
		localStorage[key] = JSON.stringify(value);
		return true;
	}

	function getData(key) {
		return JSON.parse(localStorage[key]);
	}

	//array exist
	Array.prototype.exists = function (val) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === val) {
				return true;
			} else {
				return false;
			}
		}
	};

	/**
	 * Create and return a "version 4" RFC-4122 UUID string.
	 *
	 * randomUUID.js
	 * This software is made available under the terms of the Open Software License
	 * v3.0 (available here: http://www.opensource.org/licenses/osl-3.0.php )
	 * The latest version of this file can be found at: http://www.broofa.com/Tools/randomUUID.js
	 * For more information, or to comment on this, please go to: http://www.broofa.com/blog/?p=151
	 *
	 * @author Robert Kieffer
	 * @copyright 2008
	 * @license This software is made available under the terms of the Open Software License v3.0 (available here: http://www.opensource.org/licenses/osl-3.0.php)
	 * @version 1.0
	 * @access private
	 * @api private
	 * @return {String} a "version 4" RFC-4122 UUID string
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
		createDataStore: createTable,
		set: store,
		get: read,
		remove: remove
	};
})();
