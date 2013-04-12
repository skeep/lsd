describe('LocalStorage', function(){

	it('should find lsd', function(){
		expect(lsd.createDataStore('humans')).toBeTruthy();
	});
});
