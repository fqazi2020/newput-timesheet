import React, { Component } from 'react';
import {Field, reduxForm } from 'redux-form';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Button from 'react-bootstrap/lib/Button';

import { renderField } from '../containers/constants';
import { loginAction }  from '../containers/requests';
import cookie from 'react-cookies';
import { store } from '../store';

const popoverHoverFocus = (
	<Popover id='popover-trigger-hover-focus'>
		Please go to the <strong><u>Time</u></strong> app and type command <strong><u>register/Register</u></strong>.
		Then login again with the default password.
	</Popover>
);

class LoginValidationForm extends Component {
	constructor(props) {
	  super(props);
		this.submit = this.submit.bind(this);
  }

	submit(values){
		return loginAction(values, this.props);
	}

  render() {
    const { error, handleSubmit, submitting } = this.props;
    return (
      <div className='col-sm-offset-3 col-sm-6 col-lg-4 col-lg-offset-4'>
        <div className='login-form-wrapper'>
          <p>Sign In </p>
          <form name='myForm' onSubmit= {
						handleSubmit(this.submit)}>
           { error && <div className='validation-error'> { error } </div> }
            <Field name='emailId' type='email'
              component={ renderField } label='Email'
            />
            <Field name='password' type='password'
              component={ renderField } label='Password'
            />
            <div className='text-center button-wrapper'>
              <Button type='submit' disabled = { submitting } bsStyle='primary'> Log In </Button>
              <OverlayTrigger
                trigger={[ 'hover', 'focus' ]}
                placement='right'
                overlay={popoverHoverFocus}>
                <Button bsStyle='link'> Forgot Password ?</Button>
              </OverlayTrigger>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

function validate(values) {
  const errors = {};
  if(!values.emailId){
    errors.emailId = 'Enter Email !!';
  }
  if(values.emailId && !/^[a-zA-Z0-9._-]+@newput+\.com$/i.test(values.emailId)) {
    errors.emailId = 'Enter a valid email address !!'
  }
  if(!values.password){
    errors.password = 'Enter Password !!';
  }
  return errors;
}

export default reduxForm({
  form: 'LoginValidation',
  validate
})(LoginValidationForm);
