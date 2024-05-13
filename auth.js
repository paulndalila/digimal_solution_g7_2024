// Dummy user data stored in array format
const users = [
  {
    id: "1",
    user: "John",
    user_id: 123456789,
    password: "password2",
    level: 2,
    name: "Nyamira",
    level_name: "County",
    org_Id: "uepLTG8wGWJ",
    parent_Id: "HfVjCurKxh2",
  },
  {
    id: "2",
    user: "Doe",
    user_id: 987654321,
    password: "password3",
    level: 3,
    name: "Manga Sub County",
    level_name: "sub_county",
    org_Id: "f3AcdRzgTwz",
    parent_Id: "uepLTG8wGWJ",
  },
  {
    id: "3",
    user: "Alice",
    user_id: 123498765,
    password: "password4",
    level: 4,
    name: "Kemera Ward",
    level_name: "Ward",
    org_Id: "ZJdVAPAukav",
    parent_Id: "f3AcdRzgTwz",
  },
  {
    id: "4",
    user: "Bob",
    user_id: 987612345,
    password: "password5",
    level: 5,
    name: "Omogonchoro Location",
    level_name: "Location",
    org_Id: "OU523205",
    parent_Id: "ZJdVAPAukav",
  },
];


// Function to authenticate user
function authenticate(username, password) {
  const parsedUsername = parseInt(username); // Parse username to a number
  return users.find(
    (user) => user.user_id === parsedUsername && user.password === password
  );
}

document .getElementById("login-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Call the authenticate function
  const user = authenticate(username, password);

  if (user) {
    // Store user information in local storage
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "index.html";
  } else {
    alert("Invalid credentials.");
  }
});
