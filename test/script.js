localStorage.clear();
lsd.createTable('humans');
data.forEach(function(_d) {
	lsd.store('humans', _d);
});

console.time("index time");
lsd.index('humans', 'name');
console.timeEnd("index time");

// var filter = {
// 	f : 'country',
// 	o:'=',
// 	v:'China'
// };
// // console.time("query time");
// var result = lsd.query('humans', filter);
// // console.timeEnd("query time");
// result.forEach(function(val) {
// 	console.log(val);
// });