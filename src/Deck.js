import React, { Component } from 'react';
import { 
  View, 
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
  }
  constructor(props) {
    super(props);
    
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        // position.setValue({ x: gesture.dx, y: gesture.dy })
        position.setValue({ x: gesture.dx })
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      },
    });

    this.state = {
      panResponder,
      position,
      index: 0,
    };
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);

    //is not convenient to update the state this way, in this project we are doing it because in the official
    //docs they are wrote like this
    //feel free to remove the position from the state by writing this.position.setValue(), but remember to also
    //change all position references in this file
    this.state.position.setValue({ x: 0, y: 0 });

    this.setState({ index: this.state.index+1 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.8, 0, SCREEN_WIDTH * 1.8],
      outputRange: ['-120deg', '0deg', '120deg']
    });
    const opacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [0, 1, 0]
    })
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      opacity,
    };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
        return null;
      }
      if (i === this.state.index) {
        return (
          <Animated.View 
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return (
        <View key={item.id} 
          style={[styles.cardStyle, { top: 10 * (i - this.state.index)}]}
        >
          {
            this.props.renderCard(item)
            //renderCard(item) is defined in main.js
          } 
        </View>
      )
    }).reverse();
  }

  render() {
    return(
      <Animated.View>
        {this.renderCards()}
      </Animated.View>
    );
  }
}


const styles ={ 
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  }
};

export default Deck;
