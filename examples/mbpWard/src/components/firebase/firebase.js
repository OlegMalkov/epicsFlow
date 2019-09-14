// @flow

import * as firebase from 'firebase/app'
// Add the Firebase products that you want to use
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import { mbpStore } from '../../mbpStore'
import { SignedInEvent, DbParticipantsUpdatedEvent } from './firebaseEvents'
const firebaseui = require('firebaseui')

const firebaseConfig = {
	apiKey: 'AIzaSyCBDki8_H6Wnt1ntG6Q0MPB8QRUk6chzQs',
	authDomain: 'mbp-ward.firebaseapp.com',
	databaseURL: 'https://mbp-ward.firebaseio.com',
	projectId: 'mbp-ward',
	storageBucket: 'mbp-ward.appspot.com',
	messagingSenderId: '987164261211',
	appId: '1:987164261211:web:c4bc36fa94e3407a16f87e',
}

const app = firebase.initializeApp(firebaseConfig)

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		mbpStore.dispatch(SignedInEvent.create({ userName: user.displayName }))
	} else {
		const ui = new firebaseui.auth.AuthUI(firebase.auth())

		ui.start('#firebaseui-auth-container', {
			signInOptions: [
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			],
		})
	}
})

const db = app.firestore()

db.collection('participants')
	.onSnapshot(function(querySnapshot) {
		const participants = []

		querySnapshot.forEach(function(doc) {
			participants.push({ id: doc.id, ...doc.data() })
		})

		mbpStore.dispatch(DbParticipantsUpdatedEvent.create({ participants }))
	})

const storageRef = firebase.storage().ref()

export {
	db,
	firebase,
	storageRef,
}
