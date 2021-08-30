import { useEffect, useRef } from "react";

type onSuccessEvent = (otpCode: string) => unknown;

function useWebOtp(onSuccess: onSuccessEvent) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortController = useRef(new AbortController());

  useEffect(() => {
    let isMounted = true;
    const form = inputRef?.current?.closest("form");
    const onSubmitEvent = () => {
      abortController.current.abort();
    };
    if (form) {
      form.addEventListener("submit", onSubmitEvent);
    }
    (navigator.credentials as any) // new WebOTP API types are not added yet
      .get({
        otp: { transport: ["sms"] },
        signal: abortController.current.signal,
      })
      .then((otp: any) => {
        if (!isMounted) {
          return;
        }
        if (inputRef.current) {
          inputRef.current.value ??= otp.code;
        }
        if (form) {
          form.submit();
        }
        onSuccess?.(otp.code);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      form?.removeEventListener("submit", onSubmitEvent);
      isMounted = false;
    };
  }, []);

  return inputRef;
}

export default useWebOtp;
