import * as yup from 'yup';

export const signUpValidationSchema = yup.object().shape({
  userID: yup.string().required(),
  password: yup.string().required(),
  passwordConfirm: yup.string().required(),
  email: yup.string().email().required()
});
