// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Authentication
const provider = new GoogleAuthProvider(); // Initialize Google Auth Provider
const storage = getStorage(app); // Initialize Firebase Storage

// Now you can use the `storage`, `db`, and `auth` objects in your code


// Initialize Firestore

  function containsProsCom(email) {
    const regex = /@pros\.com$/;
    return regex.test(email);
}
async function addDataToFirestore2(data, tabelname) {
  try {
      const docRef = await addDoc(collection(db, tabelname), data);
      console.log("Document successfully written!", docRef.id);
  } catch (error) {
      console.error("Error adding document:", error);
  }
}
export async function sendreels() {
  
                   
  try {
    const reel = []; // Initialize the reel array
    const filesToUpload = [];

    document.querySelectorAll('.upload-container').forEach(container => {
        const fileInput = container.querySelector('.media-upload');
        if (fileInput && fileInput.files.length > 0) {
            filesToUpload.push(fileInput.files[0]);
        }
    });

    // Check if no files are uploaded
    if (filesToUpload.length === 0) {
        throw new Error('Please upload all required videos.');
    }

    const uploadPromises = filesToUpload.map(async (file, index) => {
        const storage = getStorage();
        const storageRef = ref(storage, `videos/video${index + 1}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Push video metadata to the reel array
        reel.push({ url: downloadURL, name: file.name });

        return { url: downloadURL, name: file.name };
    });

    await Promise.all(uploadPromises); // Wait for all uploads to complete

    const data = {
        reel, // Add the reel array to the data
        // Include any other form data you want to save to Firestore
    };

    await addDataToFirestore2(data, 'vendor');
    console.log('Form successfully submitted!');
} catch (error) {
    console.error('Error submitting form:', error);
    alert('Error submitting form: ' + error.message);
}
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
      await addDataToFirestore({emails,username},"vendor")
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
  export async function saveUserData(uid,userData,imageUpload) {
    // Collect data from the form inputs
    // const userData = {
    //     image: imageUploadInput.value, // Handle file uploads separately
    //     fullName: fullNameInput.value,
    //     username: usernameInput.value,
    //     phoneNumber: phoneNumberInput.value,
    //     location: locationInput.value,
    //     socialMedia: {
    //         instagram: instagramInput.value,
    //         twitter: twitterInput.value,
    //         facebook: facebookInput.value,
    //         linkedin: linkedinInput.value,
    //         tiktok: tiktokInput.value
    //     },
    //     portfolio: portfolioInput.value,
    //     contentCategories: Array.from(contentCategoriesInputs)
    //                            .filter(input => input.checked)
    //                            .map(input => input.value),
    //     bio: bioInput.value,
    //     experienceLevel: experienceLevelInput.value,
    //     preferredPlatforms: {
    //         facebook: platformFacebookInput.checked,
    //         instagram: platformInstagramInput.checked,
    //         tiktok: platformTikTokInput.checked
    //     }
    // };

    // Save data to Firestore
    try {
//       const docRef = doc(db, "vendor", uid);
if (imageUpload) {
  const storageRef = ref(storage, `profileImages/${uid}/${imageUpload.name}`);
  const uploadTask = await uploadBytes(storageRef, imageUpload);
  var imageURL = await getDownloadURL(uploadTask.ref);
  userData.imageURL =imageURL ;
}
// // Use setDoc to merge the data
//     await setDoc(docRef, userData, { merge: true });
      // const docRef = await setDoc(doc(collection(db, "vendor"), uid), userData, { merge: true });
        // Use `doc` to get a reference to the user's document in the 'users' collection
        const userDocRef = doc(db, 'vendor', uid);

        // Use `setDoc` to save the user data
        await setDoc(userDocRef, userData, { merge: true });
      alert("User data successfully saved!");
      window.location.reload();

    } catch (error) {
        console.error("Error saving user data: ", error);
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
        localStorage.clear();
          auth.signOut();
        }
      } else {
        if (!window.location.href=="/signin.html" || !window.location.href=="/signup.html") {
            window.location.href="./signup.html";
        }else{
          localStorage.clear();
          auth.signOut();
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
