import React, { Component } from 'react';
import { reduxForm as reduxFormHoc, Field } from 'redux-form/immutable';
import { Provider } from "react-redux";
import { fromJS } from 'immutable';
import store from './store';

class RFInput extends React.PureComponent {
  render() {
    const { input, meta, ...rest } = this.props;
    return (<p><input {...rest} type="text" {...input} name={input.name} /></p>);
  }
}

class Form extends React.Component {
  render () {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field name="firstName" component={RFInput}/>
        <Field name="lastName" component={RFInput}/>
        <button type="submit">Submit</button>
      </form>
    );
  }
}

const getDiffValues = (initialValues, currentValues, diff) => {
  const diffValues = {};

  currentValues.keySeq().forEach((key) => {
    const currentValue = currentValues.get(key);
    const initialValue = initialValues.get(key);
    if (initialValues.has(key)) {
      if (diff[key] && typeof diff[key] === 'function' && diff[key]({
          value: currentValue,
          initialValue: initialValue,
          values: currentValues,
          initialValues,
        })) {
        diffValues[key] = currentValues.get(key);
      } else if (currentValues.get(key) !== initialValues.get(key)) {
        diffValues[key] = currentValues.get(key);
      }
    } else {
      diffValues[key] = currentValues.get(key);
    }
  });

  return diffValues;
};

const reduxForm = ({ onSubmit, diff: configDiff, ...restConfig }) => (Component) => {
  return class extends React.Component {
    componentWillMount() {
      this.RenderComponent = reduxFormHoc(restConfig)(Component);
    }

    handleSubmit = (values, dispatch, props) => {
      const { initialValues, diff: diffFromProp } = props;
      const dirtyValues = getDiffValues(initialValues, values, diffFromProp || configDiff);

      const submitFunc = this.props.onSubmit || onSubmit || (() => {});
      submitFunc({ values, dispatch, props, dirtyValues: fromJS(dirtyValues) });
    };

    render() {
      const { onSubmit, diff, ...remainingProps } = this.props;
      return <this.RenderComponent {...remainingProps} onSubmit={this.handleSubmit}/>
    }
  }
};

const SimpleForm = reduxForm({
  diff: {
    firstName: ({ initialValue, value }) => initialValue !== value,
  },
  enableReinitialize: true,
})(Form);

class App extends Component {
  handleSubmit = (form) => {
    console.log('initialValues: ', form.props.initialValues.toJS());
    console.log('currentValues: ', form.values.toJS());
    console.log('dirtyValues: ', form.dirtyValues.toJS());
    console.log('====================');
  };

  render() {
    const initialValues = fromJS({
      firstName: 'Thuong',
      lastName: 'Nguyen'
    });

    return (
      <Provider store={store}>
        <div style={{ padding: 15 }}>
          <h2>Simple Form</h2>
          <SimpleForm
            onSubmit={this.handleSubmit}
            form="test"
            initialValues={initialValues}
          />
        </div>
      </Provider>
    );
  }
}

export default App;
