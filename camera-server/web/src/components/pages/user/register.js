import React, { Component } from "react";
import styled from "styled-components";
import _ from "lodash";
import {
  FormSuccessMessage,
  FormErrorMessage,
  Form,
  FormItem,
  FormAction,
  FormInput,
  FormLabel,
  FormSubmit,
  FormButton,
  FormActionLeft,
} from "../../themes/form";
import { history } from "../../../history";

const RegisterWrapper = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: {
        type: "",
        msg: "",
      },
      user: {
        name: "",
        email: "",
        password: "",
      },
    };

    this._onTextFieldChange = this._onTextFieldChange.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
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

  async _onSubmit(event) {
    event.preventDefault();
    const { user } = this.state;
    const { store } = this.props;

    try {
      await store.createUserAccount(user);
      this.setState({
        message: { type: "success", msg: "Your account has been created." },
      });
    } catch (err) {
      this.setState({
        message: {
          type: "error",
          msg: _.get(
            err,
            "response.data.error.message",
            "An error occurred while creating your account"
          ),
        },
      });
    }
  }

  render() {
    const { user, message } = this.state;

    return (
      <RegisterWrapper>
        <h2>Register an account</h2>
        <Form onSubmit={this._onSubmit}>
          {message.msg &&
            (message.type === "success" ? (
              <FormSuccessMessage>{message.msg}</FormSuccessMessage>
            ) : (
              <FormErrorMessage>{message.msg}</FormErrorMessage>
            ))}
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormInput
              onChange={this._onTextFieldChange}
              placeholder="Your name"
              name="name"
              value={user.name}
              type="text"
              required
            />
          </FormItem>
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormInput
              onChange={this._onTextFieldChange}
              placeholder="Email"
              name="email"
              value={user.email}
              type="email"
              required
            />
          </FormItem>
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormInput
              onChange={this._onTextFieldChange}
              placeholder="Your Password"
              name="password"
              value={user.password}
              type="password"
              required
            />
          </FormItem>
          <FormAction>
            <FormActionLeft>
              <FormSubmit type="submit">Create new account</FormSubmit>
            </FormActionLeft>
            <FormButton onClick={() => history.push("/login")} type="button">
              Login
            </FormButton>
          </FormAction>
        </Form>
      </RegisterWrapper>
    );
  }
}
