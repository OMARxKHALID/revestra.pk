import { auth } from "@/auth";

export const optionalSession = async () => {
  try {
    return await auth();
  } catch {
    return null;
  }
};
