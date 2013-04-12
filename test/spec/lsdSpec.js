describe('LocalStorage', function () {

	it('should find lsd', function () {
		expect(lsd.createDataStore('humans')).toBeTruthy();
	});
	var data = {
		name: 'suman'
	};
	var storedData = lsd.set('humans', data);
	it('should add data suman', function () {
		expect(storedData.name).toEqual('suman');
	});

	var newData = {
		id: storedData.id,
		name: 'shreyashi'
	};
	var editedData = lsd.set('humans', newData);
	it('should edit suman to shreyashi', function () {
		expect(editedData.name).toEqual('shreyashi');
	});

	it('should delete data', function () {
		var toBeDeleted = editedData.id;
		lsd.remove('humans', toBeDeleted);
		expect(lsd.get('humans', toBeDeleted)).toBeFalsy();
	});
});
