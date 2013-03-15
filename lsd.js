var lsd = (function() {
	'use strict';
	/**
	 * LiquidMetal, version: 1.2.1 (2012-04-21)
	 *
	 * A mimetic poly-alloy of Quicksilver's scoring algorithm, essentially
	 * LiquidMetal.
	 *
	 * For usage and examples, visit:
	 * http://github.com/rmm5t/liquidmetal
	 *
	 * Licensed under the MIT:
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * Copyright (c) 2009-2012, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
	 */
	var LiquidMetal = (function() {
		var SCORE_NO_MATCH = 0.0;
		var SCORE_MATCH = 1.0;
		var SCORE_TRAILING = 0.8;
		var SCORE_TRAILING_BUT_STARTED = 0.9;
		var SCORE_BUFFER = 0.85;
		var WORD_SEPARATORS = " \t_-";

		return {
			lastScore: null,
			lastScoreArray: null,

			score: function(string, abbrev) {
				// short circuits
				if (abbrev.length === 0) return SCORE_TRAILING;
				if (abbrev.length > string.length) return SCORE_NO_MATCH;

				// match & score all
				var allScores = [];
				var search = string.toLowerCase();
				abbrev = abbrev.toLowerCase();
				this._scoreAll(string, search, abbrev, -1, 0, [], allScores);

				// complete miss
				if (allScores.length == 0) return 0;

				// sum per-character scores into overall scores,
				// selecting the maximum score
				var maxScore = 0.0,
					maxArray = [];
				for (var i = 0; i < allScores.length; i++) {
					var scores = allScores[i];
					var scoreSum = 0.0;
					for (var j = 0; j < string.length; j++) {
						scoreSum += scores[j];
					}
					if (scoreSum > maxScore) {
						maxScore = scoreSum;
						maxArray = scores;
					}
				}

				// normalize max score by string length
				// s. t. the perfect match score = 1
				maxScore /= string.length;

				// record maximum score & score array, return
				this.lastScore = maxScore;
				this.lastScoreArray = maxArray;
				return maxScore;
			},

			_scoreAll: function(string, search, abbrev, searchIndex, abbrIndex, scores, allScores) {
				// save completed match scores at end of search
				if (abbrIndex == abbrev.length) {
					// add trailing score for the remainder of the match
					var started = (search.charAt(0) == abbrev.charAt(0));
					var trailScore = started ? SCORE_TRAILING_BUT_STARTED : SCORE_TRAILING;
					fillArray(scores, trailScore, scores.length, string.length);
					// save score clone (since reference is persisted in scores)
					allScores.push(scores.slice(0));
					return;
				}

				// consume current char to match
				var c = abbrev.charAt(abbrIndex);
				abbrIndex++;

				// cancel match if a character is missing
				var index = search.indexOf(c, searchIndex);
				if (index == -1) return;

				// match all instances of the abbreviaton char
				var scoreIndex = searchIndex; // score section to update
				while ((index = search.indexOf(c, searchIndex + 1)) != -1) {
					// score this match according to context
					if (isNewWord(string, index)) {
						scores[index - 1] = 1;
						fillArray(scores, SCORE_BUFFER, scoreIndex + 1, index - 1);
					} else if (isUpperCase(string, index)) {
						fillArray(scores, SCORE_BUFFER, scoreIndex + 1, index);
					} else {
						fillArray(scores, SCORE_NO_MATCH, scoreIndex + 1, index);
					}
					scores[index] = SCORE_MATCH;

					// consume matched string and continue search
					searchIndex = index;
					this._scoreAll(string, search, abbrev, searchIndex, abbrIndex, scores, allScores);
				}
			}
		};

		function isUpperCase(string, index) {
			var c = string.charAt(index);
			return ("A" <= c && c <= "Z");
		}

		function isNewWord(string, index) {
			var c = string.charAt(index - 1);
			return (WORD_SEPARATORS.indexOf(c) != -1);
		}

		function fillArray(array, value, from, to) {
			for (var i = from; i < to; i++) {
				array[i] = value;
			}
			return array;
		}
	})();


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
			list.forEach(function(field, _index) {
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
		var tables = getTables();
		var table = getTable(tableName);
		if (table.fields[field].type === 'string' || table.fields[field].type === 'number' || table.fields[field].type === 'boolean') {
			if (table.fields[field].indexed === false) {
				table.fields[field].indexed = true;
				var data = query(tableName);
				var _index = table.index || {};
				_index[field] = {
					list: [],
					map: {}
				};
				data.forEach(function(_value) {
					if (!_index[field].map[_value[field]]) {
						_index[field].list.push(_value[field]);
						_index[field].map[_value[field]] = [];
						_index[field].map[_value[field]].push(_value.id);
					} else {
						_index[field].map[_value[field]].push(_value.id);
					}
				});
				if (table.fields[field].type === 'string') {
					_index[field].list = _index[field].list.sort();
				} else if (table.fields[field].type === 'number') {
					_index[field].list = _index[field].list.sort(function(a, b) {
						return (a - b);
					});
				}
				tables[tableName].index = _index;
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
			console.log('table exist');
		}
	}

	//write in localStorage

	function putData(key, value) {
		localStorage[key] = JSON.stringify(value);
	}

	//array exist
	Array.prototype.exists = function(val) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === val) {
				return true;
			} else {
				return false;
			}
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
		remove: remove,
		query: query,
		index: index
	};

})();