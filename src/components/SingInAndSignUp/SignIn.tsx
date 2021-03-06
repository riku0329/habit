import React, { ChangeEvent, useCallback } from 'react';
import { useImmerReducer } from 'use-immer';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LiveValidateMessage,
  TextInput,
  CustomButton,
  MarginTop,
} from '../UIkit';
import { Form, ShowPassword, ButtonWrap } from './FormStyled';
import { signIn, signUp } from '../../redux/modules/users';
import { signInWithGoogle } from '../../firebase';
import { flashMessage } from '../../redux/modules/flashMessages';

type SignInState = {
  email: string;
  password: string;
  send: boolean;
  validationError: boolean;
  showPassword: boolean;
  message: string;
  showMessage: string;
};

const min = 100000;
const max = 900000;

const SignIn = () => {
  const initialState: SignInState = {
    email: '',
    password: '',
    send: false,
    validationError: false,
    showPassword: false,
    message: '',
    showMessage: 'パスワードを表示する',
  };

  const reducer = (draft: SignInState, action: any) => {
    switch (action.type) {
      case 'emailChange':
        draft.email = action.payload;
        return;
      case 'passwordChange':
        draft.password = action.payload;
        return;
      case 'clickButton':
        draft.send = true;
        return;
      case 'valideteError':
        draft.validationError = true;
        draft.send = false;
        draft.message = action.payload;
        return;
      case 'resetValue':
        draft.email = '';
        draft.password = '';
        draft.send = false;
        return;
      case 'setShowPassword':
        draft.showPassword = !draft.showPassword;
        return;
      case 'setShowMessage':
        draft.showMessage = action.payload;
        return;
    }
  };

  const [state, immerDispatch] = useImmerReducer(reducer, initialState);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    immerDispatch({ type: 'clickButton' });
    if (state.email.trim() === '' || state.password.trim() === '') {
      immerDispatch({
        type: 'valideteError',
        payload: 'Eメールまたはパスワードが未入力です',
      });
      return;
    }
    try {
      signIn(state.email, state.password).then(() => {
        immerDispatch({ type: 'resetValue' });
        history.push('/');
        dispatch(flashMessage('サインインしました'));
      });
    } catch (error) {
      immerDispatch({
        type: 'validateError',
        payload: 'サインインに失敗しました',
      });
      alert('error');
    }
  };

  // const guestUserLogin = async () => {
  //   immerDispatch({ type: 'clickButton' });
  //   try {
  //     const guestName = `user${
  //       Math.floor(Math.random() * (max + 1 - min)) + min
  //     }`;
  //     const guestEmail = `${guestName}@test.com`;

  //     signUp(guestName, guestEmail, 'password').then(async () => {
  //       history.push('/');
  //       dispatch(flashMessage('ゲストユーザーでサインインしました'));
  //     });
  //   } catch (error) {
  //     immerDispatch({
  //       type: 'validateError',
  //       payload: 'ゲストユーザーサインインに失敗しました',
  //     });
  //   }
  // };

  const guestUserLogin = async() => {
    immerDispatch({ type: 'clickButton' });
    try {
      signIn('react@gmail.com', 'password').then(() => {
        immerDispatch({ type: 'resetValue' });
        history.push('/');
        dispatch(flashMessage('ゲストユーザーでサインインしました'));
      });
    } catch (error) {
      immerDispatch({
        type: 'validateError',
        payload: 'サインインに失敗しました',
      });
      alert('error');
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      signInWithGoogle().then(async () => {
        history.push('/');
        dispatch(flashMessage('Google認証でサインインしました'));
      });
    } catch (error) {
      immerDispatch({
        type: 'validateError',
        payload: 'Google認証サインインに失敗しました',
      });
    }
  };

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      immerDispatch({ type: 'emailChange', payload: e.target.value });
    },
    [immerDispatch]
  );
  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      immerDispatch({ type: 'passwordChange', payload: e.target.value });
    },
    [immerDispatch]
  );

  const handleShow = (display: boolean): void => {
    immerDispatch({ type: 'setShowPassword' });
    if (display === true) {
      immerDispatch({
        type: 'setShowMessage',
        payload: 'パスワードを表示する',
      });
    } else {
      immerDispatch({
        type: 'setShowMessage',
        payload: 'パスワードを閉じる',
      });
    }
  };

  return (
    <Form>
      {state.validationError && (
        <LiveValidateMessage> {state.message}</LiveValidateMessage>
      )}

      <TextInput
        onChange={handleEmailChange}
        value={state.email}
        type='email'
        label='Eメール'
      />
      <MarginTop mt={2} />
      <TextInput
        onChange={handlePasswordChange}
        value={state.password}
        type={state.showPassword ? 'text' : 'password'}
        autoComplete='off'
        label='パスワード'
      />
      <MarginTop mt={1} />
      <ShowPassword onClick={() => handleShow(state.showPassword)}>
        {state.showMessage}
      </ShowPassword>
      <ButtonWrap>
        <CustomButton
          color='primary'
          onClick={handleSubmit}
          disabled={state.send}
          label='サインイン'
        />
        <CustomButton
          onClick={handleGoogleSignIn}
          disabled={state.send}
          label='Googleアカウントでサインイン'
          bgcolor='isGoogle'
        />
        <CustomButton
          color='secondary'
          onClick={guestUserLogin}
          disabled={state.send}
          label='ゲストユーザーでサインイン'
        />
      </ButtonWrap>
    </Form>
  );
};

export { SignIn };
