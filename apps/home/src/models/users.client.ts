export const fetchUser = async () => {
    const user = await fetch("/api/user", {"credentials":"same-origin"});
    const data = await user.json();
    return data;
  };