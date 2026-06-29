import { AppHeader } from "@/components/layout/AppHeader";
import { CreateUserForm } from "./create-user-form";
import styles from "./new-user.module.css";

export default function NewUserPage() {
  return (
    <>
      <h1 className={styles.title}>Add New User</h1>
      <p className={styles.subtitle}>
        Create a login for a new content creator or admin.
      </p>
      <CreateUserForm />
    </>
  );
}
