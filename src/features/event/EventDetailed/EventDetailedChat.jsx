import React, { Component } from 'react';
import { Segment, Header, Comment } from 'semantic-ui-react';
import EventDetailedChatForm from './EventDetailedChatForm';
import distanceInWords from 'date-fns/distance_in_words';
import { Link } from "react-router-dom";

class EventDetailedChat extends Component {
  state = {
    showReplyForm: false,
    selectedCommentId: null
  };

  handleOpenReplyForm = (id) => () => {
    this.setState({ 
      showReplyForm: true,
      selectedCommentId: id
    });    
  };

  handleCloseReplyForm = () => {
    this.setState({
      selectedCommentId: null,
      showReplyForm: false
    });
  };

  render() {
    const {addEventComment, eventId, eventChat} = this.props;
    const { showReplyForm, selectedCommentId } = this.state;
    return (
      <div>
        <Segment
          textAlign="center"
          attached="top"
          inverted
          color="teal"
          style={{ border: 'none' }}
        >
          <Header>Chat about this event</Header>
        </Segment>
  
        <Segment attached>
          <Comment.Group>
            { 
              eventChat && eventChat.map((comment) => (
                <Comment key={comment.id}>
                  <Comment.Avatar src={comment.photoURL || '/assets/user.png'} />
                  <Comment.Content>
                    <Comment.Author as={Link} to={`/profile/${comment.uid}`}>{comment.displayName}</Comment.Author>
                    <Comment.Metadata>
                      <div>{distanceInWords(comment.date, Date.now())} ago</div>
                    </Comment.Metadata>
                    <Comment.Text>{comment.text}</Comment.Text>
                    <Comment.Actions>
                      <Comment.Action onClick={this.handleOpenReplyForm(comment.id)}>Reply</Comment.Action>
                      {
                        showReplyForm && selectedCommentId === comment.id && 
                        <EventDetailedChatForm 
                          addEventComment={addEventComment}
                          closeForm={this.handleCloseReplyForm}
                          eventId={eventId}
                          parentId={comment.id}
                          form={`reply_${comment.id}`}
                        />
                      }
                    </Comment.Actions>
                  </Comment.Content>

                  {comment.childNodes && comment.childNodes.map((child) => (
                    <Comment.Group key={child.id}>
                      <Comment>
                        <Comment.Avatar src={child.photoURL || '/assets/user.png'} />
                        <Comment.Content>
                          <Comment.Author as={Link} to={`/profile/${child.uid}`}>{child.displayName}</Comment.Author>
                          <Comment.Metadata>
                            <div>{distanceInWords(child.date, Date.now())} ago</div>
                          </Comment.Metadata>
                          <Comment.Text>{child.text}</Comment.Text>
                          <Comment.Actions>
                            <Comment.Action onClick={this.handleOpenReplyForm(child.id)}>Reply</Comment.Action>
                            {
                              showReplyForm && selectedCommentId === child.id && 
                              <EventDetailedChatForm 
                                addEventComment={addEventComment}
                                closeForm={this.handleCloseReplyForm}
                                eventId={eventId}
                                parentId={child.id}
                                form={`reply_${child.parentId}`}
                              />
                            }
                          </Comment.Actions>
                        </Comment.Content>
                      </Comment>
                    </Comment.Group>
                  ))}      
                </Comment>
              ))
            }                 
          </Comment.Group>
          <EventDetailedChatForm parentId={0} addEventComment={addEventComment} eventId={eventId} form={'newComment'}/>
        </Segment>
      </div>
    );
  };
}

export default EventDetailedChat;
