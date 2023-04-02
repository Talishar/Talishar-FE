import * as yup from 'yup';

export const signUpValidationSchema = yup.object().shape({
  userId: yup
    .string()
    .required('Username is required')
    .matches(
      /^[a-zA-Z0-9_]*$/,
      'Only alphanumeric characters, and underscores are allowed'
    ),
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  passwordRepeat: yup
    .string()
    .required('You must confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  agreeToTerms: yup
    .boolean()
    .required()
    .oneOf([true], 'You must agree to the terms')
});

export type SignUpType = yup.InferType<typeof signUpValidationSchema>;

export const forgottenPasswordValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required')
});

export type ForgottenPasswordType = yup.InferType<
  typeof forgottenPasswordValidationSchema
>;

export const resetPasswordValidationSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  passwordRepeat: yup
    .string()
    .required('You must confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

export const loginValidationSchema = yup.object().shape({
  userID: yup.string().required('You must enter a username'),
  password: yup.string().required('You must enter a password'),
  rememberMe: yup.boolean()
});

export type LoginValidationType = yup.InferType<typeof loginValidationSchema>;
