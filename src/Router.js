import React, { Component } from 'react';
import PropTypes from 'prop-types';

const RouteContext = React.createContext({
  path: '/',
  animate: true,
  animationDuration: '0.5s',
  setPath: () => {},
});

export class Router extends Component {
  constructor(props) {
    super(props);

    this.state = {
      path: props.path || '/',
      setPath: path => this.setState({ path }),
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      path: state.path,
      animate: props.animate,
      animationDuration: props.animationDuration,
    };
  }

  render() {
    return (
      <RouteContext.Provider value={this.state}>
        {this.props.children}
      </RouteContext.Provider>
    );
  }
}

Router.propsTypes = {
  animate: PropTypes.bool,
  animationDuration: PropTypes.string,
  path: PropTypes.string,
};

Router.defaultProps = {
  animationDuration: '0.8s',
};

export class Route extends Component {
  render() {
    return (
      <RouteContext.Consumer>
        {context => {
          const pathParts = this.props.path.split(/:\w*/g);
          const pathParamNames = (this.props.path.match(/:\w*/g) || []).map(v => v.substring(1));
          const pathParamValues = {};
          
          let testPath = context.path;
          const isMatching = pathParts.every((part, index) => {
            if (part === '' || part === '/') {
              // parameter is expected here, parse and save it
              const nextPartStart = testPath.indexOf('/');
              
              const paramName = pathParamNames[Object.keys(pathParamValues).length];
              const paramValue = testPath.substring(0, nextPartStart === -1 ? testPath.length : nextPartStart);
              pathParamValues[paramName] = paramValue;
              testPath = testPath.substring(nextPartStart + 1);
              return true;
            }
            const matches = testPath.indexOf(part) === 0;
            testPath = testPath.substring(part.length);
            return matches;
          });

          const style = Object.assign({
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            transitionProperty: context.animate ? 'visibility, opacity' : 'none',
            transitionDuration: context.animationDuration,
          }, this.props.style);
          style.visibility = isMatching ? 'visible' : 'hidden';
          style.opacity = isMatching ? 1 : 0;

          return <div style={style}>{this.props.children(pathParamValues)}</div>;
        }}
      </RouteContext.Consumer>
    );
  }
}
Route.propTypes = {
  path: PropTypes.string.isRequired,
};

export class Link extends Component {
  render() {
    const { path, ...other } = this.props;
    return (
      <RouteContext.Consumer>
        {context => (
          <div
            role="button"
            onClick={() => context.setPath(path)}
            tabIndex="-1"
            {...other}
          >
            {this.props.children}
          </div>
        )}
      </RouteContext.Consumer>
    );
  }
}
Link.propTypes = {
  path: PropTypes.string.isRequired,
};

export class Navigator extends Component {
  render() {
    return (
      <RouteContext.Consumer>
        {context => this.props.children(context)}
      </RouteContext.Consumer>
    );
  }
}