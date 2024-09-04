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
  updateDoc,
  deleteDoc,
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
  signOut,
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

export async function savePackageData(uid, packageType, data) {
  try {
    const userDocRef = doc(db, "ugc", uid);
    const packageData = {};
    packageData["packages"] = data;

    await setDoc(userDocRef, packageData, { merge: true });
    alert(`${packageType} package saved successfully!`);
    window.location.reload();
  } catch (error) {
    console.error(`Error saving ${packageType} package data: `, error);
  }
}

// Function to fetch package data from Firestore
export async function fetchPackageData(uid, packageType) {
  try {
    const userDocRef = doc(db, "ugc", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const packageData = userData["packages"][packageType];

      if (packageData) {
        document.getElementById(`${packageType}Price`).value =
          packageData.price || "";
        document.getElementById(`${packageType}Length`).value =
          packageData.length || "";
        document.getElementById(`${packageType}Editing`).value =
          packageData.editing || "";
        document.getElementById(`${packageType}Revisions`).value =
          packageData.revisions || "";
        document.getElementById(`${packageType}Delivery`).value =
          packageData.delivery || "";
        document.getElementById(`${packageType}FaceAppearance`).value =
          packageData.faceAppearance || "";
        document.getElementById(`${packageType}VoiceOver`).value =
          packageData.voiceOver || "";

        localStorage.setItem(packageType + "package", 33);
        if (localStorage.getItem(packageType + "package") == 99) {
          localStorage.setItem("packageDone", true);
        }
      } else {
        console.warn(`No data found for ${packageType} package`);
      }
    } else {
      console.warn("No such document in Firestore!");
    }
  } catch (error) {
    localStorage.removeItem(packageType + "package");
    console.error(`Error fetching ${packageType} package data: `, error);
  }
}

// Function to handle content viewing
function viewContent(contentID, data) {
  const modalContent = document.getElementById("modalContent");

  // Clear the modal content before displaying new data
  modalContent.innerHTML = "";

  // Function to create a labeled input dynamically
  function createLabeledInput(name, value, type = "text") {
    const wrapper = document.createElement("div");
    wrapper.className = "mb-3";

    const label = document.createElement("label");
    label.for = name;
    label.className = "form-label";
    label.textContent = name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.value = value;
    input.disabled = true;
    input.className = "form-control";

    // Append label and input to the wrapper div
    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
  }

  // Iterate over data to create labeled inputs dynamically
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object" && data[key] !== null) {
      Object.keys(data[key]).forEach((subKey) => {
        const value = data[key][subKey];
        if (typeof value === "string" || typeof value === "number") {
          modalContent.appendChild(createLabeledInput(subKey, value));
        }
      });
    } else if (typeof data[key] === "string" || typeof data[key] === "number") {
      modalContent.appendChild(createLabeledInput(key, data[key]));
    }
  });

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("viewModal"));
  modal.show();
}

// Function to handle content approval
async function approveContent(contentID) {
  try {
    const contentRef = doc(db, "ugc", contentID);
    await updateDoc(contentRef, {
      status: "approved", // Assuming you have a status field to update
    });
    alert(`Content ${contentID} approved!`);
  } catch (error) {
    alert("Error approving content: " + error);
  }
}
async function holdContent(contentID) {
  try {
    const contentDocRef = doc(db, "ugc", contentID);
    await updateDoc(contentDocRef, {
      status: "hold",
    });
    alert(`Content ID ${contentID} is now on hold.`);
    // Optionally, you can refresh the table or provide feedback to the user
  } catch (error) {
    alert("Error putting content on hold: " + error);
  }
}

async function Countinuecontent(contentID) {
  try {
    const contentDocRef = doc(db, "ugc", contentID);
    await updateDoc(contentDocRef, {
      status: "approved",
    });
    alert(`Content ID ${contentID} is now countinued.`);
    // Optionally, you can refresh the table or provide feedback to the user
  } catch (error) {
    alert("Error putting content on hold: " + error);
  }
}

