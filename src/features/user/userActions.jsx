import moment from 'moment';
import cuid from 'cuid';
import { toastr } from 'react-redux-toastr';
import { asyncActionStarted, asyncActionFinished, asyncActionError } from '../async/asyncActions';

//import firebase, { firestore } from 'firebase';

export const updateProfile = (user) => 
  async (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase();
    const { isLoaded, isEmpty, ...updatedUser } = user;
    if(updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
      updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
    }

    try{
      await firebase.updateProfile(updatedUser);
      toastr.success('Success', 'Profile updated');
    } catch(error) {
      console.log(error);      
    }
  };

export const uploadProfileImage = (file, fileName) => 
  async (dispatch, getState, {getFirebase, getFirestore}) => {
    const imageName = cuid();
    const firebase = getFirebase();
    const firestore = getFirestore();
    const user = firebase.auth().currentUser;
    const path = `${user.uid}/user_images`;
    const options = {
      name: imageName
    };

    try{
      dispatch(asyncActionStarted());
      let uploadedFile = await firebase.uploadFile(path, file, null, options);
      let downloadURL = await uploadedFile.uploadTaskSnapshot.ref.getDownloadURL();
      let userDoc = await firestore.get(`users/${user.uid}`);
      if(!userDoc.data().photoURL) {
        await firebase.updateProfile({ photoURL: downloadURL });
        await user.updateProfile({ photoURL: downloadURL })
      }
      await firestore.add(
        {
          collection: 'users',
          doc: user.uid,
          subcollections: [{collection: 'photos'}]
        },
        {
          name: imageName,
          url: downloadURL
        }
      )
      dispatch(asyncActionFinished());
    } catch (error) {
      console.log(error);
      dispatch(asyncActionError());
      throw new Error('Problem uploading photos');
    }
  };

export const deletePhoto = (photo) => 
  async (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase();
    const firestore = getFirestore();
    const user = firebase.auth().currentUser;

    try {
      await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);
      await firestore.delete({
        collection: 'users',
        doc: user.uid,
        subcollections: [{collection: 'photos', doc: photo.id}],
        storeAs: 'photos'
      });
    } catch(error) {
      console.log(error);
      throw new Error('Problem deleting the photo');      
    }
  };

  export const setMainPhoto = (photo) => 
    async (dispatch, getState, {getFirebase}) => {
      try {
        const firebase = getFirebase();
        return await firebase.updateProfile({
          photoURL: photo.url
        });
      } catch (error) {
        console.log(error);
        throw new Error('Problem setting main photo');        
      }
    };

  export const goingToEvent = (event) => 
    async (dispatch, getState, {getFirebase, getFirestore}) => {
      const firebase = getFirebase();
      const firestore = getFirestore();
      const user = firebase.auth().currentUser;
      const photoURL = getState().firebase.profile.photoURL;
      const attendee = {
        going: true,
        joinDate: Date.now(),
        photoURL: photoURL || '/assets/user.png',
        displayName: user.displayName,
        host: false
      };

      try {
        await firestore.update(`events/${event.id}`, {
          [`attendees.${user.uid}`]: attendee
        });
        await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
          eventId: event.id,
          userUid: user.uid,
          eventDate: event.date,
          host: false
        });
        toastr.success('Success', 'You have signed up to the event');
      } catch (error) {
        console.log(error);
        toastr.error('Oops', 'Problem signing up to event');
      }
    };
  
  export const cancelGoingToEvent = (event) => 
    async (dispatch, getState, {getFirebase, getFirestore}) => {
      const firebase = getFirebase();
      const firestore = getFirestore();
      const user = firebase.auth().currentUser;
      try {
        await firestore.update(`events/${event.id}`, {
          [`attendees.${user.uid}`]: firestore.FieldValue.delete()
        });
        await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
        toastr.success('Success', 'You have removed yourself from the event');
      } catch (error) {
        console.log(error);
        toastr.error('Oops', 'something went wrong');
      }  
    };