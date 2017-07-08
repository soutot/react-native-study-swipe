import React, { Component } from 'react';
import { 
  View, 
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

class Deck extends Component {
  constructor(props) {
    super(props);
    
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy })
      },
      onPanResponderRelease: () => {
        position.setValue({ x: 0, y: 0 })
      },
    });

    this.state = {
      panResponder,
      position,
    };
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.8, 0, SCREEN_WIDTH * 1.8],
      outputRange: ['-120deg', '0deg', '120deg']
    });
    const opacity = position.x.interpolate({
      inputRange: [-500, 0, 500],
      outputRange: [0, 1, 0]
    })
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      opacity
    };
  }

  renderCards() {
    return this.props.data.map((item, index) => {
      if (index === 0) {
        return (
          <Animated.View 
            key={item.id}
            style={this.getCardStyle()}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return this.props.renderCard(item); //renderCard(item) is defined in main.js
    });
  }

  render() {
    return(
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;
