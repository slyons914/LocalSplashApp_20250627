import {AppRegistry, Platform, AppState, NativeModules, NativeEventEmitter, DeviceEventEmitter} from "react-native"
import messaging from "@react-native-firebase/messaging"
import TrackPlayer from "react-native-track-player"
import "react-native-get-random-values"
import { name } from "./app.json"
import { App } from "./src/App"
import PushNotification from "react-native-push-notification"
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import {handleNotifications, showMissedCallNotification} from "./src/utils/notification/notifications";
import {store} from "./src/store";
import {startLogcat, uploadLogFileInFirebaseCloudStorage} from "./src/utils/logcat";
import {configurePushNotification} from "./src/utils/notification/configuration";
import {registerForAndroidIncomingCall, startSipConnection, stopRingtone} from "./src/telephony/sip.service";
import {initializeCallKeep} from "./src/telephony/callkeep.service";
import './src/jssip/webrtcpolyfill'; // Import the polyfill before JsSIP

messaging().setBackgroundMessageHandler(async (remoteMessage) =>
{
	console.log("Message handled in the background!", remoteMessage)
	const notificationData = remoteMessage?.data;
	
	
	// IF NOTIFICATION DATA IS INVALID, RETURN.
	if (!notificationData && typeof notificationData !== "object") return;
	
	// IF THIS IS AN ANDROID DEVICE, START LOGCAT FOR THE CALL AND DISPLAY INCOMING CALL NOTIFICATION.
	if (notificationData.type === "call" && Platform.OS === "android")
	{
		registerForAndroidIncomingCall (notificationData).then();
		// global.callUUId = id
		// global.callerName = notificationData.srcCallerIdName
		// global.callerNumber = notificationData.src
	}
	
	if (notificationData.type === "missed-call")
	{
		showMissedCallNotification (remoteMessage.data);
	}
})

console.log ("testing__");

configurePushNotification();

if (Platform.OS === "android")
{
	const {LogcatBridge} = NativeModules;
	const logcatEmitter = new NativeEventEmitter (LogcatBridge);
	
	// SUBSCRIBE TO LOGCAT EVENTS STOPPED TO UPLOAD LOGCAT FILE IN FIREBASE CLOUD STORAGE.
	logcatEmitter.addListener ('LogcatStopped', async (filePath) =>
	{
		console.log ('Logcat event was received:', filePath, 'upload file to server');
		let fileUpload = await uploadLogFileInFirebaseCloudStorage (filePath);
		console.log ('Logcat File upload response:', fileUpload);
	});
	
	// THIS WILL BE TRIGGERED WHEN THE MOBILE IS LOCKED. THIS WILL BE FOLLOWED BY FULL SCREEN INTENT NOTIFICATION.
	// THIS MEANS THE CODE messaging().setBackgroundMessageHandler IS ALREADY EXECUTED, THAT STARTED A FULL INTENT
	// NOTIFICATION THAT OPENED THE APP. MAIN ACTIVITY TRIGGERED THIS EVENT. NOW WE SHALL TAKE THE USER TO
	// FULL SCREEN CALL SCREEN.
	// THIS CAN ALSO HAPPEN IF USER TAPS ON A REJECT BUTTON FROM A CALL NOTIFICATION HEADS UP NOTIFICATION.
	DeviceEventEmitter.addListener ('CALL_NOTIFICATION_ACTION', (event) =>
	{
		console.log("Call notification action is triggered:", event);
		
		// IF USER HAS REJECTED OR ACCEPT THE INCOMING CALL THEN STOP THE RINGTONE.
		if (event.ACTION_TYPE === 'ACCEPT' || event.ACTION_TYPE === 'REJECT')
		{
			stopRingtone();
		}
		if (event.ACTION_TYPE === 'REJECT')
		{
			const notificationData = JSON.parse(event.data)
            rejectCall(notificationData.sipStackCallId)
		}
	});
}

function HeadlessCheck(initialProps)
{
	if (Platform.OS === "ios")
	{
		// console.log ("call keep setup initiated from background.");
		// initializeCallKeep ("index-headless").then();
	}
	console.log("Headless Check Triggered, initialProps", initialProps)
	if (initialProps.isHeadless) {
		return null // App launched in the background
	}
	return <App initialProps={initialProps?.notification_data} />
}

AppRegistry.registerComponent(name, () => HeadlessCheck)
TrackPlayer.registerPlaybackService(() => require("./player-service"))
