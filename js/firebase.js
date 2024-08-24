// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA80DaelCukmOH_ejU1ANPgpsfwsMbs-e0",
  authDomain: "propaganda-mktg.firebaseapp.com",
  projectId: "propaganda-mktg",
  storageBucket: "propaganda-mktg.appspot.com",
  messagingSenderId: "629342502640",
  appId: "1:629342502640:web:da2b6c658375c5b0134c35",
  measurementId: "G-M5E9WG411F",
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
async function addDataToFirestore2(data, tabelname,uid) {
  try {
    const docRef = await addDoc(collection(db, tabelname,uid), data);
    console.log("Document successfully written!", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
}
// export async function saveReelsData() {
//   const uid= localStorage.getItem("uid");
//   try {
//     const reel = []; // Initialize the reel array
//     const filesToUpload = [];

//     document.querySelectorAll(".upload-container").forEach((container) => {
//       const fileInput = container.querySelector(".media-upload");
//       if (fileInput && fileInput.files.length > 0) {
//         filesToUpload.push(fileInput.files[0]);
//       }
//     });

//     // Check if no files are uploaded
//     if (filesToUpload.length === 0) {
//       throw new Error("Please upload all required videos.");
//     }

//     const uploadPromises = filesToUpload.map(async (file, index) => {
//       const storage = getStorage();
//       const storageRef = ref(storage, `${uid}/videos/video${index + 1}-${file.name}`);
//       const snapshot = await uploadBytes(storageRef, file);
//       const downloadURL = await getDownloadURL(snapshot.ref);

//       // Push video metadata to the reel array
//       reel.push({ url: downloadURL, name: file.name });

//       return { url: downloadURL, name: file.name };
//     });

//     await Promise.all(uploadPromises); // Wait for all uploads to complete

//     const data = {
//       reel, // Add the reel array to the data
//       // Include any other form data you want to save to Firestore
//     };

//     await addDataToFirestore2(data, "ugc",uid);
//     console.log("Form successfully submitted!");
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     alert("Error submitting form: " + error.message);
//   }
// }
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);

    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    var emails = user.email;
    var username = user.displayName;
    await addDataToFirestore({ emails, username }, "ugc", user.uid);
    // Store user info in localStorage or your desired state management
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);
    localStorage.setItem("username", user.displayName);

    // Optionally, you can store the user data in Firestore if you haven't already
    // await addDataToFirestore({ email: user.email, username: user.displayName, phone: user.phoneNumber }, "users");

    alert(`Welcome ${user.displayName}!`);
    window.location.reload(); // Reload after successful sign-in
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    alert("Google sign-in failed: " + error.message);
  }
}
export async function saveReelsData(uid, videos) {
  try {
    console.log("trying");
    
      const reelData = {};
      const videoURLs = [];

      // Iterate over the videos object
      for (const key in videos) {
          if (videos[key]) { // Check if the video exists (i.e., not null)
              const video = videos[key];
              const storageRef = ref(storage, `${uid}/userreels/${key}.mp4`); // Using the key to name the file
              const uploadTask = await uploadBytes(storageRef, video);
              const videoURL = await getDownloadURL(uploadTask.ref);
              videoURLs.push(videoURL);
          }
      }

      reelData.videoURLs = videoURLs;
      reelData.reels=50;
      localStorage.setItem("reels",50);
      const userDocRef = doc(db, "ugc", uid);
      await setDoc(userDocRef, reelData, { merge: true });
  } catch (error) {
      throw new Error("Failed to save reels data: " + error.message);
  }
}

export async function saveUserData(uid, userData, imageUpload) {
  try {
    if (imageUpload) {
      const storageRef = ref(
        storage,
        `${uid}/profileImages/${imageUpload.name}`
      );
      const uploadTask = await uploadBytes(storageRef, imageUpload);
      var imageURL = await getDownloadURL(uploadTask.ref);
      alert(imageURL)
      userData.basicInfo.imageURL = imageURL;
    }
    const userDocRef = doc(db, "ugc", uid);
    await setDoc(userDocRef, userData, { merge: true });
      localStorage.setItem("BasicInfo", 50);

    alert("User data successfully saved!");
    window.location.reload();
  } catch (error) {
    console.error("Error saving user data: ", error);
  }
}

