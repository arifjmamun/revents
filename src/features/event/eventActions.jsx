import { CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT, FETCH_EVENT } from './eventConstants';
import { asyncActionStarted, asyncActionFinished, asyncActionError } from '../async/asyncActions';
import { fetchSampleData } from '../../app/data/mockApi';

export const fetchEvents = (events) => {
  return {
    type: FETCH_EVENT,
    payload: events
  };
};

export const createEvent = (event) => {
  return {
    type: CREATE_EVENT,
    payload: { event }
  };
};

export const updateEvent = (event) => {
  return {
    type: UPDATE_EVENT,
    payload: { event }
  };
};

export const deleteEvent = (eventId) => {
  return {
    type: DELETE_EVENT,
    payload: { eventId }
  };
};

export const loadEvents = () => {
  return async (dispatch) => {
    try {
      dispatch(asyncActionStarted());
      let events = await fetchSampleData();
      dispatch(fetchEvents(events));
      dispatch(asyncActionFinished());
    } catch(error) {
      console.log(error);      
      dispatch(asyncActionError());
    }
  };
};