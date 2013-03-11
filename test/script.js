	// mukhos.createTable('books');
	// var book1 = {
	// 	name: '.Net Book',
	// 	author: 'Suman',
	// 	year: 2007,
	// 	price: 30
	// };
	// mukhos.store('books', book1);
	// var book2 = {
	// 	name: '.Net Book',
	// 	author: 'Shreyashi',
	// 	year: 2007,
	// 	price: 40
	// };
	// mukhos.store('books', book2);
	// var book3 = {
	// 	name: '.Net Book',
	// 	author: 'Suman',
	// 	year: 2008,
	// 	price: 20
	// };
	// mukhos.store('books', book3);
	// var book4 = {
	// 	name: '.Net Book',
	// 	author: 'Shreyashi',
	// 	year: 2008,
	// 	price: 110
	// };
	// mukhos.store('books', book4);

	// mukhos.createTable('authors');
	// var author = {
	// 	// id : '3',
	// 	name: 'shreyashi'
	// };
	// mukhos.store('authors', author);
	// console.log(mukhos.read('authors', 30));
	// mukhos.remove('books', 1);
	// console.time("query time");
	// console.log(mukhos.query('books'));
	// console.timeEnd("query time");
	// var filter = {
	// 	field: 'year',
	// 	operator: '=',
	// 	value: 2007
	// };
	// console.time("query time");
	// console.log(mukhos.query('books', filter));
	// console.timeEnd("query time");

	console.time("index time");
	mukhos.index('books', 'year');
	console.timeEnd("index time");