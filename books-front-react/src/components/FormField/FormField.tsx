import { ReactNode } from "react";
import styles from "./formField.module.scss";

export interface FormField {
  // isFocused: boolean;
  errorMessage?: string;
  text: string;
  placeholder?: string;
  children: ReactNode;
}

export const FormField = ({
  // isFocused,
  errorMessage,
  text,
  placeholder,
  children,
}: FormField) => {
  return (
    <div className={styles["form-field"]}>
      <div className={styles["input-wrapper"]}>
        {children}
        {!text && <span className={styles.placeholder}>{placeholder}</span>}
      </div>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
