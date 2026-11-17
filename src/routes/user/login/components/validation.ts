import * as yup from 'yup';
import i18n from 'i18next';

const msg = (key: string) => () => i18n.t(key);

export const signUpValidationSchema = yup.object().shape({
  userId: yup
    .string()
    .required(msg('VALIDATION.USERNAME_REQUIRED'))
    .matches(/^[a-zA-Z0-9_]*$/, msg('VALIDATION.USERNAME_CHARACTERS')),
  email: yup
    .string()
    .email(msg('VALIDATION.EMAIL_INVALID'))
    .required(msg('VALIDATION.EMAIL_REQUIRED')),
  password: yup
    .string()
    .required(msg('VALIDATION.PASSWORD_REQUIRED'))
    .min(8, msg('VALIDATION.PASSWORD_MIN_LENGTH')),
  passwordRepeat: yup
    .string()
    .required(msg('VALIDATION.PASSWORD_CONFIRM_REQUIRED'))
    .oneOf([yup.ref('password')], msg('VALIDATION.PASSWORDS_MUST_MATCH')),
  agreeToTerms: yup
    .boolean()
    .required()
    .oneOf([true], msg('VALIDATION.AGREE_TO_TERMS'))
});

export type SignUpType = yup.InferType<typeof signUpValidationSchema>;

export const forgottenPasswordValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email(msg('VALIDATION.EMAIL_INVALID'))
    .required(msg('VALIDATION.EMAIL_REQUIRED'))
});

export type ForgottenPasswordType = yup.InferType<
  typeof forgottenPasswordValidationSchema
>;

export const resetPasswordValidationSchema = yup.object().shape({
  password: yup
    .string()
    .required(msg('VALIDATION.PASSWORD_REQUIRED'))
    .min(8, msg('VALIDATION.PASSWORD_MIN_LENGTH')),
  passwordRepeat: yup
    .string()
    .required(msg('VALIDATION.PASSWORD_CONFIRM_REQUIRED'))
    .oneOf([yup.ref('password')], msg('VALIDATION.PASSWORDS_MUST_MATCH'))
});

export const loginValidationSchema = yup.object().shape({
  userID: yup
    .string()
    .trim()
    .required(msg('VALIDATION.LOGIN_USERNAME_REQUIRED')),
  password: yup.string().required(msg('VALIDATION.LOGIN_PASSWORD_REQUIRED')),
  rememberMe: yup.boolean()
});

export type LoginValidationType = yup.InferType<typeof loginValidationSchema>;
