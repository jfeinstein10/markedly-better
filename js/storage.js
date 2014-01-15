define(function() {

	function saveAllTabs(tabs) {
		store.set('allTabs', tabs);
	}
	function getAllTabs() {
		return store.get('allTabs');
	}
	function saveActiveFile(tab) {
		store.set('activeFile', tab);
	}
	function getActiveFile() {
		return store.get('activeFile');
	}
	function saveActiveDirectory(dirpath) {
		store.set('activeDirectory', dirpath);
	}
	function getActiveDirectory() {
		return store.get('activeDirectory');
	}

	return {
		saveAllTabs: saveAllTabs,
		getAllTabs: getAllTabs,
		saveActiveFile: saveActiveFile,
		getActiveFile: getActiveFile,
		saveActiveDirectory: saveActiveDirectory,
		getActiveDirectory: getActiveDirectory
	}
});