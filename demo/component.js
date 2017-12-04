import React from 'react';
import LoadMore from '../src';

const INIT_DATA = ['Item One', 'Item Two', 'Item Three', 'Item Four', 'Item Five', 'Item Six', 'Item Seven', 'Item Eight', 'Item Nine', 'Item Ten'];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: INIT_DATA
    };
  }

  handleDragRefresh = () => {
    this.setState({
      data: INIT_DATA
    });
  };

  handleScrollLoad = () => {
    const { data } = this.state;

    this.setState({
      data: data.push(INIT_DATA)
    });
  };

  render() {
    const { data } = this.state;

    return (
      <div>
        <div>LoadMore Demo</div>
        <LoadMore
          needDragLoading
          needSrcollLoading
          onDragRefresh={this.handleDragRefresh}
          onScrollLoad={this.handleScrollLoad}
        >
          {
            data.map((item, index) => <div key={index}>{item}</div>)
          }
        </LoadMore>  
      </div>
    );
  }
}

export default App;
