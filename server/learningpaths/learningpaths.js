var getLearningPaths = function(predixConfig) {
	if (predixConfig.isUaaConfigured()) {
		return {
			"cloudbasics" : false,
			"authorization" : true
		};
	} else {
		return {
			"cloudbasics" : true,
			"authorization" : false
		};
	}
};

module.exports = { 
	getLearningPaths: getLearningPaths
};
