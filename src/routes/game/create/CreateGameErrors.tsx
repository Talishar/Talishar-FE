import { useFormikContext } from 'formik';
import { CreateGameResponse } from 'interface/API/CreateGame.php';
import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import styles from './CreateGame.module.css';

const CreateGameErrors = ({
  createGameResult
}: {
  createGameResult: CreateGameResponse | undefined;
}) => {
  const { errors, values, isSubmitting } = useFormikContext();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  let errorArray = [] as string[];
  for (const [key, value] of Object.entries(errors)) {
    errorArray.push(String(value));
  }

  if (isSubmitting && !hasSubmitted) setHasSubmitted(true);

  return (
    <>
      {hasSubmitted &&
        (!!createGameResult?.error || Object.keys(errors).length > 0) && (
          <div className={styles.alarm}>
            <>
              <FaExclamationCircle /> {createGameResult?.error || errorArray[0]}
            </>
          </div>
        )}
    </>
  );
};

export default CreateGameErrors;
