module.exports = {
	project: {
		ios: {},
		android: {},
	},
	assets: ["./assets/fonts/"],
	dependencies: {
		'@react-native-firebase/firestore': {
			platforms: {
				ios: null, // Prevents Firestore from being linked on iOS
			},
		},
		'@react-native-firebase/storage': {
			platforms: {
				ios: null, // Prevents Storage from being linked on iOS
			},
		},
	},
};
