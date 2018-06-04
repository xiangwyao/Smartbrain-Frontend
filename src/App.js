import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Navigation/Logo';
import ImageLinkForm from './Components/Navigation/ImageLinkForm';
import Rank from './Components/Navigation/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    },
    // line_linked: {
    //   shadow: {
    //     enable: true,
    //     color: "#3CA9D1",
    //     blur: 5
    //   }
    // }
  }
};

const app = new Clarifai.App({
 apiKey: 'fcc4561c7cae42b3ba0750f9769fc5be'
});


class App extends Component {

  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    };
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }});
  }

  componentDidMount() {
    fetch('http://localhost:3000')
      .then(response => response.json())
      .then(console.log);
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    }
  }

  displayFaceBox = (box) => {
    console.log(box)
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };
//a403429f2ddf4b49b307e318f00e528b
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    console.log('click');
    app.models.predict(Clarifai.FACE_DETECT_MODEL, 
      this.state.input).then(
      response => {
      // do something with response
      this.displayFaceBox(this.calculateFaceLocation(response));
    }).catch(err => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === 'signin' || route === 'register') {
      this.setState({ isSignedIn: false });
    } else {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={{particlesOptions}}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        { this.state.route === 'home' 
        ? <div>
            <Logo />
            <Rank />
            <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
          </div>
        : (
            this.state.route === 'signin' ?
            <Signin onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
          )
        }
      </div>
    );
  }
}

export default App;
