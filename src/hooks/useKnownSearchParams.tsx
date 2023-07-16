import { useSearchParams } from 'react-router-dom';

const knownSearchParams = ['gameName', 'playerID', 'authKey'] as const;
type KnownSearchParamKeys = (typeof knownSearchParams)[number];
type KnownSearchParams = Record<KnownSearchParamKeys, string>;
type SetKnownSearchParams = (key: KnownSearchParamKeys, value: string) => void;

export const useKnownSearchParams = (): [
  Partial<KnownSearchParams>,
  SetKnownSearchParams
] => {
  const [params, setSearchParams] = useSearchParams();

  const searchParamValues = knownSearchParams.reduce<
    Partial<KnownSearchParams>
  >((paramsValues, currentParamName) => {
    const currentParamValue = params.get(currentParamName);
    if (currentParamValue == null) {
      return paramsValues;
    }
    return {
      ...paramsValues,
      [currentParamName]: params.get(currentParamName)
    };
  }, {});

  const setKnownSearchParams: SetKnownSearchParams = (key, value) => {
    if (!(key in knownSearchParams)) {
      throw new Error(`${key} is not a known search param and cannot be set.`, {
        cause: `${key} missing in knownSearchParams`
      });
    }
    setSearchParams({ ...searchParamValues, [key]: value });
  };

  return [searchParamValues, setKnownSearchParams];
};
