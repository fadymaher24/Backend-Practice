import React, { Component } from "react";
import styled from "styled-components";
import { history } from "../../../history";
import {
  FormSuccessMessage,
  FormErrorMessage,
  Form,
  FormItem,
  FormAction,
  FormInput,
  FormLabel,
  FormSubmit,
} from "../../themes/form";
import _ from "lodash";

const LoginWrapper = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: {
        type: "",
        msg: "",
      },
      user: {
        email: "",
        password: "",
      },
    };

    this._onSubmit = this._onSubmit.bind(this);
    this._onTextFieldChange = this._onTextFieldChange.bind(this);
    this._logout = this._logout.bind(this);
  }

  componentDidMount() {
    const { store } = this.props;
    const currentUser = store.getCurrentUser();

    if (currentUser) {
      // User is logged in, redirect to home page.
      history.push("/");
    }
  }

  _onTextFieldChange(event) {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        [name]: value,
      },
    }));
  }

  _onSubmit(event) {
    event.preventDefault();
    const { user } = this.state;
    const { store } = this.props;

    console.log("Form is submitted with value", user);

    store.login(user, (err, result) => {
      if (err) {
        // Ensure that err.response.data.error.message is a string
        let errorMsg = _.get(err, "response.data.error.message", "Login Error");
        if (typeof errorMsg === "object") {
          errorMsg = JSON.stringify(errorMsg);
        }
        this.setState({
          message: {
            type: "error",
            msg: errorMsg,
          },
        });
      } else {
        this.setState({
          message: { type: "success", msg: "Login successful." },
        });
        // Redirect to home page after successful login
        history.push("/");
      }
    });
  }

  _logout() {
    const { store } = this.props;
    store.logout((err) => {
      if (err) {
        this.setState({
          message: {
            type: "error",
            msg: _.get(err, "response.data.error.message", "Logout Error"),
          },
        });
      } else {
        this.setState({
          message: { type: "success", msg: "Logout successful." },
        });
        // Redirect to login page after successful logout
        history.push("/login");
      }
    });
  }

  render() {
    const { user, message } = this.state;

    return (
      <LoginWrapper>
        <h2>Sign In</h2>
        <Form onSubmit={this._onSubmit}>
          {message.msg &&
            (message.type === "success" ? (
              <FormSuccessMessage>{message.msg}</FormSuccessMessage>
            ) : (
              <FormErrorMessage>{message.msg}</FormErrorMessage>
            ))}
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormInput
              onChange={this._onTextFieldChange}
              value={user.email}
              type="email"
              name="email"
              placeholder="Your email address"
              required
            />
          </FormItem>
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormInput
              onChange={this._onTextFieldChange}
              value={user.password}
              type="password"
              name="password"
              placeholder="Password"
              required
            />
          </FormItem>
          <FormAction>
            <FormSubmit type="submit">Login</FormSubmit>
          </FormAction>
        </Form>
        <button onClick={this._logout}>Logout</button>
      </LoginWrapper>
    );
  }
}
