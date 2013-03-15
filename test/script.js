//lets clear ourr database
localStorage.clear();

//create a new table of humans
lsd.createTable('humans');

//populate the data using store method
data.forEach(function(_d) {
	lsd.store('humans', _d);
});


//indexing time
console.time("index time");
lsd.index('humans', 'name');
console.timeEnd("index time");

//create your where clause
var filter = {
	f: 'name',
	o: '=',
	v: 'kim'
};

//query the table with given clause
console.time("query time");
var result = lsd.query('humans', filter);
console.timeEnd("query time");

//show time
result.forEach(function(val) {
	console.log(val);
});