export async function fetchwallet() {
  try {
    const requestsCollectionRef = collection(db, "Requests");
    const requestsSnapshot = await getDocs(requestsCollectionRef);

    const payoutTableBody = document.getElementById("payoutTableBody");

    payoutTableBody.innerHTML = ""; // Clear existing rows

    requestsSnapshot.forEach((doc) => {
      const data = doc.data();
      const requestID = doc.id;
      const amount = data.payoutAmount || "N/A";
      const paymentMethod = data.paymentMethod || "Unknown";
      let details = "";

      // Display details based on the payment method
      if (paymentMethod === "instapay") {
        details = `Instapay Number: ${data.instapayNumber || "N/A"}`;
      } else if (paymentMethod === "wallets") {
        details = `Wallet Number: ${data.walletNumber || "N/A"}`;
      } else if (paymentMethod === "bank") {
        details = `
          Bank Name: ${data.bankName || "N/A"}<br>
          Account Name: ${data.bankAccountName || "N/A"}<br>
          Account Number: ${data.bankAccountNumber || "N/A"}
        `;
      }

      const status = data.status || "Pending"; // Default to "Pending" if no status

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${requestID}</td>
        <td>${data.uid}</td>
        <td>${amount}</td>
        <td>${paymentMethod}</td>
        <td>${details}</td>
        <td id="status-cell-${requestID}"></td>
      `;

      const actionCell = row.querySelector(`#status-cell-${requestID}`);

      if (status === "approved") {
        actionCell.textContent = "Approved";
      } else if (status === "rejected") {
        actionCell.textContent = "Rejected";
      } else {
        // Create buttons for approving and rejecting
        actionCell.innerHTML = `
          <button class="btn btn-sm btn-success" data-action="approve" data-id="${requestID}">Approve</button>
          <button class="btn btn-sm btn-danger" data-action="reject" data-id="${requestID}">Reject</button>
        `;

        // Attach event listeners after adding buttons to the DOM
        actionCell
          .querySelector(`[data-action="approve"]`)
          .addEventListener("click", async () => {
            await updateRequestStatus(requestID, "approved");
          });

        actionCell
          .querySelector(`[data-action="reject"]`)
          .addEventListener("click", async () => {
            await updateRequestStatus(requestID, "rejected");
          });
      }

      payoutTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching payout requests: ", error);
  }
}

// Function to update the status of a request in Firestore
async function updateRequestStatus(requestID, newStatus) {
  try {
    const requestDocRef = doc(db, "Requests", requestID);
    await updateDoc(requestDocRef, { status: newStatus });
    console.log(`Request ${requestID} status updated to ${newStatus}`);
    // Reload the table after the update
    fetchwallet();
  } catch (error) {
    console.error("Error updating request status: ", error);
  }
}

export async function fetchUGCContent() {
  try {
    const ugcCollectionRef = collection(db, "ugc");
    const ugcSnapshot = await getDocs(ugcCollectionRef);

    const ugcTableBody = document.getElementById("ugcTableBody");
    const ugcApprvTableBody = document.getElementById("ugcApprvTableBody");

    ugcTableBody.innerHTML = ""; // Clear existing rows in non-approved table
    ugcApprvTableBody.innerHTML = ""; // Clear existing rows in approved table

    ugcSnapshot.forEach((doc) => {
      const data = doc.data();
      const contentID = doc.id;
      const creator = data.username || "Unknown";
      const createdAt = data.creationTime ? data.creationTime : "Unknown";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${contentID}</td>
        <td>${creator}</td>
        <td>${createdAt}</td>
      `;

      const actionCell = document.createElement("td");

      if (data.status === "approved" || data.status === "hold") {
        // For approved documents, add "View", "Hold", and "Delete" buttons
        if (data.status === "approved") {
          actionCell.innerHTML = `
            <a class="btn btn-sm btn-primary" href="#" id="view-${contentID}">View</a>
            <a class="btn btn-sm btn-warning" href="#" id="hold-${contentID}">Hold</a>
          `;
          ugcApprvTableBody.appendChild(row);
        } else {
          actionCell.innerHTML = `
            <a class="btn btn-sm btn-primary" href="#" id="view-${contentID}">View</a>
            <a class="btn btn-sm btn-warning" href="#" id="countinue-${contentID}">countinue</a>
          `;
          ugcApprvTableBody.appendChild(row);
        }
      } else {
        // For non-approved documents, add "View", "Approve", and "Delete" buttons
        actionCell.innerHTML = `
          <a class="btn btn-sm btn-primary" href="#" id="view-${contentID}">View</a>
          <a class="btn btn-sm btn-success" href="#" id="approve-${contentID}">Approve</a>
        `;
        ugcTableBody.appendChild(row);
      }

      row.appendChild(actionCell);

      // Add event listeners for buttons
      document
        .getElementById(`view-${contentID}`)
        .addEventListener("click", () => {
          viewContent(contentID, data);
        });

      if (data.status === "approved" || data.status === "hold") {
        if (data.status === "approved") {
          document
            .getElementById(`hold-${contentID}`)
            .addEventListener("click", async () => {
              await holdContent(contentID);
              fetchUGCContent();
            });
        } else {
          document
            .getElementById(`countinue-${contentID}`)
            .addEventListener("click", async () => {
              await Countinuecontent(contentID);
              fetchUGCContent();
            });
        }
      } else {
        document
          .getElementById(`approve-${contentID}`)
          .addEventListener("click", async () => {
            await approveContent(contentID);
            fetchUGCContent();
          });
      }
    });
  } catch (error) {
    console.error("Error fetching UGC content: ", error);
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
    var emails = user.email;
    var username = user.displayName;
    const creationTime = user.metadata.creationTime;

    await addDataToFirestore2(
      { emails, username, creationTime },
      "ugc",
      user.uid
    );
    // Store user info in localStorage or your desired state management

    const q2 = query(collection(db, "ugc"), where("emails", "==", emails));
    const querySnapshot2 = await getDocs(q2);
    if (!querySnapshot2.empty) {
      querySnapshot2.forEach((doc) => {
        let isAdmin = doc.data().isAdmin || false; // Check if the user is an admin
        if (isAdmin) {
          localStorage.setItem("isAdmin", isAdmin); // Store the isAdmin status
        }
      });
    }
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
      if (videos[key]) {
        // Check if the video exists (i.e., not null)
        const video = videos[key];
        const storageRef = ref(storage, `${uid}/userreels/${key}.mp4`); // Using the key to name the file
        const uploadTask = await uploadBytes(storageRef, video);
        const videoURL = await getDownloadURL(uploadTask.ref);
        videoURLs.push(videoURL);
      }
    }

    reelData.videoURLs = videoURLs;
    const userDocRef = doc(db, "ugc", uid);
    await setDoc(userDocRef, reelData, { merge: true });
  } catch (error) {
    throw new Error("Failed to save reels data: " + error.message);
  }
}

export async function saveUserData(uid, userData, imageUpload, isnewimg) {
  try {
    if (isnewimg) {
      if (imageUpload) {
        const storageRef = ref(
          storage,
          `${uid}/profileImages/${imageUpload.name}`
        );
        const uploadTask = await uploadBytes(storageRef, imageUpload);
        var imageURL = await getDownloadURL(uploadTask.ref);
        userData.basicInfo.imageURL = imageURL;
      }
    }
    const userDocRef = doc(db, "ugc", uid);
    await setDoc(userDocRef, userData, { merge: true });

    alert("User data successfully saved!");
    window.location.reload();
  } catch (error) {
    console.error("Error saving user data: ", error);
  }
}

export async function saveVerify(
  uid,
  userData,
  isnewimg1,
  isnewimg2,
  imageUpload1,
  imageUpload2
) {
  try {
    if (isnewimg1) {
      if (imageUpload1) {
        const storageRef = ref(
          storage,
          `${uid}/verifyingimg/${imageUpload1.name}`
        );
        const uploadTask = await uploadBytes(storageRef, imageUpload1);
        var imageURL1 = await getDownloadURL(uploadTask.ref);
        userData.verify.imageURL1 = imageURL1;
      }
    }
    if (isnewimg2) {
      if (imageUpload2) {
        const storageRef = ref(
          storage,
          `${uid}/verifyingimg/${imageUpload2.name}`
        );
        const uploadTask = await uploadBytes(storageRef, imageUpload2);
        var imageURL2 = await getDownloadURL(uploadTask.ref);
        userData.verify.imageURL2 = imageURL2;
      }
    }

    const userDocRef = doc(db, "ugc", uid);
    await setDoc(userDocRef, userData, { merge: true });
    alert("User data successfully saved!");
    window.location.reload();
  } catch (error) {
    console.error("Error saving user data: ", error);
  }
}

export async function fetchverifydata(uid) {
  try {
    // Reference the user's document in Firestore using their UID
    const userDocRef = doc(db, "ugc", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      let userData = userDocSnap.data();
      userData = userData.verify;

      // Populate form fields with the fetched data
      document.getElementById("idNumber").value = userData.idNumber || "";
      document.getElementById("detailedAddress").value =
        userData.detailedAddress || "";

      // Function to populate the country and region dropdowns
      function updateDropdowns() {
        const issueCountry = document.getElementById("issueCountry");
        const regionSelect = document.getElementById("region");
        const selectedCountry = issueCountry.value;
        const regions = {
          egypt: [
            "Cairo",
            "Alexandria",
            "Giza",
            "Aswan",
            "Luxor",
            "Mansoura",
            "Tanta",
            "Suez",
            "Port Said",
            "Ismailia",
            "Damanhur",
            "Beni Suef",
            "Minya",
            "Assiut",
            "Sohag",
            "Qena",
            "Damietta",
            "Kafr El Sheikh",
            "Sharqia",
            "Monufia",
          ],
          saudiArabia: [
            "Riyadh",
            "Jeddah",
            "Dammam",
            "Mecca",
            "Medina",
            "Khobar",
            "Dhahran",
            "Jubail",
            "Abha",
            "Khamis Mushait",
            "Najran",
            "Buraidah",
            "Hail",
            "Tabuk",
            "Arar",
            "Jazan",
            "Al Qunfudhah",
          ],
          uae: [
            "Abu Dhabi",
            "Dubai",
            "Sharjah",
            "Ajman",
            "Umm Al-Quwain",
            "Fujairah",
            "Ras Al Khaimah",
            "Al Ain",
            "Khalifa City",
            "Al Dhafra",
            "Al Nahyan",
            "Al Reem Island",
          ],
        };

        function populateRegions(selectedCountry) {
          const countryRegions = regions[selectedCountry] || [];

          // Clear existing options
          if (!userData.region) {
            regionSelect.innerHTML = '<option value="">Select Region</option>';
          } else {
            regionSelect.innerHTML = `<option value="">${userData.region}</option>`;
          }

          countryRegions.forEach(function (region) {
            const option = document.createElement("option");
            option.value = region.toLowerCase().replace(/\s+/g, "");
            option.textContent = region;
            regionSelect.appendChild(option);
          });

          // Set the saved region as selected
          const savedRegion = userData.region;
          if (savedRegion) {
            const regionOption = Array.from(regionSelect.options).find(
              (opt) => opt.textContent === savedRegion
            );
            if (regionOption) {
              regionOption.selected = true;
            }
          }
        }

        // Update the country dropdown and populate regions based on it
        issueCountry.value = userData.issueCountry || "";
        populateRegions(issueCountry.value);
      }

      // Call the function to populate dropdowns
      updateDropdowns();

      // Set document type radio button
      if (userData.documentType) {
        document.querySelector(
          `input[name="identificationPlan"][value="${userData.documentType}"]`
        ).checked = true;
      }

      // Display the uploaded front image if it exists
      if (userData.imageURL1) {
        const uploadedImage = document.getElementById("fronimg");
        const beforeUpload = document.getElementById("before-upload1");
        const afterUpload = document.getElementById("after-upload1");
        uploadedImage.src = userData.imageURL1;
        uploadedImage.style.display = "block";

        if (beforeUpload && afterUpload) {
          beforeUpload.style.display = "none";
          afterUpload.style.display = "block";
        }
      }

      // Display the uploaded back image if it exists
      if (userData.imageURL2) {
        const uploadedBackImage = document.getElementById("backimg");
        uploadedBackImage.src = userData.imageURL2;
        uploadedBackImage.style.display = "block";

        const beforeUploadBack = document.getElementById("before-upload2");
        const afterUploadBack = document.getElementById("after-upload2");

        if (beforeUploadBack && afterUploadBack) {
          beforeUploadBack.style.display = "none";
          afterUploadBack.style.display = "block";
        }
      }

      console.log("User data loaded successfully!");
    } else {
      console.log("No such document found!");
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
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
          const uploadedVideo = document.getElementById(
            `uploaded-video${index + 1}`
          );

          if (uploadedVideo) {
            uploadedVideo.src = userData.videoURLs[index];
            uploadedVideo.style.display = "block";
            uploadedVideo.load(); // Ensure the video is loaded

            const beforeUpload = document.getElementById(
              `before-upload${index + 1}`
            );
            const afterUpload = document.getElementById(
              `after-upload${index + 1}`
            );

            if (beforeUpload && afterUpload) {
              beforeUpload.style.display = "none";
              afterUpload.style.display = "block";
            }
          } else {
            console.error(
              `Video element with ID 'uploaded-video${index + 1}' not found`
            );
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
export async function showbalance() {
  try {
    checkifsingedin();
    const uid = localStorage.getItem("uid");
    const userDocRef = doc(db, "ugc", uid); // Assuming "Requests" contains user balance info
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const currentBalance = data.currentBalance || 0; // Default to 0 if not found

      // Display the balance in the HTML
      const balanceElement = document.getElementById("currentBalance");
      balanceElement.textContent = `$${currentBalance}`;
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching current balance: ", error);
    const balanceElement = document.getElementById("currentBalance");
    balanceElement.textContent = "Error fetching balance";
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
        userData.basicInfo.preferedplatfrom.Facebook || false;
      document.getElementById("platformInstagram").checked =
        userData.basicInfo.preferedplatfrom.Instagram || false;
      document.getElementById("platformTikTok").checked =
        userData.basicInfo.preferedplatfrom.TikTok || false;

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

export async function addDataToFirestore(data, tableName) {
  try {
    // Get a reference to the collection
    const colRef = collection(db, tableName);

    // Add a new document with a generated ID
    const docRef = await addDoc(colRef, data);

    alert("Document successfully written with ID: " + docRef.id);
  } catch (error) {
    alert("Error adding document: " + error);
  }
}

export async function addDataToFirestore2(data, tabelname, uid) {
  try {
    const docRef = doc(db, tabelname, uid);
    await setDoc(docRef, data, { merge: true });
    console.log("Document successfully written!");
  } catch (error) {
    console.error("Error adding document:", error);
    throw error; // Propagate the error to handle it in createNewUser
  }
}

export async function addRequestbalance(data) {
  try {
    checkifsingedin();
    const requestsCollectionRef = collection(db, "Requests");

    // Add a new document with a generated ID
    const docRef = await addDoc(requestsCollectionRef, data);
    alert("Document successfully written! " + docRef.id);
    window.location.reload();
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

export async function createNewUser(emails, password, username) {
  let user = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      emails,
      password
    );
    user = userCredential.user;

    const now = new Date();
    const creationTime = now.toISOString(); // Using ISO format for consistency

    // Attempt to add user data to Firestore with the correct UID
    await addDataToFirestore2(
      { emails, username, creationTime },
      "ugc",
      user.uid
    );

    alert("User created successfully");
    window.location.href = "./signin.html";
  } catch (error) {
    console.error("Error creating new user: ", error.message);
    alert("Error creating new user: " + error.message);

    // Rollback user creation if Firestore operation fails
    if (user) {
      try {
        await user; // This deletes the user if Firestore operation fails
        console.log("User deleted due to Firestore error");
      } catch (deleteError) {
        console.error(
          "Error deleting user after Firestore failure:",
          deleteError.message
        );
      }
    }
  }
}

export async function signInUser(email, password, checkbox) {
  try {
    // Sign in the user with email and password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Proceed if the user successfully signed in
    if (userCredential) {
      const user = userCredential.user;

      // Get Firestore instance
      const db = getFirestore();

      // Query Firestore to get the username
      const q = query(collection(db, "users"), where("email", "==", email));
      const q2 = query(collection(db, "ugc"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const querySnapshot2 = await getDocs(q2);

      let username = "";
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          username = doc.data().username || "Unknown"; // Fallback if username is undefined
        });
      } else if (!querySnapshot2.empty) {
        alert("23");
        querySnapshot2.forEach((doc) => {
          username = doc.data().username || "Unknown"; // Fallback if username is undefined
          isAdmin = doc.data().isAdmin || false; // Check if the user is an admin
          alert(isAdmin);
          localStorage.setItem("isAdmin", isAdmin); // Store the isAdmin status
        });
      } else {
        console.warn("No user document found with the provided email.");
      }

      // If the checkbox is checked, store user details in localStorage
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("email", user.emails);
      localStorage.setItem("username", username); // Store the username
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
    auth.onAuthStateChanged(async (user) => {
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
          const userProperties = {
            basicInfo: "BasicInfo",
            reels: "reels",
            verify: "verify",
            preelData: "reelData",
          };
          const q2 = query(
            collection(db, "ugc"),
            where("emails", "==", user.email)
          );
          const querySnapshot2 = await getDocs(q2);
          if (!querySnapshot2.empty) {
            querySnapshot2.forEach((doc) => {
              let userd = doc.data();
              for (const [key, value] of Object.entries(userProperties)) {
                if (userd[key] !== undefined) {
                  localStorage.setItem(value, 50);
                }
              }
              let isAdmin = doc.data().isAdmin || false; // Check if the user is an admin
              if (window.location.href.includes("admin_panel") && !isAdmin) {
                window.location.href = "../index.html";
              }
            });
          }

          userEmailDiv.textContent = `${storedusername}`;
          userEmailDiv2.textContent = `${storedusername}`;
          if (user.photoURL) {
            var profilePicUrl = user.photoURL;
            // imgElement.style.display = 'block';
            imgElement.src = profilePicUrl;
            imgElement2.src = profilePicUrl;
          } else if (user.basicInfo.imageURL) {
            var profilePicUrl = user.basicInfo.imageURL;
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
            localStorage.clear();
            auth.signOut();
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
      localStorage.clear();
      auth.signOut();
      window.location.href = "./signup.html";
      window.location.href = "./signin.html"; // Redirect to signin.html if the page is neither
    }
  }
}

window.onload = function () {
  // Get references to the elements
  checkifsingedin();
};
