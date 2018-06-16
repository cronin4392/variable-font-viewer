import React, { Component } from 'react';
import VariableFontEditor from './VariableFontEditor';

import KairosSans from './fonts/KairosSans_Variable.ttf';

class App extends Component {
  render() {
    return (
      <div className="App">
        <VariableFontEditor
          text={'Kairos Sans'}
          fontFile={KairosSans}
          styles={{
            fontSize: '10vw',
            fontFamily: 'Kairos Sans'
          }}
        />
      </div>
    );
  }
}

export default App;