export async function fetchUserReels(uid) {
  try {
    const userDocRef = doc(db, "ugc", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();


      // Loop through video URLs and set them
      for (let index = 0; index < 3; index++) {
        if (userData.videoURLs && userData.videoURLs[index]) {

          const uploadedVideo = document.getElementById(`uploaded-video${index + 1}`);

          if (uploadedVideo) {
            uploadedVideo.src = userData.videoURLs[index];
            uploadedVideo.style.display = "block";
            uploadedVideo.load(); // Ensure the video is loaded

            const beforeUpload = document.getElementById(`before-upload${index + 1}`);
            const afterUpload = document.getElementById(`after-upload${index + 1}`);

            if (beforeUpload && afterUpload) {
              beforeUpload.style.display = "none";
              afterUpload.style.display = "block";
            }
          } else {
            console.error(`Video element with ID 'uploaded-video${index + 1}' not found`);
          }
        } else {
          console.warn(`No video URL found for index ${index}`);
        }
      }
    } else {
      console.error("No such document in Firestore!");
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
}

export async function fetchUserData(uid) {
  try {
    const userDocRef = doc(db, "ugc", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      // Populate form fields with the fetched data
      document.getElementById("fullName").value =
        userData.basicInfo.fullName || "";
      document.getElementById("username").value =
        userData.basicInfo.username || "";
      document.getElementById("phoneNumber").value =
        userData.basicInfo.phoneNumber || "";
      document.getElementById("location").value =
        userData.basicInfo.location || "";
      document.getElementById("instagram").value =
        userData.basicInfo.instagram || "";
      document.getElementById("twitter").value =
        userData.basicInfo.twitter || "";
      document.getElementById("facebook").value =
        userData.basicInfo.facebook || "";
      document.getElementById("linkedin").value =
        userData.basicInfo.linkedin || "";
      document.getElementById("tiktok").value = userData.basicInfo.tiktok || "";
      document.getElementById("portfolio").value =
        userData.basicInfo.portfolio || "";
      document.getElementById("bio").value = userData.basicInfo.bio || "";
      document.getElementById("experienceLevel").value =
        userData.basicInfo.experienceLevel || "";

      // Set platform checkboxes
      document.getElementById("platformFacebook").checked =
        userData.basicInfo.platformFacebook || false;
      document.getElementById("platformInstagram").checked =
        userData.basicInfo.platformInstagram || false;
      document.getElementById("platformTikTok").checked =
        userData.basicInfo.platformTikTok || false;

      // Set content categories checkboxes
      const contentCategoriesInputs = document.querySelectorAll(
        "input[name='contentCategories']"
      );
      contentCategoriesInputs.forEach((input) => {
        if (userData.basicInfo.contentCategories.includes(input.value)) {
          input.checked = true;
        }
      });

      // Display the image if it exists

      if (userData.basicInfo.imageURL) {
        const uploadedImage = document.getElementById("uploaded-image");
        if (uploadedImage) {
          uploadedImage.src = userData.basicInfo.imageURL;
          uploadedImage.style.display = "block";

          const beforeUpload = document.getElementById("before-upload");
          const afterUpload = document.getElementById("after-upload");

          if (beforeUpload && afterUpload) {
            beforeUpload.style.display = "none";
            afterUpload.style.display = "block";
          }
        }
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
}
// Function to add data to Firestore
export async function addDataToFirestore(data, tabelname, uid) {
  // alert("Attempting to add document...");
  try {
    const docRef = doc(db, tabelname, uid);
    await setDoc(docRef, data, { merge: true });
    // alert("Document written with ID: " + docRef.id);
    console.log("Document successfully written!", docRef.id);
    // window.location.reload();
  } catch (error) {
    // alert("Error adding document: " + error.message);
    console.error("Error adding document:", error);
  }
}

// Function to create a new user with email and password
export async function createNewUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (containsProsCom(email)) {
      await addDataToFirestore({ email, username }, "ugc");
    } else {
      await addDataToFirestore({ email, username }, "users");
    }
    alert("User created successfully");
    window.location.href = "/signin.html";
  } catch (error) {
    alert("Error creating new user: " + error.message);
    window.location.reload();
  }
}
export async function signInUser(email, password, checkbox) {
  try {
    // Await the signInWithEmailAndPassword function
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

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
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", user.email);
        localStorage.setItem("username", username); // Store the username
      }

      // Notify the user of successful sign-in
      alert("User signed in successfully: " + username);
      window.location.reload();
    }
  } catch (error) {
    // Handle any errors that occur during sign-in
    alert("Error signing in: " + error.code + " " + error.message);
  }
}
// Function to send a password reset email
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
    window.location.reload();
  } catch (error) {
    alert("Error sending password reset email: " + error.message);
  }
}
export async function checkifsingedin() {
  if (localStorage.getItem("uid") && localStorage.getItem("email")) {
    const userEmailDiv = document.getElementsByClassName("userEmail")[0];
    const userEmailDiv2 = document.getElementsByClassName("userEmail")[1];
    var imgElement = document.getElementsByClassName("profile-pic")[0];
    var imgElement2 = document.getElementsByClassName("profile-pic")[1];

    // Get the stored UID and email from localStorage
    const storedUID = localStorage.getItem("uid");
    const storedEmail = localStorage.getItem("email");
    const storedusername = localStorage.getItem("username");
    // Check if the user is signed in by retrieving the current user
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, check if the stored UID matches the current user's UID
        if (user.uid === storedUID) {
          // UIDs match, hide the "Sign Up" link and display the email
          // userEmailDiv.style.display = 'block';
          if (
            window.location.href.includes("signin.html") ||
            window.location.href.includes("signup.html")
          ) {
            window.location.href = "./index.html";
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
          console.error(
            "UID mismatch: Stored UID does not match current user."
          );
          // Optionally, you could sign the user out:
          if (
            !window.location.href == "/signin.html" ||
            !window.location.href == "/signup.html"
          ) {
            window.location.href = "./signup.html";
          }
          localStorage.clear();
          auth.signOut();
        }
      } else {
        if (
          !window.location.href == "/signin.html" ||
          !window.location.href == "/signup.html"
        ) {
          window.location.href = "./signup.html";
        } else {
          localStorage.clear();
          auth.signOut();
          window.location.href = "./signup.html";
        }
        // No user is signed in, ensure the "Sign Up" link is visible
      }
    });
  } else {
    if (
      window.location.href.includes("signin.html") ||
      window.location.href.includes("signup.html")
    ) {
    } else {
      window.location.href = "./signin.html"; // Redirect to signin.html if the page is neither
    }
  }
}

window.onload = function () {
  // Get references to the elements
  checkifsingedin();
};
