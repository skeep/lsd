//lets clear ourr database
localStorage.clear();

osName = 'humans';
osName2 = 'aliens';

osName3 = 'mugles';

//create a new table of humans
lsd.createDataStore(osName);
lsd.createDataStore(osName2);
lsd.createDataStore(osName3);

//populate the data using store method

for(var i = 0; i<mock1.length; i++){
	lsd.set(osName, mock1[i]);
}
// mock.forEach(function(_d) {
// 	lsd.set(osName, _d);
// });

//get one data
// console.log(lsd.get(osName, 10));

// //update data
// lsd.set(osName, {
// 	country: "India",
// 	id: 10
// });

// //see new data
// console.log(lsd.get(osName, 10));

// //remove data
// lsd.remove(osName, 10);

// //check data not avalable
// console.log(lsd.get(osName, 10));

// //list all data
// lsd.get(osName).forEach(function(v, i){
// 	console.log(v);
// });


//create a new table of humans
// lsd.createDataStore(osName2);

//populate the data using store method
for(var i = 0; i<mock2.length; i++){
	lsd.set(osName2, mock2[i]);
}
// mock.forEach(function(_d) {
// 	lsd.set(osName2, _d);
// });

//get one data
// console.log(lsd.get(osName2, 10));

// //update data
// lsd.set(osName2, {
// 	country: "India",
// 	id: 10
// });

// //see new data
// console.log(lsd.get(osName2, 10));

// //remove data
// lsd.remove(osName2, 10);

// //check data not avalable
// console.log(lsd.get(osName2, 10));

// //list all data
// lsd.get(osName2).forEach(function(v, i){
// 	console.log(v);
// });




//populate the data using store method
for(var i = 0; i<mock3.length; i++){
	lsd.set(osName3, mock3[i]);
}
// mock.forEach(function(_d) {
// 	lsd.set(osName3, _d);
// });
