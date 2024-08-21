  // Import the functions you need from the SDKs
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
  import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
  import { getAuth,GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA80DaelCukmOH_ejU1ANPgpsfwsMbs-e0",
    authDomain: "propaganda-mktg.firebaseapp.com",
    projectId: "propaganda-mktg",
    storageBucket: "propaganda-mktg.appspot.com",
    messagingSenderId: "629342502640",
    appId: "1:629342502640:web:da2b6c658375c5b0134c35",
    measurementId: "G-M5E9WG411F"
  };

  // Initialize Firebase and Firestore
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  function containsProsCom(email) {
    const regex = /@pros\.com$/;
    return regex.test(email);
}
  export async function signInWithGoogle() {
  
    try {
      const result = await signInWithPopup(auth, provider);
  
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
  
      // The signed-in user info.
      const user = result.user;
      var emails= user.email;
      var username= user.displayName;
      if (containsProsCom(user.email)) {
        await addDataToFirestore({emails,username},"vendor")
      }else{
        await addDataToFirestore({email,username},"users")
      }      
      // Store user info in localStorage or your desired state management
      localStorage.setItem('uid', user.uid);
      localStorage.setItem('email', user.email);
      localStorage.setItem('username', user.displayName);
  
      // Optionally, you can store the user data in Firestore if you haven't already
      // await addDataToFirestore({ email: user.email, username: user.displayName, phone: user.phoneNumber }, "users");
  
      alert(`Welcome ${user.displayName}!`);
      window.location.reload(); // Reload after successful sign-in
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      alert("Google sign-in failed: " + error.message);
    }
  }
  
  
  // Function to add data to Firestore
  export async function addDataToFirestore(data, tabelname) {
    // alert("Attempting to add document...");
    try {
      const docRef = await addDoc(collection(db, tabelname), data);
      // alert("Document written with ID: " + docRef.id);
      console.log("Document successfully written!", docRef.id);
      // window.location.reload();
    } catch (error) {
      // alert("Error adding document: " + error.message);
      console.error("Error adding document:", error);
    }
  }

  // Function to create a new user with email and password
  export async function createNewUser(email, password,username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

    if (containsProsCom(email)) {
      await addDataToFirestore({email,username},"vendor")
    }else{
      await addDataToFirestore({email,username},"users")
    }
      alert("User created successfully");
      window.location.href="/signin.html";
    } catch (error) {
      alert("Error creating new user: "+error.message);
      window.location.reload();

    }
  }
  export async function signInUser(email, password, checkbox) {
    try {
      // Await the signInWithEmailAndPassword function
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // Check if the user successfully signed in
      if (userCredential) {
        const user = userCredential.user;
  
        // Get Firestore instance
        const db = getFirestore();
  
        // Query Firestore to get the username
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
  
        let username = "";
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          username = userDoc.data().username;
        }
  
        // If the checkbox is checked, store user details in localStorage
        if (checkbox) {
          localStorage.setItem('uid', user.uid);
          localStorage.setItem('email', user.email);
          localStorage.setItem('username', username); // Store the username
        }
  
        // Notify the user of successful sign-in
        alert("User signed in successfully: " + username);
        window.location.reload();
      }
    } catch (error) {
      // Handle any errors that occur during sign-in
      alert('Error signing in: '+ error.code+" "+ error.message);
    }
  }
  // Function to send a password reset email
  export async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    window.location.reload();

    } catch (error) {
      alert("Error sending password reset email: "+error.message);
    }
  }
  export async  function checkifsingedin() {
    if (localStorage.getItem('uid') && localStorage.getItem('email')) {
    const userEmailDiv = document.getElementsByClassName('userEmail')[0];
    const userEmailDiv2 = document.getElementsByClassName('userEmail')[1];
    var imgElement = document.getElementsByClassName('profile-pic')[0];
    var imgElement2 = document.getElementsByClassName('profile-pic')[1];
  
    // Get the stored UID and email from localStorage
    const storedUID = localStorage.getItem('uid');
    const storedEmail = localStorage.getItem('email');
    const storedusername = localStorage.getItem('username');
  
    // Check if the user is signed in by retrieving the current user
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, check if the stored UID matches the current user's UID
        if (user.uid === storedUID) {
          // UIDs match, hide the "Sign Up" link and display the email
          // userEmailDiv.style.display = 'block';
          if (window.location.href.includes("signin.html") || window.location.href.includes("signup.html")) {
            window.location.href="./index.html";
        }
          userEmailDiv.textContent = `${storedusername}`;
          userEmailDiv2.textContent = `${storedusername}`;
          if (user.photoURL) {
            var profilePicUrl = user.photoURL;
            // imgElement.style.display = 'block';
            imgElement.src = profilePicUrl;
            imgElement2.src = profilePicUrl;
          }
        } else {
          // UIDs don't match, log the user out or handle the mismatch
          console.error('UID mismatch: Stored UID does not match current user.');
          // Optionally, you could sign the user out:
          if (!window.location.href=="/signin.html" || !window.location.href=="/signup.html") {
            window.location.href="./signup.html";
        }
          auth.signOut();
          localStorage.clear();
        }
      } else {
        if (!window.location.href=="/signin.html" || !window.location.href=="/signup.html") {
            window.location.href="./signup.html";
        }
        // No user is signed in, ensure the "Sign Up" link is visible

      }
    });
} else {
  if (window.location.href.includes("signin.html") || window.location.href.includes("signup.html")) {
  } else {
    window.location.href = "./signin.html"; // Redirect to signin.html if the page is neither
  }
}
}

window.onload = function() {
  // Get references to the elements
    checkifsingedin();
};
